import React, { useState, useEffect } from 'react';
import {
  Video as VideoIcon,
  Download,
  Copy,
  Check,
  AlertCircle,
  Clock,
  Compass,
  Play,
  Film,
  Sparkles,
  X,
} from 'lucide-react';
import { SupportedLanguage, GeneratedVideo } from '../types/chat';
import { UI_STRINGS } from '../utils/languages';

interface VideoGeneratorProps {
  language: SupportedLanguage;
}

const VIDEO_RATIOS = [
  { value: '16:9', label: '16:9', desc: 'Landscape / YouTube' },
  { value: '9:16', label: '9:16', desc: 'Portrait / Reels / Shorts' },
];

const DURATION_OPTIONS = [
  { value: '5s', label: '5 Seconds', desc: 'Standard high-speed generation' },
  { value: '10s', label: '10 Seconds', desc: 'Extended cinematic scene' },
];

const VIDEO_PROMPT_IDEAS: Record<SupportedLanguage, string[]> = {
  hi: [
    'मुंबई में गेटवे ऑफ इंडिया के पत्थरों से टकराती समुद्री लहरें, सूर्यास्त की सिंदूरी किरणें, सिनेमैटिक 4K स्लो मोशन',
    'शाही बंगाल टाइगर सुंदरवन के जंगलों में धीरे-धीरे कदमों से आगे बढ़ते हुए, पत्तों की सरसराहट, अल्ट्रा रियलिस्टिक',
    'वंदे भारत एक्सप्रेस ट्रेन हरे-भरे पश्चिमी घाटों के ऊंचे पुलों से गुजरती हुई, बादलों के बीच से विहंगम ड्रोन शॉट',
    'हम्पी के प्राचीन रथ मंदिर के ऊपर आकाशगंगा का रात का टाइम-लैप्स, तारों की सुंदर गतिशीलता',
  ],
  en: [
    'Dramatic waves crashing against the stone promenade of Gateway of India in Mumbai during golden hour sunset, slow motion cinematic 4K camera pan',
    'Vande Bharat express train gliding across a scenic curved bridge in the lush green Western Ghats during monsoon mist, smooth aerial drone camera',
    'Majestic Bengal Tiger walking gracefully through misty bamboo grove, golden sunlight piercing through canopy, ultra-detailed wildlife cinematography',
    'Time-lapse of starry celestial sky and glowing nebula clouds rotating over the ancient Stone Chariot in Hampi',
  ],
  ur: [
    'وادی کشمیر کی ڈل جھیل میں تیرتی ہوئی شکارا کشتی، پانی پر ارتعاش اور دور برف پوش پہاڑوں کا دلکش سست رفتار فضائی منظر',
    'بادشاہی مسجد اور مغل فن تعمیر کے گنبدوں کے گرد شام کے وقت کبوتروں کا غول اڑتے ہوئے، سنہری روشنی کا عکس',
    'گھنے بارانی جنگل میں بہتا ہوا شفاف چشمہ، سورج کی کرنیں پتوں سے چھن کر آتی ہوئی، سحر انگیز مووی سین',
    'صحرا میں رات کے وقت ستاروں کا دلکش منظر اور ریت کے ٹیلوں پر ہوا کی لہریں، ٹائم لیپس موشن',
  ],
  kn: [
    'ಮೈಸೂರು ಅರಮನೆಯ ಮೇಲೆ ಸಂಜೆಯ ರಮಣೀಯ ಡ್ರೋನ್ ವಿಡಿಯೋ, ಸಾವಿರಾರು ದೀಪಗಳು ನಿಧಾನವಾಗಿ ಬೆಳಗುತ್ತಿರುವುದು, ಸಿನೆಮ್ಯಾಟಿಕ್ 4K',
    'ಪಶ್ಚಿಮ ಘಟ್ಟಗಳ ಹಸಿರು ಕಣಿವೆಯಲ್ಲಿ ಜಲಪಾತದ ಸುಂದರ ದೃಶ್ಯ, ಮಂಜಿನ ಹನಿಗಳು ಮತ್ತು ನಿಧಾನ ಗತಿಯ ಕ್ಯಾಮೆರಾ ಚಲನೆ',
    'ಬೆಂಗಳೂರಿನ ಹೈಟೆಕ್ ಸಿಟಿ ಮೇಲೆ ಸಂಜೆಯ ಟ್ರಾಫಿಕ್ ದೀಪಗಳ ಟೈಮ್-ಲ್ಯಾಪ್ಸ್, ನವೀನ ಭಾರತದ ವೇಗ ಮತ್ತು ಸೌಂದರ್ಯ',
    'ಕರಾವಳಿ ತೀರದಲ್ಲಿ ಸೂರ್ಯಾಸ್ತದ ಸಮಯದಲ್ಲಿ ಅಲೆಗಳು ತೀರಕ್ಕೆ ಅಪ್ಪಳಿಸುವ ಸುಂದರ ನಿಧಾನಗತಿಯ ವಿಡಿಯೋ',
  ],
};

