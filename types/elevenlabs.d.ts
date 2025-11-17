// Type definitions for ElevenLabs Client SDK
declare module '@elevenlabs/client' {
  export interface ConversationConfig {
    signedUrl: string;
    clientTools?: Record<string, (params: any) => Promise<string>>;
    onConnect?: () => void;
    onDisconnect?: () => void;
    onError?: (error: any) => void;
    onModeChange?: (mode: { mode: string }) => void;
    onVolumeChange?: (volume: number) => void;
    onMessage?: (message: any) => void;
    onStatusChange?: (status: string) => void;
  }

  export interface Conversation {
    endSession: () => Promise<void>;
    sendUserMessage?: (text: string) => void;
    sendUserActivity?: () => void;
  }

  export class Conversation {
    static startSession(config: ConversationConfig): Promise<Conversation>;
  }
}

declare module '@elevenlabs/elevenlabs-js' {
  export interface ElevenLabsClientConfig {
    apiKey?: string;
  }

  export interface SignedUrlResponse {
    signedUrl: string;
  }

  export class ElevenLabsClient {
    constructor(config: ElevenLabsClientConfig);
    
    conversationalAi: {
      conversations: {
        getSignedUrl: (params: { agentId: string }) => Promise<SignedUrlResponse>;
      };
    };
  }
}

