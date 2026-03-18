"use client";

import { forwardRef } from "react";
import { CollabIdea, CampaignOverview } from "@/lib/types";

export interface CreatorBriefProps {
  brandName: string;
  channelName: string;
  idea: CollabIdea;
  campaignOverview?: CampaignOverview;
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

export const CreatorBriefReport = forwardRef<HTMLDivElement, CreatorBriefProps>(
  function CreatorBriefReport({ brandName, channelName, idea, campaignOverview }, ref) {
    const pi = idea.postingInstruction;
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
        <div
          data-section="header"
          style={{ padding: "15mm 20mm 10mm" }}
        >
          {/* アクセントバー */}
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
            {idea.title}
          </div>
          <div style={{ fontSize: "13px", color: "#6b7280", marginBottom: "12px" }}>
            {brandName} × {channelName}
          </div>
          <div style={{ display: "flex", gap: "16px", fontSize: "10px", color: "#9ca3af" }}>
            <span>作成日: {today}</span>
            <span>フォーマット: {idea.format}</span>
          </div>
        </div>

        {/* クリエイターコンテキスト — なぜあなたか */}
        {pi.creatorContext && (
          <div data-section="context" style={{ padding: "8mm 20mm" }}>
            <div
              style={{
                padding: "14px 16px",
                background: "#fffbeb",
                borderLeft: `4px solid #f59e0b`,
                borderRadius: "0 8px 8px 0",
              }}
            >
              <div style={{ fontSize: "12px", fontWeight: 600, color: "#92400e", marginBottom: "6px" }}>
                この企画をあなたにお願いしたい理由
              </div>
              <p style={{ fontSize: "11px", color: "#78350f", lineHeight: 1.7 }}>
                {pi.creatorContext}
              </p>
            </div>
          </div>
        )}

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

        {/* 企画概要 */}
        <div data-section="idea" style={{ padding: "8mm 20mm" }}>
          <h2 style={sectionTitle}>企画概要</h2>
          <p style={valueStyle}>{idea.description}</p>
        </div>

        {/* 構成ガイド */}
        {pi.contentDirection && (
          <div data-section="direction" style={{ padding: "8mm 20mm" }}>
            <h2 style={sectionTitle}>構成ガイド</h2>
            <p style={{ fontSize: "11px", lineHeight: 1.7, whiteSpace: "pre-wrap" }}>
              {pi.contentDirection}
            </p>
          </div>
        )}

        {/* ブランド必須 / NG */}
        {(pi.brandMustDo?.length > 0 || pi.brandMustNot?.length > 0) && (
          <div data-section="requirements" style={{ padding: "8mm 20mm" }}>
            <h2 style={sectionTitle}>ブランド要件</h2>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "16px" }}>
              {pi.brandMustDo?.length > 0 && (
                <div>
                  <div style={{ fontSize: "11px", fontWeight: 600, color: "#166534", marginBottom: "6px" }}>
                    必須要件
                  </div>
                  {pi.brandMustDo.map((item, i) => (
                    <div key={i} data-sub-section style={listItem}>&#x2713; {item}</div>
                  ))}
                </div>
              )}
              {pi.brandMustNot?.length > 0 && (
                <div>
                  <div style={{ fontSize: "11px", fontWeight: 600, color: "#991b1b", marginBottom: "6px" }}>
                    NG事項
                  </div>
                  {pi.brandMustNot.map((item, i) => (
                    <div key={i} data-sub-section style={listItem}>&#x2717; {item}</div>
                  ))}
                </div>
              )}
            </div>
          </div>
        )}

        {/* クリエイターの自由裁量 */}
        {pi.creatorFreedom?.length > 0 && (
          <div data-section="freedom" style={{ padding: "8mm 20mm" }}>
            <h2 style={sectionTitle}>あなたにお任せする部分</h2>
            {pi.creatorFreedom.map((item, i) => (
              <div key={i} data-sub-section style={listItem}>&#x25CB; {item}</div>
            ))}
          </div>
        )}

        {/* 導入セリフ例 */}
        {pi.sampleOpening && (
          <div data-section="opening" style={{ padding: "8mm 20mm" }}>
            <div style={labelStyle}>導入セリフ例</div>
            <div
              style={{
                padding: "10px 14px",
                background: "#f9fafb",
                borderLeft: `3px solid ${ACCENT}`,
                borderRadius: "0 6px 6px 0",
                fontSize: "12px",
                fontStyle: "italic",
                color: "#374151",
              }}
            >
              &ldquo;{pi.sampleOpening}&rdquo;
            </div>
          </div>
        )}

        {/* キーメッセージ + トーン&マナー */}
        <div data-section="messages" style={{ padding: "8mm 20mm" }}>
          <h2 style={sectionTitle}>キーメッセージ & トーン</h2>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "16px" }}>
            <div>
              <div style={labelStyle}>伝えてほしいポイント</div>
              {pi.keyMessages.map((msg, i) => (
                <div key={i} data-sub-section style={listItem}>&#x2022; {msg}</div>
              ))}
            </div>
            {pi.toneAndManner && (
              <div>
                <div style={labelStyle}>トーン & マナー</div>
                <div style={valueStyle}>{pi.toneAndManner}</div>
              </div>
            )}
          </div>
        </div>

        {/* 概要欄テンプレート */}
        {pi.descriptionBoxSuggestion && (
          <div data-section="description" style={{ padding: "8mm 20mm" }}>
            <h2 style={sectionTitle}>概要欄テンプレート</h2>
            <pre
              style={{
                whiteSpace: "pre-wrap",
                fontFamily: "'Courier New', monospace",
                fontSize: "10px",
                lineHeight: 1.6,
                padding: "12px",
                background: "#f9fafb",
                border: "1px solid #e5e7eb",
                borderRadius: "6px",
              }}
            >
              {pi.descriptionBoxSuggestion}
            </pre>
          </div>
        )}

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
