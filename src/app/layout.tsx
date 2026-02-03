import type { Metadata } from "next";
import { Quicksand } from "next/font/google"; 
import "./globals.css";

// 只保留 Quicksand 的配置 (因为它加载快，依然用 Next.js 优化)
const quicksand = Quicksand({
  subsets: ["latin"],
  variable: "--font-quicksand",
  weight: ["400", "500", "700"],
});

export const metadata: Metadata = {
  title: "逍遥记 | Xiaoyaoji",
  description: "北冥有鱼，其名为鲲。",
};

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="zh-CN">
      <head>
        {/* 👇 强制引入 Google Fonts CDN (ZCOOL) */}
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link
          href="https://fonts.googleapis.com/css2?family=ZCOOL+KuaiLe&display=swap"
          rel="stylesheet"
        />
      </head>
      
      <body
        // 👇 关键修改：这里删掉了 ${zcool.variable}，只保留 quicksand
        className={`${quicksand.variable} font-sans antialiased bg-cloud-white text-beiming`}
      >
        <main className="min-h-screen flex flex-col items-center relative overflow-x-hidden">
          {children}
        </main>
      </body>
    </html>
  );
}
