# Requirements Document

## Introduction

Neural Pad landing page'inin indirme linklerini güncellemek ve kullanıcı deneyimini iyileştirmek için geliştirmeler yapmak. Landing page, uygulamanın ilk karşılama noktası olarak kullanıcılara ürünü tanıtır, özelliklerini sergiler ve indirme seçenekleri sunar.

## Glossary

- **Landing Page**: Uygulamanın ilk açılışta gösterilen karşılama sayfası (WelcomeModal component)
- **Download Link**: GitHub releases üzerinden uygulamanın kurulum dosyalarına erişim sağlayan URL
- **Release Version**: Uygulamanın sürüm numarası (örn: v1.0.0)
- **Platform**: İşletim sistemi türü (Windows, macOS, Linux)
- **WelcomeModal**: Landing page'i render eden React component
- **i18n**: Çok dilli destek sistemi (Internationalization)
- **Glassmorphism**: Bulanık arka plan ve şeffaflık kullanarak cam görünümü yaratan modern tasarım trendi
- **Parallax Effect**: Scroll sırasında farklı katmanların farklı hızlarda hareket etmesiyle derinlik hissi yaratan efekt
- **Microinteraction**: Kullanıcı etkileşimlerine yanıt veren küçük, detaylı animasyonlar
- **Gradient Mesh**: Birden fazla rengin yumuşak geçişlerle karıştığı arka plan deseni
- **Ripple Effect**: Tıklama noktasından dalgalar halinde yayılan animasyon efekti
- **Skeleton Screen**: İçerik yüklenirken gösterilen placeholder animasyonu
- **3D Transform**: CSS transform özellikleri ile üç boyutlu görünüm efektleri

## Requirements

### Requirement 1

**User Story:** Kullanıcı olarak, güncel sürümü indirebilmek için doğru indirme linklerine erişmek istiyorum, böylece uygulamayı sorunsuz bir şekilde kurabilirim.

#### Acceptance Criteria

1. WHEN kullanıcı Windows indirme butonuna tıkladığında, THE Landing Page SHALL kullanıcıyı "https://github.com/kibrit74/neural-pad/releases/download/v1.0.0/Neural.Pad.Setup.1.0.0.exe" adresine yönlendirmelidir
2. WHEN kullanıcı macOS indirme butonuna tıkladığında, THE Landing Page SHALL kullanıcıyı "https://github.com/kibrit74/neural-pad/releases/download/v1.0.0/Neural.Pad-1.0.0.dmg" adresine yönlendirmelidir
3. WHEN kullanıcı Linux indirme butonuna tıkladığında, THE Landing Page SHALL kullanıcıyı "https://github.com/kibrit74/neural-pad/releases/download/v1.0.0/Neural.Pad-1.0.0.AppImage" adresine yönlendirmelidir
4. WHEN indirme linki tıklandığında, THE Landing Page SHALL linki yeni bir tarayıcı sekmesinde açmalıdır

### Requirement 2

**User Story:** Kullanıcı olarak, landing page'de daha zengin görsel içerik görmek istiyorum, böylece uygulamanın yeteneklerini daha iyi anlayabilirim.

#### Acceptance Criteria

1. THE Landing Page SHALL en az 8 adet uygulama ekran görüntüsünü otomatik geçişli slider formatında göstermelidir
2. WHILE kullanıcı slider üzerinde gezinirken, THE Landing Page SHALL her ekran görüntüsü için açıklayıcı başlık ve açıklama metni göstermelidir
3. WHEN kullanıcı slider üzerine geldiğinde, THE Landing Page SHALL otomatik geçişi duraklat malıdır
4. THE Landing Page SHALL slider için navigasyon kontrolleri (önceki, sonraki, nokta göstergeleri) sağlamalıdır

### Requirement 3

**User Story:** Kullanıcı olarak, uygulamanın temel özelliklerini hızlıca görmek istiyorum, böylece uygulamanın bana uygun olup olmadığına karar verebilirim.

#### Acceptance Criteria

1. THE Landing Page SHALL en az 6 adet özellik kartı göstermelidir
2. THE Landing Page SHALL her özellik kartında ikon, başlık ve açıklama içermelidir
3. THE Landing Page SHALL özellikleri grid layout ile düzenli bir şekilde göstermelidir
4. THE Landing Page SHALL özellik kartlarını animasyonlu bir şekilde yüklemelidir

### Requirement 4

**User Story:** Kullanıcı olarak, landing page'i kendi dilimde görmek istiyorum, böylece içeriği daha iyi anlayabilirim.

#### Acceptance Criteria

1. THE Landing Page SHALL Türkçe ve İngilizce dil seçenekleri sunmalıdır
2. WHEN kullanıcı dil değiştirdiğinde, THE Landing Page SHALL tüm metinleri seçilen dilde göstermelidir
3. THE Landing Page SHALL dil seçim butonlarını sayfanın sağ üst köşesinde göstermelidir
4. THE Landing Page SHALL aktif dili görsel olarak vurgulamalıdır

### Requirement 5

**User Story:** Kullanıcı olarak, landing page'de iletişim bilgilerine ve sosyal medya linklerine erişmek istiyorum, böylece gerektiğinde destek alabilirim veya projeyi takip edebilirim.

#### Acceptance Criteria

