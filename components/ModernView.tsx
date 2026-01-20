import React, { useState, useEffect } from 'react';
import { NewsResponse, TAIWAN_TOPICS } from '../types';
import ReactMarkdown from 'react-markdown';
import { Search, Loader2, Newspaper, Globe, Zap, Mic, MicOff, Share2 } from 'lucide-react';
import ShareDialog from './ShareDialog';

interface ModernViewProps {
  news: NewsResponse | null;
  loading: boolean;
  topic: string;
  onSearch: (q: string) => void;
  onToggleMode: () => void;
}

const ModernView: React.FC<ModernViewProps> = ({ news, loading, topic, onSearch, onToggleMode }) => {
  const [input, setInput] = useState('');
  const [isListening, setIsListening] = useState(false);
  const [recognition, setRecognition] = useState<any>(null);
  const [isShareOpen, setIsShareOpen] = useState(false);

  // Initialize Speech Recognition
  useEffect(() => {
    if ('webkitSpeechRecognition' in window || 'SpeechRecognition' in window) {
        const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
        const recog = new SpeechRecognition();
        recog.continuous = false;
        recog.interimResults = false;
        recog.lang = 'zh-TW'; // Set language to Traditional Chinese (Taiwan)

        recog.onstart = () => setIsListening(true);
        recog.onend = () => setIsListening(false);
        recog.onresult = (event: any) => {
            const transcript = event.results[0][0].transcript;
            setInput(transcript);
        };
        
        setRecognition(recog);
    }
  }, []);

  const toggleListening = () => {
    if (!recognition) {
        alert("您的瀏覽器不支援語音搜尋 (Web Speech API)。建議使用 Chrome 或 Edge。");
        return;
    }
    if (isListening) {
        recognition.stop();
    } else {
        recognition.start();
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const trimmedInput = input.trim();
    if (!trimmedInput) return;

    // Easter Egg Triggers
    if (['matrix', 'hacker', 'terminal', 'debug'].includes(trimmedInput.toLowerCase())) {
      onToggleMode();
      setInput('');
      return;
    }

    onSearch(trimmedInput);
    setInput('');
  };

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 font-sans">
      {/* Header */}
      <header className="sticky top-0 z-50 bg-white/80 backdrop-blur-md border-b border-slate-200 shadow-sm">
        <div className="max-w-5xl mx-auto px-4 h-16 flex items-center justify-between">
          <div className="flex items-center gap-2 text-indigo-600">
            <Newspaper className="w-6 h-6" />
            <h1 className="text-xl font-bold tracking-tight hidden md:block">TW News Nexus</h1>
            <h1 className="text-xl font-bold tracking-tight md:hidden">TW News</h1>
          </div>
          
          <div className="flex gap-2">
            <button 
                onClick={() => setIsShareOpen(true)}
                className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-indigo-50 hover:bg-indigo-100 transition-colors text-sm font-medium text-indigo-600"
            >
                <Share2 className="w-4 h-4" />
                <span className="hidden sm:inline">分享/故事</span>
            </button>
            <button 
                onClick={onToggleMode}
                className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-slate-100 hover:bg-slate-200 transition-colors text-sm font-medium text-slate-600"
            >
                <Zap className="w-4 h-4 text-purple-500" />
                <span className="hidden sm:inline">彩蛋 (Beta)</span>
            </button>
          </div>
        </div>
      </header>

      <main className="max-w-5xl mx-auto px-4 py-8">
        {/* Search Section */}
        <div className="mb-8 space-y-4">
          <form onSubmit={handleSubmit} className="relative max-w-2xl mx-auto">
            <div className="relative">
                <input
                type="text"
                value={input}
                onChange={(e) => setInput(e.target.value)}
                placeholder="搜尋新聞話題 (例如: 颱風動態, AI 發展) 或輸入 'matrix'..."
                className="w-full pl-12 pr-12 py-4 rounded-2xl border border-slate-200 shadow-sm focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none text-lg transition-all"
                />
                <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 w-5 h-5" />
                
                {/* Voice Search Button */}
                <button
                    type="button"
                    onClick={toggleListening}
                    className={`absolute right-14 top-1/2 -translate-y-1/2 p-2 rounded-full transition-colors ${
                        isListening ? 'bg-red-100 text-red-500 animate-pulse' : 'hover:bg-slate-100 text-slate-400'
                    }`}
                    title="語音搜尋"
                >
                    {isListening ? <MicOff className="w-5 h-5" /> : <Mic className="w-5 h-5" />}
                </button>
            </div>

            <button 
                type="submit"
                disabled={!input.trim() || loading}
                className="absolute right-2 top-2 bottom-2 bg-indigo-600 text-white px-6 rounded-xl hover:bg-indigo-700 disabled:opacity-50 transition-colors font-medium"
            >
                {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : '搜尋'}
            </button>
          </form>

          {/* Quick Filters */}
          <div className="flex flex-wrap gap-2 justify-center">
            {TAIWAN_TOPICS.map((tag) => (
              <button
                key={tag}
                onClick={() => onSearch(tag)}
                disabled={loading}
                className={`px-4 py-1.5 rounded-full text-sm font-medium transition-all ${
                  topic === tag 
                    ? 'bg-indigo-100 text-indigo-700 ring-1 ring-indigo-500' 
                    : 'bg-white border border-slate-200 text-slate-600 hover:bg-slate-50 hover:border-slate-300'
                }`}
              >
                {tag}
              </button>
            ))}
          </div>
        </div>

        {/* Content Area */}
        <div className="max-w-4xl mx-auto">
          {loading ? (
            <div className="space-y-6 animate-pulse">
              <div className="h-8 bg-slate-200 rounded w-1/3"></div>
              <div className="h-4 bg-slate-200 rounded w-full"></div>
              <div className="h-4 bg-slate-200 rounded w-full"></div>
              <div className="h-4 bg-slate-200 rounded w-2/3"></div>
            </div>
          ) : news ? (
            <div className="space-y-8">
              {/* Summary Card */}
              <div className="bg-white rounded-3xl p-6 md:p-8 shadow-sm border border-slate-100">
                <h2 className="text-2xl font-bold text-slate-900 mb-6 flex items-center gap-3">
                    <span className="w-2 h-8 bg-indigo-500 rounded-full"></span>
                    {topic} 重點摘要
                </h2>
                <div className="prose prose-slate prose-lg max-w-none prose-a:text-indigo-600 prose-headings:text-slate-800">
                  <ReactMarkdown>{news.summary}</ReactMarkdown>
                </div>
              </div>

              {/* Sources Grid */}
              {news.sources.length > 0 && (
                <div>
                    <h3 className="text-lg font-semibold text-slate-500 mb-4 ml-2 uppercase tracking-wider text-sm">參考來源</h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {news.sources.map((src, idx) => (
                        <a 
                            key={idx}
                            href={src.uri}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="group block p-4 bg-white rounded-2xl border border-slate-200 hover:border-indigo-300 hover:shadow-md transition-all"
                        >
                            <div className="flex items-start gap-3">
                                <div className="p-2 bg-indigo-50 text-indigo-600 rounded-lg group-hover:bg-indigo-600 group-hover:text-white transition-colors">
                                    <Globe className="w-5 h-5" />
                                </div>
                                <div className="flex-1 min-w-0">
                                    <h4 className="font-medium text-slate-900 truncate group-hover:text-indigo-700 transition-colors">
                                        {src.title || "新聞來源"}
                                    </h4>
                                    <p className="text-sm text-slate-400 truncate mt-0.5">{src.uri}</p>
                                </div>
                            </div>
                        </a>
                        ))}
                    </div>
                </div>
              )}
            </div>
          ) : (
            <div className="text-center py-20 text-slate-400">
                請輸入關鍵字或選擇上方主題以開始瀏覽新聞
            </div>
          )}
        </div>
      </main>
      
      <ShareDialog 
        isOpen={isShareOpen}
        onClose={() => setIsShareOpen(false)}
        news={news}
        topic={topic}
        mode="NORMAL"
      />
    </div>
  );
};

export default ModernView;