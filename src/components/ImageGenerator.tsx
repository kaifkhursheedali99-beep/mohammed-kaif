import React, { useState, useEffect } from 'react';
import {
  Sparkles,
  Download,
  Copy,
  Check,
  Maximize2,
  X,
  AlertCircle,
  Clock,
  Compass,
  Layers,
  Image as ImageIcon,
} from 'lucide-react';
import { SupportedLanguage, GeneratedImage } from '../types/chat';
import { UI_STRINGS } from '../utils/languages';

interface ImageGeneratorProps {
  language: SupportedLanguage;
}

const STYLE_OPTIONS = [
  { id: 'none', label: 'Default / Natural' },
  { id: 'photorealistic', label: '📸 Photorealistic' },
  { id: 'cinematic', label: '🎬 Cinematic 8K' },
  { id: 'indian_art', label: '🎨 Indian Heritage Art' },
  { id: 'digital_art', label: '✨ Digital Art' },
  { id: '3d_render', label: '🧊 3D Render' },
  { id: 'anime', label: '🏮 Anime / Studio Ghibli' },
];

const ASPECT_RATIOS = [
  { value: '1:1', label: '1:1', desc: 'Square (Avatar / Instagram)' },
  { value: '16:9', label: '16:9', desc: 'Landscape (Desktop / YouTube)' },
  { value: '9:16', label: '9:16', desc: 'Portrait (Story / Reels)' },
  { value: '4:3', label: '4:3', desc: 'Classic Landscape' },
  { value: '3:4', label: '3:4', desc: 'Classic Portrait' },
];

const PROMPT_IDEAS: Record<SupportedLanguage, string[]> = {
  hi: [
    'वाराणसी के गंगा घाटों पर सायंकालीन महाआरती, जलते दीये और नदी पर स्वर्णिम परावर्तन, 8K सजीव छायाचित्र',
    'शाही बंगाल टाइगर सुंदरवन के घने जंगल में सुबह के कोहरे के बीच चलते हुए, नेशनल ज्योग्राफिक स्टाइल',
    'वर्ष 2050 में भारतीय अंतरिक्ष अनुसंधान संगठन (ISRO) का चंद्रमा पर अनुसंधान केंद्र, फ्यूचरिस्टिक साय-फाई',
    'राजस्थान के जैसलमेर का स्वर्ण किला सूर्यास्त की सिंदूरी धूप में, पारंपरिक भारतीय कला व आधुनिक फोटोग्राफी',
  ],
  en: [
    'Vibrant Diwali celebration at Varanasi Ghats with thousands of floating oil lamps reflecting on the sacred Ganges river, cinematic golden hour, ultra-detailed 8K',
    'Futuristic New Delhi skyline in year 2070 with eco-skyscrapers, solar elevated trains, and Indian architectural motifs, photorealistic architectural render',
    'Majestic Indian elephant adorned with royal festive silk fabrics and gold jewelry walking through an ancient carved stone palace courtyard',
    'A solitary astronaut standing on the rugged surface of Mars looking at the Earth in the distant starry sky, cinematic space photography',
  ],
  ur: [
    'دلی کی جامع مسجد پر طلوع آفتاب کی سنہری شعاعیں، کبوتر اڑتے ہوئے، پرسکون اور دلکش فوٹوگرافی',
    'وادی کشمیر کے سرسبز باغ اور جھیل ڈل میں تیرتے ہوئے شِکارے، دور برف پوش چوٹیاں، سحر انگیز منظر',
    'مغل باغات میں سنگ مرمر کے فوارے اور گلاب کے کھلتے ہوئے پھول، شام کی ہلکی روشنی میں',
    'مستقبل کا شہر جہاں قدیم تہذیب اور جدید ٹیکنالوجی ایک دوسرے سے ہم آہنگ ہیں، الٹرا ایچ ڈی آرٹ',
  ],
  kn: [
    'ಹಂಪಿಯ ವಿಜಯ ವಿಠ್ಠಲ ದೇವಾಲಯದ ಐತಿಹಾಸಿಕ ಕಲ್ಲಿನ ರಥದ ಮೇಲೆ ಮುಂಜಾನೆಯ ಸೂರ್ಯೋದಯ ಕಿರಣಗಳು, ಅದ್ಭುತ ಛಾಯಾಚಿತ್ರ',
    'ದಸರಾ ಹಬ್ಬದ ರಾತ್ರಿ ದೀಪಗಳಿಂದ ಕಂಗೊಳಿಸುತ್ತಿರುವ ಮೈಸೂರು ಅರಮನೆ, ಸುಂದರ ಬೆಳಕಿನ ಪ್ರತಿಫಲನ, 8K ಕಲೆ',
    'ಪಶ್ಚಿಮ ಘಟ್ಟಗಳ ಹಸಿರು ಬೆಟ್ಟಗಳಲ್ಲಿ ಮಂಜಿನ ನಡುವೆ ಸಾಗುವ ಸುಂದರ ನದಿ ಮತ್ತು ಜಲಪಾತ, ನಿಸರ್ಗ ಸೌಂದರ್ಯ',
    'ಭವಿಷ್ಯದ ಬೆಂಗಳೂರು ಸಿಲಿಕಾನ್ ಸಿಟಿ, ಹಸಿರು ಪರಿಸರ ಸ್ನೇಹಿ ಗಗನಚುಂಬಿ ಕಟ್ಟಡಗಳು ಮತ್ತು ಮೆಟ್ರೋ ರೈಲುಗಳು',
  ],
};

