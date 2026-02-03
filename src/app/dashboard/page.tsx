"use client";
import { useState, useEffect } from "react";
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
  
  // 发布相关状态
  const [content, setContent] = useState("");
  const [mode, setMode] = useState<'kun' | 'peng'>('kun');
  const [isSubmitting, setIsSubmitting] = useState(false);

  // 历史记录相关状态
  const [posts, setPosts] = useState<Post[]>([]);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editContent, setEditContent] = useState("");

  // 1. 实时获取历史发布 (Real-time listener)
  useEffect(() => {
    if (!user) return;

    const q = query(
      collection(db, "posts"),
      where("uid", "==", user.uid),
      orderBy("createdAt", "desc")
    );

    // 开启监听
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const fetchedPosts = snapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      })) as Post[];
      setPosts(fetchedPosts);
    });

    return () => unsubscribe();
  }, [user]);

  // 2. 发布新内容
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
      // alert 不需要了，因为列表会自动更新，直接看到结果更直观
    } catch (e) {
      console.error(e);
    }
    setIsSubmitting(false);
  };

  // 3. 删除功能
  const handleDelete = async (id: string) => {
    const confirmDelete = window.confirm("确定要抹去这条痕迹吗？🥺");
    if (confirmDelete) {
      await deleteDoc(doc(db, "posts", id));
    }
  };

  // 4. 开启编辑模式
  const startEdit = (post: Post) => {
    setEditingId(post.id);
    setEditContent(post.content);
  };

  // 5. 保存编辑
  const saveEdit = async () => {
    if (!editingId || !editContent.trim()) return;
    try {
      await updateDoc(doc(db, "posts", editingId), {
        content: editContent,
      });
      setEditingId(null);
    } catch (e) {
      console.error("Update failed", e);
    }
  };

  // 辅助：格式化时间
  const formatTime = (timestamp: any) => {
    if (!timestamp) return "...";
    // 处理 Firebase Timestamp 或 date 对象
    const date = timestamp.toDate ? timestamp.toDate() : new Date(timestamp);
    return format(date, "MM月dd日 HH:mm", { locale: zhCN });
  };

  if (authLoading) return <div className="min-h-screen flex items-center justify-center text-beiming/50">Loading...</div>;

  return (
    <div className="w-full min-h-screen bg-[#F0F8FF] p-6 pb-32 flex flex-col items-center">
      <div className="w-full max-w-2xl">
        
        {/* --- Header --- */}
        <header className="flex justify-between items-center mb-10 py-4">
          <h2 className="text-xl text-beiming font-bold font-zcool tracking-widest">
            {user?.displayName} 的逍遥游
          </h2>
          <button 
            onClick={() => router.push(`/${user?.email?.split('@')[0]}`)}
            className="text-sm bg-white/50 border border-white px-4 py-2 rounded-full text-beiming hover:bg-white hover:shadow-sm transition font-bold"
          >
            查看我的北冥卷 📜
          </button>
        </header>

        {/* --- 发布区域 (Create) --- */}
        <div className="bg-white/80 backdrop-blur-xl rounded-[2.5rem] p-8 shadow-[0_20px_40px_-10px_rgba(174,196,229,0.3)] border border-white mb-12">
          
          {/* 切换开关 */}
          <div className="flex bg-slate-100/50 p-1.5 rounded-full mb-6 w-fit mx-auto">
            <button
              onClick={() => setMode('kun')}
              className={`px-6 py-2 rounded-full transition-all duration-300 flex items-center gap-2 text-sm font-bold ${
                mode === 'kun' ? 'bg-sky-cyan text-white shadow-md' : 'text-beiming/40 hover:text-beiming/60'
              }`}
            >
              <span>🐳</span> 潜 (Status)
            </button>
            <button
              onClick={() => setMode('peng')}
              className={`px-6 py-2 rounded-full transition-all duration-300 flex items-center gap-2 text-sm font-bold ${
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
              className="bg-beiming text-white px-10 py-3 rounded-full font-bold shadow-lg hover:scale-105 hover:shadow-xl transition-all active:scale-95 disabled:opacity-50 disabled:scale-100"
            >
              {isSubmitting ? "御风中..." : "发布 ✨"}
            </button>
          </div>
        </div>

        {/* --- 管理区域 (Manage / History) --- */}
        <div className="space-y-6">
          <div className="flex items-center gap-4 mb-6 opacity-60 px-4">
            <div className="h-px flex-1 bg-beiming/20"></div>
            <span className="text-sm font-bold text-beiming/50 tracking-widest">回顾 · 往事</span>
            <div className="h-px flex-1 bg-beiming/20"></div>
          </div>

          {posts.map((post) => (
            <div 
              key={post.id} 
              className={`group relative p-6 rounded-[2rem] border transition-all duration-300 ${
                post.type === 'kun' 
                  ? 'bg-white/60 border-sky-cyan/20 hover:border-sky-cyan/50' 
                  : 'bg-white border-fish-belly/40 hover:border-fish-belly'
              }`}
            >
              {/* 卡片头部：类型图标 + 时间 */}
              <div className="flex justify-between items-center mb-3">
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

              {/* 内容区域：展示 vs 编辑 */}
              {editingId === post.id ? (
                // 编辑模式
                <div className="animate-in fade-in zoom-in-95 duration-200">
                  <textarea
                    value={editContent}
                    onChange={(e) => setEditContent(e.target.value)}
                    className="w-full bg-white/50 p-3 rounded-xl border border-jade/30 outline-none focus:ring-2 focus:ring-jade/20 text-beiming text-sm leading-relaxed resize-none h-32"
                  />
                  <div className="flex justify-end gap-2 mt-3">
                    <button 
                      onClick={() => setEditingId(null)}
                      className="text-xs px-3 py-1.5 rounded-lg hover:bg-gray-100 text-gray-400 transition"
                    >
                      取消
                    </button>
                    <button 
                      onClick={saveEdit}
                      className="text-xs px-4 py-1.5 rounded-lg bg-jade text-white font-bold shadow-sm hover:bg-jade/90 transition"
                    >
                      保存修改
                    </button>
                  </div>
                </div>
              ) : (
                // 展示模式
                <>
                  <p className="text-beiming/80 leading-relaxed whitespace-pre-wrap">
                    {post.content}
                  </p>
                  
                  {/* 操作按钮 (Hover 显示) */}
                  <div className="absolute top-6 right-6 flex gap-3 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                    <button 
                      onClick={() => startEdit(post)}
                      className="text-jade/60 hover:text-jade transition hover:scale-110"
                      title="编辑"
                    >
                      ✎
                    </button>
                    <button 
                      onClick={() => handleDelete(post.id)}
                      className="text-red-300 hover:text-red-500 transition hover:scale-110"
                      title="删除"
                    >
                      ✕
                    </button>
                  </div>
                </>
              )}
            </div>
          ))}

          {posts.length === 0 && (
            <div className="text-center py-10 text-beiming/30 text-sm">
              还没有记录，快去写下第一笔吧... ✍️
            </div>
          )}
        </div>

      </div>
    </div>
  );
}
