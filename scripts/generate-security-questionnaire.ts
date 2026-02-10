#!/usr/bin/env bun
/**
 * OpenClaw 安全数据收集脚本
 * 
 * 此脚本用于模拟 OpenClaw 代理自动收集安全数据的过程。
 * 实际生产环境中，这些数据由 OpenClaw 代理自动扫描收集。
 * 
 * 使用方法:
 *   bun run scripts/generate-security-questionnaire.ts --target "example.com" [选项]
 * 
 * 选项:
 *   --target <域名/仓库>   扫描目标 (必填)
 *   --type <类型>          目标类型: domain, repository, cloud_account, application
 *   --output <文件>        输出JSON文件路径
 *   --submit               直接提交到API
 *   --api-url <URL>        API地址 (默认: http://localhost:3000)
 *   --sample               使用示例数据填充
 *   --help                 显示帮助信息
 */

import { parseArgs } from "util";
import {
  SECURITY_DATA_COLLECTION_TEMPLATE,
  SAMPLE_COLLECTED_DATA,
  type SecurityDataSubmission,
  type CollectedDataSection,
  type CollectedDataValue,
  type DataSection,
  type DataPoint,
  calculateRiskScore
} from "./questionnaire-template";

// 颜色输出
const colors = {
  reset: "\x1b[0m",
  bright: "\x1b[1m",
  dim: "\x1b[2m",
  red: "\x1b[31m",
  green: "\x1b[32m",
  yellow: "\x1b[33m",
  blue: "\x1b[34m",
  magenta: "\x1b[35m",
  cyan: "\x1b[36m",
};

function log(message: string, color: keyof typeof colors = "reset") {
  console.log(`${colors[color]}${message}${colors.reset}`);
}

function showHelp() {
  console.log(`
${colors.bright}OpenClaw 安全数据收集脚本${colors.reset}

${colors.cyan}说明:${colors.reset}
  此脚本用于模拟 OpenClaw 代理自动收集安全数据的过程。
  实际生产环境中，这些数据由 OpenClaw 代理通过以下方式自动收集：
  - 端口扫描和服务检测
  - SSL/TLS 证书分析
  - HTTP 安全头检查
  - DNS 记录查询
  - 依赖漏洞扫描
  - 代码静态分析
  - 云配置审计

${colors.cyan}使用方法:${colors.reset}
  bun run scripts/generate-security-questionnaire.ts --target "example.com" [选项]

${colors.cyan}选项:${colors.reset}
  --target <域名/仓库>   扫描目标 (必填)
  --type <类型>          目标类型: domain, repository, cloud_account, application (默认: domain)
  --output <文件>        输出JSON文件路径 (默认: security-scan-output.json)
  --submit               直接提交到API
  --api-url <URL>        API地址 (默认: http://localhost:3000)
  --sample               使用示例数据填充（模拟扫描结果）
  --help                 显示帮助信息

${colors.cyan}示例:${colors.reset}
  # 生成空白扫描模板
  bun run scripts/generate-security-questionnaire.ts --target "example.com"

  # 生成带示例数据的扫描结果
  bun run scripts/generate-security-questionnaire.ts --target "example.com" --sample

  # 生成并直接提交到API
  bun run scripts/generate-security-questionnaire.ts --target "example.com" --sample --submit

${colors.cyan}数据收集分类:${colors.reset}
`);

  // 显示所有数据收集分类
  for (const section of SECURITY_DATA_COLLECTION_TEMPLATE) {
    console.log(`  📋 ${section.title} (${section.key})`);
    console.log(`     ${section.description}`);
    console.log(`     数据点: ${section.dataPoints.length} 个`);
    console.log();
  }
}

// 生成扫描ID
function generateScanId(): string {
  const now = new Date();
  const dateStr = now.toISOString().slice(0, 10).replace(/-/g, "");
  const randomStr = Math.random().toString(36).substring(2, 8);
  return `scan-${dateStr}-${randomStr}`;
}

// 生成空白扫描结果模板
function generateBlankScanResult(
  target: string,
  targetType: SecurityDataSubmission["targetType"]
): SecurityDataSubmission {
  const now = new Date().toISOString();
  
  const sections: CollectedDataSection[] = SECURITY_DATA_COLLECTION_TEMPLATE.map(
    (section: DataSection) => ({
      sectionKey: section.key,
      title: section.title,
      icon: section.icon,
      collectedData: section.dataPoints.map((dp: DataPoint) => ({
        dataPointCode: dp.code,
        dataPointName: dp.name,
        value: null,
        collectedAt: now,
        status: "not_applicable" as const,
      })),
    })
  );

  return {
    targetIdentifier: target,
    targetType,
    scanId: generateScanId(),
    scanStartedAt: now,
    scanCompletedAt: now,
    source: "openclaw_agent",
    agentVersion: "1.0.0",
    sections,
    metadata: {
      scanDuration: 0,
      dataPointsScanned: 0,
      dataPointsSuccessful: 0,
      dataPointsFailed: 0,
    },
  };
}

