import React, { useState, useEffect } from 'react';
import { fetchNews } from './services/geminiService';
import { NewsResponse, AppMode, TAIWAN_TOPICS } from './types';
import TerminalView from './components/TerminalView';
import ModernView from './components/ModernView';

const App: React.FC = () => {
  // Easter Egg is ENABLED by default per request ("automatically open the easter egg")
  const [mode, setMode] = useState<AppMode>(AppMode.HACKER);
  const [topic, setTopic] = useState<string>(TAIWAN_TOPICS[0]);
  const [news, setNews] = useState<NewsResponse | null>(null);
  const [loading, setLoading] = useState<boolean>(false);

  // Initial load
  useEffect(() => {
    handleSearch(topic);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleSearch = async (query: string) => {
    setTopic(query);
    setLoading(true);
    setNews(null); // Clear previous results to show loading state cleanly
    
    try {
      const data = await fetchNews(query);
      setNews(data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const toggleMode = () => {
    setMode(prev => prev === AppMode.NORMAL ? AppMode.HACKER : AppMode.NORMAL);
  };

  if (mode === AppMode.HACKER) {
    return (
      <TerminalView 
        news={news}
        loading={loading}
        topic={topic}
        onSearch={handleSearch}
        onToggleMode={toggleMode}
      />
    );
  }

  return (
    <ModernView 
      news={news}
      loading={loading}
      topic={topic}
      onSearch={handleSearch}
      onToggleMode={toggleMode}
    />
  );
};

export default App;