# 📁 Lokasi Penyimpanan PDF

Panduan tentang di mana file PDF disimpan berdasarkan environment.

## 📋 Lokasi Penyimpanan PDF

### 1. Development (Local) - Jika `SAVE_PDF_TO_LOCAL=true`

**Lokasi:**
```
tmp/reports/healthygo-report-{name}-{timestamp}.pdf
```

**Contoh:**
```
/Users/fadhalshulhan/Coding/Portfolio/cekat/experience-booth/tmp/reports/healthygo-report-Test_User-1234567890.pdf
```

**Struktur Directory:**
```
experience-booth/
├── tmp/
│   └── reports/
│       ├── healthygo-report-Test_User-1234567890.pdf
│       ├── healthygo-report-John_Doe-1234567891.pdf
│       └── ...
└── ...
```

### 2. Production (Vercel) - PDF Tidak Disimpan

**Lokasi:**
```
PDF TIDAK DISIMPAN di production
```

**Alasan:**
- Vercel tidak punya persistent storage
- File system tidak persistent (file akan hilang setelah deployment)
- PDF langsung dikirim ke print endpoint dan webhook external
- PDF tidak disimpan ke file local

### 3. Default Behavior - PDF Tidak Disimpan

**Jika `SAVE_PDF_TO_LOCAL` tidak di-set:**
- PDF tidak disimpan ke file local
- PDF langsung dikirim ke print endpoint
- PDF dikirim ke webhook external (base64)
- PDF tidak disimpan secara permanen

## 🔧 Cara Enable/Disable Save to Local

### Enable Save to Local (Development)

**1. Set Environment Variable:**

Tambahkan ke `.env.local`:
```env
SAVE_PDF_TO_LOCAL=true
```

**2. Restart Development Server:**

```bash
npm run dev
```

**3. Test Endpoint:**

```bash
curl -X POST http://localhost:3000/api/healthy-go-webhook \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Test User",
    ...
  }'
```

**4. Cek File:**

```bash
# List files
ls -la tmp/reports/

# Open PDF
open tmp/reports/healthygo-report-*.pdf
```

### Disable Save to Local (Default)

**1. Jangan set Environment Variable:**

Hapus atau comment `SAVE_PDF_TO_LOCAL` dari `.env.local`:
```env
# SAVE_PDF_TO_LOCAL=true
```

**2. Restart Development Server:**

```bash
npm run dev
```

**3. Test Endpoint:**

PDF tidak akan disimpan ke file local.

## 📁 Struktur Directory

### Development (Local) - Jika Enabled

```
experience-booth/
├── tmp/
│   └── reports/
│       ├── healthygo-report-Test_User-1234567890.pdf
│       ├── healthygo-report-John_Doe-1234567891.pdf
│       └── ...
├── .env.local
├── pages/
│   └── api/
│       └── healthy-go-webhook.ts
└── ...
```

### Production (Vercel) - Tidak Ada Directory

```
Vercel Server (Ephemeral)
├── /tmp (temporary, akan hilang setelah deployment)
└── ...
```

**Note:** File tidak disimpan di production karena Vercel tidak punya persistent storage.

## 🔍 Cara Akses File PDF

### Development (Local)

**1. List Files:**

```bash
# List semua file PDF
ls -la tmp/reports/

# List dengan detail
ls -lh tmp/reports/
```

**2. Open PDF:**

```bash
# macOS
open tmp/reports/healthygo-report-*.pdf

# Linux
xdg-open tmp/reports/healthygo-report-*.pdf

# Windows
start tmp/reports/healthygo-report-*.pdf
```

**3. Cek File Size:**

```bash
# Cek ukuran file
du -h tmp/reports/*.pdf

# Cek detail file
file tmp/reports/*.pdf
```

**4. Cek Response (jika enabled):**

Response dari endpoint akan include path file:

