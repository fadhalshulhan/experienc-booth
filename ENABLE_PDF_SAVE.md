# ✅ Enable Save PDF to Local - SUDAH DIAKTIFKAN!

PDF sekarang akan **DISIMPAN** ke file local untuk development/testing.

## ✅ Yang Sudah Dilakukan

1. ✅ **Environment Variable**: `SAVE_PDF_TO_LOCAL=true` sudah ditambahkan ke `.env.local`
2. ✅ **Directory**: `tmp/reports/` sudah dibuat
3. ✅ **Code**: Sudah siap untuk save PDF ke local

## 🚀 Langkah Selanjutnya

### 1. Restart Development Server

**PENTING:** Restart development server untuk load environment variable baru!

```bash
# Stop server (Ctrl+C)
# Kemudian restart
npm run dev
```

### 2. Test Endpoint

Setelah server restart, test endpoint:

```bash
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

### 3. Cek File PDF

Setelah test, cek file PDF:

```bash
# List files
ls -la tmp/reports/

# Open PDF
open tmp/reports/healthygo-report-*.pdf
```

### 4. Verifikasi Response

Response dari endpoint akan include path file:

```json
{
  "status": "success",
  "message": "Report created successfully. PDF generated and sent to webhook and print endpoint.",
  "localFilePath": "/path/to/tmp/reports/healthygo-report-Test_User-1234567890.pdf",
  "note": "PDF saved to local file for testing (development only)"
}
```

## 📁 Lokasi File PDF

**Lokasi:**
```
tmp/reports/healthygo-report-{name}-{timestamp}.pdf
```

**Contoh:**
```
tmp/reports/healthygo-report-Test_User-1702567890123.pdf
```

**Path Lengkap:**
```
/Users/fadhalshulhan/Coding/Portfolio/cekat/experience-booth/tmp/reports/healthygo-report-{name}-{timestamp}.pdf
```

## 🔍 Verifikasi

### 1. Cek Environment Variable

```bash
# Cek .env.local
cat .env.local | grep SAVE_PDF

# Output:
# SAVE_PDF_TO_LOCAL=true
```

### 2. Cek Directory

```bash
# List directory
ls -la tmp/reports/

# Output:
# drwxr-xr-x  2 user  staff  64 Nov 14 20:04 .
# drwxr-xr-x  3 user  staff  96 Nov 14 20:04 ..
```

### 3. Cek Logs

Setelah test endpoint, cek logs di terminal:

```
PDF saved to local file: /path/to/tmp/reports/healthygo-report-Test_User-1234567890.pdf
PDF size: 12345 bytes
```

### 4. Cek File

```bash
# List files
ls -la tmp/reports/

# Output:
# -rw-r--r--  1 user  staff  12345  Nov 14 20:05 healthygo-report-Test_User-1234567890.pdf
```

## 🎯 Quick Test

### Test dengan curl

```bash
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
  }' | jq .
```

### Cek file setelah test

```bash
# List files
ls -lh tmp/reports/

# Open PDF
open tmp/reports/healthygo-report-*.pdf
```

## ⚠️ Catatan Penting

### 1. Development Only
- Fitur ini hanya untuk development/testing
- **Jangan** set `SAVE_PDF_TO_LOCAL=true` di production (Vercel)
- Di production, PDF tidak disimpan (Vercel tidak punya persistent storage)

### 2. Restart Server
- **PENTING:** Restart development server setelah set environment variable
- Environment variable hanya ter-load saat server start
- Server tidak auto-reload environment variable

### 3. File Location
- File disimpan di `tmp/reports/`
- Directory dibuat otomatis jika belum ada
- File tidak di-commit ke Git (sudah di-ignore)

### 4. Security
- File PDF berisi data konsultasi (sensitive)
- Jangan commit file PDF ke Git
- File sudah di-ignore di `.gitignore`
- Hapus file secara berkala jika diperlukan

## 🐛 Troubleshooting

### PDF tidak tersimpan

**Penyebab:**
- Server belum restart
- Environment variable tidak ter-load
- Permission denied

**Solusi:**
1. Restart development server
2. Cek environment variable: `cat .env.local | grep SAVE_PDF`
3. Cek permission directory: `ls -la tmp/reports/`
4. Cek logs di terminal untuk error

### Error: "Failed to save PDF to local file"

**Penyebab:**
- Permission denied
- Disk full
- Directory tidak bisa dibuat

**Solusi:**
1. Cek permission directory
2. Cek disk space
3. Cek logs untuk detail error

### File tidak muncul

**Penyebab:**
- Server belum restart
- Endpoint belum dipanggil
- Error saat save

**Solusi:**
1. Restart development server
2. Test endpoint dengan curl
3. Cek logs di terminal
4. Cek directory: `ls -la tmp/reports/`

## ✅ Checklist

- [x] Environment variable `SAVE_PDF_TO_LOCAL=true` ditambahkan
- [x] Directory `tmp/reports/` dibuat
- [ ] Development server restart
- [ ] Test endpoint (POST request)
- [ ] Cek file PDF di `tmp/reports/`
- [ ] Verifikasi response include `localFilePath`
- [ ] Open PDF untuk verifikasi

## 🔗 Links

- **Directory**: `tmp/reports/`
- **Environment Variable**: `SAVE_PDF_TO_LOCAL=true`
- **Endpoint**: `http://localhost:3000/api/healthy-go-webhook`

---

**Selamat! PDF sekarang akan DISIMPAN ke file local! 🎉**

**PENTING:** Restart development server untuk apply perubahan!

