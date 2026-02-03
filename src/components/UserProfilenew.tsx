"use client";

import { useState, useMemo } from "react";
import { format } from "date-fns";
import { zhCN } from "date-fns/locale";

// --- 类型定义 ---
interface Post {
  id: string;
  content: string;
  type: "kun" | "peng";
  createdAt: number;
  username: string;
}

// --- ✨ 灵力组件：月份云朵标题 ---
const MonthDivider = ({ 
  month, 
  count, 
  isOpen, 
  onClick 
}: { 
  month: string; 
  count: number; 
  isOpen: boolean; 
  onClick: () => void; 
}) => (
  <div onClick={onClick} className="relative py-10 cursor-pointer group select-none">
    {/* 装饰线：玉色到天青色的渐变 */}
    <div className="absolute top-1/2 left-0 w-full h-[2px] bg-gradient-to-r from-transparent via-jade/20 to-transparent group-hover:via-sky-cyan/40 transition-all duration-500"></div>
    
    <div className="relative flex justify-center">
      <div className={`
        px-6 py-2 rounded-full border backdrop-blur-md transition-all duration-500 flex items-center gap-3 z-10
        ${isOpen 
          ? 'bg-white border-white/80 shadow-[0_8px_30px_-10px_rgba(152,193,217,0.5)] scale-105' 
          : 'bg-white/40 border-white/40 hover:bg-white/80 hover:scale-105'
        }
      `}>
        <span className="font-zcool text-xl text-beiming tracking-widest">{month}</span>
        <span className={`text-xs px-2.5 py-0.5 rounded-full font-mono transition-colors ${isOpen ? 'bg-fish-belly text-beiming/80' : 'bg-beiming/5 text-beiming/30'}`}>
          {count}
        </span>
        <span className={`text-xs text-beiming/30 transition-transform duration-500 ${isOpen ? 'rotate-180' : 'rotate-0'}`}>
          ▼
        </span>
      </div>
    </div>
  </div>
);

