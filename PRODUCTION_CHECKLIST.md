# ✅ Production Deployment Checklist

Checklist untuk memastikan deployment production berjalan dengan baik.

## 🚀 Deployment Status

- ✅ Build berhasil
- ✅ Deploy ke production berhasil
- ✅ URL production: `https://experience-booth-gy2hndu3o-fadhalshulhans-projects.vercel.app`
- ✅ Endpoint aktif: `/api/healthy-go-webhook`

## 📋 Checklist

### 1. Environment Variables di Vercel

Pastikan semua environment variables sudah di-set di Vercel Dashboard:

#### Required
- [ ] `XI_API_KEY` - ElevenLabs API Key
- [ ] `HEALTHYGO_AGENT_ID` - HealthyGo Agent ID
- [ ] `JAGO_AGENT_ID` - Jago Agent ID

#### Optional
- [ ] `N8N_WEBHOOK_URL` - Webhook URL untuk reporting (optional)
- [ ] `REPORT_WEBHOOK_SECRET` - Secret untuk webhook validation (optional)
- [ ] `NEXT_PUBLIC_REPORT_SECRET` - Secret untuk frontend (optional)

#### Important
- [ ] **JANGAN** set `SAVE_PDF_TO_LOCAL` di production (hanya untuk development)
- [ ] Pastikan semua environment variables sudah di-set untuk environment `Production`

### 2. URL Webhook di ElevenLabs

Pastikan URL webhook di ElevenLabs sudah di-update:

- [ ] URL webhook: `https://experience-booth.vercel.app/api/healthy-go-webhook`
- [ ] Atau: `https://experience-booth-gy2hndu3o-fadhalshulhans-projects.vercel.app/api/healthy-go-webhook`
- [ ] Method: `POST`
- [ ] Semua parameters sudah benar

### 3. Test Endpoint Production

#### Test GET (Endpoint Info)
```bash
curl https://experience-booth.vercel.app/api/healthy-go-webhook
```

Response yang diharapkan:
```json
{
  "message": "HealthyGo Webhook Endpoint",
  "method": "POST",
  "description": "This endpoint receives webhook calls from ElevenLabs when create_report tool is called.",
  ...
}
```

#### Test POST (Webhook Call)
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

### 4. Test dari ElevenLabs Agent

- [ ] Buka Agent di ElevenLabs Dashboard
- [ ] Mulai conversation test
- [ ] Panggil tool `create_report` dengan data konsultasi
- [ ] Cek response - harus return success
- [ ] Cek logs di Vercel untuk memastikan endpoint dipanggil
- [ ] Cek printer - PDF harus ter-print
- [ ] Cek webhook external - data + PDF harus terkirim

### 5. Monitor Logs

#### Vercel Logs
- [ ] Buka Vercel Dashboard
- [ ] Pilih project `experience-booth`
- [ ] Klik **"Logs"** tab
- [ ] Monitor logs untuk:
  - Endpoint dipanggil
  - PDF ter-generate
  - Webhook external terkirim
  - Print endpoint terkirim
  - Error (jika ada)

#### ElevenLabs Tool Logs
- [ ] Buka ElevenLabs Dashboard
- [ ] Pilih Agent
- [ ] Klik **"Tools"** tab
- [ ] Pilih tool `create_report`
- [ ] Cek **"Stats"** untuk:
  - Jumlah calls
  - Average latency
  - Error rate

### 6. Verify Print Endpoint

- [ ] Print endpoint accessible: `https://nontestable-odelia-isomerically.ngrok-free.dev/print`
- [ ] PDF ter-print dengan benar
- [ ] Print endpoint logs (jika ada)
- [ ] Printer status (jika ada)

### 7. Verify Webhook External (n8n)

- [ ] Webhook external accessible: `https://workflows.cekat.ai/webhook/healthy-go/innov`
- [ ] Data + PDF (base64) diterima
- [ ] PDF bisa di-decode dari base64
- [ ] n8n workflow logs (jika ada)

## 🐛 Troubleshooting

### Error: "Failed to get signed URL"
- [ ] Cek `XI_API_KEY` di Vercel environment variables
- [ ] Cek `HEALTHYGO_AGENT_ID` atau `JAGO_AGENT_ID` di Vercel environment variables
- [ ] Cek logs di Vercel untuk detail error

### Error: "PDF generation failed"
- [ ] Cek logs di Vercel untuk detail error
- [ ] Pastikan semua field required terisi
- [ ] Test dengan data lengkap

### Error: "Webhook external failed"
- [ ] Cek webhook external URL: `https://workflows.cekat.ai/webhook/healthy-go/innov`
- [ ] Test webhook external secara manual
- [ ] Cek network connectivity
- [ ] Note: Webhook external failure tidak critical (hanya warning)

### Error: "Print endpoint failed"
- [ ] Cek print endpoint URL: `https://nontestable-odelia-isomerically.ngrok-free.dev/print`
- [ ] Test print endpoint secara manual
- [ ] Cek network connectivity
- [ ] Pastikan PDF file valid
- [ ] Note: Print endpoint failure tidak critical (hanya warning)

### Error: "Endpoint timeout"
- [ ] File `vercel.json` sudah mengatur `maxDuration: 30` (30 detik)
- [ ] Optimize PDF generation jika diperlukan
- [ ] Cek network connectivity
- [ ] Cek print endpoint response time

## 📊 Monitoring

### Vercel Analytics
- [ ] Buka Vercel Dashboard
- [ ] Pilih project `experience-booth`
- [ ] Klik **"Analytics"** tab
- [ ] Monitor:
  - Page views
  - Unique visitors
  - Performance metrics
  - Error rates

### Vercel Logs
- [ ] Buka Vercel Dashboard
- [ ] Pilih project `experience-booth`
- [ ] Klik **"Logs"** tab
- [ ] Monitor:
  - API route logs
  - Error logs
  - Build logs

## ✅ Success Criteria

- [x] Build berhasil
- [x] Deploy ke production berhasil
- [ ] Environment variables sudah di-set
- [ ] URL webhook di ElevenLabs sudah di-update
- [ ] Endpoint production bisa diakses (GET)
- [ ] Endpoint production bisa dipanggil (POST)
- [ ] Test dari ElevenLabs Agent berhasil
- [ ] PDF ter-generate dengan benar
- [ ] PDF ter-print dengan benar
- [ ] Data + PDF terkirim ke webhook external
- [ ] Logs tidak menunjukkan error

## 🔗 Links

- **Production URL**: `https://experience-booth.vercel.app`
- **Endpoint**: `https://experience-booth.vercel.app/api/healthy-go-webhook`
- **Vercel Dashboard**: `https://vercel.com/dashboard`
- **ElevenLabs Dashboard**: `https://elevenlabs.io/app/conversational-ai`
- **Webhook External**: `https://workflows.cekat.ai/webhook/healthy-go/innov`
- **Print Endpoint**: `https://nontestable-odelia-isomerically.ngrok-free.dev/print`

---

**Selamat! Deployment production berhasil! 🎉**

Setelah semua checklist selesai, aplikasi siap digunakan di production!

