/**
 * OpenClaw 安全数据收集模板
 * 
 * 此模板定义了 OpenClaw 自动化安全扫描和数据收集的数据点。
 * 这些不是给人回答的问卷，而是由 OpenClaw 代理自动收集的安全信息结构。
 */

// ============================================================================
// 数据收集类型定义
// ============================================================================

/** 数据收集方法 */
export type CollectionMethod = 
  | "api_scan"           // API 端点扫描
  | "dns_lookup"         // DNS 记录查询
  | "ssl_check"          // SSL/TLS 证书检查
  | "port_scan"          // 端口扫描
  | "header_analysis"    // HTTP 头分析
  | "config_parse"       // 配置文件解析
  | "dependency_scan"    // 依赖项扫描
  | "code_analysis"      // 代码静态分析
  | "cloud_api"          // 云服务 API 查询
  | "git_analysis"       // Git 仓库分析
  | "container_scan"     // 容器镜像扫描
  | "network_probe"      // 网络探测
  | "certificate_check"  // 证书链检查
  | "waf_detection"      // WAF 检测
  | "cdn_detection";     // CDN 检测

/** 数据点值类型 */
export type DataValueType = 
  | "boolean"            // 是/否
  | "string"             // 文本值
  | "number"             // 数值
  | "enum"               // 枚举值
  | "list"               // 列表
  | "json"               // JSON 对象
  | "version"            // 版本号
  | "date"               // 日期
  | "duration"           // 时间段
  | "url"                // URL
  | "ip_address"         // IP 地址
  | "port_list"          // 端口列表
  | "certificate_info"   // 证书信息
  | "vulnerability_list"; // 漏洞列表

/** 风险权重 */
export type RiskWeight = "critical" | "high" | "medium" | "low" | "info";

/** 单个数据收集点定义 */
export interface DataPoint {
  /** 唯一标识符 */
  code: string;
  /** 数据点名称 */
  name: string;
  /** 描述说明 */
  description: string;
  /** 所属分类 */
  category: string;
  /** 收集方法 */
  collectionMethod: CollectionMethod;
  /** 值类型 */
  valueType: DataValueType;
  /** 风险权重 - 当检测到问题时的风险等级 */
  riskWeight: RiskWeight;
  /** 期望的安全值（用于评估） */
  expectedValue?: unknown;
  /** 枚举选项（当 valueType 为 enum 时） */
  enumOptions?: string[];
  /** 是否必需 */
  required: boolean;
  /** 相关的安全标准/框架 */
  frameworks?: string[];
}

/** 数据收集分区定义 */
export interface DataSection {
  /** 分区标识 */
  key: string;
  /** 分区标题 */
  title: string;
  /** 图标 */
  icon: string;
  /** 描述 */
  description: string;
  /** 数据点列表 */
  dataPoints: DataPoint[];
}

/** 收集到的数据值 */
export interface CollectedDataValue {
  /** 数据点代码 */
  dataPointCode: string;
  /** 数据点名称 */
  dataPointName: string;
  /** 收集到的值 */
  value: unknown;
  /** 原始数据（JSON 格式） */
  rawData?: Record<string, unknown>;
  /** 收集时间 */
  collectedAt: string;
  /** 收集状态 */
  status: "success" | "failed" | "partial" | "not_applicable";
  /** 错误信息（如果收集失败） */
  errorMessage?: string;
  /** 检测到的风险 */
  detectedRisks?: DetectedRisk[];
}

/** 检测到的风险 */
export interface DetectedRisk {
  /** 风险等级 */
  severity: RiskWeight;
  /** 风险描述 */
  description: string;
  /** 建议修复措施 */
  recommendation: string;
  /** 相关 CVE（如果有） */
  cveIds?: string[];
}

/** 数据收集分区结果 */
export interface CollectedDataSection {
  /** 分区标识 */
  sectionKey: string;
  /** 分区标题 */
  title: string;
  /** 图标 */
  icon?: string;
  /** 收集到的数据 */
  collectedData: CollectedDataValue[];
}

