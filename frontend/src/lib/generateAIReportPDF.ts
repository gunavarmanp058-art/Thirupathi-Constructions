import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";

interface ProjectData {
  name: string;
  health: string;
  completionPrediction: string;
  delayRisk: string;
  progress: number;
  aiInsight: string;
}

export function generateAIReportPDF(projects: ProjectData[], singleProject?: boolean) {
  const doc = new jsPDF();
  const pageWidth = doc.internal.pageSize.getWidth();

  // Brand header bar
  doc.setFillColor(34, 120, 74); // primary green
  doc.rect(0, 0, pageWidth, 32, "F");

  doc.setTextColor(255, 255, 255);
  doc.setFontSize(20);
  doc.setFont("helvetica", "bold");
  doc.text("Thirupathi Constructions", 14, 16);
  doc.setFontSize(10);
  doc.setFont("helvetica", "normal");
  doc.text("AI-Powered Project Health Report", 14, 24);

  // Date
  doc.setFontSize(9);
  doc.text(
    `Generated: ${new Date().toLocaleDateString("en-IN", { dateStyle: "full" })}`,
    pageWidth - 14,
    24,
    { align: "right" }
  );

  let y = 42;

  // Summary table (only for multi-project)
  if (!singleProject && projects.length > 1) {
    doc.setTextColor(34, 120, 74);
    doc.setFontSize(14);
    doc.setFont("helvetica", "bold");
    doc.text("Executive Summary", 14, y);
    y += 8;

    const healthy = projects.filter((p) => p.health === "Good").length;
    const atRisk = projects.filter((p) => p.health !== "Good").length;
    const avgProgress = Math.round(projects.reduce((s, p) => s + p.progress, 0) / projects.length);

    autoTable(doc, {
      startY: y,
      head: [["Metric", "Value"]],
      body: [
        ["Total Projects", String(projects.length)],
        ["Healthy", String(healthy)],
        ["At Risk", String(atRisk)],
        ["Average Progress", `${avgProgress}%`],
      ],
      theme: "grid",
      headStyles: { fillColor: [34, 120, 74], textColor: 255 },
      styles: { fontSize: 10 },
      margin: { left: 14, right: 14 },
    });

    y = (doc as any).lastAutoTable.finalY + 12;
  }

  // Per-project details
  projects.forEach((project, index) => {
    if (y > 240) {
      doc.addPage();
      y = 20;
    }

    // Project title
    doc.setTextColor(34, 120, 74);
    doc.setFontSize(13);
    doc.setFont("helvetica", "bold");
    doc.text(project.name, 14, y);
    y += 2;

    // Health badge
    const badgeColor: Record<string, [number, number, number]> = {
      Good: [34, 120, 74],
      "At Risk": [200, 140, 20],
      Critical: [200, 50, 50],
    };
    const color = badgeColor[project.health] || [100, 100, 100];
    doc.setFillColor(...color);
    const badgeX = pageWidth - 14 - doc.getTextWidth(project.health) - 8;
    doc.roundedRect(badgeX, y - 9, doc.getTextWidth(project.health) + 8, 12, 2, 2, "F");
    doc.setTextColor(255, 255, 255);
    doc.setFontSize(9);
    doc.text(project.health, badgeX + 4, y - 1);
    y += 6;

    // Details table
    autoTable(doc, {
      startY: y,
      body: [
        ["Completion Prediction", project.completionPrediction],
        ["Delay Risk", project.delayRisk],
        ["Progress", `${project.progress}%`],
      ],
      theme: "plain",
      styles: { fontSize: 10, cellPadding: 3 },
      columnStyles: {
        0: { fontStyle: "bold", textColor: [80, 80, 80], cellWidth: 55 },
        1: { textColor: [40, 40, 40] },
      },
      margin: { left: 14, right: 14 },
    });

    y = (doc as any).lastAutoTable.finalY + 4;

    // Progress bar
    const barWidth = pageWidth - 28;
    doc.setFillColor(230, 230, 230);
    doc.roundedRect(14, y, barWidth, 6, 2, 2, "F");
    doc.setFillColor(34, 120, 74);
    doc.roundedRect(14, y, barWidth * (project.progress / 100), 6, 2, 2, "F");
    doc.setTextColor(100, 100, 100);
    doc.setFontSize(8);
    doc.text(`${project.progress}%`, 14 + barWidth * (project.progress / 100) + 3, y + 5);
    y += 14;

    // AI Insight box
    doc.setFillColor(240, 248, 243);
    doc.roundedRect(14, y, pageWidth - 28, 24, 3, 3, "F");
    doc.setDrawColor(34, 120, 74);
    doc.setLineWidth(0.3);
    doc.roundedRect(14, y, pageWidth - 28, 24, 3, 3, "S");
    doc.setTextColor(34, 120, 74);
    doc.setFontSize(9);
    doc.setFont("helvetica", "bold");
    doc.text("AI Insight", 18, y + 7);
    doc.setFont("helvetica", "normal");
    doc.setTextColor(50, 50, 50);
    const insightLines = doc.splitTextToSize(project.aiInsight, pageWidth - 36);
    doc.text(insightLines, 18, y + 14);
    y += 32;

    if (index < projects.length - 1) {
      doc.setDrawColor(220, 220, 220);
      doc.line(14, y, pageWidth - 14, y);
      y += 8;
    }
  });

  // Footer
  const pageCount = doc.getNumberOfPages();
  for (let i = 1; i <= pageCount; i++) {
    doc.setPage(i);
    doc.setFontSize(8);
    doc.setTextColor(150, 150, 150);
    doc.text(
      `Thirupathi Constructions — Confidential  |  Page ${i} of ${pageCount}`,
      pageWidth / 2,
      doc.internal.pageSize.getHeight() - 8,
      { align: "center" }
    );
  }

  const filename = singleProject
    ? `ai-report-${projects[0].name.toLowerCase().replace(/\s+/g, "-")}.pdf`
    : "ai-report-all-projects.pdf";

  doc.save(filename);
}
