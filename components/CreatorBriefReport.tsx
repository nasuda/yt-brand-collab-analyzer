"use client";

import { forwardRef } from "react";
import { CampaignOverview, CampaignRules, CreativeDirection } from "@/lib/types";

export interface CreatorBriefProps {
  brandName: string;
  channelName: string;
  campaignOverview?: CampaignOverview;
  campaignRules?: CampaignRules;
  brandAlignmentReasoning: string;
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
    <div style={{ marginTop: "16px", paddingTop: "14px", borderTop: "1px dashed #d1d5db" }}>
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
          <div style={labelStyle}>あなたの世界観</div>
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
        <span style={{ fontWeight: 600 }}>&#x26A0; 注意: </span>
        {direction.avoidanceNote}
      </div>
    </div>
  );
}

export const CreatorBriefReport = forwardRef<HTMLDivElement, CreatorBriefProps>(
  function CreatorBriefReport({ brandName, channelName, campaignOverview, campaignRules, brandAlignmentReasoning }, ref) {
    const today = new Date().toLocaleDateString("ja-JP", {
      year: "numeric",
      month: "long",
      day: "numeric",
    });

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

        {/* なぜあなたか */}
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

        {/* 投稿指示書（共通ルール） */}
        {campaignRules && (campaignRules.universalMustDo.length > 0 || campaignRules.universalMustNot.length > 0 || campaignRules.creativeDirection) && (
          <div data-section="posting-rules" style={{ padding: "8mm 20mm" }}>
            <h2 style={sectionTitle}>投稿指示書</h2>
            <p style={{ ...valueStyle, color: "#6b7280", marginBottom: "12px" }}>
              全コンテンツに共通して適用されるルールです。企画の内容に関わらず、必ずお守りください。
            </p>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "16px" }}>
              {campaignRules.universalMustDo.length > 0 && (
                <div>
                  <div style={{ fontSize: "11px", fontWeight: 600, color: "#166534", marginBottom: "6px" }}>
                    必須要件
                  </div>
                  {campaignRules.universalMustDo.map((item, i) => (
                    <div key={i} style={listItem}>&#x2713; {item}</div>
                  ))}
                </div>
              )}
              {campaignRules.universalMustNot.length > 0 && (
                <div>
                  <div style={{ fontSize: "11px", fontWeight: 600, color: "#991b1b", marginBottom: "6px" }}>
                    NG事項
                  </div>
                  {campaignRules.universalMustNot.map((item, i) => (
                    <div key={i} style={listItem}>&#x2717; {item}</div>
                  ))}
                </div>
              )}
            </div>

            {/* クリエイティブ方向性 */}
            {campaignRules.creativeDirection && (
              <CreativeDirectionSection
                direction={campaignRules.creativeDirection}
                channelName={channelName}
              />
            )}
          </div>
        )}

        {/* 企画について */}
        <div data-section="ideas-note" style={{ padding: "8mm 20mm" }}>
          <h2 style={sectionTitle}>企画について</h2>
          <p style={valueStyle}>
            企画の方向性は {channelName} 様にお任せいたします。
            上記の施策概要・投稿指示書を踏まえたうえで、
            {channelName} 様ならではの視点と世界観を活かしたコンテンツをご制作ください。
          </p>
          <p style={{ ...valueStyle, fontStyle: "italic", color: "#6b7280" }}>
            ※参考企画案を別紙にてご用意しております。ご希望の場合はお声がけください。
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
    );
  }
);
