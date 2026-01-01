/**
 * Professional Note Templates for Neural Pad (Electron-Only)
 * Templates for lawyers, accountants, doctors, and other confidentiality-requiring professions
 */

export type TemplateCategory = 'legal' | 'accounting' | 'medical' | 'confidential';

export interface NoteTemplate {
    id: string;
    category: TemplateCategory;
    nameKey: string;
    descriptionKey: string;
    icon: string;
    content: string;
    tags: string[];
    isConfidential: boolean;
}

// Category icons and colors
export const categoryConfig: Record<TemplateCategory, { icon: string; color: string; nameKey: string }> = {
    legal: { icon: '⚖️', color: '#6366f1', nameKey: 'templates.categories.legal' },
    accounting: { icon: '📊', color: '#10b981', nameKey: 'templates.categories.accounting' },
    medical: { icon: '🏥', color: '#ef4444', nameKey: 'templates.categories.medical' },
    confidential: { icon: '🔒', color: '#f59e0b', nameKey: 'templates.categories.confidential' },
};

export const noteTemplates: NoteTemplate[] = [
    // ═══════════════════════════════════════════════════
    // LEGAL / HUKUK
    // ═══════════════════════════════════════════════════
    {
        id: 'power_of_attorney',
        category: 'legal',
        nameKey: 'templates.items.powerOfAttorney.name',
        descriptionKey: 'templates.items.powerOfAttorney.desc',
        icon: '📜',
        tags: ['vekaletname', 'hukuk', 'resmi'],
        isConfidential: true,
        content: `<h2>📜 Vekaletname Taslağı</h2>
<p><strong>Tarih:</strong> [Tarih]</p>
<p><strong>Vekil Eden:</strong> [Ad Soyad, TC Kimlik No]</p>
<p><strong>Vekil:</strong> [Avukat Ad Soyad, Baro Sicil No]</p>
<hr>
<h3>Yetki Kapsamı</h3>
<ul>
<li>[ ] Dava açma ve takip</li>
<li>[ ] İcra takibi</li>
<li>[ ] Sulh ve ibra</li>
<li>[ ] Temyiz ve itiraz</li>
</ul>
<h3>Özel Yetkiler</h3>
<p>[Özel yetkileri buraya yazın...]</p>
<hr>
<p><em>⚠️ GİZLİ - Avukat-Müvekkil Ayrıcalığı</em></p>`,
    },
    {
        id: 'contract_summary',
        category: 'legal',
        nameKey: 'templates.items.contractSummary.name',
        descriptionKey: 'templates.items.contractSummary.desc',
        icon: '📋',
        tags: ['sözleşme', 'hukuk', 'özet'],
        isConfidential: true,
        content: `<h2>📋 Sözleşme Özeti</h2>
<p><strong>Sözleşme Adı:</strong> [Sözleşme Adı]</p>
<p><strong>Taraflar:</strong> [Taraf 1] ile [Taraf 2]</p>
<p><strong>Tarih:</strong> [Sözleşme Tarihi]</p>
<hr>
<h3>Anahtar Maddeler</h3>
<table>
<tr><th>Madde</th><th>Özet</th><th>Dikkat</th></tr>
<tr><td>Madde X</td><td>[Özet]</td><td>[Risk/Not]</td></tr>
</table>
<h3>Yükümlülükler</h3>
<ul>
<li><strong>Taraf 1:</strong> [Yükümlülükler]</li>
<li><strong>Taraf 2:</strong> [Yükümlülükler]</li>
</ul>
<h3>Önemli Tarihler</h3>
<ul>
<li>Başlangıç: [Tarih]</li>
<li>Bitiş: [Tarih]</li>
<li>Fesih İhbar Süresi: [Süre]</li>
</ul>
<hr>
<p><em>🔒 Ticari Sır - Gizli</em></p>`,
    },
    {
        id: 'petition_draft',
        category: 'legal',
        nameKey: 'templates.items.petitionDraft.name',
        descriptionKey: 'templates.items.petitionDraft.desc',
        icon: '📝',
        tags: ['dilekçe', 'hukuk', 'dava'],
        isConfidential: true,
        content: `<h2>📝 Dilekçe Taslağı</h2>
<p><strong>[Mahkeme Adı]</strong></p>
<p><strong>Dosya No:</strong> [Dosya Numarası]</p>
<hr>
<p><strong>DAVACI:</strong> [Ad Soyad, TC, Adres]</p>
<p><strong>VEKİLİ:</strong> [Avukat Bilgileri]</p>
<p><strong>DAVALI:</strong> [Ad Soyad, TC, Adres]</p>
<hr>
<h3>KONU:</h3>
<p>[Dilekçe konusu...]</p>
<h3>AÇIKLAMALAR:</h3>
<ol>
<li>[Açıklama 1]</li>
<li>[Açıklama 2]</li>
</ol>
<h3>HUKUKİ SEBEPLER:</h3>
<p>[İlgili kanun maddeleri...]</p>
<h3>DELİLLER:</h3>
<ul>
<li>[Delil 1]</li>
<li>[Delil 2]</li>
</ul>
<h3>SONUÇ VE İSTEM:</h3>
<p>[Talep edilen...]</p>
<p style="text-align: right;">[Tarih]<br>Davacı Vekili<br>[İmza]</p>`,
    },
    {
        id: 'client_meeting_note',
        category: 'legal',
        nameKey: 'templates.items.clientMeetingNote.name',
        descriptionKey: 'templates.items.clientMeetingNote.desc',
        icon: '👤',
        tags: ['müvekkil', 'görüşme', 'hukuk'],
        isConfidential: true,
        content: `<h2>👤 Müvekkil Görüşme Notu</h2>
<p><strong>Tarih:</strong> [Tarih ve Saat]</p>
<p><strong>Müvekkil:</strong> [Ad Soyad]</p>
<p><strong>Dosya No:</strong> [Dosya Numarası]</p>
<hr>
<h3>Görüşme Özeti</h3>
<p>[Görüşme konusu ve özeti...]</p>
<h3>Müvekkilin Beyanları</h3>
<ul>
<li>[Beyan 1]</li>
<li>[Beyan 2]</li>
</ul>
<h3>Yapılacaklar</h3>
<ul>
<li>[ ] [Görev 1]</li>
<li>[ ] [Görev 2]</li>
</ul>
<h3>Sonraki Adımlar</h3>
<p>[Sonraki görüşme tarihi, yapılacaklar...]</p>
<hr>
<p><em>⚠️ GİZLİ - Avukat-Müvekkil Ayrıcalığı</em></p>`,
    },

    // ═══════════════════════════════════════════════════
    // ACCOUNTING / MUHASEBE
    // ═══════════════════════════════════════════════════
    {
        id: 'invoice_summary',
        category: 'accounting',
        nameKey: 'templates.items.invoiceSummary.name',
        descriptionKey: 'templates.items.invoiceSummary.desc',
        icon: '🧾',
        tags: ['fatura', 'muhasebe', 'mali'],
        isConfidential: true,
        content: `<h2>🧾 Fatura Özeti</h2>
<p><strong>Müşteri:</strong> [Müşteri Adı/Unvanı]</p>
<p><strong>Vergi No:</strong> [Vergi Numarası]</p>
<p><strong>Dönem:</strong> [Ay/Yıl]</p>
<hr>
<h3>Fatura Kalemleri</h3>
<table>
<tr><th>Açıklama</th><th>Miktar</th><th>Birim Fiyat</th><th>Tutar</th></tr>
<tr><td>[Hizmet/Ürün]</td><td>[Adet]</td><td>[₺]</td><td>[₺]</td></tr>
</table>
<hr>
<p><strong>Ara Toplam:</strong> [Tutar] ₺</p>
<p><strong>KDV (%18):</strong> [Tutar] ₺</p>
<p><strong>GENEL TOPLAM:</strong> [Tutar] ₺</p>
<h3>Ödeme Bilgileri</h3>
<p>Vade: [Vade Tarihi]</p>
<p>IBAN: [IBAN Numarası]</p>
<hr>
<p><em>🔒 Mali Gizlilik Kapsamında</em></p>`,
    },
    {
        id: 'tax_note',
        category: 'accounting',
        nameKey: 'templates.items.taxNote.name',
        descriptionKey: 'templates.items.taxNote.desc',
        icon: '📑',
        tags: ['vergi', 'muhasebe', 'beyanname'],
        isConfidential: true,
        content: `<h2>📑 Vergi Notu</h2>
<p><strong>Mükellef:</strong> [Mükellef Adı]</p>
<p><strong>Vergi Kimlik No:</strong> [VKN]</p>
<p><strong>Dönem:</strong> [Dönem]</p>
<hr>
<h3>Vergi Türü ve Tutarlar</h3>
<table>
<tr><th>Vergi Türü</th><th>Matrah</th><th>Oran</th><th>Tutar</th></tr>
<tr><td>KDV</td><td>[Matrah]</td><td>%18</td><td>[Tutar]</td></tr>
<tr><td>Stopaj</td><td>[Matrah]</td><td>%20</td><td>[Tutar]</td></tr>
</table>
<h3>Önemli Tarihler</h3>
<ul>
<li>Beyanname Son Günü: [Tarih]</li>
<li>Ödeme Son Günü: [Tarih]</li>
</ul>
<h3>Notlar</h3>
<p>[Önemli notlar ve hatırlatmalar...]</p>
<hr>
<p><em>🔒 Vergi Sırrı Kapsamında</em></p>`,
    },
    {
        id: 'client_financial_record',
        category: 'accounting',
        nameKey: 'templates.items.clientFinancialRecord.name',
        descriptionKey: 'templates.items.clientFinancialRecord.desc',
        icon: '💼',
        tags: ['müşteri', 'kayıt', 'mali'],
        isConfidential: true,
        content: `<h2>💼 Müşteri Mali Kaydı</h2>
<p><strong>Müşteri:</strong> [Firma/Şahıs Adı]</p>
<p><strong>Vergi No:</strong> [VKN/TCKN]</p>
<p><strong>İletişim:</strong> [Tel/Email]</p>
<hr>
<h3>Mali Durum Özeti</h3>
<table>
<tr><th>Kalem</th><th>Tutar</th></tr>
<tr><td>Toplam Alacak</td><td>[Tutar] ₺</td></tr>
<tr><td>Toplam Borç</td><td>[Tutar] ₺</td></tr>
<tr><td>Bakiye</td><td>[Tutar] ₺</td></tr>
</table>
<h3>Son İşlemler</h3>
<ul>
<li>[Tarih] - [İşlem] - [Tutar]</li>
</ul>
<h3>Notlar</h3>
<p>[Müşteri ile ilgili notlar...]</p>
<hr>
<p><em>🔒 Mali Gizlilik</em></p>`,
    },

    // ═══════════════════════════════════════════════════
    // MEDICAL / SAĞLIK
    // ═══════════════════════════════════════════════════
    {
        id: 'patient_record',
        category: 'medical',
        nameKey: 'templates.items.patientRecord.name',
        descriptionKey: 'templates.items.patientRecord.desc',
        icon: '🏥',
        tags: ['hasta', 'kayıt', 'sağlık'],
        isConfidential: true,
        content: `<h2>🏥 Hasta Kaydı</h2>
<p><strong>Hasta:</strong> [Ad Soyad]</p>
<p><strong>TC Kimlik:</strong> [TC No]</p>
<p><strong>Doğum Tarihi:</strong> [Tarih]</p>
<p><strong>İletişim:</strong> [Tel]</p>
<hr>
<h3>Tıbbi Özgeçmiş</h3>
<ul>
<li><strong>Kronik Hastalıklar:</strong> [Liste]</li>
<li><strong>Alerjiler:</strong> [Liste]</li>
<li><strong>Sürekli İlaçlar:</strong> [Liste]</li>
</ul>
<h3>Şikayet / Başvuru Nedeni</h3>
<p>[Hastanın şikayeti...]</p>
<h3>Muayene Bulguları</h3>
<p>[Bulgular...]</p>
<h3>Tanı</h3>
<p>[Tanı ve ICD kodları...]</p>
<h3>Tedavi Planı</h3>
<ul>
<li>[ ] [Tedavi 1]</li>
<li>[ ] [Tedavi 2]</li>
</ul>
<hr>
<p><em>⚠️ KİŞİSEL SAĞLIK VERİSİ - GİZLİ</em></p>`,
    },
    {
        id: 'examination_note',
        category: 'medical',
        nameKey: 'templates.items.examinationNote.name',
        descriptionKey: 'templates.items.examinationNote.desc',
        icon: '🩺',
        tags: ['muayene', 'not', 'sağlık'],
        isConfidential: true,
        content: `<h2>🩺 Muayene Notu</h2>
<p><strong>Tarih:</strong> [Tarih ve Saat]</p>
<p><strong>Hasta:</strong> [Ad Soyad]</p>
<p><strong>Protokol No:</strong> [No]</p>
<hr>
<h3>Vital Bulgular</h3>
<table>
<tr><th>Parametre</th><th>Değer</th></tr>
<tr><td>Tansiyon</td><td>[mmHg]</td></tr>
<tr><td>Nabız</td><td>[/dk]</td></tr>
<tr><td>Ateş</td><td>[°C]</td></tr>
<tr><td>SpO2</td><td>[%]</td></tr>
</table>
<h3>Şikayet</h3>
<p>[Hasta şikayeti...]</p>
<h3>Fizik Muayene</h3>
<p>[Muayene bulguları...]</p>
<h3>Tetkikler</h3>
<ul>
<li>[ ] Kan tahlili</li>
<li>[ ] Görüntüleme</li>
</ul>
<h3>Tedavi</h3>
<p>[Reçete ve öneriler...]</p>
<hr>
<p><em>⚠️ GİZLİ SAĞLIK VERİSİ</em></p>`,
    },
    {
        id: 'prescription_note',
        category: 'medical',
        nameKey: 'templates.items.prescriptionNote.name',
        descriptionKey: 'templates.items.prescriptionNote.desc',
        icon: '💊',
        tags: ['reçete', 'ilaç', 'sağlık'],
        isConfidential: true,
        content: `<h2>💊 Reçete Özeti</h2>
<p><strong>Hasta:</strong> [Ad Soyad]</p>
<p><strong>Tarih:</strong> [Tarih]</p>
<p><strong>Hekim:</strong> [Dr. Ad Soyad]</p>
<hr>
<h3>İlaç Listesi</h3>
<table>
<tr><th>İlaç Adı</th><th>Doz</th><th>Kullanım</th><th>Süre</th></tr>
<tr><td>[İlaç]</td><td>[mg]</td><td>[Günde X kez]</td><td>[X gün]</td></tr>
</table>
<h3>Kullanım Talimatları</h3>
<ul>
<li>[Talimat 1]</li>
<li>[Talimat 2]</li>
</ul>
<h3>Uyarılar</h3>
<p>[Yan etki uyarıları, etkileşimler...]</p>
<hr>
<p><em>⚠️ SAĞLIK VERİSİ</em></p>`,
    },

    // ═══════════════════════════════════════════════════
    // CONFIDENTIAL / GİZLİ GENEL
    // ═══════════════════════════════════════════════════
    {
        id: 'confidential_meeting',
        category: 'confidential',
        nameKey: 'templates.items.confidentialMeeting.name',
        descriptionKey: 'templates.items.confidentialMeeting.desc',
        icon: '🤫',
        tags: ['gizli', 'toplantı', 'önemli'],
        isConfidential: true,
        content: `<h2>🤫 Gizli Toplantı Notu</h2>
<p><strong>Tarih:</strong> [Tarih ve Saat]</p>
<p><strong>Katılımcılar:</strong> [İsimler]</p>
<p><strong>Konu:</strong> [Toplantı Konusu]</p>
<hr>
<h3>Gündem Maddeleri</h3>
<ol>
<li>[Madde 1]</li>
<li>[Madde 2]</li>
</ol>
<h3>Tartışma Özeti</h3>
<p>[Tartışılan konular...]</p>
<h3>Kararlar</h3>
<ul>
<li>✅ [Karar 1]</li>
<li>✅ [Karar 2]</li>
</ul>
<h3>Aksiyon Maddeleri</h3>
<ul>
<li>[ ] [Sorumlu] - [Görev] - [Tarih]</li>
</ul>
<hr>
<p><em>🔒 GİZLİ - Sadece Katılımcılar İçin</em></p>`,
    },
    {
        id: 'nda_summary',
        category: 'confidential',
        nameKey: 'templates.items.ndaSummary.name',
        descriptionKey: 'templates.items.ndaSummary.desc',
        icon: '🔐',
        tags: ['nda', 'gizlilik', 'sözleşme'],
        isConfidential: true,
        content: `<h2>🔐 NDA / Gizlilik Sözleşmesi Özeti</h2>
<p><strong>Taraflar:</strong> [Taraf 1] ile [Taraf 2]</p>
<p><strong>İmza Tarihi:</strong> [Tarih]</p>
<p><strong>Geçerlilik Süresi:</strong> [Süre]</p>
<hr>
<h3>Kapsam</h3>
<p>[Hangi bilgiler gizli sayılır...]</p>
<h3>Yükümlülükler</h3>
<ul>
<li>Gizli bilgileri ifşa etmeme</li>
<li>Sadece belirlenen amaçla kullanma</li>
<li>Üçüncü taraflarla paylaşmama</li>
</ul>
<h3>İstisnalar</h3>
<ul>
<li>[İstisna durumları...]</li>
</ul>
<h3>Yaptırımlar</h3>
<p>[İhlal durumunda uygulanacak yaptırımlar...]</p>
<hr>
<p><em>🔒 BU BELGE GİZLİDİR</em></p>`,
    },
];

// Helper function to get templates by category
export const getTemplatesByCategory = (category: TemplateCategory): NoteTemplate[] => {
    return noteTemplates.filter(t => t.category === category);
};

// Helper function to get all categories with their templates
export const getGroupedTemplates = (): Record<TemplateCategory, NoteTemplate[]> => {
    return {
        legal: getTemplatesByCategory('legal'),
        accounting: getTemplatesByCategory('accounting'),
        medical: getTemplatesByCategory('medical'),
        confidential: getTemplatesByCategory('confidential'),
    };
};
