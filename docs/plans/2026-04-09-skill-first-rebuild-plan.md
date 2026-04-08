# Skill-first Rebuild Plan

**日付**: 2026-04-09
**ステータス**: 承認済、実装開始
**対象**: yt-brand-collab-analyzer (既存) → yt-creator-toolkit (新リポジトリ)

## 背景とゴール

既存の `yt-brand-collab-analyzer` は「既知チャンネル → 分析 → ブリーフ生成」の Web アプリとして動作しているが、次の 2 つの要請から大規模な再構築を行う：

1. **新機能「creator-discovery」の追加**: 広告主のブリーフとリサーチデータ（PDF/PPT）を起点に、ダニ系・掃除系に閉じない "未知の切り口のクリエイター" を発掘する逆向きフロー。
2. **Skill-first アーキテクチャへの全面移行**: 既存機能も含めて Claude Code / Gemini CLI の Skill として再実装し、プロンプトとロジックを物理的に分離する。

### 価値仮説の再定義

事前のブレスト（2026-04-09）で以下を確認：

- **このプロダクトはマッチング・エンジンではなくクリエイティブ刺激ツール**。お客さん自身が正解を持っていない段階の市場で、「従来考えられなかった切り口のクリエイターや企画案」を提示することが価値。
- **成功指標**: precision/recall ではなく「驚き × 妥当性 × 説明可能性」の 3 点。
- **評価セット**: 事前に作るのではなく、運用ログから副産物として育てる（採用/保留/却下ログ）。
- **operator**: 当面はあなた（マーケ実務者）一人。お客さんは最終的に PDF で納品物を受け取る（Possibility A）。

## アーキテクチャ

三層分離：

```
[Operator: あなた]
       ↓ Claude Code で Skill 実行
[Skills (.claude/skills/)] ─── prompts/*.md を読む
       ↓ Bash で呼ぶ
[scripts/*.ts] ─── lib/*.ts を import
       ↓ YouTube API / Gemini API
[ファイル: projects/{案件slug}/*.json]  ←★ Source of Truth
       ↑ 読むだけ
[Web ビューア (app/)] ─── 既存 React コンポーネントで表示
       ↓ ブラウザで眺める / PDF 化して納品
```

- **Skills がエンジン**: オーケストレーション層
- **ファイルがデータ**: `projects/{slug}/*.json` が Source of Truth、DB なし
- **Web ビューアはレンダラー**: 読み取り専用 + 採用/保留/却下ボタンのみ
- **API ルートは極小**: フィードバック保存の静的 POST のみ、分析は全部 Skill 経由

### 確定 / AI 一発 / Agent の役割分担

| レイヤー | 責務 | 具体例 |
|---|---|---|
| 確定 (コード) | 決まったことを正確に | PDF/PPT 抽出, YouTube API 呼び出し, Quota 計測, キャッシュ, 重複排除, 軸ヒット判定, UI レンダリング |
| AI 一発 (Gemini 呼び出し) | ゴール明確・1 回呼べば終わる翻訳 | リサーチ抽出, ペルソナ推論, アーキタイプ生成, Stage 2 rerank, 最終ブリーフ生成 |
| Agent (Skill の対話ループ) | 探索戦略決定 | 次のキーワード選択, 1 軸不発時の方針転換, shallow→deep の判断, 終了判断。Claude Code / Gemini CLI の組み込みエージェントループが肩代わり |

**重要**: Agent ループは Claude Code / Gemini CLI が提供するものを借りる。自前 Agent runner は書かない。

### Codex レビュー（2026-04-09）で受け入れた指摘

- 「YouTube 全体」は誤認、実態は `search.list` の上位断面
- `max_searches=20` は quota 破綻、search は最終手段に
- Stage 1 (deterministic prefilter) + Stage 2 (AI rerank) の二段分離
- channelId 主キー、provenance 追跡必須
- B 軸の幻覚対策は evidence-first（モデルにチャンネル名を自由生成させない、動画データ起点 + 引用紐付け）
- 永続キャッシュ必須、search/deepDive 別勘定
- Brand safety prefilter を前段に
- Codex 提案のツール命名（`search_youtube_videos`, `search_youtube_channels`, `prefilter_candidate`, `rerank_candidates` 等）を採用

### Codex の指摘で逆にした判断

- 「評価セットを先に作れ」→ 顧客自身に正解がないため不可能。代わりに **運用ログから副産物として評価セットを育てる**（feedback.jsonl）。
- 「retrieval を先に締めろ、agent 化は最後」→ 創造的飛躍が商品価値なので、Skill の対話ループ（Claude Code の組み込みエージェント）を Day 1 から活用する。ただし確定パイプラインに近い Skill として書く。

