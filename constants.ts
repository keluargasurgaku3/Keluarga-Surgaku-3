export const VISUAL_STYLES = [
  "Minimalist Clean",
  "Retro/Vintage",
  "Cinematic",
  "3D Pixar/Disney Style",
  "Handwritten/Doodle",
  "Magazine Editorial",
  "B-Roll Aesthetic",
  "Grunge Poster",
  "Cyberpunk/Neon",
  "Pastel Dream",
  "Corporate Memphis",
  "Abstract Geometry",
  "Collage Art",
  "Y2K Aesthetic",
  "Paper Cutout",
  "Claymorphism"
];

export const PHOTOGRAPHY_STYLES = [
  "Vibrant & High Contrast",
  "Retro Film (Kodak Portra)",
  "Vintage 90s Lo-Fi",
  "Street Photography",
  "Monochrome / B&W",
  "Fashion Editorial",
  "Golden Hour",
  "Dark & Moody",
  "Product Macro",
  "Drone/Aerial",
  "Polaroid",
  "Studio Lighting",
  "Candid Lifestyle"
];

export const FONT_STYLES = [
  "Modern Sans-Serif",
  "Elegant Serif",
  "Bold Display",
  "Handwritten Script",
  "Retro Bubble",
  "Gothic",
  "Minimalist Thin",
  "Techno/Glitch",
  "Graffiti"
];

export const CONTENT_PILLARS = [
  "Education / Tips",
  "Entertainment / Humor",
  "Inspiration / Motivation",
  "Product Selling / Promo",
  "News / Updates",
  "Interactive / Engagement",
  "Behind the Scenes",
  "Social Proof / Testimonial"
];

export const MODEL_AGES = ["Child", "Teen", "Young Adult (20s)", "Adult (30s-40s)", "Middle Aged", "Senior"];
export const MODEL_GENDERS = ["Male", "Female", "Non-binary", "Any"];
export const MODEL_CATEGORIES = ["Person", "Couple", "Group", "None"];
export const RACES = ["Asian", "Black/African Descent", "Caucasian/White", "Hispanic/Latino", "Middle Eastern", "South Asian", "Mixed", "Any"];

export const INITIAL_STATE = {
  targetAudience: '',
  theme: '',
  contentPillar: CONTENT_PILLARS[0],
  hook: '',
  contentDescription: '',
  socialMediaCaption: '',
  
  postType: 'Single Post' as const,
  aspectRatio: '4:5 (Portrait)' as const,
  caption: '', // Overlay text
  
  visualStyle: VISUAL_STYLES[0],
  fontStyle: FONT_STYLES[0],
  photographyStyle: PHOTOGRAPHY_STYLES[0],
  
  modelDetails: {
    age: 'Young Adult (20s)',
    gender: 'Female',
    category: 'Person' as const,
    race: 'Any',
    hijab: false,
    faceless: false,
  },
  customAssets: [],
  productImage: null,
};
