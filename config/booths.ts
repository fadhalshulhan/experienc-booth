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
    background: string;
    text: string;
    onPrimary: string;
  };
  logo: string;
  favicon?: string;
  logoWidth?: number;
  logoHeight?: number;
  videos: VideoSet;
  agentId?: string; // Optional, can be set via env variable
}

// HealthyGo Booth Configuration
export const healthyGoConfig: BoothConfig = {
  id: 'healthygo',
  name: 'HealthyGo',
  theme: {
    primary: '#1f4735',
    secondary: '#f9eee9',
    accent: '#3a7255',
    dark: '#12281f',
    background: '#ffffff',
    text: '#1f4735',
    onPrimary: '#f9eee9',
  },
  logo: '/logos/healthygo.png',
  favicon: '/logos/healthygo.png',
  logoWidth: 240,
  logoHeight: 120,
  videos: {
    idle: [
      '/videos/healthygo/idle1.mp4',
    ],
    talking: '/videos/healthygo/talking.mp4',
    thinking: '/videos/healthygo/thinking.mp4',
    preview: '/videos/healthygo/idle1.mp4',
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
    primary: '#ee2737',
    secondary: '#171818',
    accent: '#ff5b6a',
    dark: '#9b1c29',
    background: '#ee2737',
    text: '#ffffff',
    onPrimary: '#ffffff',
  },
  logo: '/logos/jago.png',
  favicon: '/logos/jagofavicon.png',
  logoWidth: 200,
  logoHeight: 70,
  videos: {
    idle: [
      '/videos/jago/idle.mp4',
    ],
    talking: '/videos/jago/talking.mp4',
    preview: '/videos/jago/idle.mp4',
  },
};

// Booth Registry
export const booths: Record<string, BoothConfig> = {
  healthygo: healthyGoConfig,
  jago: jagoConfig,
};

// Get booth config by ID or from environment
export function getBoothConfig(boothId?: string): BoothConfig {
  const id = boothId ?? 'healthygo';
  return booths[id] || healthyGoConfig;
}

