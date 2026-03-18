"use client";

import { forwardRef } from "react";
import { AnalysisResult } from "@/lib/types";

export interface ReportSettings {
  authorName: string;
  sections: Record<string, boolean>;
  collabIdeasCount: "top3" | "all";
  showDistributionStrategy?: boolean;
}

interface PrintableReportProps {
  result: AnalysisResult;
  settings: ReportSettings;
}

function formatNumber(n: number): string {
  if (n >= 1_000_000_000) return `${(n / 1_000_000_000).toFixed(1)}B`;
  if (n >= 1_000_000) return `${(n / 1_000_000).toFixed(1)}M`;
  if (n >= 1_000) return `${(n / 1_000).toFixed(1)}K`;
  return n.toLocaleString();
}

function scoreColor(score: number): string {
  if (score >= 70) return "#16a34a";
  if (score >= 40) return "#ca8a04";
  return "#dc2626";
}

function safetyBadge(rec: string): { bg: string; text: string } {
  switch (rec) {
    case "推奨":
      return { bg: "#dcfce7", text: "#166534" };
    case "非推奨":
      return { bg: "#fecaca", text: "#991b1b" };
    default:
      return { bg: "#fef9c3", text: "#854d0e" };
  }
}

const ACCENT_COLOR = "#4f46e5";
const ACCENT_DARK = "#1e1b4b";

