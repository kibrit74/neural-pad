Veri Avcısı Nedir?
Veri Avcısı, PDF dokümanı yüklendiği anda devreye giren bir otomatik veri madenciliği modülüdür. Dokümanın binlerce satırlık metnini milisaniyeler içinde analiz eder ve belirli kalıplara (telefon, IBAN, tarih, plaka vb.) uyan verileri ayıklayarak bir panelde listeler.
2️⃣ Nasıl Yapılır? (Teknik Altyapı)
Bu özellik iki ana aşamada gerçekleşir:
Metin Çıkarımı (Extraction): pdf.js kütüphanesi kullanılarak dokümanın her sayfası taranır ve görsel olmayan ham metin katmanı (text layer) belleğe alınır.
Regex Motoru (Pattern Matching): utils/regex.ts dosyasında tanımlanan Düzenli İfadeler (Regular Expressions) bu metin üzerinde koşar.
Örnek: IBAN bulmak için TR\d{2}\s?(\d{4}\s?){5}\d{2} kalıbı kullanılır.
Bağlamsal Analiz (Contextual Search): Özellikle tarihlerde, sadece "12.05.2024"ü bulmakla kalmaz; o tarihin öncesindeki ve sonrasındaki 40 karakteri (Örn: "...teslim tarihi 12.05.2024 olan fatura...") yakalayarak kullanıcıya "bu tarih ne ile ilgili?" sorusunun cevabını verir.
Local-First (Gizlilik): Bu işlem tamamen kullanıcının tarayıcısında (client-side) yapılır. Veriler hiçbir sunucuya gönderilmez, bu da hukuki ve finansal belgeler için %100 güvenlik sağlar.
3️⃣ Neleri Yakalar?
Uygulama şu anda şu veri türlerine odaklanmıştır:
İletişim: Telefon numaraları, E-posta adresleri.
Finans: IBAN numaraları, Para miktarları (TL, USD, EUR vb.).
Hukuk/Resmi: TCKN/VKN (Vergi numaraları), Vergi Daireleri, Plakalar.
Zaman: Tarihler (Bağlamı ile birlikte).
Özel Veri Avcısı: Kullanıcının ayarlardan eklediği "Dosya No", "Hasta Adı", "Karar" gibi özel anahtar kelimelerin yanındaki değerler.
4️⃣ Ne İçin ve Kimler İçin Kullanılır?
Avukatlar ve Hukuk Büroları: Yüzlerce sayfalık bilirkişi raporu veya icra dosyasında "Esas No", "İcra Dairesi" veya "Vekalet Ücreti" gibi bilgileri saniyeler içinde bulmak için.
Muhasebeciler: Faturalardaki vergi numaralarını, miktarları ve IBAN'ları tek tek kopyalamak yerine topluca Excel'e aktarmak için.
Emlakçılar / Danışmanlar: Sözleşmelerdeki telefon ve adres bilgilerini rehbere hızlıca eklemek için.
Günlük Kullanım: Bir PDF içerisindeki linklere veya tarihlere (Takvime ekle özelliği ile) hızlı erişim sağlamak için.
5️⃣ Nasıl Kullanılır? (UX Akışı)
Yükle: PDF sürüklenir veya kamerayla çekilir.
Otomatik Tarama: Sağ paneldeki "Veri Avcısı" simgesi (büyüteç) tıklandığında bulunan tüm veriler kategorize edilmiş olarak görünür.
Hızlı Aksiyonlar:
Telefona tıkla -> Ara.
Tarihe tıkla -> Google Takvim'e ekle.
IBAN'a tıkla -> Kopyala.
Dışa Aktar: "Excel (XLSX) İndir" butonuna basarak bulunan tüm bu veriler profesyonel bir tablo olarak bilgisayara indirilir.
Özetle: Veri Avcısı, PDF'i sadece bir "resim" veya "metin" olarak görmez; onu yapılandırılmış bir veritabanı gibi işleyerek kullanıcının doküman üzerindeki hakimiyetini maksimize eder.