// 生成带示例数据的扫描结果
function generateSampleScanResult(
  target: string,
  targetType: SecurityDataSubmission["targetType"]
): SecurityDataSubmission {
  // 使用示例数据，但替换目标标识
  const sampleData = { ...SAMPLE_COLLECTED_DATA };
  sampleData.targetIdentifier = target;
  sampleData.targetType = targetType;
  sampleData.scanId = generateScanId();
  
  const now = new Date();
  sampleData.scanStartedAt = new Date(now.getTime() - 15 * 60 * 1000).toISOString(); // 15分钟前
  sampleData.scanCompletedAt = now.toISOString();
  
  return sampleData;
}

// API响应类型
interface ApiResponse {
  success?: boolean;
  data?: {
    id: string;
    assetHash: string;
    status: string;
    task?: {
      taskId: string;
      status: string;
    };
  };
  error?: string;
  details?: string[];
}

// 提交扫描结果到API
async function submitScanResult(
  scanResult: SecurityDataSubmission,
  apiUrl: string
): Promise<void> {
  log("\n📤 正在提交扫描结果到API...", "cyan");
  
  try {
    const response = await fetch(`${apiUrl}/api/questionnaires`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(scanResult),
    });

    const result = await response.json() as ApiResponse;

    if (response.ok && result.data) {
      log("\n✅ 扫描结果提交成功!", "green");
      log(`   记录ID: ${result.data.id}`, "cyan");
      log(`   资产哈希: ${result.data.assetHash}`, "dim");
      log(`   状态: ${result.data.status}`, "dim");
      
      if (result.data.task) {
        log(`\n📊 AI风险评估任务已创建`, "magenta");
        log(`   任务ID: ${result.data.task.taskId}`, "cyan");
        log(`   任务状态: ${result.data.task.status}`, "dim");
      }
    } else {
      log("\n❌ 提交失败!", "red");
      log(`   错误: ${result.error || "未知错误"}`, "red");
      if (result.details) {
        result.details.forEach((d: string) => log(`   - ${d}`, "yellow"));
      }
    }
  } catch (error) {
    log("\n❌ 网络错误!", "red");
    log(`   ${error instanceof Error ? error.message : String(error)}`, "red");
    log(`   请确保API服务正在运行: ${apiUrl}`, "yellow");
  }
}

// 保存扫描结果到文件
async function saveToFile(
  scanResult: SecurityDataSubmission,
  outputPath: string
): Promise<void> {
  const content = JSON.stringify(scanResult, null, 2);
  await Bun.write(outputPath, content);
  log(`\n💾 扫描结果已保存到: ${outputPath}`, "green");
}

// 显示扫描统计
function showStats(scanResult: SecurityDataSubmission): void {
  let totalDataPoints = 0;
  let successfulDataPoints = 0;
  let failedDataPoints = 0;
  let risksDetected = 0;
  let criticalRisks = 0;
  let highRisks = 0;

  const sectionStats: Array<{
    title: string;
    total: number;
    successful: number;
    failed: number;
    risks: number;
  }> = [];

  for (const section of scanResult.sections) {
    const sectionTotal = section.collectedData.length;
    const sectionSuccessful = section.collectedData.filter(
      (d: CollectedDataValue) => d.status === "success"
    ).length;
    const sectionFailed = section.collectedData.filter(
      (d: CollectedDataValue) => d.status === "failed"
    ).length;
    
    let sectionRisks = 0;
    for (const data of section.collectedData) {
      if (data.detectedRisks) {
        sectionRisks += data.detectedRisks.length;
        risksDetected += data.detectedRisks.length;
        
        for (const risk of data.detectedRisks) {
          if (risk.severity === "critical") criticalRisks++;
          if (risk.severity === "high") highRisks++;
        }
      }
    }
    
    totalDataPoints += sectionTotal;
    successfulDataPoints += sectionSuccessful;
    failedDataPoints += sectionFailed;

    sectionStats.push({
      title: section.title,
      total: sectionTotal,
      successful: sectionSuccessful,
      failed: sectionFailed,
      risks: sectionRisks,
    });
  }

  // 计算风险评分
  const allCollectedData = scanResult.sections.flatMap(s => s.collectedData);
  const riskScore = calculateRiskScore(allCollectedData);

  log("\n📊 扫描统计", "bright");
  log("=".repeat(50), "dim");
  log(`扫描目标: ${scanResult.targetIdentifier}`, "cyan");
  log(`目标类型: ${scanResult.targetType}`, "dim");
  log(`扫描ID: ${scanResult.scanId}`, "dim");
  log(`代理版本: ${scanResult.agentVersion}`, "dim");
  log("", "reset");
  log(`总数据点: ${totalDataPoints}`, "dim");
  log(`成功收集: ${successfulDataPoints} (${Math.round((successfulDataPoints / totalDataPoints) * 100)}%)`, "green");
  log(`收集失败: ${failedDataPoints}`, failedDataPoints > 0 ? "yellow" : "dim");
  
  log("\n🔒 安全评分", "bright");
  const scoreColor = riskScore >= 80 ? "green" : riskScore >= 60 ? "yellow" : "red";
  log(`   总体评分: ${riskScore}/100`, scoreColor);
  
  if (risksDetected > 0) {
    log("\n⚠️  检测到的风险:", "yellow");
    log(`   总计: ${risksDetected} 个风险`, "dim");
    if (criticalRisks > 0) log(`   🔴 严重: ${criticalRisks}`, "red");
    if (highRisks > 0) log(`   🟠 高危: ${highRisks}`, "yellow");
  } else {
    log("\n✅ 未检测到明显风险", "green");
  }

  log("\n各分类收集情况:", "dim");
  for (const stat of sectionStats) {
    const percentage = stat.total > 0 ? Math.round((stat.successful / stat.total) * 100) : 0;
    const bar = "█".repeat(Math.floor(percentage / 10)) + "░".repeat(10 - Math.floor(percentage / 10));
    const color = percentage === 100 ? "green" : percentage >= 50 ? "yellow" : "red";
    const riskIndicator = stat.risks > 0 ? ` ⚠️ ${stat.risks}` : "";
    log(`  ${stat.title}: ${bar} ${percentage}% (${stat.successful}/${stat.total})${riskIndicator}`, color);
  }
}

