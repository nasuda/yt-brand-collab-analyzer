# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Commands

```bash
npm run dev       # Start dev server (localhost:3000)
npm run build     # Production build (also serves as type-check)
npm run start     # Start production server
npm run lint      # ESLint
```

No test framework is configured yet.

## Architecture

YouTube Creator x Brand コラボ分析アプリ。チャンネルURLとブランド名を入力すると、YouTube Data API v3でデータを取得し、Gemini 2.5 Flashで分析・企画案を生成してダッシュボードに表示する。

### Data Flow

```
AnalysisForm (client)
  → useAnalysis hook (POST /api/analyze)
    → route.ts orchestrates:
      1. resolveChannel() — チャンネル解決 (handle/ID/URL/テキスト)
      2. getVideos() — 最新5本 + 人気上位5本を自動選定
      3. getVideoComments() — Promise.allSettledで失敗許容
      4. analyzeBrandFit() — Gemini構造化JSON出力
    → AnalysisResults renders dashboard
```

Single API route (`/api/analyze`) keeps API keys server-side. The client makes one fetch call.

### YouTube API Quota Strategy

`playlistItems.list` (1 unit/call) instead of `search.list` (100 units/call). Channel's upload playlist ID is obtained from `channels.list` response's `contentDetails.relatedPlaylists.uploads`. Video stats are batch-fetched in a single `videos.list` call with comma-separated IDs.

### Gemini Structured Output

`lib/gemini.ts` uses `responseMimeType: "application/json"` + `responseSchema` (with `Type.*` from `@google/genai`) to guarantee JSON output shape. The schema enforces: overallScore (0-100), contentStyleSummary, audienceProfile, brandAlignmentReasoning, strengths[], risks[], collabIdeas[].

## Tech Stack

- **Next.js 16** (App Router) + **React 19** + **TypeScript 5.9** (strict)
- **Tailwind CSS v4** — uses `@import "tailwindcss"` syntax, `@tailwindcss/postcss` plugin, `@theme inline` for design tokens, oklch() colors
- **shadcn/ui pattern** — hand-rolled primitives in `components/ui/` using `cva` + `cn()` (clsx + tailwind-merge). Not installed via shadcn CLI.
- **@google/genai** SDK for Gemini API
- **lucide-react** for icons

## Conventions

- All UI copy and Gemini prompts are in Japanese.
- Types are centralized in `lib/types.ts`. Status uses string literal union: `"idle" | "loading" | "success" | "error"`.
- `lib/validators.ts` handles channel input parsing (regex-based detection of @handle, UC channel ID, various YouTube URL formats, plain text fallback).
- Components use `"use client"` directive where React hooks are needed.
- Path alias: `@/*` maps to project root.

## Development Workflow

Claude Code（開発）→ PR → Codex（レビュー）→ マージ の非同期サイクルで開発。

### セッション開始時（必須）
1. `gh pr list` で前回PRの状態を確認
   - **Approved** → `gh pr merge --squash` → `git checkout main && git pull`
   - **Changes Requested** → 該当ブランチに戻ってフィードバック対応 → push
   - **Review待ち/PRなし** → `git checkout main && git pull`
2. mainから新ブランチを切る: `git checkout -b feat/xxx`

### セッション終了時（必須）
1. `npm run build` で型エラーなしを確認
2. コミット → push → PR作成
3. `git checkout main`（ローカルのmainを常にクリーンに保つ）

### PR作成ルール（Codexレビュー最適化）
```
タイトル: feat/fix/refactor: 日本語で簡潔に（70文字以内）
Body:
  ## Summary — 何を・なぜ（箇条書き）
  ## 変更ファイル — 新規/変更を区分
  ## Test plan — 検証チェックリスト
```

### ブランチ命名
- `feat/xxx` — 新機能
- `fix/xxx` — バグ修正
- `refactor/xxx` — リファクタリング

### 原則
- mainへの直接push禁止（必ずPR経由）
- 1PR = 1テーマ（レビューしやすい粒度）
- PRはセッション間の引き継ぎ書を兼ねる

## Environment Variables (.env.local)

- `YOUTUBE_API_KEY` — YouTube Data API v3 key (Google Cloud Console)
- `GEMINI_API_KEY` — Gemini API key (Google AI Studio)