## 新リポジトリ: yt-creator-toolkit

### ディレクトリ構造

```
yt-creator-toolkit/
├── .claude/skills/
│   ├── creator-discovery/          # NEW: ブリーフ→未知クリエイター発見
│   ├── creator-analyze/            # 移植: 既知チャンネル→分析
│   ├── creator-brief/              # 移植: 分析→メインブリーフ
│   ├── creator-idea-sheet/         # 移植: 分析→企画案シート
│   └── creator-compare/            # 移植: 比較（Phase 5 で後回し可）
│
├── prompts/                         # プロンプト外出し
│   ├── discovery/  {extract-research, reframe-brief, generate-archetypes,
│   │                generate-search-queries, rerank-candidates, synthesize-rationale}.md
│   ├── analyze/    {analyze-content-patterns, analyze-brand-fit, analyze-audience, analyze-comments}.md
│   ├── brief/      {generate-main-brief, generate-creative-direction}.md
│   └── idea/       {generate-idea-sheet}.md
│
├── scripts/                         # Skill が Bash 経由で呼ぶ薄い CLI
│   ├── youtube/   {resolve-channel, get-channel-info, get-videos,
│   │               get-comments, search-videos}.ts
│   ├── gemini/    {call, multimodal-call}.ts
│   ├── discovery/ {extract-research, reframe-brief, generate-archetypes,
│   │               retrieve-candidates, prefilter, rerank, synthesize, render-report}.ts
│   ├── analyze/   {orchestrate, render-report}.ts
│   ├── brief/     {generate}.ts
│   ├── idea/      {generate}.ts
│   └── feedback/  {log}.ts
│
├── lib/                             # 共通 TS ライブラリ（UI なし）
│   ├── youtube.ts                   # 既存から移植 + searchVideos 追加
│   ├── gemini.ts                    # 既存から移植 + multimodal 拡張
│   ├── types.ts                     # 既存から移植 + Discovery 型追加
│   ├── validators.ts                # 既存から移植
│   ├── metrics.ts                   # 既存から移植
│   ├── utils.ts                     # 既存から移植
│   ├── project-store.ts             # NEW: projects/ の読み書き
│   ├── prompt-loader.ts             # NEW: prompts/*.md の読み込み + 変数展開
│   ├── cache.ts                     # NEW: 検索結果・チャンネル情報の永続キャッシュ
│   └── quota.ts                     # NEW: search/deepDive 別勘定
│
├── projects/                        # ユーザーデータ（.gitignore）
│   └── {YYYY-MM-DD-slug}/
│       ├── input/         {brief.pdf, research.pptx}
│       ├── extract.json
│       ├── reframings.json
│       ├── candidates.json
│       ├── analyses/      {UC*.json}
│       ├── briefs/        {UC*-brief.md, UC*-idea-sheet.md}
│       ├── feedback.jsonl
│       └── meta.json
│
├── app/                             # 読み取り専用 Next.js ビューア
│   ├── page.tsx                     # 案件一覧
│   ├── projects/[slug]/
│   │   ├── page.tsx                 # 案件サマリー
│   │   ├── candidates/page.tsx      # 2 レーン候補表示
│   │   ├── analyses/[id]/page.tsx   # CreatorBriefReport 表示
│   │   └── ideas/[id]/page.tsx      # IdeaSheetReport 表示
│   ├── api/feedback/route.ts        # 採用/保留/却下の POST のみ
│   ├── globals.css
│   └── layout.tsx
│
├── components/                      # 既存 React コンポーネント移植
│   ├── ui/                          # shadcn primitives
│   ├── CreatorBriefReport.tsx       # 既存
│   ├── IdeaSheetReport.tsx          # 既存
│   ├── PrintableReport.tsx          # 既存
│   ├── ComparisonDashboard.tsx      # 既存
│   ├── BrandFitScore.tsx            # 既存
│   ├── ChannelOverview.tsx          # 既存
│   ├── VideoList.tsx                # 既存
│   ├── EngagementMetrics.tsx        # 既存
│   ├── CategoryBenchmark.tsx        # 既存
│   ├── CollabIdeas.tsx              # 既存
│   ├── ResearchSummary.tsx          # 既存
│   ├── DiscoveryCandidates.tsx      # NEW: 2 レーン候補ビュー
│   └── DiscoveryReframings.tsx      # NEW: ブリーフ再フレーミング表示
│
├── hooks/                           # 既存から縮小
│   └── usePrint.ts                  # API 呼び出し系は削除
│
├── .env.example
├── .gitignore                       # projects/, .env.local, node_modules
├── package.json                     # + tsx
├── tsconfig.json
├── next.config.ts
├── postcss.config.mjs
├── eslint.config.mjs
├── README.md                        # セットアップ + 使い方
└── CLAUDE.md                        # 開発ルール + Skill 規約
```

