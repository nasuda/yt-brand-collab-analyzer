import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "YouTube Creator x Brand コラボ分析",
  description: "YouTubeクリエイターとブランドのコラボレーション適合性を分析し、企画案を生成するツール",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="ja">
      <body className="min-h-screen bg-background antialiased">
        {children}
      </body>
    </html>
  );
}
