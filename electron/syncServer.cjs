const express = require('express');
const cors = require('cors');
const QRCode = require('qrcode');
const os = require('os');

let server = null;
let serverPort = null;

/**
 * LAN IP adresini bul
 */
function getLocalIP() {
    const interfaces = os.networkInterfaces();
    for (const name of Object.keys(interfaces)) {
        for (const iface of interfaces[name]) {
            // IPv4 ve internal olmayan adresleri al
            if (iface.family === 'IPv4' && !iface.internal) {
                return iface.address;
            }
        }
    }
    return '127.0.0.1';
}

/**
 * Uygun port bul
 */
async function findAvailablePort(startPort = 8765) {
    const net = require('net');
    return new Promise((resolve) => {
        const server = net.createServer();
        server.listen(startPort, () => {
            const port = server.address().port;
            server.close(() => resolve(port));
        });
        server.on('error', () => {
            resolve(findAvailablePort(startPort + 1));
        });
    });
}

/**
 * Sync sunucusunu başlat
 */
async function startSyncServer(db) {
    if (server) {
        console.log('[SyncServer] Already running');
        return { ip: getLocalIP(), port: serverPort };
    }

    const app = express();
    app.use(cors());
    app.use(express.json({ limit: '50mb' }));

    // Durum kontrolü
    app.get('/api/status', (req, res) => {
        res.json({
            status: 'online',
            app: 'Neural Pad',
            version: '1.0.0',
            timestamp: new Date().toISOString()
        });
    });

    // Tüm notları getir
    app.get('/api/notes', async (req, res) => {
        try {
            const notes = await db.getAllNotes();
            res.json({ success: true, notes });
        } catch (error) {
            console.error('[SyncServer] GET /api/notes error:', error);
            res.status(500).json({ success: false, error: error.message });
        }
    });

    // Tek not getir
    app.get('/api/notes/:id', async (req, res) => {
        try {
            const note = await db.getNote(parseInt(req.params.id));
            if (note) {
                res.json({ success: true, note });
            } else {
                res.status(404).json({ success: false, error: 'Not found' });
            }
        } catch (error) {
            console.error('[SyncServer] GET /api/notes/:id error:', error);
            res.status(500).json({ success: false, error: error.message });
        }
    });

    // Not ekle/güncelle
    app.post('/api/notes', async (req, res) => {
        try {
            const noteData = req.body;
            const id = await db.saveNote(noteData);
            res.json({ success: true, id });
        } catch (error) {
            console.error('[SyncServer] POST /api/notes error:', error);
            res.status(500).json({ success: false, error: error.message });
        }
    });

    // Not sil
    app.delete('/api/notes/:id', async (req, res) => {
        try {
            await db.deleteNote(parseInt(req.params.id));
            res.json({ success: true });
        } catch (error) {
            console.error('[SyncServer] DELETE /api/notes/:id error:', error);
            res.status(500).json({ success: false, error: error.message });
        }
    });

    // Toplu senkronizasyon
    app.post('/api/sync', async (req, res) => {
        try {
            const { notes: clientNotes, lastSync } = req.body;
            const serverNotes = await db.getAllNotes();

            // Basit conflict resolution: daha yeni olan kazanır
            const result = {
                toClient: [], // Client'a gönderilecek
                toServer: []  // Server'da güncellenecek
            };

            // Server notlarını kontrol et
            for (const serverNote of serverNotes) {
                const clientNote = clientNotes?.find(n => n.id === serverNote.id);
                if (!clientNote) {
                    // Client'ta yok, gönder
                    result.toClient.push(serverNote);
                } else if (new Date(serverNote.updatedAt) > new Date(clientNote.updatedAt)) {
                    // Server daha yeni
                    result.toClient.push(serverNote);
                }
            }

            // Client notlarını kontrol et
            if (clientNotes) {
                for (const clientNote of clientNotes) {
                    const serverNote = serverNotes.find(n => n.id === clientNote.id);
                    if (!serverNote || new Date(clientNote.updatedAt) > new Date(serverNote.updatedAt)) {
                        // Client daha yeni veya yeni not
                        await db.saveNote(clientNote);
                        result.toServer.push(clientNote.id);
                    }
                }
            }

            res.json({
                success: true,
                ...result,
                serverTime: new Date().toISOString()
            });
        } catch (error) {
            console.error('[SyncServer] POST /api/sync error:', error);
            res.status(500).json({ success: false, error: error.message });
        }
    });

    // Port bul ve başlat
    serverPort = await findAvailablePort();
    const ip = getLocalIP();

    return new Promise((resolve, reject) => {
        server = app.listen(serverPort, '0.0.0.0', () => {
            console.log(`[SyncServer] ✅ Running at http://${ip}:${serverPort}`);
            resolve({ ip, port: serverPort });
        });

        server.on('error', (err) => {
            console.error('[SyncServer] Failed to start:', err);
            reject(err);
        });
    });
}

/**
 * QR kod oluştur
 */
async function generateQRCode(ip, port) {
    const url = `http://${ip}:${port}`;
    try {
        const qrDataUrl = await QRCode.toDataURL(url, {
            width: 256,
            margin: 2,
            color: {
                dark: '#000000',
                light: '#ffffff'
            }
        });
        return { url, qrDataUrl };
    } catch (error) {
        console.error('[SyncServer] QR generation error:', error);
        throw error;
    }
}

/**
 * Sunucuyu durdur
 */
function stopSyncServer() {
    if (server) {
        server.close();
        server = null;
        serverPort = null;
        console.log('[SyncServer] Stopped');
    }
}

/**
 * Sunucu durumunu al
 */
function getSyncServerStatus() {
    if (server) {
        return {
            running: true,
            ip: getLocalIP(),
            port: serverPort,
            url: `http://${getLocalIP()}:${serverPort}`
        };
    }
    return { running: false };
}

module.exports = {
    startSyncServer,
    stopSyncServer,
    getSyncServerStatus,
    generateQRCode,
    getLocalIP
};