/** 完整的数据收集提交 */
export interface SecurityDataSubmission {
  /** 目标标识（域名、仓库等） */
  targetIdentifier: string;
  /** 目标类型 */
  targetType: "domain" | "repository" | "cloud_account" | "application";
  /** 扫描 ID */
  scanId: string;
  /** 扫描开始时间 */
  scanStartedAt: string;
  /** 扫描完成时间 */
  scanCompletedAt: string;
  /** 数据来源 */
  source: "openclaw_agent";
  /** 代理版本 */
  agentVersion: string;
  /** 收集到的数据分区 */
  sections: CollectedDataSection[];
  /** 总体风险评分 (0-100) */
  overallRiskScore?: number;
  /** 扫描元数据 */
  metadata?: Record<string, unknown>;
}

// ============================================================================
// 安全数据收集模板
// ============================================================================

export const SECURITY_DATA_COLLECTION_TEMPLATE: DataSection[] = [
  {
    key: "network_exposure",
    title: "网络暴露面",
    icon: "router",
    description: "自动扫描和检测网络暴露面和边界安全配置",
    dataPoints: [
      {
        code: "NET.001",
        name: "开放端口列表",
        description: "扫描目标的开放端口和运行的服务",
        category: "端口扫描",
        collectionMethod: "port_scan",
        valueType: "port_list",
        riskWeight: "high",
        required: true,
        frameworks: ["NIST CSF", "CIS Controls"]
      },
      {
        code: "NET.002",
        name: "WAF 检测",
        description: "检测是否部署了 Web 应用防火墙",
        category: "边界防护",
        collectionMethod: "waf_detection",
        valueType: "json",
        riskWeight: "high",
        expectedValue: { detected: true },
        required: true,
        frameworks: ["OWASP", "PCI-DSS"]
      },
      {
        code: "NET.003",
        name: "CDN 使用情况",
        description: "检测是否使用 CDN 服务",
        category: "边界防护",
        collectionMethod: "cdn_detection",
        valueType: "json",
        riskWeight: "medium",
        required: false,
        frameworks: ["NIST CSF"]
      },
      {
        code: "NET.004",
        name: "DNS 安全配置",
        description: "检查 DNSSEC、SPF、DKIM、DMARC 配置",
        category: "DNS 安全",
        collectionMethod: "dns_lookup",
        valueType: "json",
        riskWeight: "medium",
        required: true,
        frameworks: ["NIST CSF", "CIS Controls"]
      },
      {
        code: "NET.005",
        name: "HTTP 安全头",
        description: "分析 HTTP 响应头的安全配置（CSP、HSTS、X-Frame-Options 等）",
        category: "HTTP 安全",
        collectionMethod: "header_analysis",
        valueType: "json",
        riskWeight: "medium",
        required: true,
        frameworks: ["OWASP", "CIS Controls"]
      },
      {
        code: "NET.006",
        name: "暴露的敏感端点",
        description: "检测暴露的管理接口、API 文档、调试端点等",
        category: "端点暴露",
        collectionMethod: "api_scan",
        valueType: "list",
        riskWeight: "critical",
        required: true,
        frameworks: ["OWASP", "NIST CSF"]
      },
      {
        code: "NET.007",
        name: "SSH/RDP 服务暴露",
        description: "检测远程管理服务是否对公网开放",
        category: "远程访问",
        collectionMethod: "port_scan",
        valueType: "json",
        riskWeight: "critical",
        expectedValue: { sshExposed: false, rdpExposed: false },
        required: true,
        frameworks: ["CIS Controls", "NIST CSF"]
      },
      {
        code: "NET.008",
        name: "数据库端口暴露",
        description: "检测数据库服务端口是否对公网开放",
        category: "数据库安全",
        collectionMethod: "port_scan",
        valueType: "json",
        riskWeight: "critical",
        expectedValue: { exposed: false },
        required: true,
        frameworks: ["CIS Controls", "PCI-DSS"]
      }
    ]
  },
  {
    key: "ssl_tls_security",
    title: "SSL/TLS 安全",
    icon: "lock",
    description: "检查 SSL/TLS 证书和加密配置",
    dataPoints: [
      {
        code: "SSL.001",
        name: "证书有效性",
        description: "检查 SSL 证书是否有效、未过期",
        category: "证书管理",
        collectionMethod: "ssl_check",
        valueType: "certificate_info",
        riskWeight: "critical",
        required: true,
        frameworks: ["PCI-DSS", "NIST CSF"]
      },
      {
        code: "SSL.002",
        name: "证书到期时间",
        description: "检查证书剩余有效期",
        category: "证书管理",
        collectionMethod: "ssl_check",
        valueType: "date",
        riskWeight: "high",
        required: true,
        frameworks: ["PCI-DSS"]
      },
      {
        code: "SSL.003",
        name: "TLS 版本支持",
        description: "检测支持的 TLS 版本（应禁用 TLS 1.0/1.1）",
        category: "加密配置",
        collectionMethod: "ssl_check",
        valueType: "json",
        riskWeight: "high",
        expectedValue: { tls10: false, tls11: false, tls12: true, tls13: true },
        required: true,
        frameworks: ["PCI-DSS", "NIST CSF"]
      },
      {
        code: "SSL.004",
        name: "加密套件强度",
        description: "分析使用的加密套件是否安全",
        category: "加密配置",
        collectionMethod: "ssl_check",
        valueType: "json",
        riskWeight: "high",
        required: true,
        frameworks: ["PCI-DSS", "NIST CSF"]
      },
      {
        code: "SSL.005",
        name: "证书链完整性",
        description: "验证证书链是否完整且可信",
        category: "证书管理",
        collectionMethod: "certificate_check",
        valueType: "json",
        riskWeight: "high",
        required: true,
        frameworks: ["PCI-DSS"]
      },
      {
        code: "SSL.006",
        name: "HSTS 配置",
        description: "检查 HTTP Strict Transport Security 配置",
        category: "传输安全",
        collectionMethod: "header_analysis",
        valueType: "json",
        riskWeight: "medium",
        required: true,
        frameworks: ["OWASP", "CIS Controls"]
      },
      {
        code: "SSL.007",
        name: "证书透明度",
        description: "检查证书是否在 CT 日志中",
        category: "证书管理",
        collectionMethod: "certificate_check",
        valueType: "boolean",
        riskWeight: "low",
        required: false,
        frameworks: ["NIST CSF"]
      }
    ]
  },
  {
    key: "application_security",
    title: "应用安全",
    icon: "security",
    description: "扫描应用层安全配置和漏洞",
    dataPoints: [
      {
        code: "APP.001",
        name: "已知漏洞检测",
        description: "扫描已知的 Web 应用漏洞",
        category: "漏洞扫描",
        collectionMethod: "api_scan",
        valueType: "vulnerability_list",
        riskWeight: "critical",
        required: true,
        frameworks: ["OWASP", "CVE"]
      },
      {
        code: "APP.002",
        name: "服务器信息泄露",
        description: "检测服务器版本信息泄露",
        category: "信息泄露",
        collectionMethod: "header_analysis",
        valueType: "json",
        riskWeight: "medium",
        required: true,
        frameworks: ["OWASP", "CIS Controls"]
      },
      {
        code: "APP.003",
        name: "错误页面信息泄露",
        description: "检测错误页面是否泄露敏感信息",
        category: "信息泄露",
        collectionMethod: "api_scan",
        valueType: "json",
        riskWeight: "medium",
        required: true,
        frameworks: ["OWASP"]
      },
      {
        code: "APP.004",
        name: "目录遍历检测",
        description: "检测是否存在目录遍历漏洞",
        category: "访问控制",
        collectionMethod: "api_scan",
        valueType: "boolean",
        riskWeight: "high",
        expectedValue: false,
        required: true,
        frameworks: ["OWASP"]
      },
      {
        code: "APP.005",
        name: "敏感文件暴露",
        description: "检测 .git、.env、备份文件等敏感文件暴露",
        category: "信息泄露",
        collectionMethod: "api_scan",
        valueType: "list",
        riskWeight: "critical",
        required: true,
        frameworks: ["OWASP", "CIS Controls"]
      },
      {
        code: "APP.006",
        name: "Cookie 安全配置",
        description: "检查 Cookie 的安全属性（Secure、HttpOnly、SameSite）",
        category: "会话安全",
        collectionMethod: "header_analysis",
        valueType: "json",
        riskWeight: "medium",
        required: true,
        frameworks: ["OWASP"]
      },
      {
        code: "APP.007",
        name: "CORS 配置",
        description: "检查跨域资源共享配置是否安全",
        category: "访问控制",
        collectionMethod: "header_analysis",
        valueType: "json",
        riskWeight: "medium",
        required: true,
        frameworks: ["OWASP"]
      },
      {
        code: "APP.008",
        name: "内容安全策略",
        description: "检查 Content-Security-Policy 配置",
        category: "XSS 防护",
        collectionMethod: "header_analysis",
        valueType: "json",
        riskWeight: "medium",
        required: true,
        frameworks: ["OWASP", "CIS Controls"]
      }
    ]
  },
  {
    key: "dependency_security",
    title: "依赖安全",
    icon: "inventory_2",
    description: "扫描项目依赖的安全漏洞",
    dataPoints: [
      {
        code: "DEP.001",
        name: "NPM 依赖漏洞",
        description: "扫描 Node.js 项目的依赖漏洞",
        category: "依赖扫描",
        collectionMethod: "dependency_scan",
        valueType: "vulnerability_list",
        riskWeight: "high",
        required: true,
        frameworks: ["OWASP", "CVE"]
      },
      {
        code: "DEP.002",
        name: "Python 依赖漏洞",
        description: "扫描 Python 项目的依赖漏洞",
        category: "依赖扫描",
        collectionMethod: "dependency_scan",
        valueType: "vulnerability_list",
        riskWeight: "high",
        required: true,
        frameworks: ["OWASP", "CVE"]
      },
      {
        code: "DEP.003",
        name: "过时依赖检测",
        description: "检测严重过时的依赖版本",
        category: "依赖管理",
        collectionMethod: "dependency_scan",
        valueType: "list",
        riskWeight: "medium",
        required: true,
        frameworks: ["CIS Controls"]
      },
      {
        code: "DEP.004",
        name: "许可证合规",
        description: "检查依赖的许可证合规性",
        category: "合规检查",
        collectionMethod: "dependency_scan",
        valueType: "json",
        riskWeight: "low",
        required: false,
        frameworks: ["SOC 2"]
      },
      {
        code: "DEP.005",
        name: "容器镜像漏洞",
        description: "扫描 Docker 镜像中的漏洞",
        category: "容器安全",
        collectionMethod: "container_scan",
        valueType: "vulnerability_list",
        riskWeight: "high",
        required: true,
        frameworks: ["CIS Docker", "NIST CSF"]
      },
      {
        code: "DEP.006",
        name: "基础镜像安全",
        description: "检查容器基础镜像的安全性",
        category: "容器安全",
        collectionMethod: "container_scan",
        valueType: "json",
        riskWeight: "medium",
        required: true,
        frameworks: ["CIS Docker"]
      }
    ]
  },
  {
    key: "code_security",
    title: "代码安全",
    icon: "code",
    description: "静态代码分析和安全检查",
    dataPoints: [
      {
        code: "CODE.001",
        name: "硬编码密钥检测",
        description: "检测代码中硬编码的 API 密钥、密码等",
        category: "密钥管理",
        collectionMethod: "code_analysis",
        valueType: "list",
        riskWeight: "critical",
        required: true,
        frameworks: ["OWASP", "CIS Controls"]
      },
      {
        code: "CODE.002",
        name: "SQL 注入风险",
        description: "检测潜在的 SQL 注入漏洞",
        category: "注入漏洞",
        collectionMethod: "code_analysis",
        valueType: "vulnerability_list",
        riskWeight: "critical",
        required: true,
        frameworks: ["OWASP"]
      },
      {
        code: "CODE.003",
        name: "XSS 风险",
        description: "检测潜在的跨站脚本漏洞",
        category: "注入漏洞",
        collectionMethod: "code_analysis",
        valueType: "vulnerability_list",
        riskWeight: "high",
        required: true,
        frameworks: ["OWASP"]
      },
      {
        code: "CODE.004",
        name: "不安全的加密使用",
        description: "检测弱加密算法或不安全的加密实现",
        category: "加密安全",
        collectionMethod: "code_analysis",
        valueType: "list",
        riskWeight: "high",
        required: true,
        frameworks: ["OWASP", "NIST CSF"]
      },
      {
        code: "CODE.005",
        name: "敏感数据日志",
        description: "检测是否在日志中记录敏感数据",
        category: "数据保护",
        collectionMethod: "code_analysis",
        valueType: "list",
        riskWeight: "medium",
        required: true,
        frameworks: ["OWASP", "GDPR"]
      },
      {
        code: "CODE.006",
        name: "不安全的反序列化",
        description: "检测不安全的反序列化操作",
        category: "注入漏洞",
        collectionMethod: "code_analysis",
        valueType: "vulnerability_list",
        riskWeight: "high",
        required: true,
        frameworks: ["OWASP"]
      },
      {
        code: "CODE.007",
        name: "路径遍历风险",
        description: "检测文件路径操作中的安全风险",
        category: "访问控制",
        collectionMethod: "code_analysis",
        valueType: "list",
        riskWeight: "high",
        required: true,
        frameworks: ["OWASP"]
      }
    ]
  },
  {
    key: "git_security",
    title: "Git 仓库安全",
    icon: "source",
    description: "分析 Git 仓库的安全配置和历史",
    dataPoints: [
      {
        code: "GIT.001",
        name: "历史敏感数据",
        description: "扫描 Git 历史中的敏感数据泄露",
        category: "数据泄露",
        collectionMethod: "git_analysis",
        valueType: "list",
        riskWeight: "critical",
        required: true,
        frameworks: ["OWASP", "CIS Controls"]
      },
      {
        code: "GIT.002",
        name: "分支保护配置",
        description: "检查主分支的保护规则配置",
        category: "访问控制",
        collectionMethod: "git_analysis",
        valueType: "json",
        riskWeight: "medium",
        required: true,
        frameworks: ["CIS Controls"]
      },
      {
        code: "GIT.003",
        name: "签名提交",
        description: "检查是否启用了提交签名",
        category: "完整性",
        collectionMethod: "git_analysis",
        valueType: "boolean",
        riskWeight: "low",
        required: false,
        frameworks: ["NIST CSF"]
      },
      {
        code: "GIT.004",
        name: "依赖机器人配置",
        description: "检查是否配置了 Dependabot 或类似工具",
        category: "依赖管理",
        collectionMethod: "git_analysis",
        valueType: "boolean",
        riskWeight: "medium",
        required: true,
        frameworks: ["CIS Controls"]
      },
      {
        code: "GIT.005",
        name: "安全策略文件",
        description: "检查是否存在 SECURITY.md 文件",
        category: "安全流程",
        collectionMethod: "git_analysis",
        valueType: "boolean",
        riskWeight: "low",
        required: false,
        frameworks: ["NIST CSF"]
      },
      {
        code: "GIT.006",
        name: "CI/CD 安全配置",
        description: "分析 CI/CD 配置文件的安全性",
        category: "DevSecOps",
        collectionMethod: "config_parse",
        valueType: "json",
        riskWeight: "medium",
        required: true,
        frameworks: ["CIS Controls", "NIST CSF"]
      }
    ]
  },
  {
    key: "cloud_security",
    title: "云安全配置",
    icon: "cloud",
    description: "检查云服务的安全配置",
    dataPoints: [
      {
        code: "CLOUD.001",
        name: "S3 存储桶配置",
        description: "检查 S3 存储桶的公开访问和加密配置",
        category: "存储安全",
        collectionMethod: "cloud_api",
        valueType: "json",
        riskWeight: "critical",
        required: true,
        frameworks: ["CIS AWS", "NIST CSF"]
      },
      {
        code: "CLOUD.002",
        name: "IAM 配置审计",
        description: "审计 IAM 用户、角色和策略配置",
        category: "身份管理",
        collectionMethod: "cloud_api",
        valueType: "json",
        riskWeight: "high",
        required: true,
        frameworks: ["CIS AWS", "NIST CSF"]
      },
      {
        code: "CLOUD.003",
        name: "安全组配置",
        description: "检查安全组规则是否过于宽松",
        category: "网络安全",
        collectionMethod: "cloud_api",
        valueType: "json",
        riskWeight: "high",
        required: true,
        frameworks: ["CIS AWS", "NIST CSF"]
      },
      {
        code: "CLOUD.004",
        name: "加密配置",
        description: "检查静态数据和传输数据的加密配置",
        category: "数据保护",
        collectionMethod: "cloud_api",
        valueType: "json",
        riskWeight: "high",
        required: true,
        frameworks: ["CIS AWS", "PCI-DSS"]
      },
      {
        code: "CLOUD.005",
        name: "日志配置",
        description: "检查 CloudTrail、CloudWatch 等日志配置",
        category: "监控审计",
        collectionMethod: "cloud_api",
        valueType: "json",
        riskWeight: "medium",
        required: true,
        frameworks: ["CIS AWS", "SOC 2"]
      },
      {
        code: "CLOUD.006",
        name: "MFA 配置",
        description: "检查根账户和 IAM 用户的 MFA 配置",
        category: "身份管理",
        collectionMethod: "cloud_api",
        valueType: "json",
        riskWeight: "high",
        required: true,
        frameworks: ["CIS AWS", "NIST CSF"]
      },
      {
        code: "CLOUD.007",
        name: "密钥轮换",
        description: "检查访问密钥的轮换状态",
        category: "密钥管理",
        collectionMethod: "cloud_api",
        valueType: "json",
        riskWeight: "medium",
        required: true,
        frameworks: ["CIS AWS", "NIST CSF"]
      }
    ]
  },
  {
    key: "infrastructure_security",
    title: "基础设施安全",
    icon: "dns",
    description: "检查基础设施配置的安全性",
    dataPoints: [
      {
        code: "INFRA.001",
        name: "Kubernetes 配置",
        description: "检查 K8s 集群的安全配置",
        category: "容器编排",
        collectionMethod: "config_parse",
        valueType: "json",
        riskWeight: "high",
        required: true,
        frameworks: ["CIS Kubernetes", "NIST CSF"]
      },
      {
        code: "INFRA.002",
        name: "Pod 安全策略",
        description: "检查 Pod 安全策略/标准配置",
        category: "容器编排",
        collectionMethod: "config_parse",
        valueType: "json",
        riskWeight: "high",
        required: true,
        frameworks: ["CIS Kubernetes"]
      },
      {
        code: "INFRA.003",
        name: "网络策略",
        description: "检查 Kubernetes 网络策略配置",
        category: "网络安全",
        collectionMethod: "config_parse",
        valueType: "json",
        riskWeight: "medium",
        required: true,
        frameworks: ["CIS Kubernetes"]
      },
      {
        code: "INFRA.004",
        name: "Secrets 管理",
        description: "检查密钥和敏感配置的管理方式",
        category: "密钥管理",
        collectionMethod: "config_parse",
        valueType: "json",
        riskWeight: "high",
        required: true,
        frameworks: ["CIS Kubernetes", "NIST CSF"]
      },
      {
        code: "INFRA.005",
        name: "资源限制",
        description: "检查容器资源限制配置",
        category: "资源管理",
        collectionMethod: "config_parse",
        valueType: "json",
        riskWeight: "medium",
        required: true,
        frameworks: ["CIS Kubernetes"]
      },
      {
        code: "INFRA.006",
        name: "Terraform 配置",
        description: "检查 IaC 配置的安全性",
        category: "基础设施即代码",
        collectionMethod: "config_parse",
        valueType: "json",
        riskWeight: "medium",
        required: true,
        frameworks: ["CIS Controls", "NIST CSF"]
      }
    ]
  }
];

