import React, { useState } from 'react';
import { X, Copy, Share2, Heart, MessageCircle, Instagram, Facebook } from 'lucide-react';
import { NewsResponse } from '../types';

interface ShareDialogProps {
  isOpen: boolean;
  onClose: () => void;
  news: NewsResponse | null;
  topic: string;
  mode: 'HACKER' | 'NORMAL';
}

const ShareDialog: React.FC<ShareDialogProps> = ({ isOpen, onClose, news, topic, mode }) => {
  const [activeTab, setActiveTab] = useState<'STORY' | 'SHARE'>('SHARE');
  const [copied, setCopied] = useState(false);

  if (!isOpen) return null;

  const appUrl = window.location.href;
  const storyTitle = "在這個資訊過載的時代，找回閱讀的純粹。";
  const storyContent = `
    嗨，我是這款「TW News Nexus」的開發者。
    
    身為一個台灣人，我也跟你一樣，每天被演算法、蓋版廣告、聳動標題轟炸得喘不過氣。
    
    我常想：「有沒有可能，像科幻電影裡的駭客一樣，按下一個鍵，AI 就能幫我過濾雜訊，只給我最核心、最真實的情報？」
    
    於是，這個專案誕生了。
    
    沒有廣告，沒有廢話。只有 Gemini AI 幫你即時運算的台灣觀點。
    
    除了現代模式，我還埋了一個「終端機模式（Stealth Mode）」，那是給所有心中住著一個駭客的你，一個小小的浪漫彩蛋。
    
    如果你喜歡這個工具，請幫我分享給身邊那個也需要「清靜」的朋友。
  `;

  // Generate content optimized for social media
  const generateSocialText = () => {
    if (!news) return `正如電影般的閱讀體驗。\n\n試試 TW News Nexus: ${appUrl}`;
    
    // Strip markdown roughly for plain text
    const cleanSummary = news.summary.replace(/[*#]/g, '').slice(0, 150) + "...";
    
    return `
【 ${topic} 】重點快報 ⚡️

${cleanSummary}

---------
🤖 AI 自動摘要 | 🇹🇼 台灣觀點
📱 體驗無廣告新聞神器：TW News Nexus
👉 ${appUrl}

#台灣新聞 #AI #科技 #Gemini #TWNewsNexus #駭客 #開發日常
    `.trim();
  };

  const handleCopy = () => {
    navigator.clipboard.writeText(generateSocialText());
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleLineShare = () => {
    window.open(`https://social-plugins.line.me/lineit/share?url=${encodeURIComponent(appUrl)}`, '_blank');
  };

  const handleFBShare = () => {
    window.open(`https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(appUrl)}`, '_blank');
  };

  const isHacker = mode === 'HACKER';

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
      <div className={`relative w-full max-w-lg overflow-hidden transition-all ${
        isHacker 
          ? 'bg-cyber-black border-2 border-cyber-green shadow-[0_0_20px_rgba(0,255,65,0.3)]' 
          : 'bg-white rounded-3xl shadow-2xl'
      }`}>
        
        {/* Header */}
        <div className={`flex items-center justify-between p-4 border-b ${isHacker ? 'border-cyber-green/50 text-cyber-green' : 'border-slate-100'}`}>
          <div className="flex gap-4">
             <button 
                onClick={() => setActiveTab('SHARE')}
                className={`text-sm font-bold pb-1 border-b-2 transition-all ${activeTab === 'SHARE' ? (isHacker ? 'border-cyber-green' : 'border-indigo-600 text-indigo-600') : 'border-transparent opacity-50'}`}
             >
                {isHacker ? 'BROADCAST_SIGNAL' : '分享與推廣'}
             </button>
             <button 
                onClick={() => setActiveTab('STORY')}
                className={`text-sm font-bold pb-1 border-b-2 transition-all ${activeTab === 'STORY' ? (isHacker ? 'border-cyber-green' : 'border-indigo-600 text-indigo-600') : 'border-transparent opacity-50'}`}
             >
                {isHacker ? 'DEV_LOGS' : '開發故事'}
             </button>
          </div>
          <button onClick={onClose} className={`p-1 hover:bg-opacity-20 rounded-full ${isHacker ? 'hover:bg-cyber-green text-cyber-green' : 'hover:bg-slate-100 text-slate-500'}`}>
            <X className="w-6 h-6" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 overflow-y-auto max-h-[70vh]">
          
          {activeTab === 'STORY' && (
             <div className={isHacker ? 'text-cyber-green font-mono' : 'text-slate-700 font-sans'}>
                <h3 className={`text-xl font-bold mb-4 ${isHacker ? 'glitched-text' : 'text-slate-900'}`}>{storyTitle}</h3>
                <div className="space-y-4 whitespace-pre-line leading-relaxed opacity-90">
                    {storyContent}
                </div>
                <div className="mt-8 pt-4 border-t border-dashed border-opacity-30 text-center text-sm opacity-70">
                    Designed by a Developer in Taiwan 🇹🇼
                </div>
             </div>
          )}

          {activeTab === 'SHARE' && (
             <div className="space-y-6">
                {/* Social Grid */}
                <div className="grid grid-cols-2 gap-3">
                    <button onClick={handleLineShare} className="flex items-center justify-center gap-2 p-3 bg-[#06C755] text-white rounded-xl hover:opacity-90 transition-opacity font-bold">
                        <MessageCircle className="w-5 h-5" /> LINE 好友
                    </button>
                    <button onClick={handleFBShare} className="flex items-center justify-center gap-2 p-3 bg-[#1877F2] text-white rounded-xl hover:opacity-90 transition-opacity font-bold">
                        <Facebook className="w-5 h-5" /> Facebook
                    </button>
                </div>

                {/* IG/Threads Copy Area */}
                <div className={`p-4 rounded-xl border ${isHacker ? 'bg-black border-cyber-green/50 text-cyber-green' : 'bg-slate-50 border-slate-200'}`}>
                    <div className="flex justify-between items-center mb-2">
                        <span className="text-xs font-bold uppercase tracking-wider opacity-70">
                            {isHacker ? 'SOCIAL_PAYLOAD_GENERATOR' : 'IG / Threads 貼文產生器'}
                        </span>
                        <Instagram className="w-4 h-4 opacity-50" />
                    </div>
                    <textarea 
                        readOnly
                        value={generateSocialText()}
                        className={`w-full h-32 bg-transparent resize-none outline-none text-sm font-mono ${isHacker ? 'text-cyber-green' : 'text-slate-600'}`}
                    />
                    <button 
                        onClick={handleCopy}
                        className={`w-full mt-2 py-2 flex items-center justify-center gap-2 rounded-lg font-bold transition-all ${
                            copied 
                            ? 'bg-green-500 text-white' 
                            : isHacker ? 'bg-cyber-green text-black hover:bg-white' : 'bg-indigo-600 text-white hover:bg-indigo-700'
                        }`}
                    >
                        {copied ? 'COPIED!' : <><Copy className="w-4 h-4" /> 複製內文 (含 Hashtags)</>}
                    </button>
                </div>

                <div className={`text-xs text-center ${isHacker ? 'text-cyber-green/50' : 'text-slate-400'}`}>
                    {isHacker ? '>> HINT: SCREENSHOT_TERMINAL_FOR_MAX_STYLE' : '💡 小撇步：切換到「彩蛋模式」截圖分享，在 IG 上最吸睛！'}
                </div>
             </div>
          )}
        </div>

      </div>
    </div>
  );
};

export default ShareDialog;