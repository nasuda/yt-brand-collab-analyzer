"use client";

import { useCallback, useState } from "react";

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

      const imgWidth = 210; // A4 width in mm
      const pageHeight = 297; // A4 height in mm
      const imgHeight = (canvas.height * imgWidth) / canvas.width;

      const pdf = new jsPDF("p", "mm", "a4");
      let heightLeft = imgHeight;
      let position = 0;

      pdf.addImage(canvas.toDataURL("image/png"), "PNG", 0, position, imgWidth, imgHeight);
      heightLeft -= pageHeight;

      while (heightLeft > 0) {
        position -= pageHeight;
        pdf.addPage();
        pdf.addImage(canvas.toDataURL("image/png"), "PNG", 0, position, imgWidth, imgHeight);
        heightLeft -= pageHeight;
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

      // 各セクションを個別にキャプチャしてページ分割
      const sections = reportElement.querySelectorAll<HTMLElement>("[data-section]");
      const pdf = new jsPDF("p", "mm", "a4");
      const imgWidth = 210;
      const pageHeight = 297;
      let isFirstPage = true;

      for (const section of sections) {
        const canvas = await html2canvas(section, {
          scale: 2,
          useCORS: true,
          logging: false,
          backgroundColor: "#ffffff",
          width: section.scrollWidth,
        });

        const imgHeight = (canvas.height * imgWidth) / canvas.width;

        if (!isFirstPage) {
          pdf.addPage();
        }

        // セクションが1ページに収まる場合はそのまま
        if (imgHeight <= pageHeight) {
          pdf.addImage(canvas.toDataURL("image/png"), "PNG", 0, 0, imgWidth, imgHeight);
        } else {
          // 複数ページにまたがる場合
          let heightLeft = imgHeight;
          let position = 0;

          pdf.addImage(canvas.toDataURL("image/png"), "PNG", 0, position, imgWidth, imgHeight);
          heightLeft -= pageHeight;

          while (heightLeft > 0) {
            position -= pageHeight;
            pdf.addPage();
            pdf.addImage(canvas.toDataURL("image/png"), "PNG", 0, position, imgWidth, imgHeight);
            heightLeft -= pageHeight;
          }
        }

        isFirstPage = false;
      }

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