```json
{
  "status": "success",
  "message": "Report created successfully. PDF generated and sent to webhook and print endpoint.",
  "localFilePath": "/path/to/tmp/reports/healthygo-report-Test_User-1234567890.pdf",
  "note": "PDF saved to local file for testing (development only)"
}
```

### Production (Vercel)

**1. PDF Tidak Disimpan:**

PDF tidak disimpan di production karena Vercel tidak punya persistent storage.

**2. Akses PDF via Webhook External:**

PDF dikirim ke webhook external sebagai base64:
- URL: `https://workflows.cekat.ai/webhook/healthy-go/innov`
- Format: Base64 encoded PDF
- Field: `pdf_base64`

**3. Akses PDF via Print Endpoint:**

PDF dikirim ke print endpoint sebagai file:
- URL: `https://nontestable-odelia-isomerically.ngrok-free.dev/print`
- Format: multipart/form-data
- Field: `file`

## 📝 Naming Convention

### Filename Format

```
healthygo-report-{name}-{timestamp}.pdf
```

**Contoh:**
- `healthygo-report-Test_User-1234567890.pdf`
- `healthygo-report-John_Doe-1234567891.pdf`
- `healthygo-report-customer-1234567892.pdf`

### Filename Components

- **Prefix**: `healthygo-report-`
- **Name**: Customer name (sanitized, hanya alphanumeric dan underscore)
- **Timestamp**: Unix timestamp (milliseconds)
- **Extension**: `.pdf`

### Sanitization

Nama customer akan di-sanitize:
- Hapus karakter special (kecuali alphanumeric)
- Replace dengan underscore `_`
- Contoh: `John Doe` → `John_Doe`

## 🔐 Security

### Git Ignore

File PDF sudah di-ignore di `.gitignore`:
```
tmp/reports/
*.pdf
```

**Alasan:**
- File PDF berisi data konsultasi (sensitive)
- File tidak perlu di-commit ke Git
- File hanya untuk testing/development

### Cleanup

**1. Hapus File Secara Manual:**

```bash
# Hapus semua file PDF
rm -rf tmp/reports/*.pdf

# Hapus directory
rm -rf tmp/reports/
```

**2. Hapus File Secara Berkala:**

File tidak dihapus otomatis. Hapus secara manual jika diperlukan.

## 🐛 Troubleshooting

### Error: "Directory not found"

**Penyebab:**
- Directory `tmp/reports/` tidak ada
- Permission denied

**Solusi:**
1. Directory akan dibuat otomatis jika `SAVE_PDF_TO_LOCAL=true`
2. Cek permission directory
3. Cek logs untuk detail error

### Error: "Failed to save PDF to local file"

**Penyebab:**
- Permission denied
- Disk full
- Directory tidak bisa dibuat

**Solusi:**
1. Cek permission directory
2. Cek disk space
3. Cek logs untuk detail error

### File tidak tersimpan

**Penyebab:**
- `SAVE_PDF_TO_LOCAL` tidak di-set
- Environment variable tidak ter-load
- Error saat save

**Solusi:**
1. Cek environment variable: `echo $SAVE_PDF_TO_LOCAL`
2. Cek `.env.local` file
3. Restart development server
4. Cek logs untuk detail error

## 📊 Summary

### Development (Local)

| Condition | Location | Status |
|-----------|----------|--------|
| `SAVE_PDF_TO_LOCAL=true` | `tmp/reports/` | ✅ Saved |
| `SAVE_PDF_TO_LOCAL` not set | - | ❌ Not saved |

### Production (Vercel)

| Condition | Location | Status |
|-----------|----------|--------|
| Always | - | ❌ Not saved |
| Reason | Vercel tidak punya persistent storage | - |

## 🔗 Links

- **Development**: `tmp/reports/`
- **Production**: Not saved (Vercel)
- **Webhook External**: Base64 encoded PDF
- **Print Endpoint**: File (multipart/form-data)

---

**Selamat! File PDF bisa disimpan di `tmp/reports/` untuk development/testing! 🎉**