export const PrintableReport = forwardRef<HTMLDivElement, PrintableReportProps>(
  function PrintableReport({ result, settings }, ref) {
    const { channel, videos, analysis, metrics, brandName } = result;
    const s = settings.sections;

    const ideas =
      settings.collabIdeasCount === "top3"
        ? analysis.collabIdeas.slice(0, 3)
        : analysis.collabIdeas;

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
        {/* 表紙 */}
        {s.cover !== false && (
          <div
            data-section="cover"
            style={{
              height: "297mm",
              display: "flex",
              flexDirection: "column",
              justifyContent: "center",
              alignItems: "center",
              padding: "40mm 20mm",
              textAlign: "center",
              position: "relative",
              overflow: "hidden",
            }}
          >
            {/* 上部アクセントバー */}
            <div
              style={{
                position: "absolute",
                top: 0,
                left: 0,
                right: 0,
                height: "6px",
                background: `linear-gradient(90deg, ${ACCENT_COLOR}, #7c3aed)`,
              }}
            />
            <div style={{ fontSize: "13px", color: "#6b7280", letterSpacing: "0.15em", marginBottom: "20px" }}>
              ブランドコラボレーション適合性レポート
            </div>
            <div style={{ fontSize: "30px", fontWeight: 700, color: ACCENT_DARK, marginBottom: "8px" }}>
              {brandName}
            </div>
            <div style={{ fontSize: "20px", color: "#6b7280", marginBottom: "24px" }}>
              × {channel.title}
            </div>
            {/* 装飾ライン */}
            <div
              style={{
                width: "60px",
                height: "3px",
                background: ACCENT_COLOR,
                margin: "0 auto 24px",
              }}
            />
            <div style={{ fontSize: "12px", color: "#9ca3af" }}>
              分析日: {today}
              {settings.authorName && ` | 作成者: ${settings.authorName}`}
            </div>
          </div>
        )}

        {/* エグゼクティブサマリー */}
        {s.summary !== false && (
          <div data-section="summary" style={{ padding: "15mm 20mm" }}>
            <h2 style={sectionTitle}>エグゼクティブサマリー</h2>

            <div style={{ display: "flex", alignItems: "center", gap: "24px", marginBottom: "20px" }}>
              <div
                style={{
                  width: "100px",
                  height: "100px",
                  borderRadius: "50%",
                  border: `6px solid ${scoreColor(analysis.overallScore)}`,
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  fontSize: "32px",
                  fontWeight: 700,
                  color: scoreColor(analysis.overallScore),
                  flexShrink: 0,
                }}
              >
                {analysis.overallScore}
              </div>
              <div style={{ flex: 1 }}>
                <div style={{ marginBottom: "8px" }}>
                  <span
                    style={{
                      display: "inline-block",
                      padding: "4px 12px",
                      borderRadius: "16px",
                      fontSize: "13px",
                      fontWeight: 600,
                      background: safetyBadge(analysis.brandSafety.recommendation).bg,
                      color: safetyBadge(analysis.brandSafety.recommendation).text,
                    }}
                  >
                    {analysis.brandSafety.recommendation}
                  </span>
                </div>
                <p style={{ fontSize: "12px", color: "#374151" }}>
                  {analysis.brandAlignmentReasoning.slice(0, 200)}
                  {analysis.brandAlignmentReasoning.length > 200 && "..."}
                </p>
              </div>
            </div>

            {/* 5軸スコアバー */}
            <div style={{ display: "grid", gap: "8px" }}>
              {([
                ["コンテンツ親和性", analysis.scoreBreakdown.contentAffinity],
                ["視聴者層の一致", analysis.scoreBreakdown.audienceMatch],
                ["エンゲージメント品質", analysis.scoreBreakdown.engagementQuality],
                ["ブランドセーフティ", analysis.scoreBreakdown.brandSafety],
                ["実行可能性", analysis.scoreBreakdown.feasibility],
              ] as const).map(([label, value]) => (
                <div key={label} style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                  <span style={{ width: "130px", fontSize: "11px" }}>{label}</span>
                  <div style={{ flex: 1, height: "8px", background: "#f3f4f6", borderRadius: "4px" }}>
                    <div
                      style={{
                        width: `${(value / 20) * 100}%`,
                        height: "100%",
                        background: scoreColor((value / 20) * 100),
                        borderRadius: "4px",
                      }}
                    />
                  </div>
                  <span style={{ width: "32px", textAlign: "right", fontSize: "11px", fontWeight: 600 }}>
                    {value}/20
                  </span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* 定量メトリクス */}
        {s.metrics !== false && metrics && (
          <div data-section="metrics" style={{ padding: "15mm 20mm" }}>
            <h2 style={sectionTitle}>定量エンゲージメント分析</h2>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: "12px" }}>
              {[
                ["エンゲージメント率", `${metrics.engagementRate}%`],
                ["平均再生数", formatNumber(metrics.avgViews)],
                ["登録者あたり再生率", metrics.viewsPerSubscriber.toFixed(2)],
                ["いいね率", `${metrics.likeRate}%`],
                ["コメント率", `${metrics.commentRate}%`],
                ["投稿頻度", metrics.postingFrequency],
              ].map(([label, value]) => (
                <div key={label} style={metricCard}>
                  <div style={{ fontSize: "10px", color: "#6b7280" }}>{label}</div>
                  <div style={{ fontSize: "20px", fontWeight: 700 }}>{value}</div>
                </div>
              ))}
            </div>
            <div style={{ marginTop: "12px", fontSize: "12px" }}>
              再生数トレンド: <strong>{metrics.viewTrend}</strong>
            </div>
          </div>
        )}

        {/* 分析対象動画 */}
        {s.videos !== false && videos.length > 0 && (
          <div data-section="videos" style={{ padding: "15mm 20mm" }}>
            <h2 style={sectionTitle}>分析対象動画（{videos.length}本）</h2>
            <table
              style={{
                width: "100%",
                borderCollapse: "collapse",
                fontSize: "10px",
              }}
            >
              <thead>
                <tr>
                  {["#", "タイトル", "公開日", "再生数", "いいね", "コメント"].map((h) => (
                    <th
                      key={h}
                      style={{
                        padding: "8px 6px",
                        textAlign: h === "タイトル" ? "left" : "right",
                        fontSize: "10px",
                        fontWeight: 700,
                        borderBottom: `2px solid ${ACCENT_COLOR}`,
                        color: ACCENT_DARK,
                        whiteSpace: "nowrap",
                      }}
                    >
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {videos.map((video, i) => (
                  <tr
                    key={video.id}
                    data-sub-section
                    style={{ background: i % 2 === 0 ? "#fff" : "#f9fafb" }}
                  >
                    <td style={{ ...tdStyle, textAlign: "right", color: "#9ca3af", width: "24px" }}>{i + 1}</td>
                    <td style={{ ...tdStyle, textAlign: "left", maxWidth: "280px" }}>
                      <div style={{ overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                        {video.title}
                      </div>
                    </td>
                    <td style={{ ...tdStyle, textAlign: "right", whiteSpace: "nowrap" }}>
                      {new Date(video.publishedAt).toLocaleDateString("ja-JP")}
                    </td>
                    <td style={{ ...tdStyle, textAlign: "right", fontWeight: 600 }}>{formatNumber(video.viewCount)}</td>
                    <td style={{ ...tdStyle, textAlign: "right" }}>{formatNumber(video.likeCount)}</td>
                    <td style={{ ...tdStyle, textAlign: "right" }}>{formatNumber(video.commentCount)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {/* カテゴリベンチマーク & オーディエンス */}
        {s.benchmark !== false && analysis.categoryBenchmark && (
          <div data-section="benchmark" style={{ padding: "15mm 20mm" }}>
            <h2 style={sectionTitle}>カテゴリベンチマーク & オーディエンス</h2>

            <div style={{ marginBottom: "16px" }}>
              <span style={{ display: "inline-block", padding: "4px 12px", borderRadius: "16px", background: "#ede9fe", color: "#5b21b6", fontWeight: 600, fontSize: "12px" }}>
                {analysis.categoryBenchmark.channelCategory}
              </span>
              <span style={{ marginLeft: "8px", fontSize: "12px", color: "#6b7280" }}>
                {analysis.categoryBenchmark.categoryTier}
              </span>
            </div>

            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "12px", marginBottom: "20px" }}>
              <div style={metricCard}>
                <div style={{ fontSize: "10px", color: "#6b7280" }}>エンゲージメント比較</div>
                <div style={{ fontSize: "11px", marginTop: "4px" }}>{analysis.categoryBenchmark.engagementComparison}</div>
              </div>
              <div style={metricCard}>
                <div style={{ fontSize: "10px", color: "#6b7280" }}>再生効率比較</div>
                <div style={{ fontSize: "11px", marginTop: "4px" }}>{analysis.categoryBenchmark.viewEfficiencyComparison}</div>
              </div>
            </div>

            <h3 style={{ fontSize: "14px", fontWeight: 600, marginBottom: "8px", color: ACCENT_DARK }}>推定オーディエンスペルソナ</h3>
            {analysis.audiencePersona.summary && (
              <p style={{ fontSize: "11px", color: "#374151", marginBottom: "12px" }}>
                {analysis.audiencePersona.summary}
              </p>
            )}
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "12px" }}>
              <div style={metricCard}>
                <div style={{ fontSize: "10px", color: "#6b7280" }}>年齢層</div>
                <div style={{ fontSize: "13px", fontWeight: 600 }}>{analysis.audiencePersona.estimatedAgeRange}</div>
              </div>
              <div style={metricCard}>
                <div style={{ fontSize: "10px", color: "#6b7280" }}>性別比</div>
                <div style={{ fontSize: "13px", fontWeight: 600 }}>{analysis.audiencePersona.estimatedGenderSplit}</div>
              </div>
              <div style={metricCard}>
                <div style={{ fontSize: "10px", color: "#6b7280" }}>地域</div>
                <div style={{ fontSize: "13px", fontWeight: 600 }}>{analysis.audiencePersona.estimatedRegion}</div>
              </div>
              <div style={metricCard}>
                <div style={{ fontSize: "10px", color: "#6b7280" }}>興味関心</div>
                <div style={{ fontSize: "11px", marginTop: "4px" }}>{analysis.audiencePersona.estimatedInterests.join(", ")}</div>
              </div>
            </div>

            {/* 類似クリエイター */}
            {analysis.similarCreators && analysis.similarCreators.length > 0 && (
              <div style={{ marginTop: "20px" }}>
                <h3 style={{ fontSize: "14px", fontWeight: 600, marginBottom: "8px", color: ACCENT_DARK }}>類似クリエイター</h3>
                {analysis.similarCreators.map((creator, i) => (
                  <div key={i} data-sub-section style={{ padding: "8px 12px", borderLeft: `3px solid #ede9fe`, marginBottom: "6px", background: "#fafafa", borderRadius: "0 6px 6px 0" }}>
                    <div style={{ fontSize: "12px", fontWeight: 600 }}>
                      {creator.name}
                      <span style={{ fontWeight: 400, color: "#6b7280", marginLeft: "6px" }}>{creator.handle}</span>
                    </div>
                    <div style={{ fontSize: "10px", color: "#6b7280", marginTop: "2px" }}>{creator.reason}</div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* ブランドセーフティ */}
        {s.safety !== false && (
          <div data-section="safety" style={{ padding: "15mm 20mm" }}>
            <h2 style={sectionTitle}>ブランドセーフティ</h2>
            <div style={{ display: "flex", alignItems: "center", gap: "16px", marginBottom: "16px" }}>
              <div style={{ fontSize: "28px", fontWeight: 700, color: scoreColor(analysis.brandSafety.safetyScore) }}>
                {analysis.brandSafety.safetyScore}/100
              </div>
              <span
                style={{
                  padding: "4px 12px",
                  borderRadius: "16px",
                  fontSize: "12px",
                  fontWeight: 600,
                  background: safetyBadge(analysis.brandSafety.recommendation).bg,
                  color: safetyBadge(analysis.brandSafety.recommendation).text,
                }}
              >
                {analysis.brandSafety.recommendation}
              </span>
            </div>
            {analysis.brandSafety.concerns.length > 0 && (
              <div>
                <h3 style={{ fontSize: "12px", fontWeight: 600, marginBottom: "8px" }}>懸念事項</h3>
                {analysis.brandSafety.concerns.map((concern, i) => (
                  <div key={i} data-sub-section style={{ padding: "8px 12px", border: "1px solid #e5e7eb", borderLeft: "3px solid #dc2626", borderRadius: "6px", marginBottom: "8px" }}>
                    <p style={{ fontSize: "11px" }}>{concern.description}</p>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* コラボ企画案 */}
        {s.ideas !== false && (
          <div data-section="ideas" style={{ padding: "15mm 20mm" }}>
            <h2 style={sectionTitle}>コラボ企画案 Top {ideas.length}</h2>
            {ideas.map((idea, i) => (
              <div
                key={i}
                data-sub-section
                style={{
                  borderLeft: `4px solid ${ACCENT_COLOR}`,
                  borderRadius: "0 8px 8px 0",
                  padding: "16px",
                  marginBottom: "16px",
                  background: "#fafafa",
                }}
              >
                <div style={{ display: "flex", alignItems: "center", gap: "8px", marginBottom: "8px" }}>
                  <span
                    style={{
                      display: "inline-flex",
                      alignItems: "center",
                      justifyContent: "center",
                      width: "24px",
                      height: "24px",
                      borderRadius: "50%",
                      background: ACCENT_COLOR,
                      color: "#fff",
                      fontSize: "12px",
                      fontWeight: 700,
                      flexShrink: 0,
                    }}
                  >
                    {i + 1}
                  </span>
                  <span style={{ fontSize: "14px", fontWeight: 700 }}>{idea.title}</span>
                  <span style={{ padding: "2px 8px", borderRadius: "12px", background: "#e5e7eb", fontSize: "10px" }}>
                    {idea.format}
                  </span>
                  <span style={{ padding: "2px 8px", borderRadius: "12px", background: "#ecfdf5", fontSize: "10px", color: "#065f46" }}>
                    実現性: {idea.feasibility}
                  </span>
                </div>

                {/* 新フィールドバッジ */}
                <div style={{ display: "flex", gap: "6px", marginBottom: "8px", flexWrap: "wrap" }}>
                  {idea.funnelStage && (
                    <span style={{ padding: "2px 8px", borderRadius: "12px", background: "#dbeafe", fontSize: "10px", color: "#1e40af" }}>
                      {idea.funnelStage}
                    </span>
                  )}
                  {idea.riskLevel && (
                    <span style={{ padding: "2px 8px", borderRadius: "12px", background: "#f1f5f9", fontSize: "10px", color: "#475569" }}>
                      {idea.riskLevel}
                    </span>
                  )}
                  {idea.campaignType && (
                    <span style={{ padding: "2px 8px", borderRadius: "12px", background: "#fef3c7", fontSize: "10px", color: "#92400e" }}>
                      {idea.campaignType}
                    </span>
                  )}
                </div>

                <p style={{ fontSize: "11px", marginBottom: "8px" }}>{idea.description}</p>
                <div style={{ fontSize: "10px", color: "#6b7280" }}>
                  <p><strong>期待効果:</strong> {idea.expectedImpact}</p>
                  <p><strong>KPI:</strong> {idea.targetKPI}</p>
                  <p><strong>着想元:</strong> {idea.basedOn}</p>
                  {idea.creatorPattern && <p><strong>クリエイターの型:</strong> {idea.creatorPattern}</p>}
                  {idea.viewerHook && <p><strong>視聴者フック:</strong> {idea.viewerHook}</p>}
                </div>

                {/* 投稿指示書 */}
                <div style={{ marginTop: "12px", padding: "10px", background: "#fff", border: "1px solid #e5e7eb", borderRadius: "6px" }}>
                  <div style={{ fontSize: "10px", fontWeight: 600, marginBottom: "6px", color: "#065f46" }}>投稿指示書</div>

                  {idea.postingInstruction.creatorContext && (
                    <div style={{ padding: "6px 8px", background: "#fffbeb", borderRadius: "4px", marginBottom: "6px" }}>
                      <p style={{ fontSize: "10px" }}><strong>クリエイターコンテキスト:</strong> {idea.postingInstruction.creatorContext}</p>
                    </div>
                  )}

                  <p style={{ fontSize: "10px" }}><strong>構成ガイド:</strong> {idea.postingInstruction.contentDirection}</p>

                  {idea.postingInstruction.brandMustDo?.length > 0 && (
                    <div style={{ marginTop: "4px" }}>
                      <p style={{ fontSize: "10px", fontWeight: 600, color: "#166534" }}>必須要件:</p>
                      {idea.postingInstruction.brandMustDo.map((item, j) => (
                        <p key={j} style={{ fontSize: "10px", paddingLeft: "8px" }}>&#x2713; {item}</p>
                      ))}
                    </div>
                  )}

                  {idea.postingInstruction.brandMustNot?.length > 0 && (
                    <div style={{ marginTop: "4px" }}>
                      <p style={{ fontSize: "10px", fontWeight: 600, color: "#991b1b" }}>NG:</p>
                      {idea.postingInstruction.brandMustNot.map((item, j) => (
                        <p key={j} style={{ fontSize: "10px", paddingLeft: "8px" }}>&#x2717; {item}</p>
                      ))}
                    </div>
                  )}

                  {idea.postingInstruction.creatorFreedom?.length > 0 && (
                    <div style={{ marginTop: "4px" }}>
                      <p style={{ fontSize: "10px", fontWeight: 600, color: "#5b21b6" }}>クリエイター自由裁量:</p>
                      {idea.postingInstruction.creatorFreedom.map((item, j) => (
                        <p key={j} style={{ fontSize: "10px", paddingLeft: "8px" }}>&#x25CB; {item}</p>
                      ))}
                    </div>
                  )}

                  {idea.postingInstruction.sampleOpening && (
                    <p style={{ fontSize: "10px", marginTop: "4px" }}><strong>導入例:</strong> &ldquo;{idea.postingInstruction.sampleOpening}&rdquo;</p>
                  )}

                  <p style={{ fontSize: "10px", marginTop: "4px" }}><strong>キーメッセージ:</strong> {idea.postingInstruction.keyMessages.join(" / ")}</p>
                  <p style={{ fontSize: "10px" }}><strong>トーン&マナー:</strong> {idea.postingInstruction.toneAndManner}</p>
                  {idea.postingInstruction.descriptionBoxSuggestion && (
                    <div style={{ fontSize: "10px" }}>
                      <strong>概要欄:</strong>
                      <pre style={{ whiteSpace: "pre-wrap", fontFamily: "inherit", margin: "4px 0 0", fontSize: "10px" }}>{idea.postingInstruction.descriptionBoxSuggestion}</pre>
                    </div>
                  )}
                </div>

                {/* 配信戦略 */}
                {settings.showDistributionStrategy !== false && (
                  <div style={{ marginTop: "8px", padding: "10px", background: "#fff", border: "1px solid #e5e7eb", borderRadius: "6px" }}>
                    <div style={{ fontSize: "10px", fontWeight: 600, marginBottom: "6px", color: "#1e40af" }}>配信戦略</div>
                    <p style={{ fontSize: "10px" }}><strong>広告:</strong> {idea.distributionStrategy.adProduct}</p>
                    {idea.distributionStrategy.mixStrategy && (
                      <p style={{ fontSize: "10px" }}><strong>ミックス方針:</strong> {idea.distributionStrategy.mixStrategy}</p>
                    )}
                    <p style={{ fontSize: "10px" }}><strong>ターゲティング:</strong> {idea.distributionStrategy.audienceTargeting}</p>
                    <p style={{ fontSize: "10px" }}><strong>予算配分:</strong> {idea.distributionStrategy.budgetAllocation}</p>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}

        {/* 強み & リスク */}
        {s.strengths !== false && (
          <div data-section="strengths" style={{ padding: "15mm 20mm" }}>
            <h2 style={sectionTitle}>強み & リスク</h2>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "16px" }}>
              <div>
                <h3 style={{ fontSize: "12px", fontWeight: 600, color: "#16a34a", marginBottom: "8px" }}>強み</h3>
                {analysis.strengths.map((str, i) => (
                  <div key={i} data-sub-section style={{ padding: "6px 0 6px 8px", borderLeft: "3px solid #16a34a", marginBottom: "4px", fontSize: "11px" }}>
                    {str}
                  </div>
                ))}
              </div>
              <div>
                <h3 style={{ fontSize: "12px", fontWeight: 600, color: "#dc2626", marginBottom: "8px" }}>リスク</h3>
                {analysis.risks.map((r, i) => (
                  <div key={i} data-sub-section style={{ padding: "6px 0 6px 8px", borderLeft: "3px solid #dc2626", marginBottom: "4px", fontSize: "11px" }}>
                    {r.description}
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}
      </div>
    );
  }
);

const sectionTitle: React.CSSProperties = {
  fontSize: "18px",
  fontWeight: 700,
  marginBottom: "16px",
  paddingBottom: "8px",
  borderBottom: `3px solid ${ACCENT_COLOR}`,
  color: ACCENT_DARK,
};

const metricCard: React.CSSProperties = {
  padding: "12px",
  border: "1px solid #e5e7eb",
  borderLeft: `3px solid ${ACCENT_COLOR}`,
  borderRadius: "0 8px 8px 0",
  background: "#fafafa",
};

const tdStyle: React.CSSProperties = {
  padding: "6px",
  borderBottom: "1px solid #f3f4f6",
};
