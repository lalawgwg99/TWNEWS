export interface Source {
  title: string;
  uri: string;
}

export interface NewsResponse {
  summary: string;
  sources: Source[];
}

export enum AppMode {
  NORMAL = 'NORMAL',
  HACKER = 'HACKER' // The Easter Egg mode
}

// 針對台灣用戶每天最常查詢的高頻關鍵字設計
export const TAIWAN_TOPICS = [
  "⚡️ 即時氣象/地震",
  "📈 台股 & 台積電",
  "🏛️ 兩岸與國際政經",
  "🔥 PTT/Dcard 熱議",
  "🤖 AI 與科技新品",
  "🍱 旅遊美食情報",
  "⚾ 職棒與運動賽事",
  "💰 補助與新制"
];