// --- 列表组件 ---
const GroupedPostList = ({ posts, type }: { posts: Post[], type: 'diary' | 'status' }) => {
  const groups = useMemo(() => {
    const grouped: Record<string, Post[]> = {};
    posts.forEach(post => {
      const key = format(new Date(post.createdAt), "yyyy年M月");
      if (!grouped[key]) grouped[key] = [];
      grouped[key].push(post);
    });
    return grouped;
  }, [posts]);

  const [expandedMonths, setExpandedMonths] = useState<Record<string, boolean>>(() => {
    const keys = Object.keys(groups);
    return keys.length > 0 ? { [keys[0]]: true } : {};
  });

  const toggleMonth = (month: string) => {
    setExpandedMonths(prev => ({ ...prev, [month]: !prev[month] }));
  };

  const [openDiaryId, setOpenDiaryId] = useState<string | null>(null);

  const formatTime = (timestamp: number, fmt = "yyyy/MM/dd HH:mm") => {
    return format(new Date(timestamp), fmt, { locale: zhCN });
  };

  if (posts.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-20 opacity-40 animate-pulse">
        <div className="text-6xl mb-4 grayscale">{type === 'diary' ? '🍂' : '☁️'}</div>
        <p className="text-beiming font-zcool tracking-widest">此处空空如也...</p>
      </div>
    );
  }

  return (
    <div className="space-y-4 pb-32">
      {Object.entries(groups).map(([month, monthPosts]) => (
        <div key={month}>
          <MonthDivider 
            month={month} 
            count={monthPosts.length} 
            isOpen={!!expandedMonths[month]} 
            onClick={() => toggleMonth(month)} 
          />

          <div className={`space-y-6 transition-all duration-700 ease-in-out overflow-hidden ${expandedMonths[month] ? 'max-h-[5000px] opacity-100 transform translate-y-0' : 'max-h-0 opacity-0 transform -translate-y-4'}`}>
            
            {/* 🦅 日记样式 */}
            {type === 'diary' && monthPosts.map(post => (
              <div
                key={post.id}
                onClick={() => setOpenDiaryId(openDiaryId === post.id ? null : post.id)}
                className={`
                  relative bg-white/80 border-2 rounded-[24px] cursor-pointer overflow-hidden mx-2 backdrop-blur-sm
                  transition-all duration-500 ease-spring group
                  ${openDiaryId === post.id 
                    ? 'border-jade/30 shadow-[0_20px_50px_-15px_rgba(152,193,217,0.4)] scale-[1.01] bg-white z-10' 
                    : 'border-white shadow-[0_4px_15px_-5px_rgba(255,228,225,0.5)] hover:-translate-y-1 hover:shadow-[0_12px_25px_-8px_rgba(255,228,225,0.8)]'
                  }
                `}
              >
                <div className="p-6">
                  <div className="flex justify-between items-start mb-2">
                    <div className="flex flex-col">
                      <div className="flex items-center gap-2 text-[10px] font-mono text-beiming/40 mb-1 uppercase tracking-wider">
                        <span className={`w-1.5 h-1.5 rounded-full ${openDiaryId === post.id ? 'bg-jade animate-pulse' : 'bg-fish-belly'}`}></span>
                        {formatTime(post.createdAt, "MM.dd HH:mm")}
                      </div>
                      <h3 className={`font-bold text-beiming text-lg transition-all ${openDiaryId === post.id ? '' : 'truncate max-w-[200px] md:max-w-md'}`}>
                        {post.content.split('\n')[0] || "无题"}
                      </h3>
                    </div>
                    <div className={`w-8 h-8 rounded-full flex items-center justify-center transition-all duration-500 ${openDiaryId === post.id ? 'rotate-180 bg-fish-belly/20 text-beiming' : 'text-beiming/20'}`}>▼</div>
                  </div>
                  
                  <div className={`
                    text-beiming/80 leading-loose whitespace-pre-wrap text-sm md:text-base
                    border-t border-dashed border-beiming/5 pt-6 mt-4
                    transition-all duration-700 ease-in-out
                    ${openDiaryId === post.id ? 'block opacity-100 max-h-[3000px]' : 'hidden opacity-0 max-h-0'}
                  `}>
                    {post.content}
                    <div className="mt-8 flex justify-end">
                       <span className="text-xs text-jade/60 font-mono bg-jade/5 px-2 py-1 rounded">✨ 记录完成</span>
                    </div>
                  </div>
                  
                  {!openDiaryId === post.id && (
                    <p className="text-beiming/40 text-sm line-clamp-1 font-light mt-1">{post.content}</p>
                  )}
                </div>
              </div>
            ))}

            {/* 🐳 状态样式 */}
            {type === 'status' && monthPosts.map(post => (
              <div key={post.id} className="flex gap-5 group px-2">
                {/* 左侧大日期 - 渐变字 */}
                <div className="w-16 text-right pt-3 flex-shrink-0">
                  <div className="font-zcool text-2xl bg-clip-text text-transparent bg-gradient-to-br from-sky-cyan to-jade group-hover:scale-110 transition-transform origin-right">
                    {formatTime(post.createdAt, "dd")}
                  </div>
                  <div className="text-[10px] font-mono text-beiming/30">
                    {formatTime(post.createdAt, "HH:mm")}
                  </div>
                </div>

                {/* 气泡本体 */}
                <div className="flex-1 relative">
                  <div className="bg-white/60 hover:bg-white border border-white hover:border-fish-belly/40 px-6 py-5 rounded-[24px] rounded-tl-sm shadow-sm hover:shadow-[0_8px_20px_-8px_rgba(255,209,220,0.6)] transition-all duration-300">
                    <p className="text-beiming text-base font-medium">{post.content}</p>
                  </div>
                </div>
              </div>
            ))}

          </div>
        </div>
      ))}
    </div>
  );
};