### 移植マップ

| 既存ファイル | 新リポでの場所 | 変更 |
|---|---|---|
| `lib/youtube.ts` | そのまま移植 | 後の Phase で `searchVideos` 追加 |
| `lib/gemini.ts` | そのまま移植 | 後の Phase で multimodal + prompt file 読み込み |
| `lib/types.ts` | そのまま移植 | 後の Phase で Discovery 型追加 |
| `lib/validators.ts` | そのまま移植 | - |
| `lib/metrics.ts` | そのまま移植 | - |
| `lib/utils.ts` | そのまま移植 | - |
| `app/api/analyze/route.ts` | `scripts/analyze/orchestrate.ts` | API → CLI 化 |
| `app/page.tsx` | `app/page.tsx` | 案件一覧スタブに置き換え |
| `components/AnalysisForm.tsx` | 削除 | - |
| `components/AnalysisResults.tsx` | 削除または大幅縮小 | - |
| `components/CreatorBriefReport.tsx` | 移植 | データソースを props → JSON file 読み込みに |
| `components/IdeaSheetReport.tsx` | 移植 | 同上 |
| `components/PrintableReport.tsx` | 移植 | - |
| `components/ComparisonDashboard.tsx` | 移植 | - |
| `components/BrandFitScore.tsx` 他 | 移植 | - |
| `hooks/useAnalysis.ts` | 削除 | API 呼び出しがなくなる |
| `hooks/usePrint.ts` | 移植 | - |
| `package.json` | 移植 + `tsx` 追加 | `name` を変更 |

## フェーズ別ビルド順序

### Phase 0: リポジトリ bootstrap

- GitHub プライベートリポジトリ作成 (`gh repo create`)
- ローカルに `/Users/nao/VibeCoding/yt-creator-toolkit` を作成
- 既存 `yt` から `lib/`, `components/`, `hooks/usePrint.ts`, `app/layout.tsx`, `app/globals.css`, 設定ファイル一式をコピー
- `package.json` に `tsx` を追加、`name` を `yt-creator-toolkit` に変更
- `.claude/skills/` (5 skill dirs), `prompts/` (4 subdirs), `scripts/` (6 subdirs), `projects/.gitkeep` を作成
- `AnalysisForm.tsx`, `useAnalysis.ts`, `app/api/analyze/`, `components/AnalysisResults.tsx` を削除
- `app/page.tsx` を「案件一覧」スタブに書き換え（projects/ を ls）
- `.gitignore` 作成（projects/, .env.local, node_modules）
- `.env.example`, `README.md`, `CLAUDE.md` の骨子
- `npm install` → `npm run build` 通過を確認
- 初期コミット → push

**完了条件**: `npm run dev` で「案件 0 件」が表示される。Skill はまだ動かない。

### Phase 1: creator-analyze Skill (機能パリティのベース)

- `lib/project-store.ts`, `lib/prompt-loader.ts` を実装
- 既存 `lib/gemini.ts` 内のプロンプトを `prompts/analyze/*.md` に機械的抽出
- `scripts/youtube/{resolve-channel, get-channel-info, get-videos, get-comments}.ts` 実装
- `scripts/gemini/call.ts` 実装（汎用 Gemini 呼び出し、prompt file + input JSON）
- `scripts/analyze/orchestrate.ts` 実装（旧 `route.ts` ロジック移植）
- `.claude/skills/creator-analyze/SKILL.md` 記述
- 既知チャンネル 1 件で実行 → `projects/test/analyses/UCxxx.json` 生成
- `app/projects/[slug]/analyses/[id]/page.tsx` で既存 `CreatorBriefReport` がそのまま表示されることを確認

**完了条件**: Skill → ファイル → ビューアの三層が動く。既存と同じ品質のチャンネル分析が表示される。

### Phase 2: creator-brief & creator-idea-sheet Skill

- `prompts/brief/*.md`, `prompts/idea/*.md` を書く（既存から機械的抽出）
- `scripts/brief/generate.ts`, `scripts/idea/generate.ts` 実装
- `.claude/skills/creator-brief/SKILL.md`, `creator-idea-sheet/SKILL.md`
- ビューアの該当ページ実装

**完了条件**: ブリーフと企画案シートが生成される。既存リポジトリの主要機能が全部 Skill 経由で動く（機能パリティ到達）。

### Phase 3: creator-discovery Skill (NEW)