const STORAGE_KEY = 'bharatgpt_generated_videos';

export const VideoGenerator: React.FC<VideoGeneratorProps> = ({ language }) => {
  const ui = UI_STRINGS[language] || UI_STRINGS.en;
  const [prompt, setPrompt] = useState('');
  const [selectedRatio, setSelectedRatio] = useState('16:9');
  const [selectedDuration, setSelectedDuration] = useState('5s');
  const [isGenerating, setIsGenerating] = useState(false);
  const [elapsedSeconds, setElapsedSeconds] = useState(0);
  const [currentVideo, setCurrentVideo] = useState<GeneratedVideo | null>(null);
  const [recentVideos, setRecentVideos] = useState<GeneratedVideo[]>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });
  const [error, setError] = useState<string | null>(null);
  const [copiedId, setCopiedId] = useState<string | null>(null);

  // Timer while generating
  useEffect(() => {
    let interval: any;
    if (isGenerating) {
      setElapsedSeconds(0);
      interval = setInterval(() => {
        setElapsedSeconds((prev) => prev + 1);
      }, 1000);
    }
    return () => {
      if (interval) clearInterval(interval);
    };
  }, [isGenerating]);

  // Persist recent videos
  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(recentVideos.slice(0, 10)));
    } catch (e) {
      console.warn('Could not save videos to localStorage');
    }
  }, [recentVideos]);

  const handleGenerate = async () => {
    if (!prompt.trim() || isGenerating) return;

    setIsGenerating(true);
    setError(null);

    try {
      const res = await fetch('/api/video/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          prompt: prompt.trim(),
          aspectRatio: selectedRatio,
          duration: selectedDuration,
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || `Server returned error (${res.status})`);
      }

      if (!data.videoUrl) {
        throw new Error('Video generation completed but no video stream data was returned.');
      }

      const newVideo: GeneratedVideo = {
        id: data.id || `vid-${Date.now()}`,
        videoUrl: data.videoUrl,
        prompt: prompt.trim(),
        aspectRatio: selectedRatio,
        duration: selectedDuration,
        source: data.source,
        timestamp: Date.now(),
        language,
      };

      setCurrentVideo(newVideo);
      setRecentVideos((prev) => [newVideo, ...prev.filter((v) => v.id !== newVideo.id)]);
    } catch (err: any) {
      console.error('Video generation error:', err);
      setError(
        err?.message ||
          'Failed to generate video. Gemini Omni Flash requires video generation permissions or active quota.'
      );
    } finally {
      setIsGenerating(false);
    }
  };

  const handleDownload = (video: GeneratedVideo) => {
    const link = document.createElement('a');
    link.href = video.videoUrl;
    const cleanPrompt = video.prompt
      .slice(0, 30)
      .replace(/[^a-zA-Z0-9_\u0900-\u097F\u0C80-\u0CFF\u0600-\u06FF]/g, '_');
    link.download = `bharatgpt-video-${cleanPrompt}-${Date.now()}.mp4`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handleCopyPrompt = (id: string, text: string) => {
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  const promptIdeas = VIDEO_PROMPT_IDEAS[language] || VIDEO_PROMPT_IDEAS.en;

  // Stages of generation for visual clarity
  const getStageMessage = () => {
    if (elapsedSeconds < 8) return 'Initializing Gemini Omni 1.2 Flash neural video pipeline...';
    if (elapsedSeconds < 22) return 'Synthesizing scene motion, physics, and lighting dynamics...';
    if (elapsedSeconds < 38) return 'Interpolating temporal frames and rendering 720p HD sequence...';
    return 'Finalizing MP4 video container and streaming back to BharatGPT...';
  };

  return (
    <div className="flex-1 overflow-y-auto px-4 py-6 max-w-5xl mx-auto w-full">
      {/* Hero Badge & Header */}
      <div className="text-center mb-6">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-semibold bg-gradient-to-r from-blue-500/10 via-amber-500/10 to-emerald-500/10 border border-blue-500/20 text-neutral-800 dark:text-neutral-200 mb-2">
          <Film size={14} className="text-blue-500 animate-pulse" />
          <span>{ui.tabVideo} · Gemini Omni 1.2 Flash</span>
        </div>
        <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-neutral-900 dark:text-white">
          Generate Cinematic AI Videos with <span className="text-amber-500">Bharat</span>
          <span className="text-emerald-600 dark:text-emerald-400">GPT</span>
        </h1>
        <p className="text-xs sm:text-sm text-neutral-500 dark:text-neutral-400 mt-1 max-w-xl mx-auto">
          Turn your imagination into real high-definition videos with natural physics and smooth motion using the Gemini Interactions API.
        </p>
      </div>

      {/* Main Video Creation Box */}
      <div className="bg-neutral-50 dark:bg-[#121622] border border-neutral-200/90 dark:border-neutral-800/90 rounded-2xl p-4 sm:p-5 shadow-xs transition-all">
        {/* Prompt Input */}
        <div className="space-y-2">
          <label className="text-xs font-semibold text-neutral-700 dark:text-neutral-300 flex items-center justify-between">
            <span className="flex items-center gap-1.5">
              <VideoIcon size={14} className="text-blue-500" />
              Video Scene & Motion Description
            </span>
            <span className="text-[11px] font-normal text-neutral-400">
              {prompt.length} / 1000 characters
            </span>
          </label>
          <div className="relative">
            <textarea
              value={prompt}
              onChange={(e) => setPrompt(e.target.value)}
              placeholder={ui.videoPromptPlaceholder}
              rows={3}
              maxLength={1000}
              className="w-full px-3.5 py-3 rounded-xl bg-white dark:bg-[#0c0f17] border border-neutral-200 dark:border-neutral-700/80 text-neutral-900 dark:text-neutral-100 placeholder-neutral-400 dark:placeholder-neutral-500 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/40 focus:border-blue-500 transition-all resize-none shadow-xs"
            />
          </div>
        </div>

        {/* Prompt Inspirations */}
        <div className="mt-3">
          <div className="text-[11px] font-semibold text-neutral-500 dark:text-neutral-400 flex items-center gap-1 mb-1.5">
            <Compass size={12} className="text-blue-500" />
            Cinematic Prompt Ideas:
          </div>
          <div className="flex flex-wrap gap-1.5">
            {promptIdeas.map((idea, idx) => (
              <button
                key={idx}
                type="button"
                onClick={() => setPrompt(idea)}
                className="text-left text-xs px-2.5 py-1.5 rounded-lg bg-white dark:bg-[#0c0f17] border border-neutral-200/80 dark:border-neutral-700/70 text-neutral-700 dark:text-neutral-300 hover:border-blue-500/50 hover:bg-blue-500/5 dark:hover:bg-blue-500/10 transition-colors line-clamp-1 max-w-full"
                title={idea}
              >
                🎬 {idea}
              </button>
            ))}
          </div>
        </div>

        {/* Configuration Row: Aspect Ratio & Duration */}
        <div className="mt-4 pt-4 border-t border-neutral-200/70 dark:border-neutral-800/70 grid grid-cols-1 sm:grid-cols-2 gap-4">
          {/* Aspect Ratio */}
          <div>
            <label className="text-xs font-semibold text-neutral-700 dark:text-neutral-300 block mb-1.5">
              {ui.aspectRatio}
            </label>
            <div className="grid grid-cols-2 gap-2">
              {VIDEO_RATIOS.map((ratio) => (
                <button
                  key={ratio.value}
                  type="button"
                  onClick={() => setSelectedRatio(ratio.value)}
                  className={`px-3 py-2 text-center rounded-xl border text-xs font-medium transition-all ${
                    selectedRatio === ratio.value
                      ? 'bg-blue-600 text-white border-blue-700 shadow-xs font-bold'
                      : 'bg-white dark:bg-[#0c0f17] border-neutral-200 dark:border-neutral-700/80 text-neutral-700 dark:text-neutral-300 hover:border-neutral-300'
                  }`}
                  title={ratio.desc}
                >
                  <div className="font-semibold">{ratio.label}</div>
                  <div className="text-[10px] opacity-80">{ratio.desc.split('/')[0]}</div>
                </button>
              ))}
            </div>
          </div>

          {/* Duration */}
          <div>
            <label className="text-xs font-semibold text-neutral-700 dark:text-neutral-300 block mb-1.5">
              {ui.duration}
            </label>
            <div className="grid grid-cols-2 gap-2">
              {DURATION_OPTIONS.map((opt) => (
                <button
                  key={opt.value}
                  type="button"
                  onClick={() => setSelectedDuration(opt.value)}
                  className={`px-3 py-2 text-center rounded-xl border text-xs font-medium transition-all ${
                    selectedDuration === opt.value
                      ? 'bg-blue-600 text-white border-blue-700 shadow-xs font-bold'
                      : 'bg-white dark:bg-[#0c0f17] border-neutral-200 dark:border-neutral-700/80 text-neutral-700 dark:text-neutral-300 hover:border-neutral-300'
                  }`}
                  title={opt.desc}
                >
                  <div className="font-semibold">{opt.label}</div>
                  <div className="text-[10px] opacity-80">{opt.desc}</div>
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Action Button & API Notice */}
        <div className="mt-5 flex flex-col sm:flex-row items-center justify-between gap-3 pt-3 border-t border-neutral-200/70 dark:border-neutral-800/70">
          <div className="text-[11px] text-neutral-500 dark:text-neutral-400 flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full bg-blue-500 animate-pulse" />
            <span>{ui.videoNotice}</span>
          </div>

          <button
            type="button"
            disabled={!prompt.trim() || isGenerating}
            onClick={handleGenerate}
            className={`w-full sm:w-auto px-6 py-2.5 rounded-xl font-semibold text-sm flex items-center justify-center gap-2 transition-all shadow-md cursor-pointer ${
              !prompt.trim() || isGenerating
                ? 'bg-neutral-300 dark:bg-neutral-800 text-neutral-500 cursor-not-allowed shadow-none'
                : 'bg-gradient-to-r from-blue-600 via-indigo-600 to-amber-600 hover:from-blue-700 hover:to-amber-700 text-white active:scale-[0.98]'
            }`}
          >
            {isGenerating ? (
              <>
                <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                <span>
                  Rendering Video ({elapsedSeconds}s)
                </span>
              </>
            ) : (
              <>
                <Film size={16} />
                <span>{ui.generateVideo}</span>
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
              <p className="font-semibold">Video Generation Note</p>
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

      {/* Video Generation Progress Animation */}
      {isGenerating && (
        <div className="mt-6 p-6 rounded-2xl bg-neutral-100 dark:bg-[#121622] border border-neutral-200 dark:border-neutral-800 text-center animate-pulse">
          <div className="w-16 h-16 mx-auto rounded-2xl bg-blue-500/10 flex items-center justify-center mb-3">
            <Film size={30} className="text-blue-500 animate-spin" />
          </div>
          <h3 className="font-semibold text-sm text-neutral-900 dark:text-neutral-100">
            {getStageMessage()}
          </h3>
          <p className="text-xs text-neutral-500 dark:text-neutral-400 mt-1 max-w-md mx-auto">
            Video generation uses advanced neural physics and takes 25–45 seconds. Elapsed: {elapsedSeconds}s
          </p>
          <div className="w-60 h-2 bg-neutral-200 dark:bg-neutral-700 rounded-full mx-auto mt-4 overflow-hidden">
            <div
              className="h-full bg-gradient-to-r from-blue-500 via-indigo-500 to-amber-500 rounded-full transition-all duration-300"
              style={{ width: `${Math.min(95, elapsedSeconds * 2.5)}%` }}
            />
          </div>
        </div>
      )}

      {/* Active Generated Video Player */}
      {currentVideo && !isGenerating && (
        <div className="mt-6">
          <div className="flex items-center justify-between mb-2">
            <h2 className="text-sm font-bold text-neutral-900 dark:text-white flex items-center gap-1.5">
              <Play size={15} className="text-blue-500" />
              Generated AI Video Preview
            </h2>
            <span className="text-[11px] text-neutral-400">
              {new Date(currentVideo.timestamp).toLocaleTimeString()} · Ratio {currentVideo.aspectRatio} · {currentVideo.duration}
            </span>
          </div>

          <div className="rounded-2xl overflow-hidden border border-neutral-200 dark:border-neutral-800 bg-black shadow-xl">
            <video
              src={currentVideo.videoUrl}
              controls
              autoPlay
              loop
              playsInline
              className={`w-full max-h-[550px] object-contain mx-auto ${
                currentVideo.aspectRatio === '9:16' ? 'max-w-sm' : 'w-full'
              }`}
            />

            {/* Video metadata and download toolbar */}
            <div className="p-4 bg-white/95 dark:bg-[#121622]/95 backdrop-blur-md border-t border-neutral-200 dark:border-neutral-800 flex items-center justify-between gap-3">
              <p className="text-xs text-neutral-800 dark:text-neutral-200 font-medium line-clamp-2 flex-1">
                {currentVideo.prompt}
              </p>
              <div className="flex items-center gap-2 shrink-0">
                <button
                  type="button"
                  onClick={() => handleCopyPrompt(currentVideo.id, currentVideo.prompt)}
                  className="p-2 rounded-lg text-neutral-600 dark:text-neutral-300 hover:bg-neutral-100 dark:hover:bg-neutral-800 transition-colors cursor-pointer"
                  title="Copy Prompt"
                >
                  {copiedId === currentVideo.id ? (
                    <Check size={15} className="text-emerald-500" />
                  ) : (
                    <Copy size={15} />
                  )}
                </button>
                <button
                  type="button"
                  onClick={() => handleDownload(currentVideo)}
                  className="px-3.5 py-1.5 rounded-lg bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold shadow-xs flex items-center gap-1.5 cursor-pointer transition-colors"
                >
                  <Download size={14} />
                  <span>{ui.downloadVideo}</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Recent Videos History */}
      {recentVideos.length > 0 && (
        <div className="mt-10">
          <div className="flex items-center justify-between mb-3 border-b border-neutral-200 dark:border-neutral-800 pb-2">
            <h3 className="text-sm font-bold text-neutral-900 dark:text-neutral-100 flex items-center gap-2">
              <Clock size={15} className="text-blue-500" />
              {ui.recentCreations} ({recentVideos.length})
            </h3>
            <button
              type="button"
              onClick={() => {
                if (confirm('Clear video history from this session?')) {
                  setRecentVideos([]);
                  localStorage.removeItem(STORAGE_KEY);
                }
              }}
              className="text-xs text-neutral-400 hover:text-rose-500 transition-colors"
            >
              Clear
            </button>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
            {recentVideos.map((vid) => (
              <div
                key={vid.id}
                className="group rounded-xl overflow-hidden border border-neutral-200 dark:border-neutral-800 bg-neutral-100 dark:bg-neutral-900 shadow-2xs hover:shadow-md transition-all cursor-pointer flex flex-col"
                onClick={() => setCurrentVideo(vid)}
              >
                <div className="relative aspect-video bg-black flex items-center justify-center">
                  <video
                    src={vid.videoUrl}
                    className="w-full h-full object-cover"
                    muted
                    playsInline
                    preload="metadata"
                  />
                  <div className="absolute inset-0 bg-black/30 flex items-center justify-center opacity-70 group-hover:opacity-100 transition-opacity">
                    <div className="w-10 h-10 rounded-full bg-white/20 backdrop-blur-md flex items-center justify-center text-white">
                      <Play size={18} fill="currentColor" />
                    </div>
                  </div>
                  <span className="absolute bottom-1.5 right-1.5 text-[10px] bg-black/70 text-white px-1.5 py-0.5 rounded font-mono">
                    {vid.duration}
                  </span>
                </div>
                <div className="p-2.5 flex-1 flex flex-col justify-between">
                  <p className="text-xs text-neutral-800 dark:text-neutral-200 line-clamp-2 font-medium">
                    {vid.prompt}
                  </p>
                  <div className="flex items-center justify-between mt-2 pt-1 border-t border-neutral-200 dark:border-neutral-800">
                    <span className="text-[10px] text-neutral-400">{vid.aspectRatio}</span>
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        handleDownload(vid);
                      }}
                      className="p-1 rounded text-neutral-500 hover:text-blue-500 transition-colors"
                      title={ui.downloadVideo}
                    >
                      <Download size={13} />
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};
