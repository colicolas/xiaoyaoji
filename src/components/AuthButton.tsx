"use client";
import { signInWithPopup, signOut } from "firebase/auth";
import { auth, googleProvider, db } from "@/lib/firebase";
import { useAuthState } from "react-firebase-hooks/auth";
import { doc, setDoc } from "firebase/firestore";
import { useRouter } from "next/navigation";

export default function AuthButton() {
  const [user, loading] = useAuthState(auth);
  const router = useRouter();

  const handleLogin = async () => {
    try {
      const result = await signInWithPopup(auth, googleProvider);
      const u = result.user;
      const username = u.email?.split("@")[0] || u.uid;
      await setDoc(
        doc(db, "users", username),
        {
          uid: u.uid,
          displayName: u.displayName,
          photoURL: u.photoURL,
          username,
        },
        { merge: true }
      );
      router.push("/dashboard");
    } catch (e) {
      console.error("登录失败:", e);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center gap-3">
        <div className="h-10 w-28 rounded-full bg-sky-cyan/35 animate-pulse" />
        <div className="h-10 w-28 rounded-full bg-white/40 animate-pulse [animation-delay:140ms]" />
      </div>
    );
  }

  if (user) {
    return (
      <div className="flex flex-wrap items-center justify-center gap-3">
        <button 
          onClick={() => router.push("/dashboard")} 
          className="group relative inline-flex items-center justify-center gap-2 rounded-full px-5 py-2.5 text-sm font-semibold tracking-wide transition-all duration-300 cursor-pointer text-beiming bg-gradient-to-r from-jade/95 via-sky-cyan/70 to-fish-belly/50 shadow-[0_16px_40px_rgba(27,60,89,0.14)] ring-1 ring-white/70 hover:-translate-y-[2px] hover:shadow-[0_24px_60px_rgba(27,60,89,0.20)] hover:scale-[1.03] active:translate-y-0 active:scale-[0.98] focus:outline-none focus-visible:ring-2 focus-visible:ring-sky-cyan/70 focus-visible:ring-offset-2 focus-visible:ring-offset-transparent"
        >
          {/* glow effect */}
          <span className="pointer-events-none absolute -inset-2 rounded-full bg-gradient-to-r from-jade/30 via-sky-cyan/30 to-fish-belly/30 opacity-0 blur-xl group-hover:opacity-100 transition-opacity duration-300" />
          <span className="relative">去写日记</span>
          <span className="relative opacity-85">✍️</span>
        </button>

        <button 
          onClick={() => signOut(auth)} 
          className="group relative inline-flex items-center justify-center gap-2 rounded-full px-5 py-2.5 text-sm font-semibold tracking-wide transition-all duration-300 cursor-pointer text-beiming/80 bg-white/28 backdrop-blur-md ring-1 ring-white/70 shadow-[0_10px_28px_rgba(27,60,89,0.10)] hover:bg-white/45 hover:text-beiming hover:-translate-y-[2px] hover:shadow-[0_16px_40px_rgba(27,60,89,0.14)] hover:scale-[1.03] active:translate-y-0 active:scale-[0.98] focus:outline-none focus-visible:ring-2 focus-visible:ring-fish-belly/70 focus-visible:ring-offset-2 focus-visible:ring-offset-transparent"
        >
          {/* glow effect */}
          <span className="pointer-events-none absolute -inset-2 rounded-full bg-white/40 opacity-0 blur-xl group-hover:opacity-100 transition-opacity duration-300" />
          <span className="relative">归隐（退出）</span>
          <span className="relative opacity-70">☁️</span>
        </button>
      </div>
    );
  }

  return (
    <button 
      onClick={handleLogin} 
      className="group relative mx-auto inline-flex w-full max-w-sm items-center justify-center gap-2 rounded-full px-6 py-3.5 text-base font-semibold text-beiming ring-1 ring-white/70 bg-white/30 backdrop-blur-md shadow-[0_18px_55px_rgba(27,60,89,0.12)] transition-all duration-300 cursor-pointer hover:-translate-y-[2px] hover:bg-white/45 hover:shadow-[0_24px_65px_rgba(27,60,89,0.18)] hover:scale-[1.02] active:translate-y-0 active:scale-[0.98] focus:outline-none focus-visible:ring-2 focus-visible:ring-sky-cyan/70 focus-visible:ring-offset-2 focus-visible:ring-offset-transparent"
    >
      {/* background glow */}
      <span className="pointer-events-none absolute -top-12 left-1/2 h-20 w-[22rem] -translate-x-1/2 rounded-full bg-sky-cyan/55 blur-3xl opacity-60 group-hover:opacity-100 transition-opacity duration-300" />
      {/* button glow */}
      <span className="pointer-events-none absolute -inset-3 rounded-full bg-sky-cyan/20 opacity-0 blur-xl group-hover:opacity-100 transition-opacity duration-300" />
      
      <span className="relative text-xl">🌊</span>
      <span className="relative">入世 · Google 登录</span>
      <span className="relative ml-1 opacity-70 group-hover:opacity-100 transition-opacity">→</span>
    </button>
  );
}
