# 🔄 Alur Webhook: ElevenLabs → Generate PDF → Print

Panduan lengkap tentang alur generate PDF dan print setelah webhook di-set di ElevenLabs.

## 📋 Alur Lengkap (Saat Ini - Otomatis)

### 1. ElevenLabs Agent memanggil tool `create_report`
- Agent mengumpulkan data konsultasi dari conversation
- Agent memanggil tool `create_report` dengan data konsultasi
- Tool mengirim POST request ke endpoint kita

### 2. Endpoint menerima data dari ElevenLabs
- **Endpoint**: `https://experience-booth.vercel.app/api/healthy-go-webhook`
- **Method**: POST
- **Data**: Consultation data (name, age, gender, height, weight, bmi, etc.)

### 3. Endpoint generate PDF
- Endpoint menerima data konsultasi
- Generate PDF menggunakan `pdfkit` dengan template HealthyGo
- PDF berisi:
  - Patient Information
  - Health Metrics (BMI, BMI Status, Ideal Weight, Calorie Recommendation)
  - Medical History
  - Health Goals
  - Exercise Plan
  - Meal Plan (Breakfast, Lunch, Dinner, Snack)
  - Recommendations

### 4. Endpoint kirim PDF ke webhook external
- Convert PDF ke base64
- Kirim data + PDF (base64) ke webhook external:
  - **URL**: `https://workflows.cekat.ai/webhook/healthy-go/innov`
  - **Method**: POST
  - **Body**: JSON dengan data konsultasi + `pdf_base64` + `pdf_filename`

### 5. Endpoint kirim PDF ke print endpoint
- Kirim PDF (file) ke print endpoint:
  - **URL**: `https://nontestable-odelia-isomerically.ngrok-free.dev/print`
  - **Method**: POST
  - **Body**: multipart/form-data dengan file PDF
  - **Field**: `file` (PDF file)

### 6. Endpoint return success response
- Return success response ke ElevenLabs:
  ```json
  {
    "status": "success",
    "message": "Report created successfully. PDF generated and sent to webhook and print endpoint."
  }
  ```

## 🎯 Alur Diagram

```
┌─────────────────────────────────────────────────────────────┐
│ 1. ElevenLabs Agent                                         │
│    - Mengumpulkan data konsultasi dari conversation        │
│    - Memanggil tool create_report dengan data konsultasi   │
└──────────────────────┬──────────────────────────────────────┘
                       │
                       ▼
┌─────────────────────────────────────────────────────────────┐
│ 2. Endpoint: /api/healthy-go-webhook                        │
│    - Menerima POST request dari ElevenLabs                  │
│    - Mendapatkan data konsultasi (name, age, gender, etc.) │
└──────────────────────┬──────────────────────────────────────┘
                       │
                       ▼
┌─────────────────────────────────────────────────────────────┐
│ 3. Generate PDF                                              │
│    - Generate PDF menggunakan pdfkit                        │
│    - Template: HealthyGo branded PDF                        │
│    - Berisi: Patient info, Health metrics, Meal plan, etc. │
└──────────────────────┬──────────────────────────────────────┘
                       │
                       ▼
        ┌──────────────┴──────────────┐
        │                             │
        ▼                             ▼
┌──────────────────┐        ┌──────────────────┐
│ 4. Webhook       │        │ 5. Print         │
│ External         │        │ Endpoint         │
│ (n8n)            │        │                  │
│ - Data + PDF     │        │ - PDF file       │
│   (base64)       │        │ - multipart/     │
│ - For logging/   │        │   form-data      │
│   processing     │        │ - Direct print   │
└──────────────────┘        └──────────────────┘
        │                             │
        └──────────────┬──────────────┘
                       │
                       ▼
┌─────────────────────────────────────────────────────────────┐
│ 6. Return Success Response                                   │
│    - Return success response ke ElevenLabs                  │
│    - Agent menerima konfirmasi bahwa report sudah dibuat   │
└─────────────────────────────────────────────────────────────┘
```

## 🔍 Verifikasi Alur

### 1. Cek Endpoint di Browser (GET)
Buka di browser:
```
https://experience-booth.vercel.app/api/healthy-go-webhook
```
Seharusnya menampilkan informasi endpoint.

