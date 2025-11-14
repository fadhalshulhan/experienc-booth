# 💾 Simpan PDF ke File Local (Development/Testing)

Panduan untuk menyimpan PDF ke file local untuk testing dan sample.

## 📋 Fitur

- ✅ Simpan PDF ke file local (development/testing)
- ✅ Optional (menggunakan environment variable)
- ✅ File disimpan di `tmp/reports/`
- ✅ Filename: `healthygo-report-{name}-{timestamp}.pdf`
- ✅ Response include path file (jika enabled)

## 🔧 Setup

### 1. Set Environment Variable

Tambahkan ke `.env.local`:

```env
SAVE_PDF_TO_LOCAL=true
```

### 2. Directory

PDF akan disimpan di:
```
tmp/reports/healthygo-report-{name}-{timestamp}.pdf
```

Directory akan dibuat otomatis jika belum ada.

### 3. Git Ignore

File PDF sudah di-ignore di `.gitignore`:
```
tmp/reports/
*.pdf
```

## 🚀 Cara Menggunakan

### 1. Development (Local)

```bash
# Set environment variable
echo "SAVE_PDF_TO_LOCAL=true" >> .env.local

# Run development server
npm run dev

# Test endpoint
curl -X POST http://localhost:3000/api/healthy-go-webhook \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Test User",
    "age": "30",
    "gender": "Male",
    "height": "170",
    "weight": "70",
    "bmi": "24.2",
    "bmi_status": "Normal",
    "ideal_weight": "65",
    "calorie_recommendation": "2000",
    "medical_history": "None",
    "goal": "Maintain weight",
    "exercise": "30 minutes daily",
    "breakfast_menu": "Oatmeal with fruits",
    "lunch_menu": "Grilled chicken with vegetables",
    "dinner_menu": "Salmon with rice",
    "snack_menu": "Apple",
    "recommendation": "Maintain current diet"
  }'
```

### 2. Response

Jika `SAVE_PDF_TO_LOCAL=true`, response akan include path file:

```json
{
  "status": "success",
  "message": "Report created successfully. PDF generated and sent to webhook and print endpoint.",
  "localFilePath": "/path/to/tmp/reports/healthygo-report-Test_User-1234567890.pdf",
  "note": "PDF saved to local file for testing (development only)"
}
```

### 3. Cek File

```bash
# List files
ls -la tmp/reports/

# Open PDF
open tmp/reports/healthygo-report-*.pdf

# Or on Linux
xdg-open tmp/reports/healthygo-report-*.pdf
```

## 📁 Struktur File

```
experience-booth/
├── tmp/
│   └── reports/
│       ├── healthygo-report-Test_User-1234567890.pdf
│       ├── healthygo-report-John_Doe-1234567891.pdf
│       └── ...
└── ...
```

## ⚠️ Catatan Penting

### 1. Development Only
- Fitur ini hanya untuk development/testing
- **Tidak recommended untuk production**
- Di production (Vercel), file system tidak persistent
- File akan hilang setelah deployment

### 2. Production (Vercel)
- Di Vercel, file system tidak persistent
- File tidak bisa disimpan secara permanen
- PDF hanya dikirim ke print endpoint
- PDF tidak disimpan ke file local di production

### 3. Security
- File PDF berisi data konsultasi (sensitive)
- Jangan commit file PDF ke Git
- File sudah di-ignore di `.gitignore`
- Hapus file secara berkala jika diperlukan

### 4. Storage
- File disimpan di `tmp/reports/`
- Directory akan dibuat otomatis
- File tidak dihapus otomatis
- Hapus file secara manual jika diperlukan

## 🧪 Testing

### 1. Test dengan Environment Variable

```bash
# Enable save to local
export SAVE_PDF_TO_LOCAL=true

# Run development server
npm run dev

# Test endpoint
curl -X POST http://localhost:3000/api/healthy-go-webhook \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Test User",
    "age": "30",
    ...
  }'

# Cek file
ls -la tmp/reports/
```

### 2. Test tanpa Environment Variable

```bash
# Disable save to local (default)
# SAVE_PDF_TO_LOCAL tidak di-set

# Run development server
npm run dev

# Test endpoint
curl -X POST http://localhost:3000/api/healthy-go-webhook \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Test User",
    "age": "30",
    ...
  }'

# File tidak akan disimpan
# Response tidak include localFilePath
```

## 🔍 Verifikasi

### 1. Cek Environment Variable

```bash
# Cek .env.local
cat .env.local | grep SAVE_PDF_TO_LOCAL

# Output: SAVE_PDF_TO_LOCAL=true
```

### 2. Cek File

```bash
# List files
ls -la tmp/reports/

# Output:
# -rw-r--r--  1 user  staff  12345  Dec 10 10:00 healthygo-report-Test_User-1234567890.pdf
```

### 3. Cek Logs

```bash
# Cek logs di terminal
# Output:
# PDF saved to local file: /path/to/tmp/reports/healthygo-report-Test_User-1234567890.pdf
# PDF size: 12345 bytes
```

## 🐛 Troubleshooting

### Error: "Failed to save PDF to local file"

**Penyebab:**
- Permission denied
- Directory tidak bisa dibuat
- Disk full

**Solusi:**
1. Cek permission directory
2. Cek disk space
3. Cek logs untuk detail error

### Error: "Directory not found"

**Penyebab:**
- Directory tidak dibuat
- Permission denied

**Solusi:**
1. Directory akan dibuat otomatis
2. Cek permission
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

## 📝 Best Practices

### 1. Development
- Gunakan `SAVE_PDF_TO_LOCAL=true` untuk testing
- Cek file PDF untuk verifikasi
- Hapus file secara berkala

### 2. Production
- **Jangan** set `SAVE_PDF_TO_LOCAL=true` di production
- PDF tidak perlu disimpan di production
- PDF langsung dikirim ke print endpoint

### 3. Security
- Jangan commit file PDF ke Git
- File sudah di-ignore di `.gitignore`
- Hapus file secara berkala

### 4. Cleanup
- Hapus file secara berkala
- Gunakan script untuk cleanup
- Atau hapus manual jika diperlukan

## 🔗 Links

- **Endpoint**: `http://localhost:3000/api/healthy-go-webhook` (development)
- **Directory**: `tmp/reports/`
- **Git Ignore**: `.gitignore`

---

**Selamat! PDF bisa disimpan ke file local untuk testing! 🎉**

