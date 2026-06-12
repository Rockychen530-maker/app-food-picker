import type { Metadata, Viewport } from "next";
import { Noto_Sans_TC } from "next/font/google";
import "./globals.css";

const notoSansTC = Noto_Sans_TC({
  subsets: ["latin"],
  weight: ["300", "400", "500", "700"],
  variable: "--font-noto",
});

export const metadata: Metadata = {
  title: "就決定是你了 - AI 美食推薦",
  description: "用 AI 解決三餐選擇困難症！一秒決定吃什麼。",
  manifest: "/manifest.json",
  appleWebApp: {
    capable: true,
    statusBarStyle: "default",
    title: "就決定是你了",
  },
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
  themeColor: "#E74C3C",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="zh-TW">
      <head>
        <link rel="icon" href="/favicon.ico" />
        {/* Google AdSense - 替換 YOUR_AD_CLIENT_ID 為你的 ID */}
        <script async src="https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=YOUR_AD_CLIENT_ID" crossOrigin="anonymous"></script>
      </head>
      <body className={`${notoSansTC.variable}`} style={{ fontFamily: "'Noto Sans TC', sans-serif" }}>
        {children}
      </body>
    </html>
  );
}