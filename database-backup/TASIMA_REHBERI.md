# Veritabanı Transfer Dosyası

Bu klasör, projeyi başka bir bilgisayara taşırken verilerinizi korumak için oluşturulmuştur.

## Nasıl Kullanılır?

1. Projeyi yeni bilgisayara indirin (`git clone`).
2. Gerekli paketleri kurun (`npm install`).
3. `.env` dosyanızı oluşturun (DATABASE_URL="file:./prisma/dev.db").
4. Bu klasördeki `dev-transfer.db` dosyasını ana dizindeki `prisma` klasörüne kopyalayın ve adını `dev.db` yapın.

```bash
# Windows (PowerShell)
copy database-backup\dev-transfer.db prisma\dev.db
```

5. Son olarak prisma client'ı generate edin:
```bash
npx prisma generate
```

Artık `npm run dev` ile projeyi tüm verilerle birlikte çalıştırabilirsiniz.
