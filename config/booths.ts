// Booth Configuration System
// This file defines all booth configurations for easy reusability

export interface VideoSet {
  idle: string[];
  talking: string;
  thinking?: string;
  preview?: string;
  // Tool-specific videos
  [key: string]: string | string[] | undefined;
}

export interface RecommendationItem {
  id: string;
  name: string;
  image: string;
  description?: string;
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
  headerLogo?: string;
  favicon?: string;
  logoWidth?: number;
  logoHeight?: number;
  videos: VideoSet;
  recommendations?: Record<string, RecommendationItem>;
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
  headerLogo: '/logos/Healthy-Go_White.png',
  favicon: '/logos/healthygo.png',
  logoWidth: 240,
  logoHeight: 120,
  videos: {
    idle: [
      '/videos/healthygo/preview.mp4',
    ],
    talking: '/videos/healthygo/talking.mp4',
    thinking: '/videos/healthygo/thinking.mp4',
    preview: '/videos/healthygo/preview.mp4',
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
      '/videos/jago/notTalking.mp4',
    ],
    talking: '/videos/jago/talking.mp4',
    thinking: '/videos/jago/notTalking.mp4',
    preview: '/videos/jago/preview.mp4',
  },
  recommendations: {
    jago_black_coffee: {
      id: 'jago_black_coffee',
      name: 'Jago Black Coffee',
      image: '/menus/jago/jago-americano.png',
    },
    citrus_cold_brew: {
      id: 'citrus_cold_brew',
      name: 'Citrus Cold Brew',
      image: '/menus/jago/citrus-cold-brew.png',
    },
    kopi_susu_jago: {
      id: 'kopi_susu_jago',
      name: 'Kopi Susu Jago',
      image: '/menus/jago/kopi-susu-jago.png',
    },
    kopi_susu_oatside: {
      id: 'kopi_susu_oatside',
      name: 'Kopi Susu Oatside',
      image: '/menus/jago/kopi-susu-oatside.png',
    },
    salted_caramel_latte: {
      id: 'salted_caramel_latte',
      name: 'Salted Caramel Latte',
      image: '/menus/jago/salted-caramel-latte.png',
    },
    vanilla_latte: {
      id: 'vanilla_latte',
      name: 'Vanilla Latte',
      image: '/menus/jago/vanilla-latte.png',
    },
    earl_grey_milk_tea: {
      id: 'earl_grey_milk_tea',
      name: 'Earl Grey Milk Tea',
      image: '/menus/jago/jago-bubble-tea.png',
    },
    jago_chocolate: {
      id: 'jago_chocolate',
      name: 'Jago Chocolate',
      image: '/menus/jago/jago-chocolate.png',
    },
    hojicha_lychee_tea: {
      id: 'hojicha_lychee_tea',
      name: 'Hojicha Lychee Tea',
      image: '/menus/jago/hojicha-lychee-tea.png',
    },
    matcha_latte: {
      id: 'matcha_latte',
      name: 'Matcha Latte',
      image: '/menus/jago/matcha-latte.png',
    },
  },
};

// Cekat Booth Configuration
export const cekatConfig: BoothConfig = {
  id: 'cekat',
  name: 'Cekat',
  theme: {
    primary: '#004aad',
    secondary: '#eaf2ff',
    accent: '#007cf0',
    dark: '#022b64',
    background: '#ffffff',
    text: '#022b64',
    onPrimary: '#ffffff',
  },
  logo: '/logos/cekat.png',
  headerLogo: '/logos/Cekat-logo-putih.png',
  favicon: '/logos/cekat.png',
  logoWidth: 320,
  logoHeight: 140,
  videos: {
    idle: [
      '/videos/cekat/preview.mp4',
    ],
    talking: '/videos/cekat/talking.mp4',
    thinking: '/videos/cekat/preview.mp4',
    preview: '/videos/cekat/preview.mp4',
  },
  recommendations: {},
};

// Booth Registry
export const booths: Record<string, BoothConfig> = {
  cekat: cekatConfig,
  healthygo: healthyGoConfig,
  jago: jagoConfig,
};

// Check if booth ID is valid
export function isValidBoothId(boothId: string | undefined): boothId is string {
  return !!boothId && boothId in booths;
}

// Get booth config by ID or from environment
export function getBoothConfig(boothId?: string): BoothConfig {
  const id = boothId ?? 'healthygo';
  return booths[id] || healthyGoConfig;
}

