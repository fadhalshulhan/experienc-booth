# Experience Booth - Interactive Voice Kiosk

A Next.js application for creating interactive voice-enabled experience booths using ElevenLabs Conversational AI Platform.

## Features

- 🎙️ **Voice Streaming**: Full duplex audio streaming with ElevenLabs Agents
- 🎬 **Dynamic Video Switching**: Event-based video switching (idle, talking, tool actions)
- 🎨 **Multi-Brand Support**: Reusable system for multiple booth configurations
- 🖥️ **Large Screen Optimized**: Designed for 43" displays (95cm × 54cm)
- 🛠️ **Client Tools**: Framework for UI manipulation via voice commands
- ⚡ **Real-time Updates**: Live voice activity indicators and state management

## Booth Configurations

Currently supports:
- **HealthyGo**: Green-themed health and wellness booth
- **Jago**: Blue-themed financial services booth (template)

Easy to add more booths by extending `config/booths.ts`.

## Setup

### 1. Install Dependencies

```bash
npm install
```

### 2. Configure Environment Variables

Create a `.env.local` file:

```env
# ElevenLabs Configuration
XI_API_KEY=your_elevenlabs_api_key_here
ELEVENLABS_AGENT_ID=your_agent_id_here

# Booth Configuration
NEXT_PUBLIC_BOOTH_TYPE=healthygo
```

### 3. Add Video Assets

Place your video files in the `public/videos/` directory:

```
public/
  videos/
    healthygo/
      idle1.mp4
      idle2.mp4
      idle3.mp4
      talking.mp4
      thinking.mp4
      tool_*.mp4  (optional tool-specific videos)
```

Update video paths in `config/booths.ts` to match your files.

### 4. Run Development Server

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) to view the booth.

## Project Structure

```
experience-booth/
├── components/           # UI components
│   ├── Header.tsx       # Top bar with logo and branding
│   ├── Footer.tsx       # Bottom bar with controls
│   ├── VoiceIndicator.tsx
│   └── VideoPlayer.tsx
├── config/
│   └── booths.ts        # Booth configurations
├── hooks/
│   └── useVideoManager.ts  # Video state management
├── pages/
│   ├── index.tsx        # Main booth page
│   ├── _app.tsx
│   └── api/
│       └── signed-url.ts  # ElevenLabs signed URL endpoint
├── public/
│   ├── videos/          # Video assets
│   └── logos/           # Logo assets
└── styles/
    └── globals.css      # Global styles
```

## Video Management

The `useVideoManager` hook provides easy video switching:

```typescript
// Automatically switches videos based on conversation state
videoManager.playIdleVideo();      // Cycles through idle videos
videoManager.playTalkingVideo();   // Shows talking animation
videoManager.playThinkingVideo();  // Shows thinking/listening state
videoManager.playToolVideo('tool_name');  // Custom tool video
```

## Client Tools

Client tools allow the ElevenLabs agent to manipulate the UI:

```typescript
const clientTools = {
  show_message: async ({ message }) => {
    // Display message on screen
    // Trigger video change
    videoManager.playToolVideo('show_message');
    return `Message displayed: ${message}`;
  },
  
  trigger_effect: async ({ effect }) => {
    // Custom visual effects
    videoManager.playToolVideo(effect);
    return `Effect triggered: ${effect}`;
  },
  
  // Add more tools as needed...
};
```

## Adding a New Booth

1. **Create configuration** in `config/booths.ts`:

```typescript
export const myBoothConfig: BoothConfig = {
  id: 'mybooth',
  name: 'My Booth',
  theme: {
    primary: '#ff6b6b',
    secondary: '#ee5a6f',
    accent: '#ff8787',
    dark: '#c92a2a',
  },
  logo: '/logos/mybooth.png',
  videos: {
    idle: ['/videos/mybooth/idle1.mp4'],
    talking: '/videos/mybooth/talking.mp4',
  },
};

// Add to registry
export const booths: Record<string, BoothConfig> = {
  healthygo: healthyGoConfig,
  mybooth: myBoothConfig,
};
```

2. **Add video assets** to `public/videos/mybooth/`

3. **Set environment variable**:
```env
NEXT_PUBLIC_BOOTH_TYPE=mybooth
```

## ElevenLabs Agent Setup

1. Create an agent at [elevenlabs.io](https://elevenlabs.io/app/conversational-ai)
2. Configure the agent's behavior and voice
3. Copy the Agent ID to your `.env.local` file
4. (Optional) Define tools in the agent that match your `clientTools`

## Screen Specifications

Designed for 43-inch displays:
- **Width**: 54cm (1920px)
- **Height**: 95cm (1080px)
- **Aspect Ratio**: 16:9

The UI automatically scales for large screens.

## Production Deployment

```bash
# Build
npm run build

# Start production server
npm start
```

For kiosk mode, consider:
- Full-screen browser mode
- Auto-start on boot
- Disable screen sleep
- Lock down browser controls

## Troubleshooting

### Microphone not working
- Check browser permissions
- Ensure HTTPS (required for getUserMedia)
- Test with `navigator.mediaDevices.getUserMedia({ audio: true })`

### Videos not playing
- Verify video file paths in `config/booths.ts`
- Check video format (MP4 recommended)
- Test video playback manually

### ElevenLabs connection failed
- Verify `XI_API_KEY` and `ELEVENLABS_AGENT_ID`
- Check network connectivity
- Review agent configuration in ElevenLabs dashboard

## Resources

- [ElevenLabs Agents Documentation](https://elevenlabs.io/docs/agents-platform/build/overview)
- [Next.js Documentation](https://nextjs.org/docs)
- [Tailwind CSS](https://tailwindcss.com/docs)

## License

MIT