export default function UserProfile({
  posts,
  username,
}: {
  posts: Post[];
  username: string;
}) {
  const latestStatus = posts.find((p) => p.type === "kun");
  const diaries = posts.filter((p) => p.type === "peng");
  const allStatuses = posts.filter((p) => p.type === "kun");

  const [activeTab, setActiveTab] = useState<'diary' | 'status'>('diary');

  return (
    <div className="w-full max-w-2xl mx-auto p-4 pt-16 md:pt-24 min-h-screen">
      
      {/* ==================== 
          🌌 头部 Hero (多彩光晕版) 
         ==================== */}
      <div className="flex flex-col items-center relative z-10 mb-16">
        
        {/* 1. 头像：混合流光 */}
        <div className="relative mb-6 group cursor-pointer">
          {/* 混合光晕: Jade + Fish Belly + Sky Cyan */}
          <div className="absolute -inset-1 bg-gradient-to-tr from-jade via-fish-belly to-sky-cyan rounded-full blur-2xl opacity-50 group-hover:opacity-80 group-hover:blur-3xl transition-all duration-1000 animate-pulse"></div>
          
          <div className="w-24 h-24 relative rounded-full overflow-hidden border-[3px] border-white shadow-xl bg-white z-10 transition-transform duration-700 group-hover:rotate-[360deg] ease-spring">
            <img
              src={`https://api.dicebear.com/9.x/notionists/svg?seed=${username}&backgroundColor=eaf7fb`}
              alt="avatar"
              className="w-full h-full object-cover"
            />
          </div>
        </div>

        {/* 2. 名字 */}
        <h1 className="text-3xl font-zcool text-beiming drop-shadow-sm text-center">
          @{username}
        </h1>

        {/* 3. Current Status 气泡 (毛玻璃 + 糖果标签) */}
        {latestStatus && (
          <div className="mt-8 relative animate-float w-full flex justify-center z-20 px-4">
            <div className="relative group max-w-sm w-full">
              {/* 小三角 */}
              <div className="absolute -top-2 left-1/2 -translate-x-1/2 w-5 h-5 bg-white/80 rotate-45 backdrop-blur-xl border-t border-l border-white/60"></div>
              
              {/* 气泡主体 */}
              <div className="relative bg-white/70 backdrop-blur-2xl border border-white/60 px-8 py-7 rounded-[32px] shadow-[0_15px_40px_-15px_rgba(174,196,229,0.3)] hover:shadow-[0_20px_50px_-10px_rgba(152,193,217,0.4)] hover:bg-white/80 transition-all duration-500">
                
                {/* 装饰 ✨ */}
                <div className="absolute -top-3 -right-2 bg-white rounded-full p-1.5 shadow-sm animate-bounce duration-[3000ms]">
                  <span className="text-sm">✨</span>
                </div>

                <div className="flex flex-col items-center">
                  {/* 糖果色标签 */}
                  <div className="inline-block px-3 py-1 rounded-full bg-gradient-to-r from-fish-belly to-jade text-[10px] font-bold text-beiming/70 mb-3 tracking-widest uppercase shadow-sm">
                    Current Mood
                  </div>
                  <p className="text-beiming text-xl font-medium leading-relaxed">
                    “{latestStatus.content}”
                  </p>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* ==================== 
          🌟 导航：吸顶极简 Tabs (带彩色光晕)
         ==================== */}
      <div className="sticky top-6 z-30 flex justify-center mb-12">
        <div className="bg-white/85 backdrop-blur-md p-1.5 rounded-full border border-white/60 shadow-[0_8px_30px_rgba(0,0,0,0.04)] flex gap-1">
          <button
            onClick={() => setActiveTab('diary')}
            className={`px-6 py-2 rounded-full text-sm font-bold transition-all duration-300 ${
              activeTab === 'diary' 
                ? 'bg-gradient-to-br from-beiming to-slate-700 text-white shadow-lg shadow-beiming/20' 
                : 'text-beiming/40 hover:text-beiming/80 hover:bg-fish-belly/20'
            }`}
          >
            北冥卷
          </button>
          <button
            onClick={() => setActiveTab('status')}
            className={`px-6 py-2 rounded-full text-sm font-bold transition-all duration-300 ${
              activeTab === 'status' 
                ? 'bg-gradient-to-br from-sky-cyan to-blue-400 text-white shadow-lg shadow-sky-cyan/30' 
                : 'text-beiming/40 hover:text-sky-cyan hover:bg-sky-cyan/10'
            }`}
          >
            潜渊迹
          </button>
        </div>
      </div>

      {/* ==================== 
          📜 列表内容 
         ==================== */}
      <div className="min-h-[400px]">
        {activeTab === 'diary' ? (
          <GroupedPostList posts={diaries} type="diary" />
        ) : (
          <GroupedPostList posts={allStatuses} type="status" />
        )}
      </div>

    </div>
  );
}