### 2. Test Endpoint dengan POST (Manual)
Gunakan curl atau Postman:
```bash
curl -X POST https://experience-booth.vercel.app/api/healthy-go-webhook \
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

Response yang diharapkan:
```json
{
  "status": "success",
  "message": "Report created successfully. PDF generated and sent to webhook and print endpoint."
}
```

### 3. Test dari ElevenLabs Agent
1. Buka Agent di ElevenLabs Dashboard
2. Mulai conversation test
3. Panggil tool `create_report` dengan data konsultasi
4. Cek response - harus return success
5. Cek logs di Vercel untuk memastikan endpoint dipanggil
6. Cek webhook external untuk memastikan data + PDF terkirim
7. Cek print endpoint untuk memastikan PDF terkirim

### 4. Cek Logs di Vercel
1. Buka Vercel Dashboard
2. Pilih project `experience-booth`
3. Klik **"Logs"** tab
4. Cek logs untuk:
   - Endpoint dipanggil
   - PDF ter-generate
   - Webhook external terkirim
   - Print endpoint terkirim

### 5. Cek Webhook External (n8n)
1. Buka n8n workflow
2. Cek webhook `healthy-go/innov`
3. Pastikan data + PDF (base64) diterima
4. Pastikan PDF bisa di-decode dari base64

### 6. Cek Print Endpoint
1. Cek print endpoint logs
2. Pastikan PDF file diterima
3. Pastikan PDF ter-print

## 🐛 Troubleshooting

### Error: "PDF generation failed"
**Penyebab:**
- Data konsultasi tidak lengkap
- PDF generation error
- Template error

**Solusi:**
1. Cek logs di Vercel untuk detail error
2. Pastikan semua field required terisi
3. Test dengan data lengkap

### Error: "Webhook external failed"
**Penyebab:**
- Webhook external URL salah
- Network error
- Webhook external tidak available

**Solusi:**
1. Cek webhook external URL: `https://workflows.cekat.ai/webhook/healthy-go/innov`
2. Test webhook external secara manual
3. Cek network connectivity
4. Note: Webhook external failure tidak critical (hanya warning)

### Error: "Print endpoint failed"
**Penyebab:**
- Print endpoint URL salah
- Network error
- Print endpoint tidak available
- PDF file tidak valid

**Solusi:**
1. Cek print endpoint URL: `https://nontestable-odelia-isomerically.ngrok-free.dev/print`
2. Test print endpoint secara manual
3. Cek network connectivity
4. Pastikan PDF file valid
5. Note: Print endpoint failure tidak critical (hanya warning)

### Error: "Endpoint timeout"
**Penyebab:**
- PDF generation memakan waktu lama
- Network timeout
- Print endpoint slow

**Solusi:**
1. File `vercel.json` sudah mengatur `maxDuration: 30` (30 detik)
2. Optimize PDF generation jika diperlukan
3. Cek network connectivity
4. Cek print endpoint response time

## 📝 Catatan Penting

### 1. PDF tidak disimpan permanen
- PDF di-generate on-demand
- PDF tidak disimpan di server
- PDF hanya dikirim ke webhook external dan print endpoint
- PDF akan di-garbage collected setelah digunakan

### 2. Print endpoint harus accessible
- Print endpoint harus bisa diakses dari Vercel
- Print endpoint harus menerima multipart/form-data
- Print endpoint harus bisa print PDF file

### 3. Webhook external untuk logging
- Webhook external menerima data + PDF (base64)
- Webhook external bisa digunakan untuk logging/processing
- Webhook external failure tidak critical (hanya warning)

### 4. Error handling
- Jika PDF generation gagal → return error 500
- Jika webhook external gagal → log warning, continue
- Jika print endpoint gagal → log warning, continue
- Return success jika PDF generation berhasil (meskipun webhook/print gagal)

## 🎯 Best Practices

### 1. Monitor Logs
- Monitor logs di Vercel secara regular
- Cek error logs untuk masalah
- Cek success logs untuk verifikasi

### 2. Test Regularly
- Test endpoint secara regular
- Test dari ElevenLabs Agent
- Test dengan berbagai data konsultasi

### 3. Error Handling
- Handle semua error dengan baik
- Log error untuk debugging
- Return meaningful error messages

### 4. Performance
- Optimize PDF generation jika diperlukan
- Monitor response time
- Monitor timeout errors

## 🔗 Links

- **Endpoint**: `https://experience-booth.vercel.app/api/healthy-go-webhook`
- **Webhook External**: `https://workflows.cekat.ai/webhook/healthy-go/innov`
- **Print Endpoint**: `https://nontestable-odelia-isomerically.ngrok-free.dev/print`
- **Vercel Dashboard**: `https://vercel.com/dashboard`
- **ElevenLabs Dashboard**: `https://elevenlabs.io/app/conversational-ai`

---

**Selamat! Alur webhook sudah siap digunakan! 🎉**

