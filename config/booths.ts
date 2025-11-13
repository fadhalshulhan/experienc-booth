// Booth Configuration System
// This file defines all booth configurations for easy reusability

export interface VideoSet {
  idle: string[];
  talking: string;
  thinking?: string;
  // Tool-specific videos
  [key: string]: string | string[] | undefined;
}

export interface BoothConfig {
  id: string;
  name: string;
  theme: {
    primary: string;
    secondary: string;
    accent: string;
    dark: string;
  };
  logo: string;
  videos: VideoSet;
  agentId?: string; // Optional, can be set via env variable
}

// HealthyGo Booth Configuration
export const healthyGoConfig: BoothConfig = {
  id: 'healthygo',
  name: 'HealthyGo',
  theme: {
    primary: '#10b981', // Green
    secondary: '#059669',
    accent: '#34d399',
    dark: '#047857',
  },
  logo: '/logos/healthygo.png',
  videos: {
    idle: [
      '/videos/healthygo/idle1.mp4',
      '/videos/healthygo/idle2.mp4',
      '/videos/healthygo/idle3.mp4',
    ],
    talking: '/videos/healthygo/talking.mp4',
    thinking: '/videos/healthygo/thinking.mp4',
    // Example tool-specific videos
    tool_nutrition_check: '/videos/healthygo/nutrition_check.mp4',
    tool_product_scan: '/videos/healthygo/product_scan.mp4',
    tool_recommendation: '/videos/healthygo/recommendation.mp4',
  },
};

// Jago Booth Configuration (placeholder for future use)
export const jagoConfig: BoothConfig = {
  id: 'jago',
  name: 'Jago',
  theme: {
    primary: '#3b82f6', // Blue
    secondary: '#2563eb',
    accent: '#60a5fa',
    dark: '#1e40af',
  },
  logo: '/logos/jago.png',
  videos: {
    idle: [
      '/videos/jago/idle1.mp4',
      '/videos/jago/idle2.mp4',
    ],
    talking: '/videos/jago/talking.mp4',
  },
};

// Booth Registry
export const booths: Record<string, BoothConfig> = {
  healthygo: healthyGoConfig,
  jago: jagoConfig,
};

// Get booth config by ID or from environment
export function getBoothConfig(boothId?: string): BoothConfig {
  const id = boothId || process.env.NEXT_PUBLIC_BOOTH_TYPE || 'healthygo';
  return booths[id] || healthyGoConfig;
}

