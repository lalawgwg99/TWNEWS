import React, { useEffect, useRef, useState } from 'react';
import { NewsResponse, TAIWAN_TOPICS } from '../types';
import { Terminal, ShieldAlert, Cpu, Search, RefreshCw, ExternalLink, Share2 } from 'lucide-react';
import ReactMarkdown from 'react-markdown';
import ShareDialog from './ShareDialog';

interface TerminalViewProps {
  news: NewsResponse | null;
  loading: boolean;
  topic: string;
  onSearch: (q: string) => void;
  onToggleMode: () => void;
}

const TerminalView: React.FC<TerminalViewProps> = ({ news, loading, topic, onSearch, onToggleMode }) => {
  const [input, setInput] = useState('');
  const [logs, setLogs] = useState<string[]>([]);
  const [isShareOpen, setIsShareOpen] = useState(false);
  
  // Typing effect state
  const [displayedSummary, setDisplayedSummary] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  
  const scrollRef = useRef<HTMLDivElement>(null);
  const summaryRef = useRef<HTMLDivElement>(null);

  // Initial logs
  useEffect(() => {
    if (logs.length === 0) {
        addLog(`INITIALIZING SYSTEM... OK`);
        addLog(`CONNECTING TO TAIWAN NEWS NODE... ESTABLISHED`);
        addLog(`LOADING PROTOCOL: ${topic}`);
    }
  }, []);

  // Handle loading and data reception logs
  useEffect(() => {
    if (loading) {
      addLog(`[EXECUTING SEARCH QUERY]: ${topic}...`);
      setDisplayedSummary(''); // Reset summary
      setIsTyping(false);
    } else if (news) {
      if (news.summary.includes("連線逾時") || news.summary.includes("System Error")) {
          addLog(`[ERROR]: DATA STREAM INTERRUPTED.`);
          setDisplayedSummary(news.summary); // Show error immediately without typing effect
      } else {
          addLog(`[DATA RECEIVED]: ${topic} - ${news.sources.length} SOURCES FOUND.`);
          addLog(`[DECODING STREAM]...`);
          setIsTyping(true);
      }
    }
  }, [loading, news, topic]);

  // Teletype Effect Logic
  useEffect(() => {
    if (!news?.summary || !isTyping) return;

    let currentIndex = 0;
    const fullText = news.summary;
    // Faster typing speed for hacker feel
    const typingSpeed = 5; 
    
    // Clear previous interval if exists
    const intervalId = setInterval(() => {
      if (currentIndex >= fullText.length) {
        clearInterval(intervalId);
        setIsTyping(false);
        addLog(`[STREAM COMPLETE]`);
        return;
      }

      // Add a few characters at a time for better performance on long texts
      const charsToAdd = fullText.slice(currentIndex, currentIndex + 3);
      setDisplayedSummary(prev => prev + charsToAdd);
      currentIndex += 3;

      // Auto scroll the summary container
      if (summaryRef.current) {
        summaryRef.current.scrollTop = summaryRef.current.scrollHeight;
      }
    }, typingSpeed);

    return () => clearInterval(intervalId);
  }, [news?.summary, isTyping]);

  // Auto scroll logs
  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [logs]);

  const addLog = (msg: string) => {
    const timestamp = new Date().toLocaleTimeString('en-US', { hour12: false });
    setLogs(prev => [...prev, `[${timestamp}] > ${msg}`]);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const trimmedInput = input.trim();
    if (!trimmedInput) return;

    if (['exit', 'quit', 'gui', 'logout'].includes(trimmedInput.toLowerCase())) {
        addLog('TERMINATING SESSION...');
        setTimeout(onToggleMode, 800);
        setInput('');
        return;
    }

    if (trimmedInput.toLowerCase() === 'retry') {
        onSearch(topic);
        setInput('');
        return;
    }

    if (trimmedInput.toLowerCase() === 'share' || trimmedInput.toLowerCase() === 'help') {
        setIsShareOpen(true);
        setInput('');
        return;
    }

    onSearch(trimmedInput);
    setInput('');
  };

  // Helper to strip emojis for the terminal look (keep it text-based)
  const stripEmoji = (str: string) => str.replace(/^[^\w\u4e00-\u9fa5]+/, '').trim();

  return (
    <div className="min-h-screen bg-cyber-black text-cyber-green font-mono p-4 flex flex-col relative overflow-hidden">
      {/* CRT Scanline Effect */}
      <div className="absolute inset-0 pointer-events-none z-50 bg-[linear-gradient(rgba(18,16,16,0)_50%,rgba(0,0,0,0.25)_50%),linear-gradient(90deg,rgba(255,0,0,0.06),rgba(0,255,0,0.02),rgba(0,0,255,0.06))] bg-[length:100%_4px,6px_100%]"></div>
      
      {/* Header */}
      <div className="border-b border-cyber-green pb-4 mb-4 flex justify-between items-center z-10 gap-2">
        <div className="flex items-center gap-2 overflow-hidden">
           <Terminal className="w-6 h-6 animate-pulse flex-shrink-0" />
           <h1 className="text-xl font-bold tracking-widest whitespace-nowrap">TW_NEXUS // NODE</h1>
        </div>
        
        <div className="flex items-center gap-2">
            <button 
                onClick={() => setIsShareOpen(true)}
                className="px-3 py-1 border border-cyber-green hover:bg-cyber-green hover:text-black transition-colors text-xs uppercase tracking-widest flex items-center gap-1"
            >
                <Share2 className="w-3 h-3" /> NET_SHARE
            </button>
            <button 
                onClick={onToggleMode}
                className="px-3 py-1 border border-cyber-green hover:bg-cyber-green hover:text-black transition-colors text-xs uppercase tracking-widest whitespace-nowrap"
            >
                Deactivate Stealth
            </button>
        </div>
      </div>

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col md:flex-row gap-4 overflow-hidden z-10">
        
        {/* Left Panel: Logs & Search */}
        <div className="w-full md:w-1/3 flex flex-col gap-4 border-r border-cyber-green/30 pr-4">
          <div className="flex-1 bg-cyber-black border border-cyber-green p-4 overflow-y-auto terminal-scroll font-xs" ref={scrollRef}>
             {logs.map((log, i) => (
               <div key={i} className="mb-1 opacity-80 hover:opacity-100">{log}</div>
             ))}
             {loading && (
                 <div className="animate-pulse flex items-center gap-2">
                    <span className="animate-spin">/</span> _PROCESSING STREAM...
                 </div>
             )}
          </div>

          <form onSubmit={handleSubmit} className="flex gap-2">
            <span className="text-cyber-green self-center">{'>'}</span>
            <input 
              type="text" 
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="ENTER_QUERY..."
              className="flex-1 bg-transparent border-b border-cyber-green text-cyber-green focus:outline-none placeholder-cyber-green/50 p-2 font-mono uppercase"
            />
            <button type="submit" className="text-cyber-green hover:text-white"><Search className="w-5 h-5"/></button>
          </form>
          
          {/* Quick Access Grid */}
          <div className="grid grid-cols-2 gap-2 mt-2">
             {TAIWAN_TOPICS.map(tag => (
                 <button 
                    key={tag}
                    onClick={() => onSearch(tag)}
                    className="border border-cyber-green/50 text-xs py-1 hover:bg-cyber-green hover:text-black transition-all truncate text-left px-2"
                 >
                    RUN: {stripEmoji(tag)}
                 </button>
             ))}
          </div>
        </div>

        {/* Right Panel: Data Visualization */}
        <div className="w-full md:w-2/3 flex flex-col border border-cyber-green p-6 relative bg-cyber-dim overflow-hidden">
           {loading ? (
             <div className="flex flex-col items-center justify-center h-full gap-4 opacity-80">
                <Cpu className="w-16 h-16 animate-spin text-cyber-green" />
                <p className="animate-pulse tracking-widest text-center">
                    DECRYPTING SECURE DATA STREAMS...<br/>
                    <span className="text-xs opacity-50">ESTIMATING LATENCY...</span>
                </p>
             </div>
           ) : news ? (
             <div className="flex flex-col h-full">
               <div className="mb-4 border-b border-cyber-green/50 pb-2 flex-shrink-0">
                  <h2 className="text-2xl font-bold mb-1 glitched-text">TOPIC: {topic}</h2>
                  <p className="text-xs opacity-70">DATA_INTEGRITY: 100% | REGION: TW-ZH</p>
               </div>
               
               {/* Summary Container with auto-scroll */}
               <div 
                  ref={summaryRef}
                  className="flex-1 overflow-y-auto terminal-scroll prose prose-invert prose-p:text-cyber-green prose-headings:text-cyber-green max-w-none mb-4 font-mono leading-relaxed"
               >
                  <ReactMarkdown>{displayedSummary}</ReactMarkdown>
                  {isTyping && <span className="animate-pulse inline-block w-2 h-4 bg-cyber-green ml-1 align-middle"></span>}
               </div>

               {news.sources.length > 0 && !isTyping && (
                 <div className="mt-auto pt-4 border-t border-cyber-green/30 animate-[fadeIn_0.5s_ease-out]">
                    <h3 className="text-sm font-bold mb-3 flex items-center gap-2">
                        <ExternalLink className="w-4 h-4"/> VERIFIED LINKS
                    </h3>
                    <ul className="space-y-2">
                        {news.sources.map((src, idx) => (
                            <li key={idx} className="text-xs truncate hover:bg-cyber-green/20 p-1 transition-colors cursor-pointer">
                                <span className="mr-2">[{idx < 9 ? `0${idx+1}` : idx+1}]</span>
                                <a href={src.uri} target="_blank" rel="noopener noreferrer" className="hover:underline decoration-dashed underline-offset-4">
                                    {src.title || src.uri}
                                </a>
                            </li>
                        ))}
                    </ul>
                 </div>
               )}
             </div>
           ) : (
             <div className="text-center opacity-50 mt-20">AWAITING INPUT...</div>
           )}
        </div>
      </div>

      <ShareDialog 
        isOpen={isShareOpen}
        onClose={() => setIsShareOpen(false)}
        news={news}
        topic={topic}
        mode="HACKER"
      />
    </div>
  );
};

export default TerminalView;