**Phase 3a**: 抽出 + 再フレーミング
- `lib/gemini.ts` multimodal 入力対応追加
- `prompts/discovery/extract-research.md`, `reframe-brief.md`
- `scripts/discovery/extract-research.ts`, `reframe-brief.ts`
- SKILL.md の最初の 3 ステップ
- 実ブリーフで抽出 → 再フレーミングまで動くこと

**Phase 3b**: アーキタイプ → 検索 → prefilter
- `prompts/discovery/generate-archetypes.md`, `generate-search-queries.md`
- `scripts/youtube/search-videos.ts` (NEW)
- `lib/cache.ts`, `lib/quota.ts` 実装
- `scripts/discovery/{generate-archetypes, retrieve-candidates, prefilter}.ts`
- 候補チャンネル 30-50 件まで絞れること

**Phase 3c**: rerank → synthesize → ビューア + 計測フック
- `prompts/discovery/rerank-candidates.md`, `synthesize-rationale.md`
- `scripts/discovery/{rerank, synthesize, render-report}.ts`
- `components/DiscoveryCandidates.tsx` (2 レーン)
- `components/DiscoveryReframings.tsx`
- `app/projects/[slug]/candidates/page.tsx`
- `scripts/feedback/log.ts` + `app/api/feedback/route.ts` (採用/保留/却下)
- 実案件をフルパイプで通す

**完了条件**: 実案件で「未知のクリエイターが提案できた」と言える状態。

### Phase 4: 統合ポリッシュ

- README に end-to-end 使い方を記述
- 案件テンプレート (`projects/_template/`) 作成
- 案件一覧ページの体裁
- 印刷モードの再確認
- Codex レビュー

### Phase 5 (オプション): creator-compare Skill

複数チャンネル比較。優先度低。

## 使い方ワークフロー（1 案件のエンドツーエンド）

```
[1] 案件開始
$ cd ~/VibeCoding/yt-creator-toolkit
$ mkdir -p projects/2026-04-09-dani-control/input
$ cp ~/Downloads/dani-brief.pdf projects/2026-04-09-dani-control/input/
$ cp ~/Downloads/dani-research.pptx projects/2026-04-09-dani-control/input/
$ claude

[2] Discovery 実行
> /creator-discovery 2026-04-09-dani-control
# 対話的に進行:
#   - リサーチ抽出 → 確認・修正
#   - ブリーフ再フレーミング 3 案 → 選択
#   - アーキタイプ生成 → YouTube 検索 → prefilter → rerank → 候補 8-13 件
#   - report.md 表示

[3] ブラウザで眺める
$ npm run dev
# http://localhost:3000/projects/2026-04-09-dani-control/candidates
# 2 レーン UI、採用/保留/却下 をクリックで記録

[4] 採用候補を deep-dive
> /creator-analyze 2026-04-09-dani-control UC123abc
> /creator-brief 2026-04-09-dani-control UC123abc
> /creator-idea-sheet 2026-04-09-dani-control UC123abc

[5] 納品
# ブラウザで /projects/{slug}/analyses/UC123abc を開いて印刷 → PDF → メール添付

[6] 計測フックの蓄積
# feedback.jsonl に採否記録が貯まる
# 3-6 ヶ月後に eval set として参照
```

## 確定事項（ブレストでの決定）

| 論点 | 決定 |
|---|---|
| 新リポジトリ名 | `yt-creator-toolkit` |
| ビューアのインタラクティブ性 | 読み取り専用 + 採用/保留/却下ボタンのみ |
| AnalysisResult スキーマ | 既存と同じ（CreatorBriefReport がそのまま動くように） |
| 既存リポジトリの扱い | 当面並走、Phase 4 完了で機能パリティ確認後アーカイブ化 |
| プロンプト初版 | 既存から機械的移植、改善は別 PR |
| 既存リポジトリの WIP | 先に PR 化してコミット済み状態を移植 (PR #9) |
| PDF/PPT 抽出責務 | Claude Code の Read ツール（ネイティブマルチモーダル）に任せる |
| 計測フック | Skill 内対話 + ブラウザボタン両対応 |

## 未決事項・将来検討

- `projects/` のスキーマ進化時の migration 戦略
- 複数案件の横断検索
- チーム共有（現状 Possibility A 前提なので不要）
- API quota の月次集計
- Gemini File API アップロードの 48 時間有効期限対応

## 参考

- ブレスト会話ログ: 2026-04-09（Q1〜Q10）
- Codex レビュー: 2026-04-09 consult mode, session 019d6eeb-02f3-7500-bd9e-865753f686cf
- 移行前の最終 WIP: PR #9 (feat/brief-creator-address-rules)
