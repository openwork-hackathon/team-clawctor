import type { DetailedAssessment, TaskData, RiskItem } from "./ai-report-generator";

// Helper function to escape HTML
function escapeHtml(text: string): string {
  const htmlEntities: Record<string, string> = {
    "&": "&amp;",
    "<": "&lt;",
    ">": "&gt;",
    '"': "&quot;",
    "'": "&#39;",
  };
  return text.replace(/[&<>"']/g, (char) => htmlEntities[char] || char);
}

// Generate risk table rows
function generateRiskRows(risks: RiskItem[]): string {
  return risks
    .map((risk) => {
      const severityClass =
        risk.level === "HIGH"
          ? "bg-red-100 text-red-700 dark:bg-red-900/40 dark:text-red-300"
          : risk.level === "MEDIUM"
            ? "bg-orange-100 text-orange-700 dark:bg-orange-900/40 dark:text-orange-300"
            : "bg-yellow-100 text-yellow-700 dark:bg-yellow-900/40 dark:text-yellow-300";
      const dotClass =
        risk.level === "HIGH"
          ? "bg-red-600"
          : risk.level === "MEDIUM"
            ? "bg-orange-600"
            : "bg-yellow-600";
      const cvssClass =
        risk.level === "HIGH"
          ? "text-red-600"
          : risk.level === "MEDIUM"
            ? "text-orange-600"
            : "text-yellow-600";
      const pulseClass = risk.level === "HIGH" ? " animate-pulse" : "";

      return `<tr class="hover:bg-gray-50/50 dark:hover:bg-white/5 transition-colors">
  <td class="px-6 py-4">
    <span class="inline-flex items-center gap-1.5 px-2 py-1 rounded text-[11px] font-black uppercase ${severityClass}">
      <span class="size-1.5 rounded-full ${dotClass}${pulseClass}"></span> ${risk.level}
    </span>
  </td>
  <td class="px-6 py-4 font-bold text-sm dark:text-gray-200">${escapeHtml(risk.description)}</td>
  <td class="px-6 py-4 text-sm text-[#617589] font-medium">${escapeHtml(risk.category)}</td>
  <td class="px-6 py-4 text-sm font-black text-center ${cvssClass}">${risk.cvss?.toFixed(1) || "N/A"}</td>
  <td class="px-6 py-4 text-right">
    <button class="text-primary hover:underline text-sm font-bold">Details</button>
  </td>
</tr>`;
    })
    .join("\n");
}

// Generate category health bars
function generateCategoryBars(categories: DetailedAssessment["categoryHealth"]): string {
  return categories
    .map((cat) => {
      const colorClass =
        cat.score >= 80
          ? "bg-green-500"
          : cat.score >= 60
            ? "bg-primary"
            : cat.score >= 40
              ? "bg-orange-500"
              : "bg-red-500";
      const textColorClass =
        cat.score >= 80
          ? "text-green-500"
          : cat.score >= 60
            ? "text-primary"
            : cat.score >= 40
              ? "text-orange-500"
              : "text-red-500";

      return `<div class="space-y-2">
  <div class="flex justify-between text-sm">
    <span class="font-bold dark:text-gray-200">${escapeHtml(cat.name)}</span>
    <span class="font-bold ${textColorClass}">${cat.score}%</span>
  </div>
  <div class="w-full h-2 bg-gray-100 dark:bg-gray-700 rounded-full overflow-hidden">
    <div class="h-full ${colorClass} rounded-full" style="width: ${cat.score}%"></div>
  </div>
</div>`;
    })
    .join("\n");
}

// Generate remediation roadmap items
function generateRoadmapItems(roadmap: DetailedAssessment["remediationRoadmap"]): string {
  return roadmap
    .map((phase, index) => {
      const isFirst = index === 0;
      const dotClass = isFirst ? "bg-primary" : "bg-gray-300 dark:bg-gray-600";
      const cardClass = isFirst ? "bg-white dark:bg-[#1e293b]" : "bg-white/60 dark:bg-[#1e293b]/60";
      const labelClass = isFirst ? "text-primary" : "text-[#617589]";
      const urgencyClass = isFirst ? "text-red-500" : "text-[#617589]";

      return `<div class="relative">
  <div class="absolute -left-[28px] top-1 size-5 rounded-full ${dotClass} border-4 border-white dark:border-background-dark shadow-sm"></div>
  <div class="${cardClass} rounded-xl p-5 border border-[#dbe0e6] dark:border-white/5 shadow-sm">
    <div class="flex justify-between items-start mb-2">
      <span class="text-xs font-black ${labelClass} uppercase tracking-wider">Phase ${phase.phase}: ${escapeHtml(phase.title)}</span>
      <span class="text-xs font-bold ${urgencyClass}">${escapeHtml(phase.urgency)}</span>
    </div>
    <h4 class="font-bold dark:text-gray-200">${escapeHtml(phase.title)}</h4>
    <p class="text-sm text-[#617589] mt-2 font-medium">${escapeHtml(phase.description)} Expected Score Boost: <strong>${escapeHtml(phase.expectedBoost)}</strong></p>
  </div>
</div>`;
    })
    .join("\n");
}

// Generate critical risk section
function generateCriticalRiskSection(criticalRisk: RiskItem | undefined): string {
  if (!criticalRisk) return "";

  return `<section class="mb-12">
  <div class="bg-white dark:bg-[#1e293b] rounded-xl border-l-4 border-red-500 shadow-md p-8">
    <div class="flex justify-between items-start mb-6">
      <div>
        <h3 class="text-xl font-bold dark:text-white flex items-center gap-2">
          Finding: ${escapeHtml(criticalRisk.description)}
          <span class="material-symbols-outlined text-red-500">lock_open</span>
        </h3>
        <p class="text-[#617589] text-sm mt-1">Category: ${escapeHtml(criticalRisk.category)}</p>
      </div>
      <span class="px-3 py-1 rounded-full bg-gray-100 dark:bg-gray-800 text-xs font-bold text-gray-500">CVSS: ${criticalRisk.cvss?.toFixed(1) || "N/A"}</span>
    </div>
    <div class="mb-4">
      <h4 class="text-xs font-black uppercase text-[#617589] mb-3 tracking-widest">Remediation Suggestion</h4>
      <p class="text-sm dark:text-gray-300">${escapeHtml(criticalRisk.remediation || "Contact security team for detailed remediation steps.")}</p>
    </div>
  </div>
</section>`;
}

// Main function to generate the full HTML report
export function generateReportHTML(task: TaskData, assessment: DetailedAssessment): string {
  const reportId = `OC-${task.id.slice(-6).toUpperCase()}`;
  const reportDate = task.createdAt.toLocaleDateString("en-US", {
    year: "numeric",
    month: "short",
    day: "numeric",
  });
  const totalRisks = task.highRiskCount + task.mediumRiskCount + task.lowRiskCount;
  const currentYear = new Date().getFullYear();

  const riskRows = generateRiskRows(assessment.risks);
  const categoryBars = generateCategoryBars(assessment.categoryHealth);
  const roadmapItems = generateRoadmapItems(assessment.remediationRoadmap);
  const criticalRisk = assessment.risks.find((r) => r.level === "HIGH");
  const criticalRiskSection = generateCriticalRiskSection(criticalRisk);

  const summaryParagraphs = assessment.executiveSummary
    .split("\n")
    .filter((p) => p.trim())
    .map((p) => `<p class="mb-4">${escapeHtml(p)}</p>`)
    .join("");

  return `<!DOCTYPE html>
<html class="light" lang="en">
<head>
  <meta charset="utf-8"/>
  <meta content="width=device-width, initial-scale=1.0" name="viewport"/>
  <title>Security Health Check Report - ${escapeHtml(task.companyName)}</title>
  <script src="https://cdn.tailwindcss.com?plugins=forms,container-queries"></script>
  <link href="https://fonts.googleapis.com/css2?family=Manrope:wght@200..800&display=swap" rel="stylesheet"/>
  <link href="https://fonts.googleapis.com/css2?family=Material+Symbols+Outlined:wght,FILL@100..700,0..1&display=swap" rel="stylesheet"/>
  <script>
    tailwind.config = {
      darkMode: "class",
      theme: {
        extend: {
          colors: {
            "primary": "#137fec",
            "background-light": "#f6f7f8",
            "background-dark": "#101922",
          },
          fontFamily: {
            "display": ["Manrope", "sans-serif"]
          },
        },
      },
    }
  </script>
  <style>
    body { font-family: 'Manrope', sans-serif; }
    .scroll-section { scroll-margin-top: 100px; }
    @media print { .no-print { display: none !important; } }
  </style>
</head>
<body class="bg-background-light dark:bg-background-dark text-[#111418] dark:text-white transition-colors duration-200">
  <div class="relative flex h-auto min-h-screen w-full flex-col overflow-x-hidden">
    <div class="layout-container flex h-full grow flex-col">
      <!-- Header -->
      <header class="sticky top-0 z-50 flex items-center justify-between whitespace-nowrap border-b border-solid border-[#dbe0e6] dark:border-[#2a343d] bg-white/80 dark:bg-background-dark/80 backdrop-blur-md px-4 lg:px-10 py-3 no-print">
        <div class="flex items-center gap-4 text-primary">
          <div class="size-8">
            <svg fill="none" viewBox="0 0 48 48" xmlns="http://www.w3.org/2000/svg">
              <path clip-rule="evenodd" d="M24 18.4228L42 11.475V34.3663C42 34.7796 41.7457 35.1504 41.3601 35.2992L24 42V18.4228Z" fill="currentColor" fill-rule="evenodd"></path>
              <path clip-rule="evenodd" d="M24 8.18819L33.4123 11.574L24 15.2071L14.5877 11.574L24 8.18819ZM9 15.8487L21 20.4805V37.6263L9 32.9945V15.8487ZM27 37.6263V20.4805L39 15.8487V32.9945L27 37.6263ZM25.354 2.29885C24.4788 1.98402 23.5212 1.98402 22.646 2.29885L4.98454 8.65208C3.7939 9.08038 3 10.2097 3 11.475V34.3663C3 36.0196 4.01719 37.5026 5.55962 38.098L22.9197 44.7987C23.6149 45.0671 24.3851 45.0671 25.0803 44.7987L42.4404 38.098C43.9828 37.5026 45 36.0196 45 34.3663V11.475C45 10.2097 44.2061 9.08038 43.0155 8.65208L25.354 2.29885Z" fill="currentColor" fill-rule="evenodd"></path>
            </svg>
          </div>
          <div class="flex flex-col">
            <h2 class="text-[#111418] dark:text-white text-lg font-bold leading-tight tracking-[-0.015em]">OpenClaw AI Center</h2>
            <p class="text-xs text-[#617589] font-medium uppercase tracking-wider">Report ${reportId}</p>
          </div>
        </div>
        <div class="flex gap-2">
          <button onclick="window.print()" class="flex min-w-[100px] cursor-pointer items-center justify-center rounded-lg h-10 px-4 bg-primary text-white text-sm font-bold tracking-[0.015em] hover:bg-primary/90 transition-all">
            <span class="material-symbols-outlined text-[18px] mr-2">picture_as_pdf</span>
            <span class="truncate">Export PDF</span>
          </button>
        </div>
      </header>

      <!-- Main Content -->
      <main class="flex-1 flex flex-col overflow-y-auto px-6 lg:px-12 py-8 bg-background-light dark:bg-background-dark max-w-[1200px] mx-auto w-full">
        <!-- Breadcrumbs -->
        <div class="flex items-center gap-2 mb-6 no-print">
          <span class="text-[#617589] dark:text-gray-400 text-xs font-semibold uppercase tracking-wider">Reports</span>
          <span class="material-symbols-outlined text-[16px] text-[#617589]">chevron_right</span>
          <span class="text-primary text-xs font-semibold uppercase tracking-wider underline underline-offset-4">Security Health Check ${reportId}</span>
        </div>

        <!-- Page Header -->
        <div class="flex flex-wrap justify-between items-end gap-6 mb-10">
          <div class="flex flex-col gap-2">
            <h1 class="text-[#111418] dark:text-white text-4xl font-extrabold leading-tight tracking-tight">Security Health Check Report</h1>
            <p class="text-[#617589] dark:text-gray-400 text-base max-w-2xl font-medium">Detailed security posture assessment for ${escapeHtml(task.companyName)} - Generated on ${reportDate}</p>
          </div>
        </div>

        <!-- Summary Stats -->
        <div class="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-6 mb-12">
          <div class="flex flex-col gap-2 rounded-xl bg-white dark:bg-[#1e293b] p-6 border border-[#dbe0e6] dark:border-white/5 shadow-sm">
            <div class="flex items-center justify-between mb-2">
              <p class="text-[#617589] dark:text-gray-400 text-sm font-bold uppercase tracking-wider">Overall Score</p>
              <span class="material-symbols-outlined text-primary">verified_user</span>
            </div>
            <p class="text-[#111418] dark:text-white text-4xl font-black">${assessment.overallScore}<span class="text-lg text-gray-400 font-medium">/100</span></p>
          </div>
          <div class="flex flex-col gap-2 rounded-xl bg-white dark:bg-[#1e293b] p-6 border border-[#dbe0e6] dark:border-white/5 shadow-sm">
            <div class="flex items-center justify-between mb-2">
              <p class="text-[#617589] dark:text-gray-400 text-sm font-bold uppercase tracking-wider">Critical Risks</p>
              <span class="material-symbols-outlined text-red-500">warning</span>
            </div>
            <p class="text-[#111418] dark:text-white text-4xl font-black">${task.highRiskCount}</p>
          </div>
          <div class="flex flex-col gap-2 rounded-xl bg-white dark:bg-[#1e293b] p-6 border border-[#dbe0e6] dark:border-white/5 shadow-sm">
            <div class="flex items-center justify-between mb-2">
              <p class="text-[#617589] dark:text-gray-400 text-sm font-bold uppercase tracking-wider">Open Issues</p>
              <span class="material-symbols-outlined text-orange-500">error</span>
            </div>
            <p class="text-[#111418] dark:text-white text-4xl font-black">${totalRisks}</p>
          </div>
          <div class="flex flex-col gap-2 rounded-xl bg-white dark:bg-[#1e293b] p-6 border border-[#dbe0e6] dark:border-white/5 shadow-sm">
            <div class="flex items-center justify-between mb-2">
              <p class="text-[#617589] dark:text-gray-400 text-sm font-bold uppercase tracking-wider">Medium Risks</p>
              <span class="material-symbols-outlined text-yellow-500">info</span>
            </div>
            <p class="text-[#111418] dark:text-white text-4xl font-black">${task.mediumRiskCount}</p>
          </div>
        </div>

        <!-- Executive Summary -->
        <section class="scroll-section mb-12" id="summary">
          <div class="flex items-center gap-3 mb-6">
            <h2 class="text-2xl font-bold dark:text-white">Executive Summary</h2>
            <div class="h-[1px] flex-1 bg-[#dbe0e6] dark:bg-[#2a343d]"></div>
          </div>
          <div class="bg-white dark:bg-[#1e293b] rounded-xl p-8 border border-[#dbe0e6] dark:border-white/5 shadow-sm leading-relaxed text-gray-700 dark:text-gray-300">
            ${summaryParagraphs}
          </div>
        </section>

        <!-- Scores & Domain Breakdown -->
        <section class="scroll-section mb-12" id="scores">
          <div class="flex items-center gap-3 mb-6">
            <h2 class="text-2xl font-bold dark:text-white">Scores &amp; Domain Breakdown</h2>
            <div class="h-[1px] flex-1 bg-[#dbe0e6] dark:bg-[#2a343d]"></div>
          </div>
          <div class="grid grid-cols-1 lg:grid-cols-2 gap-8">
            <div class="bg-white dark:bg-[#1e293b] rounded-xl p-8 border border-[#dbe0e6] dark:border-white/5 shadow-sm flex flex-col items-center justify-center text-center">
              <h3 class="text-[#617589] text-sm font-bold uppercase mb-8">Security Gauge</h3>
              <div class="relative flex items-center justify-center size-52">
                <svg class="size-full -rotate-90" viewBox="0 0 36 36" xmlns="http://www.w3.org/2000/svg">
                  <circle class="stroke-current text-gray-200 dark:text-gray-700" cx="18" cy="18" fill="none" r="16" stroke-width="2.5"></circle>
                  <circle class="stroke-current text-primary" cx="18" cy="18" fill="none" r="16" stroke-dasharray="${assessment.overallScore}, 100" stroke-linecap="round" stroke-width="2.5"></circle>
                </svg>
                <div class="absolute flex flex-col items-center">
                  <span class="text-5xl font-black dark:text-white">${assessment.overallScore}%</span>
                  <span class="text-xs font-bold text-[#617589] uppercase tracking-widest">Health</span>
                </div>
              </div>
            </div>
            <div class="bg-white dark:bg-[#1e293b] rounded-xl p-8 border border-[#dbe0e6] dark:border-white/5 shadow-sm flex flex-col gap-6">
              <h3 class="text-[#617589] text-sm font-bold uppercase">Category Health</h3>
              <div class="space-y-5">
                ${categoryBars}
              </div>
            </div>
          </div>
        </section>

        <!-- Risk List -->
        <section class="scroll-section mb-12" id="risks">
          <div class="flex flex-wrap items-center justify-between gap-4 mb-6">
            <div class="flex items-center gap-3">
              <h2 class="text-2xl font-bold dark:text-white">Identified Risk List</h2>
              <span class="bg-primary/10 text-primary px-3 py-1 rounded-full text-xs font-black uppercase">${totalRisks} Total</span>
            </div>
          </div>
          <div class="bg-white dark:bg-[#1e293b] rounded-xl border border-[#dbe0e6] dark:border-white/5 overflow-hidden shadow-sm">
            <div class="overflow-x-auto">
              <table class="w-full text-left border-collapse">
                <thead>
                  <tr class="bg-gray-50 dark:bg-[#161f29] border-b border-[#dbe0e6] dark:border-[#2a343d]">
                    <th class="px-6 py-4 text-xs font-black text-[#617589] uppercase tracking-widest">Severity</th>
                    <th class="px-6 py-4 text-xs font-black text-[#617589] uppercase tracking-widest">Risk Name</th>
                    <th class="px-6 py-4 text-xs font-black text-[#617589] uppercase tracking-widest">Category</th>
                    <th class="px-6 py-4 text-xs font-black text-[#617589] uppercase tracking-widest text-center">CVSS</th>
                    <th class="px-6 py-4 text-xs font-black text-[#617589] uppercase tracking-widest text-right">Action</th>
                  </tr>
                </thead>
                <tbody class="divide-y divide-[#dbe0e6] dark:divide-[#2a343d]">
                  ${riskRows}
                </tbody>
              </table>
            </div>
          </div>
        </section>

        ${criticalRiskSection}

        <!-- Remediation Roadmap -->
        <section class="scroll-section mb-20" id="roadmap">
          <div class="flex items-center gap-3 mb-6">
            <h2 class="text-2xl font-bold dark:text-white">Remediation Roadmap</h2>
            <div class="h-[1px] flex-1 bg-[#dbe0e6] dark:bg-[#2a343d]"></div>
          </div>
          <div class="relative pl-8 space-y-8 before:absolute before:left-[11px] before:top-2 before:bottom-2 before:w-[2px] before:bg-[#dbe0e6] dark:before:bg-[#2a343d]">
            ${roadmapItems}
          </div>
        </section>

        <!-- Footer -->
        <footer class="border-t border-[#dbe0e6] dark:border-[#2a343d] pt-8 pb-12 flex flex-col md:flex-row justify-between items-center gap-6">
          <div class="flex items-center gap-4 text-[#617589]">
            <div class="size-6 opacity-50">
              <svg fill="currentColor" viewBox="0 0 48 48">
                <path d="M24 18.4228L42 11.475V34.3663C42 34.7796 41.7457 35.1504 41.3601 35.2992L24 42V18.4228Z"></path>
              </svg>
            </div>
            <p class="text-sm font-medium">&copy; ${currentYear} OpenClaw Security. All rights reserved.</p>
          </div>
          <div class="flex gap-6">
            <a class="text-sm font-bold text-[#617589] hover:text-primary transition-colors" href="#">Privacy Policy</a>
            <a class="text-sm font-bold text-[#617589] hover:text-primary transition-colors" href="#">Terms of Service</a>
            <a class="text-sm font-bold text-[#617589] hover:text-primary transition-colors" href="#">Audit Methodology</a>
          </div>
        </footer>
      </main>
    </div>
  </div>
</body>
</html>`;
}
