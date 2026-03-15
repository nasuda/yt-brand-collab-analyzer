"use client";

import { useCallback, useState } from "react";

const PAGE_WIDTH = 210; // A4 width in mm
const PAGE_HEIGHT = 297; // A4 height in mm
const MARGIN_TOP = 10; // Header accent bar area
const MARGIN_BOTTOM = 12; // Footer page number area
const USABLE_HEIGHT = PAGE_HEIGHT - MARGIN_TOP - MARGIN_BOTTOM; // 275mm
const ACCENT_COLOR_R = 79;
const ACCENT_COLOR_G = 70;
const ACCENT_COLOR_B = 229;

export function useExportPDF() {
  const [exporting, setExporting] = useState(false);

  const exportPDF = useCallback(async (elementId: string, filename: string) => {
    setExporting(true);
    try {
      const element = document.getElementById(elementId);
      if (!element) throw new Error("Export target not found");

      const html2canvas = (await import("html2canvas-pro")).default;
      const { jsPDF } = await import("jspdf");

      const canvas = await html2canvas(element, {
        scale: 2,
        useCORS: true,
        logging: false,
        backgroundColor: "#ffffff",
      });

      const imgWidth = PAGE_WIDTH;
      const imgHeight = (canvas.height * imgWidth) / canvas.width;

      const pdf = new jsPDF("p", "mm", "a4");
      let heightLeft = imgHeight;
      let position = 0;

      pdf.addImage(canvas.toDataURL("image/png"), "PNG", 0, position, imgWidth, imgHeight);
      heightLeft -= PAGE_HEIGHT;

      while (heightLeft > 0) {
        position -= PAGE_HEIGHT;
        pdf.addPage();
        pdf.addImage(canvas.toDataURL("image/png"), "PNG", 0, position, imgWidth, imgHeight);
        heightLeft -= PAGE_HEIGHT;
      }

      pdf.save(`${filename}.pdf`);
    } finally {
      setExporting(false);
    }
  }, []);

  /** PrintableReport 用: 一時的にDOMに追加 → html2canvas → PDF → 削除 */
  const exportReport = useCallback(async (reportElement: HTMLElement, filename: string) => {
    setExporting(true);
    try {
      const html2canvas = (await import("html2canvas-pro")).default;
      const { jsPDF } = await import("jspdf");

      // 一時的にDOMに追加して描画
      reportElement.style.position = "absolute";
      reportElement.style.left = "-9999px";
      reportElement.style.top = "0";
      document.body.appendChild(reportElement);

      const sections = reportElement.querySelectorAll<HTMLElement>("[data-section]");
      const pdf = new jsPDF("p", "mm", "a4");
      let currentY = MARGIN_TOP;
      let pageNum = 1;
      let isFirstPage = true;

      const html2canvasOpts = {
        scale: 2,
        useCORS: true,
        logging: false,
        backgroundColor: "#ffffff" as const,
      };

      function drawPageDecorations(isCover: boolean) {
        if (isCover) return;
        // ヘッダーアクセントバー
        pdf.setFillColor(ACCENT_COLOR_R, ACCENT_COLOR_G, ACCENT_COLOR_B);
        pdf.rect(0, 0, PAGE_WIDTH, 3, "F");
        // フッターページ番号
        pdf.setFontSize(8);
        pdf.setTextColor(156, 163, 175);
        pdf.text(`${pageNum}`, PAGE_WIDTH / 2, PAGE_HEIGHT - 5, { align: "center" });
      }

      function startNewPage(isCover: boolean) {
        if (!isFirstPage) {
          pdf.addPage();
        }
        isFirstPage = false;
        pageNum++;
        currentY = isCover ? 0 : MARGIN_TOP;
        drawPageDecorations(isCover);
      }

      function canvasToImgHeight(canvas: HTMLCanvasElement): number {
        return (canvas.height * PAGE_WIDTH) / canvas.width;
      }

      /** 単一キャンバスをページに配置。currentY が超えたら自動改ページ（数学的分割） */
      function placeCanvasOnPages(canvas: HTMLCanvasElement) {
        const imgH = canvasToImgHeight(canvas);
        const dataUrl = canvas.toDataURL("image/png");
        const remainingOnPage = (MARGIN_TOP + USABLE_HEIGHT) - currentY;

        if (imgH <= remainingOnPage) {
          // 現在ページに収まる
          pdf.addImage(dataUrl, "PNG", 0, currentY, PAGE_WIDTH, imgH);
          currentY += imgH;
        } else if (imgH <= USABLE_HEIGHT) {
          // 新ページに収まる
          startNewPage(false);
          pdf.addImage(dataUrl, "PNG", 0, currentY, PAGE_WIDTH, imgH);
          currentY += imgH;
        } else {
          // 複数ページにまたがる — 数学的分割
          let heightLeft = imgH;
          let offsetY = 0;

          // 現在ページの残り分を描画
          if (remainingOnPage > 20) {
            pdf.addImage(dataUrl, "PNG", 0, currentY - offsetY, PAGE_WIDTH, imgH);
            offsetY += remainingOnPage;
            heightLeft -= remainingOnPage;
          }

          while (heightLeft > 0) {
            startNewPage(false);
            pdf.addImage(dataUrl, "PNG", 0, currentY - offsetY, PAGE_WIDTH, imgH);
            const drawn = Math.min(USABLE_HEIGHT, heightLeft);
            offsetY += drawn;
            heightLeft -= drawn;
          }
          currentY = MARGIN_TOP + (imgH - (offsetY - (imgH - heightLeft - USABLE_HEIGHT)));
          // 簡略化: 最終ページでの currentY を計算
          const totalPages = Math.ceil(imgH / USABLE_HEIGHT);
          currentY = MARGIN_TOP + (imgH - (totalPages - 1) * USABLE_HEIGHT);
        }
      }

      for (const section of sections) {
        const sectionName = section.getAttribute("data-section");
        const isCover = sectionName === "cover";

        if (isCover) {
          // 表紙は常に専用ページ
          startNewPage(true);
          const canvas = await html2canvas(section, {
            ...html2canvasOpts,
            width: section.scrollWidth,
          });
          const imgH = canvasToImgHeight(canvas);
          pdf.addImage(canvas.toDataURL("image/png"), "PNG", 0, 0, PAGE_WIDTH, imgH);
          // 表紙の後は必ず改ページ
          currentY = MARGIN_TOP + USABLE_HEIGHT; // ページ満杯扱い
          continue;
        }

        // セクション全体をキャプチャ
        const canvas = await html2canvas(section, {
          ...html2canvasOpts,
          width: section.scrollWidth,
        });
        const imgH = canvasToImgHeight(canvas);
        const remainingOnPage = (MARGIN_TOP + USABLE_HEIGHT) - currentY;

        if (imgH <= remainingOnPage) {
          // 現ページに収まる
          pdf.addImage(canvas.toDataURL("image/png"), "PNG", 0, currentY, PAGE_WIDTH, imgH);
          currentY += imgH;
        } else if (imgH <= USABLE_HEIGHT) {
          // 新ページに収まる
          startNewPage(false);
          pdf.addImage(canvas.toDataURL("image/png"), "PNG", 0, currentY, PAGE_WIDTH, imgH);
          currentY += imgH;
        } else {
          // セクションがページに収まらない → sub-section で分割を試みる
          const subSections = section.querySelectorAll<HTMLElement>("[data-sub-section]");

          if (subSections.length > 0) {
            // セクションタイトル部分（sub-sectionの前のコンテンツ）をまずキャプチャ
            // sub-sectionを一時的に非表示にしてタイトル部分だけキャプチャ
            const origDisplay: string[] = [];
            subSections.forEach((sub) => {
              origDisplay.push(sub.style.display);
              sub.style.display = "none";
            });

            const headerCanvas = await html2canvas(section, {
              ...html2canvasOpts,
              width: section.scrollWidth,
            });
            const headerH = canvasToImgHeight(headerCanvas);

            // sub-sectionを復元
            subSections.forEach((sub, idx) => {
              sub.style.display = origDisplay[idx];
            });

            // ヘッダー部分を配置
            if (headerH > 5) {
              // ヘッダーが有意なサイズの場合のみ
              const headerRemaining = (MARGIN_TOP + USABLE_HEIGHT) - currentY;
              if (headerH > headerRemaining) {
                startNewPage(false);
              }
              pdf.addImage(headerCanvas.toDataURL("image/png"), "PNG", 0, currentY, PAGE_WIDTH, headerH);
              currentY += headerH;
            }

            // 各sub-sectionを個別にキャプチャして配置
            for (const sub of subSections) {
              const subCanvas = await html2canvas(sub, {
                ...html2canvasOpts,
                width: sub.scrollWidth,
              });
              placeCanvasOnPages(subCanvas);
            }
          } else {
            // sub-sectionがない場合は数学的分割にフォールバック
            placeCanvasOnPages(canvas);
          }
        }
      }

      // 最初のページにもデコレーションを描画（表紙でない場合）
      // 注: 最初のページが表紙の場合、decorationsは既に処理済み

      pdf.save(`${filename}.pdf`);
    } finally {
      // DOM から削除
      if (reportElement.parentNode) {
        reportElement.parentNode.removeChild(reportElement);
      }
      setExporting(false);
    }
  }, []);

  return { exportPDF, exportReport, exporting };
}