1. THE Landing Page SHALL footer bölümünde e-posta adresi göstermelidir
2. THE Landing Page SHALL GitHub, Twitter ve LinkedIn sosyal medya linklerini göstermelidir
3. WHEN kullanıcı sosyal medya ikonuna tıkladığında, THE Landing Page SHALL ilgili platformu yeni sekmede açmalıdır
4. THE Landing Page SHALL footer'da telif hakkı bilgisi ve güncel yıl göstermelidir

### Requirement 6

**User Story:** Kullanıcı olarak, landing page'den uygulamaya geçiş yapmak istiyorum, böylece hemen not almaya başlayabilirim.

#### Acceptance Criteria

1. THE Landing Page SHALL hero bölümünde belirgin bir "Başla" (CTA) butonu göstermelidir
2. WHEN kullanıcı CTA butonuna tıkladığında, THE Landing Page SHALL kapanmalı ve ana uygulama görünümü açılmalıdır
3. THE Landing Page SHALL CTA butonunu animasyonlu ve dikkat çekici bir şekilde göstermelidir
4. THE Landing Page SHALL kullanıcının landing page'i tekrar görmek istediğinde erişebileceği bir geri dönüş mekanizması sağlamalıdır

### Requirement 7

**User Story:** Kullanıcı olarak, landing page'in responsive ve modern bir tasarıma sahip olmasını istiyorum, böylece farklı cihazlarda iyi görünüm elde edebilirim.

#### Acceptance Criteria

1. THE Landing Page SHALL mobil, tablet ve masaüstü cihazlarda düzgün görüntülenmelidir
2. THE Landing Page SHALL modern gradient efektleri ve animasyonlar kullanmalıdır
3. THE Landing Page SHALL karanlık tema desteği sağlamalıdır
4. THE Landing Page SHALL yükleme sırasında yumuşak animasyonlar göstermelidir

### Requirement 8

**User Story:** Kullanıcı olarak, landing page'de animasyonlu ve etkileşimli görsel öğeler görmek istiyorum, böylece daha etkileyici bir deneyim yaşayabilirim.

#### Acceptance Criteria

1. THE Landing Page SHALL özellik kartlarında hover durumunda 3D transform efektleri göstermelidir
2. THE Landing Page SHALL hero bölümünde animasyonlu gradient arka plan kullanmalıdır
3. WHEN kullanıcı özellik kartının üzerine geldiğinde, THE Landing Page SHALL kartı hafifçe yukarı kaldırmalı ve gölge efekti eklemelidir
4. THE Landing Page SHALL scroll sırasında parallax efekti ile derinlik hissi yaratmalıdır

### Requirement 9

**User Story:** Kullanıcı olarak, landing page'de glassmorphism ve modern görsel efektler görmek istiyorum, böylece premium bir kullanıcı deneyimi yaşayabilirim.

#### Acceptance Criteria

1. THE Landing Page SHALL özellik kartlarında glassmorphism efekti (blur ve transparency) kullanmalıdır
2. THE Landing Page SHALL slider container'ında backdrop-blur efekti ile modern bir görünüm sağlamalıdır
3. THE Landing Page SHALL butonlarda gradient border ve glow efektleri göstermelidir
4. THE Landing Page SHALL arka planda animasyonlu gradient mesh veya blob şekilleri göstermelidir

### Requirement 10

**User Story:** Kullanıcı olarak, landing page'de istatistikler ve başarı göstergeleri görmek istiyorum, böylece uygulamanın popülerliğini ve güvenilirliğini anlayabilirim.

#### Acceptance Criteria

1. THE Landing Page SHALL hero bölümünde animasyonlu sayaç ile kullanıcı sayısı, indirme sayısı veya not sayısı gibi istatistikler göstermelidir
2. THE Landing Page SHALL istatistik kartlarını grid layout ile düzenli bir şekilde göstermelidir
3. WHEN sayfa yüklendiğinde, THE Landing Page SHALL sayaçları sıfırdan hedef değere animasyonlu olarak artırmalıdır
4. THE Landing Page SHALL her istatistik için ikon ve açıklayıcı metin içermelidir

### Requirement 11

**User Story:** Kullanıcı olarak, landing page'de mikroetkileşimler ve detaylı animasyonlar görmek istiyorum, böylece daha canlı ve dinamik bir deneyim yaşayabilirim.

#### Acceptance Criteria

1. THE Landing Page SHALL butonlarda ripple efekti (tıklama animasyonu) göstermelidir
2. THE Landing Page SHALL scroll sırasında öğelerin fade-in ve slide-up animasyonları ile görünmesini sağlamalıdır
3. THE Landing Page SHALL sosyal medya ikonlarında hover durumunda renk değişimi ve scale animasyonu göstermelidir
4. THE Landing Page SHALL loading durumunda skeleton screen veya shimmer efekti göstermelidir

### Requirement 12

**User Story:** Kullanıcı olarak, landing page'de zengin tipografi ve görsel hiyerarşi görmek istiyorum, böylece içeriği daha kolay okuyabilirim.

#### Acceptance Criteria

1. THE Landing Page SHALL başlıklarda gradient text efekti kullanmalıdır
2. THE Landing Page SHALL önemli metinlerde text-shadow veya glow efekti ile vurgu yapmalıdır
3. THE Landing Page SHALL farklı font ağırlıkları ve boyutları ile net bir görsel hiyerarşi oluşturmalıdır
4. THE Landing Page SHALL özel vurgu gerektiren kelimelerde animasyonlu underline veya highlight efekti göstermelidir
