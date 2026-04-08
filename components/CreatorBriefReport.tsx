"use client";

import { forwardRef } from "react";
import { CampaignOverview, CampaignRules, CreativeDirection } from "@/lib/types";

export interface CreatorBriefProps {
  brandName: string;
  channelName: string;
  campaignOverview?: CampaignOverview;
  campaignRules?: CampaignRules;
  brandAlignmentReasoning: string;
  contentStyleSummary?: string;
  strengths?: string[];
}

const ACCENT = "#4f46e5";
const ACCENT_DARK = "#1e1b4b";

const sectionTitle: React.CSSProperties = {
  fontSize: "14px",
  fontWeight: 700,
  marginBottom: "10px",
  paddingBottom: "6px",
  borderBottom: `2px solid ${ACCENT}`,
  color: ACCENT_DARK,
};

const labelStyle: React.CSSProperties = {
  fontSize: "10px",
  fontWeight: 600,
  color: "#6b7280",
  marginBottom: "2px",
};

const valueStyle: React.CSSProperties = {
  fontSize: "11px",
  color: "#1a1a1a",
  marginBottom: "8px",
  lineHeight: 1.6,
};

const listItem: React.CSSProperties = {
  fontSize: "11px",
  color: "#1a1a1a",
  paddingLeft: "8px",
  marginBottom: "3px",
  lineHeight: 1.5,
};

function CreativeDirectionSection({ direction, channelName }: { direction: CreativeDirection; channelName: string }) {
  return (
    <div>
      <div style={{ fontSize: "12px", fontWeight: 700, color: ACCENT_DARK, marginBottom: "10px" }}>
        {channelName} 様のクリエイティブ方向性
      </div>

      {/* 戦略的ナラティブ — メインの出力 */}
      <div
        style={{
          padding: "12px 14px",
          background: "#eff6ff",
          borderLeft: `4px solid ${ACCENT}`,
          borderRadius: "0 6px 6px 0",
          marginBottom: "12px",
        }}
      >
        <div style={{ fontSize: "10px", fontWeight: 600, color: ACCENT, marginBottom: "4px" }}>
          戦略的ナラティブ
        </div>
        <p style={{ fontSize: "11px", color: "#1e3a5f", lineHeight: 1.7, margin: 0 }}>
          {direction.strategicNarrative}
        </p>
      </div>

      {/* 3カラム: 世界観 / 接点 / 推奨角度 */}
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: "10px", marginBottom: "10px" }}>
        <div>
          <div style={labelStyle}>{channelName}さんの世界観</div>
          <div style={valueStyle}>{direction.creatorWorldview}</div>
        </div>
        <div>
          <div style={labelStyle}>ブランドとの接点</div>
          <div style={valueStyle}>{direction.connectionPoint}</div>
        </div>
        <div>
          <div style={labelStyle}>推奨する角度</div>
          <div style={valueStyle}>{direction.suggestedAngle}</div>
        </div>
      </div>

      {/* 注意事項 */}
      <div
        style={{
          padding: "8px 12px",
          background: "#fef9ee",
          borderLeft: "3px solid #f59e0b",
          borderRadius: "0 4px 4px 0",
          fontSize: "10px",
          color: "#92400e",
          lineHeight: 1.6,
        }}
      >
        <span style={{ fontWeight: 600 }}>&#x26A0; ご留意点: </span>
        {direction.avoidanceNote}
      </div>
    </div>
  );
}

