"use client";
import { useState, useEffect, useMemo } from "react";
import { useAuthState } from "react-firebase-hooks/auth";
import { auth, db } from "@/lib/firebase";
import { 
  addDoc, 
  collection, 
  serverTimestamp, 
  query, 
  where, 
  orderBy, 
  onSnapshot,
  deleteDoc,
  doc,
  updateDoc
} from "firebase/firestore";
import { useRouter } from "next/navigation";
import { format } from "date-fns";
import { zhCN } from "date-fns/locale";

// 定义数据类型
interface Post {
  id: string;
  content: string;
  type: 'kun' | 'peng';
  createdAt: any;
}

export default function Dashboard() {
  const [user, authLoading] = useAuthState(auth);
  const router = useRouter();
  
  // --- 发布相关状态 ---
  const [content, setContent] = useState("");
  const [mode, setMode] = useState<'kun' | 'peng'>('kun');
  const [isSubmitting, setIsSubmitting] = useState(false);

  // --- 历史记录/管理相关状态 ---
  const [posts, setPosts] = useState<Post[]>([]);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editContent, setEditContent] = useState("");
  
  // --- 搜索与筛选状态 ---
  const [searchQuery, setSearchQuery] = useState("");
  const [filterType, setFilterType] = useState<'all' | 'kun' | 'peng'>('all');
  const [expandedMonths, setExpandedMonths] = useState<Record<string, boolean>>({});

  // 1. 实时获取数据
  useEffect(() => {
    if (!user) return;
    const q = query(
      collection(db, "posts"),
      where("uid", "==", user.uid),
      orderBy("createdAt", "desc")
    );
    // 实时监听
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const fetchedPosts = snapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      })) as Post[];
      setPosts(fetchedPosts);
    });
    return () => unsubscribe();
  }, [user]);

  // 2. 核心逻辑：过滤 -> 分组
  const groupedPosts = useMemo(() => {
    // A. 过滤 (搜索 + 类型)
    const filtered = posts.filter(post => {
      const matchesSearch = post.content.toLowerCase().includes(searchQuery.toLowerCase());
      const matchesType = filterType === 'all' || post.type === filterType;
      return matchesSearch && matchesType;
    });

    // B. 分组 (按月份)
    const groups: Record<string, Post[]> = {};
    filtered.forEach(post => {
      if (!post.createdAt) return;
      const date = post.createdAt.toDate ? post.createdAt.toDate() : new Date(post.createdAt);
      const key = format(date, "yyyy年M月", { locale: zhCN });
      if (!groups[key]) groups[key] = [];
      groups[key].push(post);
    });
    
    return groups;
  }, [posts, searchQuery, filterType]);

  // 当搜索时，自动展开所有月份
  useEffect(() => {
    if (searchQuery) {
      const allMonths = Object.keys(groupedPosts).reduce((acc, key) => ({ ...acc, [key]: true }), {});
      setExpandedMonths(allMonths);
    } else {
      // 默认只展开最近的一个月
      const keys = Object.keys(groupedPosts);
      if (keys.length > 0 && !expandedMonths[keys[0]]) {
        setExpandedMonths({ [keys[0]]: true });
      }
    }
  }, [groupedPosts, searchQuery]);

  const toggleMonth = (month: string) => {
    setExpandedMonths(prev => ({ ...prev, [month]: !prev[month] }));
  };

  // --- CRUD 操作 ---
  const handleSubmit = async () => {
    if (!content.trim() || !user) return;
    setIsSubmitting(true);
    try {
      await addDoc(collection(db, "posts"), {
        uid: user.uid,
        username: user.email?.split('@')[0],
        content,
        type: mode,
        createdAt: serverTimestamp(),
      });
      setContent("");
    } catch (e) {
      console.error(e);
    }
    setIsSubmitting(false);
  };

  const handleDelete = async (id: string) => {
    if (window.confirm("确定要抹去这条痕迹吗？🥺")) {
      await deleteDoc(doc(db, "posts", id));
    }
  };

  const startEdit = (post: Post) => {
    setEditingId(post.id);
    setEditContent(post.content);
  };

  const saveEdit = async () => {
    if (!editingId || !editContent.trim()) return;
    try {
      await updateDoc(doc(db, "posts", editingId), { content: editContent });
      setEditingId(null);
    } catch (e) { console.error(e); }
  };

  const formatTime = (timestamp: any) => {
    if (!timestamp) return "...";
    const date = timestamp.toDate ? timestamp.toDate() : new Date(timestamp);
    return format(date, "MM月dd日 HH:mm", { locale: zhCN });
  };

  if (authLoading) return <div className="min-h-screen flex items-center justify-center text-beiming/50">Loading...</div>;

  return (
    <div className="w-full min-h-screen bg-[#F0F8FF] p-6 pb-32 flex flex-col items-center">
      <div className="w-full max-w-3xl">
        
        {/* Header */}
        <header className="flex justify-between items-center mb-10 py-4">
          <h2 className="text-xl text-beiming font-bold font-zcool tracking-widest">
            {user?.displayName} 的逍遥游
          </h2>
          <button 
            onClick={() => router.push(`/${user?.email?.split('@')[0]}`)}
            className="text-sm bg-white/50 border border-white px-4 py-2 rounded-full text-beiming hover:bg-white hover:shadow-sm transition font-bold cursor-pointer"
          >
            查看我的北冥卷 📜
          </button>
        </header>

        {/* --- 1. 发布区域 --- */}
        <div className="bg-white/80 backdrop-blur-xl rounded-[2.5rem] p-8 shadow-[0_20px_40px_-10px_rgba(174,196,229,0.3)] border border-white mb-16 relative z-10">
          <div className="flex bg-slate-100/50 p-1.5 rounded-full mb-6 w-fit mx-auto">
            <button
              onClick={() => setMode('kun')}
              className={`px-6 py-2 rounded-full transition-all duration-300 flex items-center gap-2 text-sm font-bold cursor-pointer ${
                mode === 'kun' ? 'bg-sky-cyan text-white shadow-md' : 'text-beiming/40 hover:text-beiming/60'
              }`}
            >
              <span>🐳</span> 潜 (Status)
            </button>
            <button
              onClick={() => setMode('peng')}
              className={`px-6 py-2 rounded-full transition-all duration-300 flex items-center gap-2 text-sm font-bold cursor-pointer ${
                mode === 'peng' ? 'bg-jade text-white shadow-md' : 'text-beiming/40 hover:text-beiming/60'
              }`}
            >
              <span>🦅</span> 飞 (Diary)
            </button>
          </div>

          <textarea
            value={content}
            onChange={(e) => setContent(e.target.value)}
            placeholder={mode === 'kun' ? "水击三千里... (写句短的)" : "扶摇直上九万里... (写篇日记)"}
            className={`w-full bg-transparent border-none outline-none text-beiming placeholder:text-beiming/30 resize-none transition-all text-center ${
              mode === 'peng' ? 'h-40 text-lg leading-relaxed' : 'h-24 text-2xl font-zcool'
            }`}
          />
          <div className="flex justify-center mt-4">
            <button
              onClick={handleSubmit}
              disabled={isSubmitting}
              className="bg-beiming text-white px-10 py-3 rounded-full font-bold shadow-lg hover:scale-105 hover:shadow-xl transition-all active:scale-95 disabled:opacity-50 disabled:scale-100 cursor-pointer"
            >
              {isSubmitting ? "御风中..." : "发布 ✨"}
            </button>
          </div>
        </div>

        {/* --- 2. 管理工具栏 (搜索 + 筛选) --- */}
        <div className="flex flex-col md:flex-row gap-4 mb-8 items-center justify-between bg-white/40 p-2 pl-6 rounded-2xl border border-white/50 backdrop-blur-sm">
          <div className="flex items-center gap-3 w-full md:w-auto">
            <span className="text-xl">🔍</span>
            <input 
              type="text" 
              placeholder="搜索记忆..." 
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="bg-transparent border-none outline-none text-beiming placeholder:text-beiming/30 w-full md:w-64"
            />
          </div>
          
          <div className="flex bg-white/50 p-1 rounded-xl shadow-sm">
            <button onClick={() => setFilterType('all')} className={`px-4 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${filterType === 'all' ? 'bg-beiming text-white shadow-sm' : 'text-beiming/40 hover:text-beiming'}`}>全部</button>
            <button onClick={() => setFilterType('kun')} className={`px-4 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${filterType === 'kun' ? 'bg-sky-cyan text-white shadow-sm' : 'text-beiming/40 hover:text-sky-cyan'}`}>Status</button>
            <button onClick={() => setFilterType('peng')} className={`px-4 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${filterType === 'peng' ? 'bg-jade text-white shadow-sm' : 'text-beiming/40 hover:text-jade'}`}>Diary</button>
          </div>
        </div>

        {/* --- 3. 历史回顾列表 (按月折叠 + 修复后的卡片) --- */}
        <div className="space-y-8">
          {Object.entries(groupedPosts).map(([month, monthPosts]) => (
            <div key={month} className="relative">
              
              {/* 月份分割线 (点击折叠) */}
              <div 
                onClick={() => toggleMonth(month)}
                className="flex items-center gap-4 mb-6 cursor-pointer group select-none py-2"
              >
                <div className="h-px flex-1 bg-beiming/10 group-hover:bg-sky-cyan/30 transition-colors"></div>
                <div className="flex items-center gap-2 text-beiming/40 group-hover:text-beiming/70 transition-colors">
                  <span className="font-zcool text-xl">{month}</span>
                  <span className="text-xs bg-white px-2 py-0.5 rounded-full border border-beiming/10 font-mono shadow-sm">
                    {monthPosts.length}
                  </span>
                  <span className={`text-xs transition-transform duration-300 ${expandedMonths[month] ? 'rotate-180' : 'rotate-0'}`}>▼</span>
                </div>
                <div className="h-px flex-1 bg-beiming/10 group-hover:bg-sky-cyan/30 transition-colors"></div>
              </div>

              {/* 内容区域 (折叠动画) */}
              <div className={`space-y-4 transition-all duration-500 ease-in-out overflow-hidden ${expandedMonths[month] ? 'max-h-[5000px] opacity-100' : 'max-h-0 opacity-0'}`}>
                {monthPosts.map((post) => (
                  <div 
                    key={post.id} 
                    className={`group relative p-6 rounded-[2rem] border transition-all duration-300 ${
                      post.type === 'kun' 
                        ? 'bg-white/60 border-sky-cyan/20 hover:border-sky-cyan/50 hover:bg-white' 
                        : 'bg-white border-fish-belly/40 hover:border-fish-belly shadow-sm'
                    }`}
                  >
                    {/* 卡片头部：图标 + 时间 */}
                    <div className="flex justify-between items-center mb-4">
                      <div className="flex items-center gap-2">
                        <span className="text-xl filter grayscale group-hover:grayscale-0 transition-all duration-300">
                          {post.type === 'kun' ? '🐳' : '🦅'}
                        </span>
                        <span className={`text-xs font-bold px-2 py-0.5 rounded-md ${
                          post.type === 'kun' ? 'bg-sky-cyan/10 text-sky-cyan' : 'bg-fish-belly/40 text-beiming/60'
                        }`}>
                          {post.type === 'kun' ? 'Status' : 'Diary'}
                        </span>
                      </div>
                      <span className="text-xs font-mono text-beiming/30">{formatTime(post.createdAt)}</span>
                    </div>

                    {/* 内容与编辑逻辑 */}
                    {editingId === post.id ? (
                      <div className="animate-in fade-in zoom-in-95 duration-200">
                        <textarea
                          value={editContent}
                          onChange={(e) => setEditContent(e.target.value)}
                          className="w-full bg-white/50 p-3 rounded-xl border border-jade/30 outline-none focus:ring-2 focus:ring-jade/20 text-beiming text-sm leading-relaxed resize-none h-32"
                        />
                        <div className="flex justify-end gap-2 mt-3">
                          <button onClick={() => setEditingId(null)} className="text-xs px-3 py-1.5 rounded-lg hover:bg-gray-100 text-gray-400 transition cursor-pointer">取消</button>
                          <button onClick={saveEdit} className="text-xs px-4 py-1.5 rounded-lg bg-jade text-white font-bold shadow-sm hover:bg-jade/90 transition cursor-pointer">保存</button>
                        </div>
                      </div>
                    ) : (
                      // 展示模式：内容 + 底部操作栏
                      <div className="flex flex-col h-full">
                        <p className="text-beiming/80 leading-relaxed whitespace-pre-wrap text-base">
                          {post.content}
                        </p>
                        
                        {/* 🛠️ 底部操作栏 (彻底解决重叠问题) */}
                        <div className="mt-6 pt-4 border-t border-beiming/5 flex justify-end gap-3 opacity-60 group-hover:opacity-100 transition-opacity duration-300">
                          <button 
                            onClick={() => startEdit(post)}
                            className="flex items-center gap-1 text-xs font-bold text-jade hover:bg-jade/10 px-3 py-1.5 rounded-full transition-colors cursor-pointer"
                          >
                            <span>✎</span> 编辑
                          </button>
                          <button 
                            onClick={() => handleDelete(post.id)}
                            className="flex items-center gap-1 text-xs font-bold text-red-300 hover:bg-red-50 hover:text-red-500 px-3 py-1.5 rounded-full transition-colors cursor-pointer"
                          >
                            <span>✕</span> 删除
                          </button>
                        </div>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          ))}

          {/* 空状态提示 */}
          {posts.length === 0 && (
            <div className="text-center py-10 text-beiming/30 text-sm">
              还没有记录，快去写下第一笔吧... ✍️
            </div>
          )}
          {posts.length > 0 && Object.keys(groupedPosts).length === 0 && (
            <div className="text-center py-10 text-beiming/30 text-sm">
              没有找到匹配的记忆... 🔍
            </div>
          )}
        </div>

      </div>
    </div>
  );
}
