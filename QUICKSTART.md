# 🚀 Quick Start Guide

Get your Experience Booth running in 5 minutes!

## Prerequisites

- Node.js 18+ installed
- ElevenLabs account with API access
- MP4 video files for your character
- 43-inch display (or any large screen)

## Step 1: Install (1 minute)

```bash
cd experience-booth
npm install
```

## Step 2: Configure (2 minutes)

### Create `.env.local`:

```env
XI_API_KEY=sk_xxxxxxxxxxxxx
ELEVENLABS_AGENT_ID=your_agent_id
NEXT_PUBLIC_BOOTH_TYPE=healthygo
```

**Where to get these:**
- **XI_API_KEY**: [ElevenLabs Settings → API Keys](https://elevenlabs.io/app/settings/api-keys)
- **ELEVENLABS_AGENT_ID**: [Create/Select Agent](https://elevenlabs.io/app/conversational-ai) → Copy Agent ID

### Add Videos:

Create this structure:

```
public/
  videos/
    healthygo/
      idle1.mp4      ← Your character idle loop
      talking.mp4    ← Your character talking
```

**Minimum requirement:** Just these 2 videos to start!

## Step 3: Run (1 minute)

```bash
npm run dev
```

Open: [http://localhost:3000](http://localhost:3000)

## Step 4: Test (1 minute)

1. Click **"Start Experience"**
2. Allow microphone access
3. Say "Hello!"
4. Watch your character respond!

---

## 🎉 That's it! You're running!

## Next Steps

### Customize Your Booth

1. **Change colors** → Edit `config/booths.ts`
2. **Add more videos** → Add to `public/videos/healthygo/`
3. **Add client tools** → Edit `pages/index.tsx`

### Add More Videos (Optional)

```
public/videos/healthygo/
  idle1.mp4
  idle2.mp4       ← More idle variations
  idle3.mp4
  talking.mp4
  thinking.mp4    ← Optional: different video when agent is thinking
  tool_*.mp4      ← Custom videos for specific actions
```

Update `config/booths.ts`:

```typescript
videos: {
  idle: [
    '/videos/healthygo/idle1.mp4',
    '/videos/healthygo/idle2.mp4',
    '/videos/healthygo/idle3.mp4',
  ],
  talking: '/videos/healthygo/talking.mp4',
  thinking: '/videos/healthygo/thinking.mp4',
}
```

### Create Client Tools

In `pages/index.tsx`, add to `clientTools`:

```typescript
const clientTools = {
  show_message: async ({ message }: { message: string }) => {
    setToolState((prev: any) => ({ ...prev, message }));
    videoManager.playToolVideo('show_message');
    return `Message: ${message}`;
  },
};
```

Then in your ElevenLabs agent, add this tool with the same name.

## Video Requirements

- **Format:** MP4 (H.264)
- **Resolution:** 1920x1080 (Full HD)
- **Frame Rate:** 30fps
- **Size:** < 10MB per video (for fast loading)

## Troubleshooting

### "Agent ID not configured"
→ Add `ELEVENLABS_AGENT_ID` to `.env.local`

### "Failed to get signed URL"
→ Check your `XI_API_KEY` is correct

### Microphone not working
→ Use HTTPS or localhost, check browser permissions

### Videos not showing
→ Check file paths in `config/booths.ts` match your files

## Deploy to Production

```bash
npm run build
npm start
```

For kiosk mode, run Chrome with:

```bash
google-chrome --kiosk --app=http://localhost:3000
```

---

## 📚 Learn More

- **SETUP.md** → Detailed setup instructions
- **EXAMPLES.md** → Code examples and recipes
- **README.md** → Full documentation

## 💡 Tips

1. **Start simple** → Get basic conversation working first
2. **Test audio** → Ensure microphone works before adding features
3. **Optimize videos** → Compress videos for faster loading
4. **Use placeholders** → Start with simple colored videos if needed

## 🆘 Need Help?

Check the console (F12) for error messages. Most issues are:
- Missing environment variables
- Incorrect file paths
- Microphone permissions

---

**You're ready to build amazing voice experiences! 🎙️✨**