function ContentAnalysisSection({ contentStyleSummary, strengths, channelName }: { contentStyleSummary: string; strengths: string[]; channelName: string }) {
  const displayStrengths = strengths.slice(0, 3);

  return (
    <div>
      <div style={{ fontSize: "12px", fontWeight: 700, color: "#4338ca", marginBottom: "10px" }}>
        {channelName} 様のコンテンツを拝見して
      </div>

      <p style={{ fontSize: "11px", color: "#312e81", lineHeight: 1.7, marginBottom: "12px" }}>
        {contentStyleSummary}
      </p>

      {displayStrengths.length > 0 && (
        <div>
          <div style={{ fontSize: "10px", fontWeight: 600, color: "#4338ca", marginBottom: "6px" }}>
            特に注目しているポイント
          </div>
          {displayStrengths.map((s, i) => (
            <div key={i} style={{ ...listItem, color: "#312e81", paddingLeft: "12px", position: "relative" }}>
              <span style={{ position: "absolute", left: 0, color: "#6366f1" }}>&#x2022;</span>
              {s}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

function InspirationSeedsSection({ seeds }: { seeds: string[] }) {
  return (
    <div>
      <div style={{ fontSize: "12px", fontWeight: 700, color: "#92400e", marginBottom: "10px" }}>
        企画のヒント
      </div>
      <p style={{ fontSize: "10px", color: "#78350f", marginBottom: "10px", lineHeight: 1.5 }}>
        以下は企画を考える際の「種」です。具体的な企画案ではなく、思考のきっかけとしてご活用ください。
      </p>
      {seeds.map((seed, i) => (
        <div
          key={i}
          style={{
            padding: "8px 12px",
            background: "#fffbeb",
            borderLeft: "3px solid #f59e0b",
            borderRadius: "0 4px 4px 0",
            marginBottom: "6px",
            fontSize: "11px",
            color: "#78350f",
            lineHeight: 1.6,
          }}
        >
          {seed}
        </div>
      ))}
    </div>
  );
}

export const CreatorBriefReport = forwardRef<HTMLDivElement, CreatorBriefProps>(
  function CreatorBriefReport({ brandName, channelName, campaignOverview, campaignRules, brandAlignmentReasoning, contentStyleSummary, strengths }, ref) {
    const today = new Date().toLocaleDateString("ja-JP", {
      year: "numeric",
      month: "long",
      day: "numeric",
    });

    const hasContentAnalysis = !!contentStyleSummary;
    const hasCreativeDirection = !!campaignRules?.creativeDirection;
    const hasInspirationSeeds = !!(campaignRules?.inspirationSeeds && campaignRules.inspirationSeeds.length > 0);
    const hasPostingRules = !!(campaignRules && (campaignRules.universalMustDo.length > 0 || campaignRules.universalMustNot.length > 0));

    return (
      <div
        ref={ref}
        style={{
          width: "210mm",
          background: "#fff",
          color: "#1a1a1a",
          fontFamily: "'Helvetica Neue', Arial, 'Hiragino Kaku Gothic ProN', sans-serif",
          fontSize: "11px",
          lineHeight: 1.6,
        }}
      >
        {/* ヘッダー */}
        <div data-section="header" style={{ padding: "15mm 20mm 10mm" }}>
          <div
            style={{
              position: "absolute",
              top: 0,
              left: 0,
              right: 0,
              height: "4px",
              background: `linear-gradient(90deg, ${ACCENT}, #7c3aed)`,
            }}
          />
          <div style={{ fontSize: "10px", color: "#6b7280", letterSpacing: "0.1em", marginBottom: "8px" }}>
            CREATOR COLLABORATION BRIEF
          </div>
          <div style={{ fontSize: "22px", fontWeight: 700, color: ACCENT_DARK, marginBottom: "4px" }}>
            {brandName} × {channelName}
          </div>
          <div style={{ fontSize: "13px", color: "#6b7280", marginBottom: "12px" }}>
            コラボレーションブリーフ
          </div>
          <div style={{ display: "flex", gap: "16px", fontSize: "10px", color: "#9ca3af" }}>
            <span>作成日: {today}</span>
          </div>
        </div>

        {/* スタンスの明示 */}
        <div data-section="stance" style={{ padding: "6mm 20mm" }}>
          <div
            style={{
              padding: "14px 16px",
              background: "#f0fdf4",
              borderLeft: "4px solid #22c55e",
              borderRadius: "0 8px 8px 0",
            }}
          >
            <div style={{ fontSize: "12px", fontWeight: 600, color: "#15803d", marginBottom: "6px" }}>
              このブリーフについて
            </div>
            <p style={{ fontSize: "11px", color: "#166534", lineHeight: 1.7 }}>
              本ブリーフはコラボレーションの方向性をお伝えするためのガイドです。
              最終的な企画・構成は {channelName} 様の世界観と判断にお任せします。
              「投稿指示書」として最低限お守りいただきたい事項をまとめておりますので、
              そちらをご確認のうえ、自由にコンテンツをご制作ください。
            </p>
          </div>
        </div>

        {/* 施策概要 */}
        {campaignOverview && (
          <div data-section="campaign" style={{ padding: "8mm 20mm" }}>
            <h2 style={sectionTitle}>施策概要</h2>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "12px" }}>
              <div>
                <div style={labelStyle}>目的</div>
                <div style={valueStyle}>{campaignOverview.objective}</div>
              </div>
              <div>
                <div style={labelStyle}>ターゲット</div>
                <div style={valueStyle}>{campaignOverview.targetAudience}</div>
              </div>
              <div>
                <div style={labelStyle}>課題感・背景</div>
                <div style={valueStyle}>{campaignOverview.challenge}</div>
              </div>
              <div>
                <div style={labelStyle}>インサイト</div>
                <div style={valueStyle}>{campaignOverview.insight}</div>
              </div>
            </div>
          </div>
        )}

        {/* なぜこのクリエイターか */}
        {brandAlignmentReasoning && (
          <div data-section="why-you" style={{ padding: "8mm 20mm" }}>
            <div
              style={{
                padding: "14px 16px",
                background: "#fffbeb",
                borderLeft: "4px solid #f59e0b",
                borderRadius: "0 8px 8px 0",
              }}
            >
              <div style={{ fontSize: "12px", fontWeight: 600, color: "#92400e", marginBottom: "6px" }}>
                {channelName} 様にお声がけした理由
              </div>
              <p style={{ fontSize: "11px", color: "#78350f", lineHeight: 1.7 }}>
                {brandAlignmentReasoning}
              </p>
            </div>
          </div>
        )}

        {/* コンテンツ分析 — "○○様のコンテンツを拝見して" */}
        {hasContentAnalysis && (
          <div data-section="content-analysis" style={{ padding: "8mm 20mm" }}>
            <div
              style={{
                padding: "14px 16px",
                background: "#eef2ff",
                borderLeft: "4px solid #6366f1",
                borderRadius: "0 8px 8px 0",
              }}
            >
              <ContentAnalysisSection
                contentStyleSummary={contentStyleSummary!}
                strengths={strengths ?? []}
                channelName={channelName}
              />
            </div>
          </div>
        )}

        {/* クリエイティブ方向性 — 独立セクション */}
        {hasCreativeDirection && (
          <div data-section="creative-direction" style={{ padding: "8mm 20mm" }}>
            <h2 style={sectionTitle}>クリエイティブ方向性</h2>
            <CreativeDirectionSection
              direction={campaignRules!.creativeDirection!}
              channelName={channelName}
            />
          </div>
        )}

        {/* 企画のヒント — インスピレーションシード */}
        {hasInspirationSeeds && (
          <div data-section="inspiration-seeds" style={{ padding: "8mm 20mm" }}>
            <InspirationSeedsSection seeds={campaignRules!.inspirationSeeds!} />
          </div>
        )}

        {/* 投稿指示書 + 企画について + フッター（同一ページに収める） */}
        <div data-section="posting-and-closing" style={{ pageBreakInside: "avoid" }}>
          {hasPostingRules && (
            <div style={{ padding: "8mm 20mm 4mm" }}>
              <h2 style={sectionTitle}>投稿指示書</h2>
              <p style={{ ...valueStyle, color: "#6b7280", marginBottom: "12px" }}>
                全コンテンツに共通して適用されるルールです。企画の内容に関わらず、必ずお守りください。
              </p>
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "16px" }}>
                {campaignRules!.universalMustDo.length > 0 && (
                  <div>
                    <div style={{ fontSize: "11px", fontWeight: 600, color: "#166534", marginBottom: "6px" }}>
                      必須要件
                    </div>
                    {campaignRules!.universalMustDo.map((item, i) => (
                      <div key={i} style={listItem}>&#x2713; {item}</div>
                    ))}
                  </div>
                )}
                {campaignRules!.universalMustNot.length > 0 && (
                  <div>
                    <div style={{ fontSize: "11px", fontWeight: 600, color: "#991b1b", marginBottom: "6px" }}>
                      NG事項
                    </div>
                    {campaignRules!.universalMustNot.map((item, i) => (
                      <div key={i} style={listItem}>&#x2717; {item}</div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          )}

          {/* 企画について */}
          <div style={{ padding: "4mm 20mm 8mm" }}>
            <h2 style={sectionTitle}>企画について</h2>
            <p style={valueStyle}>
              企画の方向性は {channelName} 様にお任せいたします。
              {hasCreativeDirection && "上記のクリエイティブ方向性を参考に、"}
              {hasInspirationSeeds && "企画のヒントもご活用いただきながら、"}
              {channelName} 様ならではの視点と世界観を活かしたコンテンツをご制作ください。
            </p>
            <p style={{ ...valueStyle, fontStyle: "italic", color: "#6b7280" }}>
              ※参考企画案を別紙にてご用意しております。あわせてご参照ください。
            </p>
          </div>

          {/* フッター */}
          <div style={{ padding: "8mm 20mm", borderTop: "1px solid #e5e7eb", marginTop: "4mm" }}>
            <div style={{ fontSize: "9px", color: "#9ca3af", textAlign: "center" }}>
              本ブリーフは {channelName} 様向けに作成されたコラボレーションガイドです。
              ご不明点がございましたらお気軽にお問い合わせください。
            </div>
          </div>
        </div>
      </div>
    );
  }
);
