"use client";

import { useState, useMemo, useCallback } from "react";
import { ResearchMode } from "@/lib/types";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Globe,
  BookOpen,
  FileText,
  ChevronDown,
  ChevronRight,
  User,
  Handshake,
  AlertTriangle,
  MessageCircle,
  Link,
  Users,
  BarChart3,
  ScrollText,
  Lightbulb,
} from "lucide-react";

interface ResearchSummaryProps {
  creatorResearch: string;
  researchMode: ResearchMode;
}

const MODE_CONFIG: Record<string, { label: string; icon: React.ReactNode }> = {
  search: {
    label: "Google検索調査結果",
    icon: <Globe className="h-5 w-5" />,
  },
  "deep-research": {
    label: "Deep Research調査結果",
    icon: <BookOpen className="h-5 w-5" />,
  },
  "custom-research": {
    label: "添付リサーチレポート",
    icon: <FileText className="h-5 w-5" />,
  },
};

interface ParsedSection {
  title: string;
  content: string;
}

/** Markdown テキストを ## 見出しでセクション分割 */
function parseSections(text: string): ParsedSection[] {
  const lines = text.split("\n");
  const sections: ParsedSection[] = [];
  let currentTitle = "";
  let currentLines: string[] = [];

  for (const line of lines) {
    const headerMatch = line.match(/^#{1,3}\s+(.+)/);
    if (headerMatch) {
      if (currentTitle || currentLines.length > 0) {
        sections.push({ title: currentTitle, content: currentLines.join("\n").trim() });
      }
      currentTitle = headerMatch[1].replace(/\*\*/g, "").trim();
      currentLines = [];
    } else {
      currentLines.push(line);
    }
  }
  if (currentTitle || currentLines.length > 0) {
    sections.push({ title: currentTitle, content: currentLines.join("\n").trim() });
  }
  return sections.filter((s) => s.content.length > 0);
}

/** セクションタイトルからアイコンを推定 */
function getSectionIcon(title: string): React.ReactNode {
  const t = title.toLowerCase();
  if (t.includes("評判") || t.includes("知名度") || t.includes("ポジション")) return <User className="h-4 w-4 shrink-0" />;
  if (t.includes("コラボ") || t.includes("案件") || t.includes("実績")) return <Handshake className="h-4 w-4 shrink-0" />;
  if (t.includes("炎上") || t.includes("スキャンダル") || t.includes("論争") || t.includes("リスク")) return <AlertTriangle className="h-4 w-4 shrink-0" />;
  if (t.includes("sns") || t.includes("twitter") || t.includes("instagram") || t.includes("影響力")) return <MessageCircle className="h-4 w-4 shrink-0" />;
  if (t.includes("親和性") || t.includes("ブランド")) return <Link className="h-4 w-4 shrink-0" />;
  if (t.includes("視聴者") || t.includes("ファン") || t.includes("コミュニティ")) return <Users className="h-4 w-4 shrink-0" />;
  if (t.includes("比較") || t.includes("ジャンル")) return <BarChart3 className="h-4 w-4 shrink-0" />;
  if (t.includes("経歴") || t.includes("活動") || t.includes("変遷")) return <ScrollText className="h-4 w-4 shrink-0" />;
  if (t.includes("企画") || t.includes("キャラ") || t.includes("人柄") || t.includes("得意")) return <Lightbulb className="h-4 w-4 shrink-0" />;
  return <FileText className="h-4 w-4 shrink-0" />;
}

/** セクション内容の先頭を1行サマリーとして抽出 */
function extractSummaryLine(content: string): string {
  const lines = content.split("\n").filter((l) => l.trim());
  if (lines.length === 0) return "";
  let first = lines[0].trim();
  // リストマーカーを除去
  first = first.replace(/^[-*•]\s+/, "").replace(/^\d+\.\s+/, "");
  // 長すぎる場合は切り詰め
  if (first.length > 80) first = first.slice(0, 80) + "…";
  return first;
}

/** Markdown のインラインフォーマットをReact要素に変換 */
function renderInlineMarkdown(text: string): React.ReactNode[] {
  const parts: React.ReactNode[] = [];
  const regex = /\*\*(.+?)\*\*/g;
  let lastIndex = 0;
  let match;

  while ((match = regex.exec(text)) !== null) {
    if (match.index > lastIndex) {
      parts.push(text.slice(lastIndex, match.index));
    }
    parts.push(<strong key={match.index} className="text-foreground font-semibold">{match[1]}</strong>);
    lastIndex = regex.lastIndex;
  }
  if (lastIndex < text.length) {
    parts.push(text.slice(lastIndex));
  }
  return parts.length > 0 ? parts : [text];
}

/** セクション内容をリスト/段落として描画 */
function renderContent(content: string) {
  const lines = content.split("\n");
  const elements: React.ReactNode[] = [];
  let listItems: string[] = [];
  let listType: "ul" | "ol" | null = null;

  const flushList = () => {
    if (listItems.length === 0) return;
    const Tag = listType === "ol" ? "ol" : "ul";
    const cls = listType === "ol" ? "list-decimal" : "list-disc";
    elements.push(
      <Tag key={`list-${elements.length}`} className={`${cls} pl-5 space-y-1 text-sm text-muted-foreground`}>
        {listItems.map((item, i) => (
          <li key={i}>{renderInlineMarkdown(item)}</li>
        ))}
      </Tag>
    );
    listItems = [];
    listType = null;
  };

  for (const line of lines) {
    const trimmed = line.trim();
    if (!trimmed) {
      flushList();
      continue;
    }

    const olMatch = trimmed.match(/^\d+\.\s+(.+)/);
    if (olMatch) {
      if (listType && listType !== "ol") flushList();
      listType = "ol";
      listItems.push(olMatch[1]);
      continue;
    }

    const ulMatch = trimmed.match(/^[-*•]\s+(.+)/);
    if (ulMatch) {
      if (listType && listType !== "ul") flushList();
      listType = "ul";
      listItems.push(ulMatch[1]);
      continue;
    }

    flushList();
    elements.push(
      <p key={`p-${elements.length}`} className="text-sm text-muted-foreground">
        {renderInlineMarkdown(trimmed)}
      </p>
    );
  }
  flushList();

  return <div className="space-y-2">{elements}</div>;
}

/** 個別セクションの折りたたみ表示 */
function SectionAccordion({ section }: { section: ParsedSection }) {
  const [open, setOpen] = useState(false);
  const summary = extractSummaryLine(section.content);

  return (
    <div className="rounded-lg border bg-muted/30 overflow-hidden">
      <button
        type="button"
        className="w-full flex items-start gap-2 p-3 text-left hover:bg-muted/50 transition-colors"
        onClick={() => setOpen(!open)}
      >
        {open
          ? <ChevronDown className="h-4 w-4 mt-0.5 shrink-0 text-muted-foreground" />
          : <ChevronRight className="h-4 w-4 mt-0.5 shrink-0 text-muted-foreground" />
        }
        {getSectionIcon(section.title)}
        <div className="flex-1 min-w-0">
          <span className="font-medium text-sm text-foreground">{section.title}</span>
          {!open && summary && (
            <p className="text-xs text-muted-foreground mt-0.5 truncate">{summary}</p>
          )}
        </div>
      </button>
      {open && (
        <div className="px-3 pb-3 pl-9">
          {renderContent(section.content)}
        </div>
      )}
    </div>
  );
}

export function ResearchSummary({ creatorResearch, researchMode }: ResearchSummaryProps) {
  const config = MODE_CONFIG[researchMode];
  if (!config) return null;

  const sections = useMemo(() => parseSections(creatorResearch), [creatorResearch]);
  const hasSections = sections.length > 1 || (sections.length === 1 && sections[0].title);
  const [showAll, setShowAll] = useState(false);
  const toggleShowAll = useCallback(() => setShowAll((v) => !v), []);

  // セクション分割できない場合はフォールバック表示
  if (!hasSections) {
    return (
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-lg flex items-center gap-2">
            {config.icon}
            {config.label}
          </CardTitle>
        </CardHeader>
        <CardContent>
          {renderContent(creatorResearch)}
        </CardContent>
      </Card>
    );
  }

  const visibleSections = showAll ? sections : sections.slice(0, 4);

  return (
    <Card>
      <CardHeader className="pb-3">
        <CardTitle className="text-lg flex items-center gap-2">
          {config.icon}
          {config.label}
        </CardTitle>
        <p className="text-xs text-muted-foreground mt-1">
          {sections.length}項目の調査結果 — 各項目をクリックして詳細を表示
        </p>
      </CardHeader>
      <CardContent className="space-y-2">
        {visibleSections.map((section, i) => (
          <SectionAccordion key={i} section={section} />
        ))}

        {sections.length > 4 && (
          <button
            type="button"
            className="w-full text-center text-xs text-muted-foreground hover:text-foreground py-2 transition-colors"
            onClick={toggleShowAll}
          >
            {showAll ? "折りたたむ" : `他${sections.length - 4}項目を表示`}
          </button>
        )}
      </CardContent>
    </Card>
  );
}
