// Web Crypto helpers for password-based encryption (AES-GCM + PBKDF2)

const textEncoder = new TextEncoder();
const textDecoder = new TextDecoder();

function getRandomBytes(length) {
    const arr = new Uint8Array(length);
    crypto.getRandomValues(arr);
    return arr;
}

function bufToBase64(buf) {
    const bytes = new Uint8Array(buf);
    let binary = '';
    for (let i = 0; i < bytes.length; i++)
        binary += String.fromCharCode(bytes[i]);
    return btoa(binary);
}

function base64ToBuf(b64) {
    const binary = atob(b64);
    const len = binary.length;
    const bytes = new Uint8Array(len);
    for (let i = 0; i < len; i++)
        bytes[i] = binary.charCodeAt(i);
    return bytes.buffer;
}

async function deriveKey(password, salt) {
    const enc = textEncoder.encode(password);
    const keyMaterial = await crypto.subtle.importKey('raw', enc, { name: 'PBKDF2' }, false, ['deriveKey']);
    return crypto.subtle.deriveKey({
        name: 'PBKDF2',
        // @ts-ignore
        salt,
        iterations: 150000,
        hash: 'SHA-256',
    }, keyMaterial, { name: 'AES-GCM', length: 256 }, false, ['encrypt', 'decrypt']);
}

export async function encryptString(plainText, password) {
    const salt = getRandomBytes(16);
    const iv = getRandomBytes(12);
    const key = await deriveKey(password, salt);
    const cipherBuf = await crypto.subtle.encrypt({ name: 'AES-GCM', iv }, key, textEncoder.encode(plainText));
    return {
        // @ts-ignore
        salt: bufToBase64(salt.buffer),
        iv: bufToBase64(iv.buffer),
        data: bufToBase64(cipherBuf),
    };
}

export async function decryptString(payload, password) {
    const salt = new Uint8Array(base64ToBuf(payload.salt));
    const iv = new Uint8Array(base64ToBuf(payload.iv));
    const data = base64ToBuf(payload.data);
    const key = await deriveKey(password, salt);
    const plainBuf = await crypto.subtle.decrypt({ name: 'AES-GCM', iv }, key, 
    // @ts-ignore
    data);
    return textDecoder.decode(plainBuf);
}
