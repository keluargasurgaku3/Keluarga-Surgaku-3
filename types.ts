export interface DesignState {
  // Strategy & Content
  targetAudience: string;
  theme: string;
  contentPillar: string;
  hook: string;
  contentDescription: string; // Description of what's happening in the image
  socialMediaCaption: string; // The text to post on Instagram/TikTok
  
  // Visual Structure
  postType: 'Single Post' | 'Carousel';
  aspectRatio: '1:1 (Square)' | '4:5 (Portrait)' | '9:16 (Story)' | '16:9 (Landscape)';
  
  // Aesthetics
  caption: string; // Text Overlay on the image
  visualStyle: string;
  fontStyle: string;
  photographyStyle: string;
  
  // Model & Assets
  modelDetails: {
    age: string;
    gender: string;
    category: 'Person' | 'Couple' | 'Group' | 'None';
    race: string;
    hijab: boolean;
    faceless: boolean;
  };
  customAssets: File[]; 
  productImage: File | null; 
}

export interface GeneratedPrompt {
  prompt: string;
  negativePrompt: string;
}

export type GenerationStatus = 'idle' | 'loading' | 'success' | 'error';