const STORAGE_KEY = 'bharatgpt_generated_images';

export const ImageGenerator: React.FC<ImageGeneratorProps> = ({ language }) => {
  const ui = UI_STRINGS[language] || UI_STRINGS.en;
  const [prompt, setPrompt] = useState('');
  const [selectedStyle, setSelectedStyle] = useState('none');
  const [selectedRatio, setSelectedRatio] = useState('1:1');
  const [isGenerating, setIsGenerating] = useState(false);
  const [generationTime, setGenerationTime] = useState(0);
  const [currentImage, setCurrentImage] = useState<GeneratedImage | null>(null);
  const [recentImages, setRecentImages] = useState<GeneratedImage[]>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });
  const [error, setError] = useState<string | null>(null);
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [lightboxImage, setLightboxImage] = useState<GeneratedImage | null>(null);

  // Timer effect while generating
  useEffect(() => {
    let interval: any;
    if (isGenerating) {
      setGenerationTime(0);
      interval = setInterval(() => {
        setGenerationTime((prev) => prev + 1);
      }, 1000);
    }
    return () => {
      if (interval) clearInterval(interval);
    };
  }, [isGenerating]);

  // Persist recent creations
  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(recentImages.slice(0, 20)));
    } catch (e) {
      console.warn('Could not save images to localStorage (quota exceeded)');
    }
  }, [recentImages]);

  const handleGenerate = async () => {
    if (!prompt.trim() || isGenerating) return;

    setIsGenerating(true);
    setError(null);

    try {
      const res = await fetch('/api/image/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          prompt: prompt.trim(),
          aspectRatio: selectedRatio,
          style: selectedStyle !== 'none' ? selectedStyle : '',
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || `Server returned error (${res.status})`);
      }

      if (!data.imageUrl) {
        throw new Error('Image generation completed but no image data was returned.');
      }

      const newImage: GeneratedImage = {
        id: data.id || `img-${Date.now()}`,
        imageUrl: data.imageUrl,
        prompt: prompt.trim(),
        aspectRatio: selectedRatio,
        source: data.source,
        timestamp: Date.now(),
        language,
      };

      setCurrentImage(newImage);
      setRecentImages((prev) => [newImage, ...prev.filter((img) => img.id !== newImage.id)]);
    } catch (err: any) {
      console.error('Image generation error:', err);
      setError(err?.message || 'Failed to generate image. Please try again.');
    } finally {
      setIsGenerating(false);
    }
  };

  const handleDownload = (img: GeneratedImage) => {
    const link = document.createElement('a');
    link.href = img.imageUrl;
    const cleanPrompt = img.prompt
      .slice(0, 30)
      .replace(/[^a-zA-Z0-9_\u0900-\u097F\u0C80-\u0CFF\u0600-\u06FF]/g, '_');
    link.download = `bharatgpt-${cleanPrompt}-${Date.now()}.png`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handleCopyPrompt = (id: string, text: string) => {
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  const promptIdeas = PROMPT_IDEAS[language] || PROMPT_IDEAS.en;

  return (
    <div className="flex-1 overflow-y-auto px-4 py-6 max-w-5xl mx-auto w-full">
      {/* Hero Badge & Header */}
      <div className="text-center mb-6">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-semibold bg-gradient-to-r from-amber-500/10 via-orange-500/10 to-emerald-500/10 border border-amber-500/20 text-neutral-800 dark:text-neutral-200 mb-2">
          <Sparkles size={14} className="text-amber-500 animate-pulse" />
          <span>{ui.tabImage} · Gemini 3.1 Flash Lite Image</span>
        </div>
        <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-neutral-900 dark:text-white">
          Create Stunning Images with <span className="text-amber-500">Bharat</span>
          <span className="text-emerald-600 dark:text-emerald-400">GPT</span>
        </h1>
        <p className="text-xs sm:text-sm text-neutral-500 dark:text-neutral-400 mt-1 max-w-xl mx-auto">
          Describe any concept in Hindi, English, Urdu, or Kannada and watch the AI bring it to life instantly with high fidelity.
        </p>
      </div>

      {/* Main Generator Box */}
      <div className="bg-neutral-50 dark:bg-[#121622] border border-neutral-200/90 dark:border-neutral-800/90 rounded-2xl p-4 sm:p-5 shadow-xs transition-all">
        {/* Prompt Input */}
        <div className="space-y-2">
          <label className="text-xs font-semibold text-neutral-700 dark:text-neutral-300 flex items-center justify-between">
            <span className="flex items-center gap-1.5">
              <ImageIcon size={14} className="text-amber-500" />
              Prompt
            </span>
            <span className="text-[11px] font-normal text-neutral-400">
              {prompt.length} / 1000 characters
            </span>
          </label>
          <div className="relative">
            <textarea
              value={prompt}
              onChange={(e) => setPrompt(e.target.value)}
              placeholder={ui.imagePromptPlaceholder}
              rows={3}
              maxLength={1000}
              className="w-full px-3.5 py-3 rounded-xl bg-white dark:bg-[#0c0f17] border border-neutral-200 dark:border-neutral-700/80 text-neutral-900 dark:text-neutral-100 placeholder-neutral-400 dark:placeholder-neutral-500 text-sm focus:outline-none focus:ring-2 focus:ring-amber-500/40 focus:border-amber-500 transition-all resize-none shadow-xs"
            />
          </div>
        </div>

        {/* Prompt Inspirations */}
        <div className="mt-3">
          <div className="text-[11px] font-semibold text-neutral-500 dark:text-neutral-400 flex items-center gap-1 mb-1.5">
            <Compass size={12} className="text-amber-500" />
            Prompt Ideas:
          </div>
          <div className="flex flex-wrap gap-1.5">
            {promptIdeas.map((idea, idx) => (
              <button
                key={idx}
                type="button"
                onClick={() => setPrompt(idea)}
                className="text-left text-xs px-2.5 py-1.5 rounded-lg bg-white dark:bg-[#0c0f17] border border-neutral-200/80 dark:border-neutral-700/70 text-neutral-700 dark:text-neutral-300 hover:border-amber-500/50 hover:bg-amber-500/5 dark:hover:bg-amber-500/10 transition-colors line-clamp-1 max-w-full"
                title={idea}
              >
                💡 {idea}
              </button>
            ))}
          </div>
        </div>

        {/* Controls Row: Aspect Ratio & Style */}
        <div className="mt-4 pt-4 border-t border-neutral-200/70 dark:border-neutral-800/70 grid grid-cols-1 sm:grid-cols-2 gap-4">
          {/* Aspect Ratio */}
          <div>
            <label className="text-xs font-semibold text-neutral-700 dark:text-neutral-300 block mb-1.5">
              {ui.aspectRatio}
            </label>
            <div className="grid grid-cols-5 gap-1.5">
              {ASPECT_RATIOS.map((ratio) => (
                <button
                  key={ratio.value}
                  type="button"
                  onClick={() => setSelectedRatio(ratio.value)}
                  className={`px-2 py-2 text-center rounded-xl border text-xs font-medium transition-all ${
                    selectedRatio === ratio.value
                      ? 'bg-amber-500 text-white border-amber-600 shadow-xs font-bold'
                      : 'bg-white dark:bg-[#0c0f17] border-neutral-200 dark:border-neutral-700/80 text-neutral-700 dark:text-neutral-300 hover:border-neutral-300'
                  }`}
                  title={ratio.desc}
                >
                  <div className="text-xs">{ratio.label}</div>
                </button>
              ))}
            </div>
          </div>

          {/* Style Filter */}
          <div>
            <label className="text-xs font-semibold text-neutral-700 dark:text-neutral-300 flex items-center gap-1 mb-1.5">
              <Layers size={13} className="text-amber-500" />
              Artistic Style
            </label>
            <select
              value={selectedStyle}
              onChange={(e) => setSelectedStyle(e.target.value)}
              className="w-full px-3 py-2 rounded-xl bg-white dark:bg-[#0c0f17] border border-neutral-200 dark:border-neutral-700/80 text-neutral-800 dark:text-neutral-200 text-xs font-medium focus:outline-none focus:ring-2 focus:ring-amber-500/40"
            >
              {STYLE_OPTIONS.map((opt) => (
                <option key={opt.id} value={opt.id}>
                  {opt.label}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Action Button & Disclaimer */}
        <div className="mt-5 flex flex-col sm:flex-row items-center justify-between gap-3 pt-3 border-t border-neutral-200/70 dark:border-neutral-800/70">
          <div className="text-[11px] text-neutral-500 dark:text-neutral-400 flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
            <span>{ui.imageNotice}</span>
          </div>

          <button
            type="button"
            disabled={!prompt.trim() || isGenerating}
            onClick={handleGenerate}
            className={`w-full sm:w-auto px-6 py-2.5 rounded-xl font-semibold text-sm flex items-center justify-center gap-2 transition-all shadow-md cursor-pointer ${
              !prompt.trim() || isGenerating
                ? 'bg-neutral-300 dark:bg-neutral-800 text-neutral-500 cursor-not-allowed shadow-none'
                : 'bg-gradient-to-r from-amber-500 via-orange-500 to-emerald-600 hover:from-amber-600 hover:to-emerald-700 text-white active:scale-[0.98]'
            }`}
          >
            {isGenerating ? (
              <>
                <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                <span>
                  {ui.generatingImage} ({generationTime}s)
                </span>
              </>
            ) : (
              <>
                <Sparkles size={16} />
                <span>{ui.generateImage}</span>
              </>
            )}
          </button>
        </div>
      </div>

      {/* Error Alert */}
      {error && (
        <div className="mt-4 p-3.5 rounded-xl bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-900 text-rose-800 dark:text-rose-200 text-xs flex items-start justify-between gap-2">
          <div className="flex items-start gap-2">
            <AlertCircle size={16} className="shrink-0 text-rose-500 mt-0.5" />
            <div>
              <p className="font-semibold">Image Generation Error</p>
              <p className="mt-0.5 opacity-90">{error}</p>
            </div>
          </div>
          <button
            type="button"
            onClick={() => setError(null)}
            className="p-1 hover:bg-rose-100 dark:hover:bg-rose-900/50 rounded"
          >
            <X size={14} />
          </button>
        </div>
      )}

      {/* Active Generating Placeholder */}
      {isGenerating && (
        <div className="mt-6 p-6 rounded-2xl bg-neutral-100 dark:bg-[#121622] border border-neutral-200 dark:border-neutral-800 text-center animate-pulse">
          <div className="w-16 h-16 mx-auto rounded-2xl bg-gradient-to-tr from-amber-500/20 via-orange-500/20 to-emerald-500/20 flex items-center justify-center mb-3">
            <Sparkles size={28} className="text-amber-500 animate-spin" />
          </div>
          <h3 className="font-semibold text-sm text-neutral-800 dark:text-neutral-200">
            Rendering your artwork...
          </h3>
          <p className="text-xs text-neutral-500 dark:text-neutral-400 mt-1 max-w-md mx-auto">
            Gemini is evaluating your prompt and generating a high-resolution image ({generationTime}s elapsed)
          </p>
          <div className="w-48 h-1.5 bg-neutral-200 dark:bg-neutral-700 rounded-full mx-auto mt-4 overflow-hidden">
            <div className="h-full bg-gradient-to-r from-amber-500 via-orange-500 to-emerald-500 rounded-full animate-indeterminate" />
          </div>
        </div>
      )}

      {/* Featured Current Generated Image */}
      {currentImage && !isGenerating && (
        <div className="mt-6">
          <div className="flex items-center justify-between mb-2">
            <h2 className="text-sm font-bold text-neutral-900 dark:text-white flex items-center gap-1.5">
              <Sparkles size={14} className="text-amber-500" />
              Generated Artwork
            </h2>
            <span className="text-[11px] text-neutral-400">
              {new Date(currentImage.timestamp).toLocaleTimeString()} · Ratio {currentImage.aspectRatio}
            </span>
          </div>

          <div className="relative rounded-2xl overflow-hidden border border-neutral-200 dark:border-neutral-800 bg-neutral-900 shadow-xl group">
            <img
              src={currentImage.imageUrl}
              alt={currentImage.prompt}
              className="w-full h-auto max-h-[550px] object-contain mx-auto bg-black/40"
            />

            {/* Hover Actions Toolbar */}
            <div className="absolute top-3 right-3 flex items-center gap-1.5 opacity-95">
              <button
                type="button"
                onClick={() => setLightboxImage(currentImage)}
                className="p-2 rounded-xl bg-black/60 hover:bg-black/80 text-white backdrop-blur-md transition-all shadow-md cursor-pointer"
                title="Fullscreen Preview"
              >
                <Maximize2 size={16} />
              </button>
              <button
                type="button"
                onClick={() => handleDownload(currentImage)}
                className="p-2 rounded-xl bg-amber-500 hover:bg-amber-600 text-white transition-all shadow-md cursor-pointer flex items-center gap-1 text-xs font-semibold"
                title={ui.downloadImage}
              >
                <Download size={16} />
                <span className="hidden sm:inline">{ui.download}</span>
              </button>
            </div>

            {/* Prompt details overlay bar */}
            <div className="p-3.5 bg-white/95 dark:bg-[#121622]/95 backdrop-blur-md border-t border-neutral-200 dark:border-neutral-800 flex items-center justify-between gap-3">
              <p className="text-xs text-neutral-800 dark:text-neutral-200 font-medium line-clamp-2 flex-1">
                {currentImage.prompt}
              </p>
              <div className="flex items-center gap-2 shrink-0">
                <button
                  type="button"
                  onClick={() => handleCopyPrompt(currentImage.id, currentImage.prompt)}
                  className="p-2 rounded-lg text-neutral-600 dark:text-neutral-300 hover:bg-neutral-100 dark:hover:bg-neutral-800 transition-colors cursor-pointer"
                  title="Copy Prompt"
                >
                  {copiedId === currentImage.id ? (
                    <Check size={15} className="text-emerald-500" />
                  ) : (
                    <Copy size={15} />
                  )}
                </button>
                <button
                  type="button"
                  onClick={() => handleDownload(currentImage)}
                  className="px-3 py-1.5 rounded-lg bg-neutral-900 dark:bg-white text-white dark:text-neutral-900 text-xs font-semibold hover:opacity-90 transition-opacity flex items-center gap-1.5"
                >
                  <Download size={13} />
                  <span>{ui.download}</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Recent Generations Gallery */}
      {recentImages.length > 0 && (
        <div className="mt-10">
          <div className="flex items-center justify-between mb-3 border-b border-neutral-200 dark:border-neutral-800 pb-2">
            <h3 className="text-sm font-bold text-neutral-900 dark:text-neutral-100 flex items-center gap-2">
              <Clock size={15} className="text-amber-500" />
              {ui.recentCreations} ({recentImages.length})
            </h3>
            {recentImages.length > 0 && (
              <button
                type="button"
                onClick={() => {
                  if (confirm('Clear all recent image creations from this session?')) {
                    setRecentImages([]);
                    localStorage.removeItem(STORAGE_KEY);
                  }
                }}
                className="text-xs text-neutral-400 hover:text-rose-500 transition-colors"
              >
                Clear
              </button>
            )}
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
            {recentImages.map((img) => (
              <div
                key={img.id}
                className="group relative rounded-xl overflow-hidden border border-neutral-200 dark:border-neutral-800 bg-neutral-100 dark:bg-neutral-900 aspect-square shadow-2xs hover:shadow-md transition-all cursor-pointer"
                onClick={() => setCurrentImage(img)}
              >
                <img
                  src={img.imageUrl}
                  alt={img.prompt}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                  loading="lazy"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity flex flex-col justify-end p-2.5">
                  <p className="text-[11px] text-white line-clamp-2 font-medium">{img.prompt}</p>
                  <div className="flex items-center justify-between mt-1.5 pt-1 border-t border-white/20">
                    <span className="text-[10px] text-neutral-300">{img.aspectRatio}</span>
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        handleDownload(img);
                      }}
                      className="p-1 rounded bg-white/20 hover:bg-white/40 text-white transition-colors"
                      title={ui.downloadImage}
                    >
                      <Download size={12} />
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Lightbox Modal */}
      {lightboxImage && (
        <div
          className="fixed inset-0 z-50 bg-black/90 backdrop-blur-md flex items-center justify-center p-4"
          onClick={() => setLightboxImage(null)}
        >
          <div
            className="relative max-w-4xl max-h-[90vh] flex flex-col items-center"
            onClick={(e) => e.stopPropagation()}
          >
            <button
              type="button"
              onClick={() => setLightboxImage(null)}
              className="absolute -top-10 right-0 text-white hover:text-neutral-300 p-2 cursor-pointer"
            >
              <X size={24} />
            </button>
            <img
              src={lightboxImage.imageUrl}
              alt={lightboxImage.prompt}
              className="max-w-full max-h-[75vh] rounded-xl object-contain shadow-2xl"
            />
            <div className="mt-3 p-3 rounded-xl bg-neutral-900/80 border border-neutral-700 text-white text-xs max-w-xl text-center flex items-center justify-between gap-3 w-full">
              <span className="line-clamp-2 text-left">{lightboxImage.prompt}</span>
              <button
                type="button"
                onClick={() => handleDownload(lightboxImage)}
                className="px-3 py-1.5 rounded-lg bg-amber-500 hover:bg-amber-600 font-semibold text-white shrink-0 flex items-center gap-1"
              >
                <Download size={14} />
                <span>{ui.download}</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
