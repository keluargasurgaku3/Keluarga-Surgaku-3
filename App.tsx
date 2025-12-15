import React, { useState, useEffect } from 'react';
import { 
  Layout, 
  Palette, 
  Camera, 
  Type, 
  Users, 
  Image as ImageIcon, 
  Sparkles, 
  Copy, 
  RefreshCcw,
  Search,
  Upload,
  X,
  Wand2,
  Lightbulb,
  MessageSquareText,
  Target,
  AlignLeft
} from 'lucide-react';
import { INITIAL_STATE, VISUAL_STYLES, PHOTOGRAPHY_STYLES, FONT_STYLES, MODEL_AGES, MODEL_GENDERS, MODEL_CATEGORIES, RACES, CONTENT_PILLARS } from './constants';
import { DesignState } from './types';
import * as GeminiService from './services/geminiService';

export default function App() {
  const [state, setState] = useState<DesignState>(INITIAL_STATE);
  const [generatedPrompt, setGeneratedPrompt] = useState<string>('');
  const [isLoading, setIsLoading] = useState(false);
  const [previewImage, setPreviewImage] = useState<string | null>(null);
  const [isGeneratingImage, setIsGeneratingImage] = useState(false);
  
  // Loading states for individual fields
  const [loadingField, setLoadingField] = useState<string | null>(null);

  useEffect(() => {
    buildPrompt();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [state]);

  const buildPrompt = () => {
    const { 
      postType, aspectRatio, targetAudience, theme, caption, 
      visualStyle, fontStyle, photographyStyle, modelDetails,
      customAssets, productImage, contentDescription 
    } = state;

    let prompt = `Create a high-quality ${postType} design for social media. `;
    prompt += `Format: ${aspectRatio}. `;
    prompt += `Theme: ${theme}. `;
    prompt += `Target Audience: ${targetAudience}. \n\n`;
    
    // Add the specific visual description if available
    if (contentDescription) {
        prompt += `**Visual Description:** ${contentDescription} \n\n`;
    }

    prompt += `**Visual Style:** ${visualStyle}. `;
    prompt += `**Photography Style:** ${photographyStyle}. `;
    prompt += `**Typography:** ${fontStyle}. \n\n`;
    
    if (modelDetails.category !== 'None') {
      prompt += `**Subject/Model:** ${modelDetails.age} ${modelDetails.race} ${modelDetails.gender} (${modelDetails.category}). `;
      if (modelDetails.hijab) prompt += `Wearing Hijab. `;
      if (modelDetails.faceless) prompt += `Faceless/Anonymous style. `;
      prompt += `\n`;
    }

    if (caption) {
      prompt += `**Image Overlay Text:** Include the text "${caption}" elegantly integrated into the design. \n`;
    }

    if (productImage) {
      prompt += `**Product Integration:** Feature the main subject/product prominently in the center. \n`;
    }

    if (customAssets.length > 0) {
      prompt += `**References:** Use the visual cues from the input images for color palette and composition. \n`;
    }

    setGeneratedPrompt(prompt);
  };

  const handleAutoFill = async () => {
    setIsLoading(true);
    try {
      const suggestion = await GeminiService.suggestDesign(state.theme);
      setState(prev => ({
        ...prev,
        ...suggestion,
        customAssets: prev.customAssets,
        productImage: prev.productImage,
        modelDetails: {
          ...prev.modelDetails,
          ...suggestion.modelDetails
        }
      }));
    } catch (err) {
      alert("Failed to auto-fill.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleTrendSearch = async () => {
      setLoadingField('trend');
      try {
          const trend = await GeminiService.getTrendingTopic();
          setState(prev => ({ ...prev, theme: trend }));
      } catch (err) {
          alert("Could not fetch trends.");
      } finally {
          setLoadingField(null);
      }
  }

  // --- Individual Generators ---

  const genTheme = async () => {
      setLoadingField('theme');
      const res = await GeminiService.generateTheme(state.targetAudience);
      if(res) setState(p => ({...p, theme: res}));
      setLoadingField(null);
  }

  const genHook = async () => {
      setLoadingField('hook');
      const res = await GeminiService.generateHook(state.targetAudience, state.contentPillar, state.theme);
      if(res) setState(p => ({...p, hook: res}));
      setLoadingField(null);
  }

  const genDesc = async () => {
      setLoadingField('desc');
      const res = await GeminiService.generateContentDescription(state.targetAudience, state.contentPillar, state.theme, state.hook);
      if(res) setState(p => ({...p, contentDescription: res}));
      setLoadingField(null);
  }

  const genSocialCaption = async () => {
      setLoadingField('social');
      const res = await GeminiService.generateSocialCaption(state);
      if(res) setState(p => ({...p, socialMediaCaption: res}));
      setLoadingField(null);
  }

  const genOverlayText = async () => {
      setLoadingField('overlay');
      const res = await GeminiService.generateOverlayText(state.theme, state.hook);
      if(res) setState(p => ({...p, caption: res}));
      setLoadingField(null);
  }

  const handleGenerateImage = async () => {
    if (!process.env.API_KEY) {
        alert("API Key missing");
        return;
    }
    setIsGeneratingImage(true);
    setPreviewImage(null);
    try {
        const allAssets = [...state.customAssets];
        if (state.productImage) allAssets.push(state.productImage);
        
        const imgData = await GeminiService.generateImagePreview(generatedPrompt, allAssets);
        setPreviewImage(imgData);
    } catch (e) {
        alert("Failed to generate image.");
    } finally {
        setIsGeneratingImage(false);
    }
  }

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>, isProduct: boolean) => {
    if (e.target.files && e.target.files[0]) {
      if (isProduct) {
        setState(prev => ({ ...prev, productImage: e.target.files![0] }));
      } else {
        if (state.customAssets.length >= 4) return;
        setState(prev => ({ ...prev, customAssets: [...prev.customAssets, e.target.files![0]] }));
      }
    }
  };

  const removeAsset = (index: number) => {
    setState(prev => ({
      ...prev,
      customAssets: prev.customAssets.filter((_, i) => i !== index)
    }));
  };

  const InputWithGen = ({ 
    label, 
    value, 
    onChange, 
    onGen, 
    isLoading, 
    placeholder, 
    isArea = false, 
    icon: Icon 
  }: any) => (
      <div className="space-y-1">
          <div className="flex justify-between items-center">
             <span className="text-xs text-slate-500 flex items-center gap-1">
                {Icon && <Icon className="w-3 h-3"/>} {label}
             </span>
             {onGen && (
                 <button 
                   onClick={onGen} 
                   disabled={isLoading}
                   className="text-[10px] text-indigo-400 hover:text-indigo-300 flex items-center gap-1"
                 >
                    {isLoading ? <RefreshCcw className="w-3 h-3 animate-spin"/> : <Sparkles className="w-3 h-3"/>}
                    Auto
                 </button>
             )}
          </div>
          {isArea ? (
              <textarea 
                  className="w-full bg-slate-800 border border-slate-700 rounded-lg p-2 text-sm focus:ring-2 focus:ring-indigo-500 outline-none h-20 resize-none"
                  value={value}
                  onChange={(e) => onChange(e.target.value)}
                  placeholder={placeholder}
              />
          ) : (
              <input 
                  type="text" 
                  className="w-full bg-slate-800 border border-slate-700 rounded-lg p-2 text-sm focus:ring-2 focus:ring-indigo-500 outline-none"
                  value={value}
                  onChange={(e) => onChange(e.target.value)}
                  placeholder={placeholder}
              />
          )}
      </div>
  );

  return (
    <div className="min-h-screen bg-slate-900 text-slate-200 flex flex-col md:flex-row font-sans">
      
      {/* Sidebar Controls */}
      <div className="w-full md:w-[500px] flex-shrink-0 border-r border-slate-800 bg-slate-900 h-screen overflow-y-auto custom-scrollbar">
        
        {/* Header */}
        <div className="p-6 border-b border-slate-800 sticky top-0 bg-slate-900/95 backdrop-blur z-20">
          <div className="flex items-center gap-2 mb-2">
            <Sparkles className="w-6 h-6 text-indigo-500" />
            <h1 className="text-2xl font-bold bg-gradient-to-r from-indigo-400 to-purple-400 bg-clip-text text-transparent">
              FeedForge AI
            </h1>
          </div>
          <p className="text-sm text-slate-500">Design your social feed strategy & visuals.</p>
          
          <div className="grid grid-cols-2 gap-2 mt-4">
             <button 
                onClick={handleTrendSearch}
                disabled={loadingField === 'trend'}
                className="flex items-center justify-center gap-2 bg-slate-800 hover:bg-slate-700 text-xs font-medium py-2 px-3 rounded-lg border border-slate-700 transition-colors"
             >
               {loadingField === 'trend' ? <RefreshCcw className="w-3 h-3 animate-spin"/> : <Search className="w-3 h-3" />}
               {loadingField === 'trend' ? 'Searching...' : 'Search Trends'}
             </button>
             <button 
                onClick={handleAutoFill}
                disabled={isLoading}
                className="flex items-center justify-center gap-2 bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-medium py-2 px-3 rounded-lg shadow-lg shadow-indigo-500/20 transition-all"
             >
               <Wand2 className="w-3 h-3" />
               {isLoading ? 'Thinking...' : 'Full Magic Fill'}
             </button>
          </div>
        </div>

        {/* Form Content */}
        <div className="p-6 space-y-8 pb-32">
          
          {/* Section 1: Strategy & Content */}
          <section className="space-y-4">
            <h2 className="text-sm font-semibold text-slate-400 uppercase tracking-wider flex items-center gap-2">
              <Target className="w-4 h-4" /> Strategy & Content
            </h2>
            
            <InputWithGen 
                label="Target Audience" 
                value={state.targetAudience} 
                onChange={(v: string) => setState({...state, targetAudience: v})}
                placeholder="e.g. Gen Z Gamers, Corporate Moms"
                // No auto for audience, this is user input usually
            />

            <div className="space-y-1">
               <span className="text-xs text-slate-500">Content Pillar</span>
               <select 
                  className="w-full bg-slate-800 border border-slate-700 rounded-lg p-2 text-sm focus:ring-2 focus:ring-indigo-500 outline-none"
                  value={state.contentPillar}
                  onChange={e => setState({...state, contentPillar: e.target.value})}
               >
                 {CONTENT_PILLARS.map(s => <option key={s} value={s}>{s}</option>)}
               </select>
            </div>

            <InputWithGen 
                label="Theme / Topic" 
                value={state.theme} 
                onChange={(v: string) => setState({...state, theme: v})}
                onGen={genTheme}
                isLoading={loadingField === 'theme'}
                placeholder="e.g. Sustainable Fashion"
                icon={Lightbulb}
            />

            <InputWithGen 
                label="Hook" 
                value={state.hook} 
                onChange={(v: string) => setState({...state, hook: v})}
                onGen={genHook}
                isLoading={loadingField === 'hook'}
                placeholder="e.g. Stop scrolling! You need to see this."
            />

            <InputWithGen 
                label="Content Description (Visuals)" 
                value={state.contentDescription} 
                onChange={(v: string) => setState({...state, contentDescription: v})}
                onGen={genDesc}
                isLoading={loadingField === 'desc'}
                isArea={true}
                placeholder="Describe the scene, action, mood..."
                icon={AlignLeft}
            />
            
            <InputWithGen 
                label="Social Media Caption" 
                value={state.socialMediaCaption} 
                onChange={(v: string) => setState({...state, socialMediaCaption: v})}
                onGen={genSocialCaption}
                isLoading={loadingField === 'social'}
                isArea={true}
                placeholder="Caption for Instagram/TikTok..."
                icon={MessageSquareText}
            />
          </section>

          {/* Section 2: Visual Structure */}
          <section className="space-y-4">
             <h2 className="text-sm font-semibold text-slate-400 uppercase tracking-wider flex items-center gap-2">
              <Layout className="w-4 h-4" /> Visual Design
            </h2>
             <div className="grid grid-cols-2 gap-4">
              <label className="space-y-1">
                <span className="text-xs text-slate-500">Type</span>
                <select 
                  className="w-full bg-slate-800 border border-slate-700 rounded-lg p-2 text-sm focus:ring-2 focus:ring-indigo-500 outline-none"
                  value={state.postType}
                  onChange={e => setState({...state, postType: e.target.value as any})}
                >
                  <option>Single Post</option>
                  <option>Carousel</option>
                </select>
              </label>
              <label className="space-y-1">
                <span className="text-xs text-slate-500">Format</span>
                <select 
                  className="w-full bg-slate-800 border border-slate-700 rounded-lg p-2 text-sm focus:ring-2 focus:ring-indigo-500 outline-none"
                  value={state.aspectRatio}
                  onChange={e => setState({...state, aspectRatio: e.target.value as any})}
                >
                  <option>1:1 (Square)</option>
                  <option>4:5 (Portrait)</option>
                  <option>9:16 (Story)</option>
                  <option>16:9 (Landscape)</option>
                </select>
              </label>
            </div>

             <div className="space-y-1">
               <span className="text-xs text-slate-500">Visual Style</span>
               <select 
                  className="w-full bg-slate-800 border border-slate-700 rounded-lg p-2 text-sm focus:ring-2 focus:ring-indigo-500 outline-none"
                  value={state.visualStyle}
                  onChange={e => setState({...state, visualStyle: e.target.value})}
               >
                 {VISUAL_STYLES.map(s => <option key={s} value={s}>{s}</option>)}
               </select>
            </div>
            <div className="space-y-1">
               <span className="text-xs text-slate-500">Photography Style</span>
               <select 
                  className="w-full bg-slate-800 border border-slate-700 rounded-lg p-2 text-sm focus:ring-2 focus:ring-indigo-500 outline-none"
                  value={state.photographyStyle}
                  onChange={e => setState({...state, photographyStyle: e.target.value})}
               >
                 {PHOTOGRAPHY_STYLES.map(s => <option key={s} value={s}>{s}</option>)}
               </select>
            </div>
            <div className="space-y-1">
               <span className="text-xs text-slate-500 flex items-center gap-1"><Type className="w-3 h-3"/> Font Style</span>
               <select 
                  className="w-full bg-slate-800 border border-slate-700 rounded-lg p-2 text-sm focus:ring-2 focus:ring-indigo-500 outline-none"
                  value={state.fontStyle}
                  onChange={e => setState({...state, fontStyle: e.target.value})}
               >
                 {FONT_STYLES.map(s => <option key={s} value={s}>{s}</option>)}
               </select>
            </div>
            
            <InputWithGen 
                label="Image Overlay Text (On Design)" 
                value={state.caption} 
                onChange={(v: string) => setState({...state, caption: v})}
                onGen={genOverlayText}
                isLoading={loadingField === 'overlay'}
                placeholder="Text that appears IN the image"
            />
          </section>

          {/* Section 3: Model */}
          <section className="space-y-4">
             <h2 className="text-sm font-semibold text-slate-400 uppercase tracking-wider flex items-center gap-2">
              <Users className="w-4 h-4" /> Model Details
            </h2>
            <div className="grid grid-cols-2 gap-4">
              <select 
                  className="w-full bg-slate-800 border border-slate-700 rounded-lg p-2 text-sm"
                  value={state.modelDetails.category}
                  onChange={e => setState({...state, modelDetails: {...state.modelDetails, category: e.target.value as any}})}
               >
                 {MODEL_CATEGORIES.map(s => <option key={s} value={s}>{s}</option>)}
               </select>
               <select 
                  className="w-full bg-slate-800 border border-slate-700 rounded-lg p-2 text-sm"
                  value={state.modelDetails.gender}
                  onChange={e => setState({...state, modelDetails: {...state.modelDetails, gender: e.target.value}})}
                  disabled={state.modelDetails.category === 'None'}
               >
                 {MODEL_GENDERS.map(s => <option key={s} value={s}>{s}</option>)}
               </select>
               <select 
                  className="w-full bg-slate-800 border border-slate-700 rounded-lg p-2 text-sm"
                  value={state.modelDetails.age}
                  onChange={e => setState({...state, modelDetails: {...state.modelDetails, age: e.target.value}})}
                  disabled={state.modelDetails.category === 'None'}
               >
                 {MODEL_AGES.map(s => <option key={s} value={s}>{s}</option>)}
               </select>
                <select 
                  className="w-full bg-slate-800 border border-slate-700 rounded-lg p-2 text-sm"
                  value={state.modelDetails.race}
                  onChange={e => setState({...state, modelDetails: {...state.modelDetails, race: e.target.value}})}
                  disabled={state.modelDetails.category === 'None'}
               >
                 {RACES.map(s => <option key={s} value={s}>{s}</option>)}
               </select>
            </div>
            {state.modelDetails.category !== 'None' && (
              <div className="flex gap-4 pt-2">
                <label className="flex items-center gap-2 text-sm text-slate-400 cursor-pointer">
                  <input 
                    type="checkbox" 
                    checked={state.modelDetails.hijab}
                    onChange={e => setState({...state, modelDetails: {...state.modelDetails, hijab: e.target.checked}})}
                    className="rounded border-slate-700 bg-slate-800 text-indigo-500 focus:ring-offset-slate-900"
                  />
                  Hijab
                </label>
                <label className="flex items-center gap-2 text-sm text-slate-400 cursor-pointer">
                   <input 
                    type="checkbox" 
                    checked={state.modelDetails.faceless}
                    onChange={e => setState({...state, modelDetails: {...state.modelDetails, faceless: e.target.checked}})}
                    className="rounded border-slate-700 bg-slate-800 text-indigo-500 focus:ring-offset-slate-900"
                  />
                  Faceless
                </label>
              </div>
            )}
          </section>

          {/* Section 4: Assets */}
          <section className="space-y-4">
            <h2 className="text-sm font-semibold text-slate-400 uppercase tracking-wider flex items-center gap-2">
              <Camera className="w-4 h-4" /> Assets
            </h2>
            
            {/* Product Upload */}
            <div className="p-4 border border-dashed border-slate-700 rounded-xl bg-slate-800/50 hover:bg-slate-800 transition-colors">
               <p className="text-xs font-medium text-slate-400 mb-3">Main Product / Subject</p>
               {!state.productImage ? (
                 <label className="flex flex-col items-center justify-center h-24 cursor-pointer">
                    <Upload className="w-6 h-6 text-slate-500 mb-2" />
                    <span className="text-xs text-slate-500">Click to upload</span>
                    <input type="file" className="hidden" accept="image/*" onChange={(e) => handleFileUpload(e, true)}/>
                 </label>
               ) : (
                 <div className="relative group">
                    <img src={URL.createObjectURL(state.productImage)} alt="Product" className="h-32 w-full object-cover rounded-lg" />
                    <button 
                      onClick={() => setState({...state, productImage: null})}
                      className="absolute top-2 right-2 bg-red-500 p-1 rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
                    >
                      <X className="w-3 h-3 text-white" />
                    </button>
                 </div>
               )}
            </div>

            {/* Reference Uploads */}
            <div className="space-y-2">
              <div className="flex justify-between items-center">
                <p className="text-xs font-medium text-slate-400">Style References (Max 4)</p>
                <span className="text-xs text-slate-600">{state.customAssets.length}/4</span>
              </div>
              <div className="grid grid-cols-4 gap-2">
                {state.customAssets.map((file, idx) => (
                  <div key={idx} className="relative aspect-square group">
                    <img src={URL.createObjectURL(file)} alt="ref" className="w-full h-full object-cover rounded-lg border border-slate-700" />
                    <button 
                      onClick={() => removeAsset(idx)}
                      className="absolute top-1 right-1 bg-black/50 p-1 rounded-full hover:bg-red-500 transition-colors"
                    >
                      <X className="w-2 h-2 text-white" />
                    </button>
                  </div>
                ))}
                {state.customAssets.length < 4 && (
                   <label className="aspect-square border border-dashed border-slate-700 rounded-lg flex items-center justify-center cursor-pointer hover:bg-slate-800 transition-colors">
                      <Upload className="w-4 h-4 text-slate-500" />
                      <input type="file" className="hidden" accept="image/*" onChange={(e) => handleFileUpload(e, false)}/>
                   </label>
                )}
              </div>
            </div>
          </section>

        </div>
      </div>

      {/* Main Preview Area */}
      <div className="flex-1 bg-black/50 p-6 md:p-12 flex flex-col gap-6 relative overflow-y-auto">
        <div className="absolute top-0 left-0 w-full h-full bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-indigo-900/20 via-slate-900/0 to-slate-900/0 pointer-events-none"></div>
        
        {/* Output Box */}
        <div className="relative z-10 w-full max-w-3xl mx-auto space-y-6">
          
          <div className="bg-slate-800/80 backdrop-blur-xl border border-slate-700 rounded-2xl p-6 shadow-2xl">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-semibold text-white flex items-center gap-2">
                <Sparkles className="w-5 h-5 text-yellow-400" /> Generated Prompt
              </h2>
              <button 
                onClick={() => navigator.clipboard.writeText(generatedPrompt)}
                className="flex items-center gap-2 text-xs font-medium text-indigo-400 hover:text-indigo-300 transition-colors"
              >
                <Copy className="w-4 h-4" /> Copy Text
              </button>
            </div>
            <div className="bg-slate-950 rounded-xl p-4 font-mono text-sm text-slate-300 leading-relaxed max-h-60 overflow-y-auto border border-slate-800 shadow-inner">
               {generatedPrompt}
            </div>
            <div className="mt-4 flex gap-2">
                <button 
                    onClick={handleGenerateImage}
                    disabled={isGeneratingImage || !process.env.API_KEY}
                    className="w-full py-3 bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-500 hover:to-purple-500 text-white rounded-lg font-medium shadow-lg shadow-indigo-500/25 transition-all flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                    {isGeneratingImage ? <RefreshCcw className="w-4 h-4 animate-spin"/> : <ImageIcon className="w-4 h-4" />}
                    {isGeneratingImage ? 'Generating in Gemini 3 Pro...' : 'Generate Preview Image'}
                </button>
            </div>
          </div>

          {/* Social Caption Output */}
          {state.socialMediaCaption && (
            <div className="bg-slate-800/80 backdrop-blur-xl border border-slate-700 rounded-2xl p-6 shadow-2xl">
               <div className="flex items-center justify-between mb-4">
                  <h2 className="text-lg font-semibold text-white flex items-center gap-2">
                    <MessageSquareText className="w-5 h-5 text-pink-400" /> Social Caption
                  </h2>
                  <button 
                    onClick={() => navigator.clipboard.writeText(state.socialMediaCaption)}
                    className="flex items-center gap-2 text-xs font-medium text-indigo-400 hover:text-indigo-300 transition-colors"
                  >
                    <Copy className="w-4 h-4" /> Copy
                  </button>
               </div>
               <div className="bg-slate-950 rounded-xl p-4 text-sm text-slate-300 whitespace-pre-wrap leading-relaxed border border-slate-800 shadow-inner">
                   {state.socialMediaCaption}
               </div>
            </div>
          )}

          {/* Image Preview Result */}
          {previewImage && (
             <div className="bg-slate-800/80 backdrop-blur-xl border border-slate-700 rounded-2xl p-6 shadow-2xl animate-in fade-in slide-in-from-bottom-4 duration-500">
                <h3 className="text-sm font-semibold text-slate-400 mb-4 uppercase tracking-wider">Gemini 3 Pro Preview</h3>
                <div className="rounded-xl overflow-hidden border border-slate-700 shadow-2xl relative">
                    <img src={previewImage} alt="Generated Feed Post" className="w-full h-auto object-cover" />
                    <div className="absolute bottom-4 right-4 flex gap-2">
                         <a href={previewImage} download="feed-design.png" className="bg-black/70 backdrop-blur text-white px-3 py-1.5 rounded-lg text-xs font-medium hover:bg-black transition-colors">Download</a>
                    </div>
                </div>
             </div>
          )}

           {/* Tips */}
          {!previewImage && !state.socialMediaCaption && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="bg-slate-800/40 border border-slate-700/50 rounded-xl p-4">
                    <h4 className="text-indigo-400 font-medium text-sm mb-2">Workflow Tip</h4>
                    <p className="text-xs text-slate-400">Fill out "Target Audience" first. The 'Auto' buttons for Theme, Hook, and Description use it to create tailored results.</p>
                </div>
                <div className="bg-slate-800/40 border border-slate-700/50 rounded-xl p-4">
                    <h4 className="text-purple-400 font-medium text-sm mb-2">Content Pillars</h4>
                    <p className="text-xs text-slate-400">Selecting a "Pillar" (e.g. Education) helps the AI write better captions and hooks that actually convert.</p>
                </div>
            </div>
          )}

        </div>
      </div>
    </div>
  );
}