// 显示数据收集模板信息
function showTemplateInfo(): void {
  log("\n📋 安全数据收集模板", "bright");
  log("=".repeat(50), "dim");
  
  let totalDataPoints = 0;
  let criticalPoints = 0;
  let highPoints = 0;
  
  for (const section of SECURITY_DATA_COLLECTION_TEMPLATE) {
    totalDataPoints += section.dataPoints.length;
    criticalPoints += section.dataPoints.filter(dp => dp.riskWeight === "critical").length;
    highPoints += section.dataPoints.filter(dp => dp.riskWeight === "high").length;
  }
  
  log(`总分类: ${SECURITY_DATA_COLLECTION_TEMPLATE.length}`, "dim");
  log(`总数据点: ${totalDataPoints}`, "dim");
  log(`严重风险点: ${criticalPoints}`, "red");
  log(`高风险点: ${highPoints}`, "yellow");
  
  log("\n数据收集方法:", "dim");
  const methods = new Set<string>();
  for (const section of SECURITY_DATA_COLLECTION_TEMPLATE) {
    for (const dp of section.dataPoints) {
      methods.add(dp.collectionMethod);
    }
  }
  log(`  ${Array.from(methods).join(", ")}`, "cyan");
}

// 主函数
async function main() {
  const { values } = parseArgs({
    args: Bun.argv.slice(2),
    options: {
      target: { type: "string" },
      type: { type: "string", default: "domain" },
      output: { type: "string", default: "security-scan-output.json" },
      submit: { type: "boolean", default: false },
      "api-url": { type: "string", default: "http://localhost:3000" },
      sample: { type: "boolean", default: false },
      help: { type: "boolean", default: false },
    },
    strict: true,
    allowPositionals: true,
  });

  if (values.help) {
    showHelp();
    process.exit(0);
  }

  if (!values.target) {
    log("❌ 错误: 必须提供扫描目标 (--target)", "red");
    log("\n使用 --help 查看帮助信息", "dim");
    process.exit(1);
  }

  // 验证目标类型
  const validTypes = ["domain", "repository", "cloud_account", "application"];
  if (!validTypes.includes(values.type!)) {
    log(`❌ 错误: 无效的目标类型 "${values.type}"`, "red");
    log(`   有效类型: ${validTypes.join(", ")}`, "dim");
    process.exit(1);
  }

  const targetType = values.type as SecurityDataSubmission["targetType"];

  // 显示模板信息
  showTemplateInfo();

  let scanResult: SecurityDataSubmission;

  if (values.sample) {
    scanResult = generateSampleScanResult(values.target, targetType);
    log("\n✅ 已生成带示例数据的扫描结果", "green");
  } else {
    scanResult = generateBlankScanResult(values.target, targetType);
    log("\n✅ 已生成空白扫描模板", "green");
    log("   注意: 实际扫描数据由 OpenClaw 代理自动收集", "dim");
  }

  // 显示统计
  showStats(scanResult);

  // 保存到文件
  await saveToFile(scanResult, values.output!);

  // 提交到API
  if (values.submit) {
    await submitScanResult(scanResult, values["api-url"]!);
  } else {
    log("\n💡 提示: 使用 --submit 选项可直接提交到API", "dim");
  }
}

main().catch((error) => {
  log(`\n❌ 发生错误: ${error.message}`, "red");
  process.exit(1);
});
