# Quick Setup Guide

## 1. Install Dependencies

```bash
cd experience-booth
npm install
```

## 2. Configure Environment

Create `.env.local` file:

```env
XI_API_KEY=your_api_key_here
ELEVENLABS_AGENT_ID=your_agent_id_here
NEXT_PUBLIC_BOOTH_TYPE=healthygo
```

### Getting Your ElevenLabs Credentials

1. Go to [ElevenLabs Dashboard](https://elevenlabs.io/app/conversational-ai)
2. Create or select an agent
3. Copy the Agent ID from the agent settings
4. Get your API key from Settings → API Keys

## 3. Add Video Assets

Create video directories:

```bash
mkdir -p public/videos/healthygo
mkdir -p public/logos
```

Add your videos:
- `public/videos/healthygo/idle1.mp4` (required)
- `public/videos/healthygo/idle2.mp4` (optional)
- `public/videos/healthygo/idle3.mp4` (optional)
- `public/videos/healthygo/talking.mp4` (required)
- `public/videos/healthygo/thinking.mp4` (optional)

Add logo:
- `public/logos/healthygo.png`

## 4. Update Configuration

Edit `config/booths.ts` and update the video paths to match your files.

## 5. Run Development Server

```bash
npm run dev
```

Open http://localhost:3000

## 6. Test the System

1. Click "Start Experience"
2. Allow microphone access
3. Speak to the agent
4. Verify video switching works
5. Test client tools (if configured)

## 7. Configure ElevenLabs Agent

In the ElevenLabs dashboard, configure your agent with:

### System Prompt Example (HealthyGo)

```
You are a friendly health assistant at a HealthyGo kiosk. Help users with:
- Product information
- Nutrition advice
- Health recommendations

Be conversational, helpful, and concise.
```

### Client Tools (Optional)

If you want to use client tools, define them in your agent:

**show_message**
- Description: Display a message on screen
- Parameters: message (string), duration (number, optional)

**trigger_effect**
- Description: Trigger a visual effect
- Parameters: effect (string)

## 8. Customization

### Change Colors

Edit `config/booths.ts`:

```typescript
theme: {
  primary: '#10b981',    // Main brand color
  secondary: '#059669',  // Secondary color
  accent: '#34d399',     // Accent color
  dark: '#047857',       // Dark variant
}
```

### Add More Idle Videos

```typescript
videos: {
  idle: [
    '/videos/healthygo/idle1.mp4',
    '/videos/healthygo/idle2.mp4',
    '/videos/healthygo/idle3.mp4',
    '/videos/healthygo/idle4.mp4',  // Add more!
  ],
  // ...
}
```

### Add Tool Videos

```typescript
videos: {
  // ... other videos
  tool_scan_product: '/videos/healthygo/scan_product.mp4',
  tool_show_nutrition: '/videos/healthygo/show_nutrition.mp4',
}
```

Then in `pages/index.tsx`, add the client tool:

```typescript
const clientTools = {
  scan_product: async ({ barcode }: { barcode: string }) => {
    videoManager.playToolVideo('scan_product');
    // Your logic here
    return `Product scanned: ${barcode}`;
  },
};
```

## 9. Production Deployment

### Build

```bash
npm run build
npm start
```

### Kiosk Mode Setup

For a 43" display kiosk:

1. **Auto-start browser on boot**
   - Windows: Add to Startup folder
   - Mac: System Preferences → Users & Groups → Login Items
   - Linux: Add to `.xinitrc` or systemd service

2. **Full-screen browser**
   - Chrome: Press F11 or start with `--kiosk` flag
   - Firefox: Press F11

3. **Disable screen sleep**
   - Windows: Power Options
   - Mac: Energy Saver settings
   - Linux: `xset s off`

4. **Lock down browser** (optional)
   - Disable address bar
   - Disable right-click
   - Use Chrome kiosk mode

### Example Chrome Kiosk Command

```bash
google-chrome --kiosk --app=http://localhost:3000
```

## Troubleshooting

### No audio/microphone
- Check browser permissions
- Must use HTTPS (except localhost)
- Try different browser

### Videos not loading
- Check file paths in `config/booths.ts`
- Verify files exist in `public/videos/`
- Check browser console for errors

### ElevenLabs not connecting
- Verify API key and Agent ID
- Check network/firewall
- Ensure agent is active in dashboard

### UI looks wrong
- Clear browser cache
- Check screen resolution
- Verify Tailwind CSS is working

## Support

For issues:
1. Check browser console (F12)
2. Review ElevenLabs dashboard logs
3. Check video file formats (MP4 recommended)
4. Verify environment variables

## Next Steps

- Customize the UI in `components/`
- Add more client tools
- Create additional booth configurations
- Add analytics/logging
- Implement session management

