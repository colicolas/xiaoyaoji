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

// --- ☁️ 组件：月份云朵分割线 (带展开/收起动画) ---
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
  <div onClick={onClick} className="relative py-8 cursor-pointer group select-none flex justify-center items-center">
    {/* 装饰线：两侧渐隐，中间连接 */}
    <div className="absolute top-1/2 w-full h-[1px] bg-gradient-to-r from-transparent via-jade/30 to-transparent group-hover:via-sky-cyan/50 transition-all duration-500"></div>
    
    <div className={`
      relative z-10 px-8 py-2 rounded-full border backdrop-blur-md transition-all duration-500 flex items-center gap-3
      ${isOpen 
        ? 'bg-white border-white/80 shadow-[0_8px_25px_-5px_rgba(152,193,217,0.4)] scale-105 translate-y-0' 
        : 'bg-white/50 border-white/40 hover:bg-white/90 hover:scale-105 translate-y-0'
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
);

// --- 📜 列表组件 (处理按月分组 & 折叠) ---
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

  // 默认展开所有月份（或者是第一个）
  const [expandedMonths, setExpandedMonths] = useState<Record<string, boolean>>(() => {
    const keys = Object.keys(groups);
    // 默认展开第一个
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
    <div className="space-y-6 pb-32">
      {Object.entries(groups).map(([month, monthPosts]) => (
        <div key={month} className="relative">
          {/* 月份标题 */}
          <MonthDivider 
            month={month} 
            count={monthPosts.length} 
            isOpen={!!expandedMonths[month]} 
            onClick={() => toggleMonth(month)} 
          />

          {/* 可折叠的内容区域 (使用 grid 动画技巧会更顺滑) */}
          <div 
            className={`grid transition-all duration-500 ease-[cubic-bezier(0.4,0,0.2,1)] ${
              expandedMonths[month] ? 'grid-rows-[1fr] opacity-100 mb-8' : 'grid-rows-[0fr] opacity-0 mb-0'
            }`}
          >
            <div className="overflow-hidden min-h-0">
              <div className="space-y-6 pt-2 px-1">
                
                {/* 🦅 模式：日记卡片 */}
                {type === 'diary' && monthPosts.map(post => (
                  <div
                    key={post.id}
                    onClick={() => setOpenDiaryId(openDiaryId === post.id ? null : post.id)}
                    className={`
                      relative bg-white/80 border-2 rounded-[24px] cursor-pointer overflow-hidden backdrop-blur-sm
                      transition-all duration-500 ease-spring group
                      ${openDiaryId === post.id 
                        ? 'border-jade/30 shadow-[0_20px_50px_-15px_rgba(152,193,217,0.4)] scale-[1.01] bg-white z-10' 
                        : 'border-white shadow-[0_4px_15px_-5px_rgba(255,228,225,0.5)] hover:-translate-y-1 hover:shadow-[0_12px_25px_-8px_rgba(255,228,225,0.8)]'
                      }
                    `}
                  >
                    <div className="p-6 md:p-8">
                      <div className="flex justify-between items-start mb-4">
                        <div className="flex flex-col gap-1">
                          <div className="flex items-center gap-2 text-[11px] font-mono text-beiming/40 uppercase tracking-wider">
                            <span className={`w-1.5 h-1.5 rounded-full ${openDiaryId === post.id ? 'bg-jade animate-pulse' : 'bg-fish-belly'}`}></span>
                            {formatTime(post.createdAt, "MM.dd HH:mm")}
                          </div>
                          <h3 className={`font-bold text-beiming text-xl transition-all ${openDiaryId === post.id ? '' : 'truncate max-w-[240px] md:max-w-xl'}`}>
                            {post.content.split('\n')[0] || "无题"}
                          </h3>
                        </div>
                        <div className={`w-8 h-8 rounded-full flex items-center justify-center transition-all duration-500 ${openDiaryId === post.id ? 'rotate-180 bg-fish-belly/20 text-beiming' : 'text-beiming/20'}`}>▼</div>
                      </div>
                      
                      <div className={`
                        text-beiming/80 leading-loose whitespace-pre-wrap text-base
                        border-t border-dashed border-beiming/5 pt-6 mt-4
                        transition-all duration-700 ease-in-out
                        ${openDiaryId === post.id ? 'block opacity-100 max-h-[3000px]' : 'hidden opacity-0 max-h-0'}
                      `}>
                        {post.content}
                        <div className="mt-10 flex justify-end items-center gap-2 opacity-50">
                           <span className="h-px w-8 bg-jade/50"></span>
                           <span className="text-xs text-jade/80 font-mono">End</span>
                        </div>
                      </div>
                      
                      {!openDiaryId === post.id && (
                        <p className="text-beiming/40 text-sm line-clamp-1 font-light mt-1">{post.content}</p>
                      )}
                    </div>
                  </div>
                ))}

                {/* 🐳 模式：状态气泡 (更宽的布局) */}
                {type === 'status' && monthPosts.map(post => (
                  <div key={post.id} className="flex gap-6 group px-2 md:px-4">
                    {/* 左侧大日期 - 渐变字 */}
                    <div className="w-16 md:w-20 text-right pt-4 flex-shrink-0">
                      <div className="font-zcool text-3xl bg-clip-text text-transparent bg-gradient-to-br from-sky-cyan to-jade group-hover:scale-110 transition-transform origin-right">
                        {formatTime(post.createdAt, "dd")}
                      </div>
                      <div className="text-[11px] font-mono text-beiming/30">
                        {formatTime(post.createdAt, "HH:mm")}
                      </div>
                    </div>

                    {/* 气泡本体 */}
                    <div className="flex-1 relative">
                      <div className="absolute top-7 -left-1.5 w-3 h-3 bg-white rotate-45 border-l border-b border-white hover:border-fish-belly/40"></div>
                      <div className="bg-white/70 hover:bg-white border border-white hover:border-fish-belly/40 px-6 py-5 rounded-[24px] rounded-tl-sm shadow-sm hover:shadow-[0_8px_20px_-8px_rgba(255,209,220,0.6)] transition-all duration-300">
                        <p className="text-beiming text-lg font-medium leading-relaxed">{post.content}</p>
                      </div>
                    </div>
                  </div>
                ))}

              </div>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
};


// --- 🚀 主组件 ---
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
    // 宽屏优化：max-w-4xl
    <div className="w-full max-w-4xl mx-auto p-4 pt-16 md:pt-24 min-h-screen">
      
      {/* ==================== 
          🌌 1. 头部 Hero (修复重叠，使用 Flex Gap)
         ==================== */}
      <div className="flex flex-col items-center relative z-10 mb-16 w-full">
        
        {/* 头像 + 名字区 */}
        <div className="flex flex-col items-center gap-6">
          {/* 头像 */}
          <div className="relative group cursor-pointer">
            <div className="absolute -inset-2 bg-gradient-to-tr from-jade via-fish-belly to-sky-cyan rounded-full blur-2xl opacity-60 group-hover:opacity-80 group-hover:blur-3xl transition-all duration-1000 animate-pulse"></div>
            <div className="w-28 h-28 relative rounded-full overflow-hidden border-[4px] border-white shadow-xl bg-white z-10 transition-transform duration-700 group-hover:rotate-[360deg] ease-spring">
              <img
                src={`https://api.dicebear.com/9.x/notionists/svg?seed=${username}&backgroundColor=eaf7fb`}
                alt="avatar"
                className="w-full h-full object-cover"
              />
            </div>
          </div>

          {/* 名字 */}
          <h1 className="text-4xl font-zcool text-beiming drop-shadow-sm text-center">
            @{username}
          </h1>
        </div>

        {/* 💭 Current Status 气泡 (你喜欢的那一版) */}
        {/* 使用 margin-top 分隔，防止重叠 */}
        {latestStatus && (
          <div className="mt-10 relative animate-float w-full flex justify-center z-20 px-4">
            <div className="relative group max-w-lg w-full">
              {/* 小三角 (指向头像) */}
              <div className="absolute -top-2 left-1/2 -translate-x-1/2 w-5 h-5 bg-white/80 rotate-45 backdrop-blur-xl border-t border-l border-white/60"></div>
              
              {/* 气泡主体 */}
              <div className="relative bg-white/70 backdrop-blur-2xl border border-white/60 px-10 py-8 rounded-[36px] shadow-[0_15px_40px_-15px_rgba(174,196,229,0.3)] hover:shadow-[0_20px_50px_-10px_rgba(152,193,217,0.4)] hover:bg-white/80 transition-all duration-500">
                
                {/* 装饰 ✨ */}
                <div className="absolute -top-3 -right-2 bg-white rounded-full p-2 shadow-sm animate-bounce duration-[3000ms]">
                  <span className="text-lg">✨</span>
                </div>

                <div className="flex flex-col items-center text-center">
                  {/* 糖果色标签 (Current Mood) */}
                  <div className="inline-block px-3 py-1 rounded-full bg-gradient-to-r from-fish-belly to-jade text-[10px] font-bold text-beiming/70 mb-4 tracking-widest uppercase shadow-sm">
                    Current Mood
                  </div>
                  <p className="text-beiming text-2xl font-medium leading-relaxed">
                    “{latestStatus.content}”
                  </p>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* ==================== 
          🔘 2. 导航栏 (你喜欢的那个 Toggle)
         ==================== */}
      <div className="sticky top-6 z-30 flex justify-center mb-16">
        <div className="bg-white/40 p-1.5 rounded-full flex items-center shadow-inner border border-white/50 backdrop-blur-md">
          <button
            onClick={() => setActiveTab('diary')}
            className={`px-8 py-2.5 rounded-full text-sm font-bold tracking-wide transition-all duration-300 ${
              activeTab === 'diary' 
                ? 'bg-white text-beiming shadow-[0_4px_12px_rgba(27,60,89,0.1)] scale-105' 
                : 'text-beiming/50 hover:text-beiming/80 hover:bg-white/30'
            }`}
          >
            🦅 北冥卷 (Diary)
          </button>
          <button
            onClick={() => setActiveTab('status')}
            className={`px-8 py-2.5 rounded-full text-sm font-bold tracking-wide transition-all duration-300 ${
              activeTab === 'status' 
                ? 'bg-white text-sky-cyan shadow-[0_4px_12px_rgba(174,196,229,0.2)] scale-105' 
                : 'text-beiming/50 hover:text-sky-cyan hover:bg-white/30'
            }`}
          >
            🐳 潜渊迹 (Status)
          </button>
        </div>
      </div>

      {/* ==================== 
          📜 3. 列表内容 
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
