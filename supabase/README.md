# Supabase Kurulum Talimatları

## 1. Supabase Projesi Oluştur

1. [supabase.com](https://supabase.com) adresine git
2. "Start your project" tıkla
3. Yeni proje oluştur:
   - **Organization:** Yeni oluştur veya mevcut olanı seç
   - **Project name:** `neural-pad` veya istediğin isim
   - **Database Password:** Güçlü bir şifre belirle (kaydet!)
   - **Region:** `Europe (Frankfurt)` veya size en yakın
4. Proje oluşturulmasını bekle (~2 dakika)

## 2. Database Schema'sını Çalıştır

1. Supabase Dashboard → **SQL Editor**'e git
2. `supabase/schema.sql` dosyasını aç
3. Tüm içeriği kopyala ve SQL Editor'e yapıştır
4. **RUN** butonuna tıkla
5. "Success" mesajını gördüğünde tamamdır

## 3. API Keys'leri Al

1. Supabase Dashboard → **Settings** → **API**'ye git
2. Şu bilgileri kopyala:
   - **Project URL:** `https://xxxxx.supabase.co`
   - **anon public key:** `eyJhbGc...` (uzun token)

## 4. .env Dosyasını Oluştur

Proje kök dizininde `.env` dosyası oluştur:

```bash
# Supabase Configuration
VITE_SUPABASE_URL=https://xxxxx.supabase.co
VITE_SUPABASE_ANON_KEY=eyJhbGc...
```

**ÖNEMLİ:** `.env` dosyasını Git'e commit etme! (`.gitignore`'da olduğundan emin ol)

## 5. Testing

1. Development server'ı yeniden başlat:
```bash
npm run dev
```

2. Tarayıcıda aç: `http://localhost:5175`

3. Artık Supabase kullanıyor! 

## Sonraki Adımlar

- [ ] Auth sistemi (kayıt/giriş) eklenecek
- [ ] Profil sayfası oluşturulacak
- [ ] API key yönetimi eklenecek
