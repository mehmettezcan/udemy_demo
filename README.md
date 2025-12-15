# Mini Eğitim & Canlı Ders Platformu (DEMO)

Bu proje; mimari düşünme, rol bazlı yetkilendirme, ödeme akışı simülasyonu ve eğitmen–öğrenci eşleştirme mantığını göstermek amacıyla hazırlanmış küçük ölçekli bir DEMO backend uygulamasıdır.

Odak noktası **arayüz veya gerçek ödeme entegrasyonu değil**, temiz mimari yaklaşım, iş akışlarının modellenmesi ve gelecekte ölçeklenebilirliktir.

---

## Kullanılan Teknolojiler ve Nedenleri

### Backend
- **NestJS (Node.js)**
  - Modüler mimariyi doğal olarak destekler (`module / controller / service`)
  - Dependency Injection, Guard ve Strategy gibi kurumsal backend kavramlarını içerir
  - Hızlı prototipleme ve üretim ortamına uygun yapı sunar

### Kimlik Doğrulama & Yetkilendirme
- **JWT + Passport**
  - Stateless (durumsuz) kimlik doğrulama
  - `user`, `instructor`, `admin` rollerine göre erişim kontrolü
  - Yatay ölçeklenmeye uygundur

### Veri Katmanı
- **In-memory mock veri (JSON benzeri yapı)**
  - Gerçek veritabanı olmadan iş kurallarının gösterilmesini sağlar
  - Üretim ortamında PostgreSQL / MySQL / MongoDB gibi veritabanları ile kolayca değiştirilebilir

### API Dokümantasyonu
- **Swagger (OpenAPI)**
  - Endpoint’lerin ve istek/yanıt modellerinin net biçimde incelenmesini sağlar
  - Authentication akışı kolayca test edilebilir

---

## Ödeme Akışının Mantığı

Ödeme sistemi, gerçek bir ödeme sağlayıcısı yerine **simüle edilmiş bir ödeme endpoint’i** ile modellenmiştir.

### Akış
1. Kullanıcı bir eğitimi satın almak için `/payments/pay` endpoint’ini çağırır
2. Ödeme sonucu request içindeki simülasyon parametresi ile belirlenir
3. Ödeme başarılıysa:
   - Kullanıcı–eğitim ilişkisi oluşturulur (purchase kaydı)
   - Eğitim kullanıcıya atanmış kabul edilir
4. Kullanıcı panelinde satın alınan eğitimler listelenir

Bu yapı, Stripe, iyzico veya PayTR gibi servislerin çalışma mantığına birebir uyarlanabilir.

---

## Satın Alınan Eğitimler (Kullanıcı Paneli)

Kullanıcılar, satın aldıkları eğitimleri aşağıdaki endpoint üzerinden görüntüleyebilir:

GET /users/me/courses

- Eğitimler ödeme (purchase) kayıtları üzerinden türetilir
- Ekstra manuel atama gerekmez
- Kullanıcının satın aldığı eğitim yoksa boş liste döner

Bu yaklaşım gerçek bir “Satın Aldığım Eğitimler” paneli davranışını temsil eder.

---

## Canlı Ders Eşleştirme Mantığı (Mini Uber Modeli)

Canlı ders sistemi, talep–eşleştirme mantığı ile tasarlanmıştır.

### Akış
1. Kullanıcı canlı ders talebi oluşturur
2. Sistem uygun eğitmenleri belirler
3. İlk uygun eğitmen otomatik olarak atanır
4. Eğitmene bildirim simülasyonu yapılır (log / response)

### Tasarım Hedefleri
- Hızlı ve deterministik eşleştirme
- Basit ve anlaşılır algoritma
- Geliştirilebilir altyapı (uygunluk, puanlama, kuyruk sistemi)

---

## Ölçeklenebilirlik ve Gelecek Geliştirmeler

Mevcut mimari, üretim ortamına geçiş için hazır bir temel sunmaktadır.

İleride eklenebilecek geliştirmeler:
- Gerçek veritabanı entegrasyonu
- Redis ile cache ve state yönetimi
- Queue sistemleri (BullMQ / RabbitMQ) ile asenkron işlemler
- WebSocket veya push notification entegrasyonu
- Gelişmiş eğitmen eşleştirme algoritmaları
- Modüllerin microservice mimarisine ayrılması

---

## Testlerin Çalıştırılması

Bu projede uçtan uca (E2E) testler **Jest + Supertest** kullanılarak yazılmıştır.  
Testler; kimlik doğrulama, rol bazlı yetkilendirme, eğitim satın alma ve canlı ders eşleştirme akışlarını kapsar.

### Testleri Çalıştırma

1. Bağımlılıkları yükleyin:
```bash
npm install
```
2. E2E testlerini çalıştırın:
```bash
npm run test:e2e
```

Testler sırasında uygulama in-memory mock data ile çalışır.
Gerçek veritabanı veya ek yapılandırma gerekmez.

Test Kapsamı
Kullanıcı / eğitmen / admin login işlemleri

JWT doğrulama ve rol bazlı erişim kontrolleri

Eğitim listeleme

Eğitim satın alma (başarılı / başarısız / tekrar satın alma)

“Satın aldığım eğitimler” paneli

Canlı ders talebi oluşturma

Eğitmen–öğrenci otomatik eşleştirme