// ============================================================================
// 示例收集数据（用于测试和演示）
// ============================================================================

export const SAMPLE_COLLECTED_DATA: SecurityDataSubmission = {
  targetIdentifier: "example.com",
  targetType: "domain",
  scanId: "scan-20260209-001",
  scanStartedAt: "2026-02-09T10:00:00Z",
  scanCompletedAt: "2026-02-09T10:15:00Z",
  source: "openclaw_agent",
  agentVersion: "1.0.0",
  sections: [
    {
      sectionKey: "network_exposure",
      title: "网络暴露面",
      icon: "router",
      collectedData: [
        {
          dataPointCode: "NET.001",
          dataPointName: "开放端口列表",
          value: [
            { port: 80, service: "http", version: "nginx/1.24.0" },
            { port: 443, service: "https", version: "nginx/1.24.0" }
          ],
          collectedAt: "2026-02-09T10:01:00Z",
          status: "success"
        },
        {
          dataPointCode: "NET.002",
          dataPointName: "WAF 检测",
          value: { detected: true, provider: "Cloudflare", features: ["DDoS", "Bot Management"] },
          collectedAt: "2026-02-09T10:02:00Z",
          status: "success"
        },
        {
          dataPointCode: "NET.004",
          dataPointName: "DNS 安全配置",
          value: {
            dnssec: true,
            spf: "v=spf1 include:_spf.google.com ~all",
            dkim: true,
            dmarc: "v=DMARC1; p=reject; rua=mailto:dmarc@example.com"
          },
          collectedAt: "2026-02-09T10:03:00Z",
          status: "success"
        },
        {
          dataPointCode: "NET.005",
          dataPointName: "HTTP 安全头",
          value: {
            "Strict-Transport-Security": "max-age=31536000; includeSubDomains; preload",
            "X-Content-Type-Options": "nosniff",
            "X-Frame-Options": "DENY",
            "Content-Security-Policy": "default-src 'self'",
            "X-XSS-Protection": "1; mode=block"
          },
          collectedAt: "2026-02-09T10:04:00Z",
          status: "success"
        },
        {
          dataPointCode: "NET.007",
          dataPointName: "SSH/RDP 服务暴露",
          value: { sshExposed: false, rdpExposed: false },
          collectedAt: "2026-02-09T10:05:00Z",
          status: "success"
        }
      ]
    },
    {
      sectionKey: "ssl_tls_security",
      title: "SSL/TLS 安全",
      icon: "lock",
      collectedData: [
        {
          dataPointCode: "SSL.001",
          dataPointName: "证书有效性",
          value: {
            valid: true,
            issuer: "Let's Encrypt Authority X3",
            subject: "example.com",
            serialNumber: "03:a1:b2:c3:d4:e5:f6"
          },
          collectedAt: "2026-02-09T10:06:00Z",
          status: "success"
        },
        {
          dataPointCode: "SSL.002",
          dataPointName: "证书到期时间",
          value: "2026-05-09T00:00:00Z",
          collectedAt: "2026-02-09T10:06:00Z",
          status: "success"
        },
        {
          dataPointCode: "SSL.003",
          dataPointName: "TLS 版本支持",
          value: { tls10: false, tls11: false, tls12: true, tls13: true },
          collectedAt: "2026-02-09T10:07:00Z",
          status: "success"
        }
      ]
    },
    {
      sectionKey: "dependency_security",
      title: "依赖安全",
      icon: "inventory_2",
      collectedData: [
        {
          dataPointCode: "DEP.001",
          dataPointName: "NPM 依赖漏洞",
          value: [
            {
              package: "lodash",
              version: "4.17.15",
              vulnerability: "Prototype Pollution",
              severity: "high",
              cve: "CVE-2020-8203",
              fixedIn: "4.17.19"
            }
          ],
          collectedAt: "2026-02-09T10:10:00Z",
          status: "success",
          detectedRisks: [
            {
              severity: "high",
              description: "发现 1 个高危依赖漏洞",
              recommendation: "升级 lodash 到 4.17.19 或更高版本"
            }
          ]
        }
      ]
    }
  ],
  overallRiskScore: 75,
  metadata: {
    scanDuration: 900,
    dataPointsScanned: 45,
    dataPointsSuccessful: 42,
    dataPointsFailed: 3
  }
};

// ============================================================================
// 辅助函数
// ============================================================================

/**
 * 获取所有数据点的扁平列表
 */
export function getAllDataPoints(): DataPoint[] {
  return SECURITY_DATA_COLLECTION_TEMPLATE.flatMap(section => section.dataPoints);
}

/**
 * 根据代码获取数据点
 */
export function getDataPointByCode(code: string): DataPoint | undefined {
  return getAllDataPoints().find(dp => dp.code === code);
}

/**
 * 根据收集方法获取数据点
 */
export function getDataPointsByMethod(method: CollectionMethod): DataPoint[] {
  return getAllDataPoints().filter(dp => dp.collectionMethod === method);
}

/**
 * 根据风险权重获取数据点
 */
export function getDataPointsByRiskWeight(weight: RiskWeight): DataPoint[] {
  return getAllDataPoints().filter(dp => dp.riskWeight === weight);
}

/**
 * 计算风险评分
 */
export function calculateRiskScore(collectedData: CollectedDataValue[]): number {
  const riskWeights: Record<RiskWeight, number> = {
    critical: 40,
    high: 25,
    medium: 15,
    low: 10,
    info: 0
  };

  let totalRisk = 0;
  let maxRisk = 0;

  for (const data of collectedData) {
    const dataPoint = getDataPointByCode(data.dataPointCode);
    if (!dataPoint) continue;

    const weight = riskWeights[dataPoint.riskWeight];
    maxRisk += weight;

    // 如果有检测到的风险，增加风险分数
    if (data.detectedRisks && data.detectedRisks.length > 0) {
      for (const risk of data.detectedRisks) {
        totalRisk += riskWeights[risk.severity];
      }
    }
  }

  // 返回 0-100 的分数，100 表示最安全
  return maxRisk > 0 ? Math.max(0, 100 - Math.round((totalRisk / maxRisk) * 100)) : 100;
}
