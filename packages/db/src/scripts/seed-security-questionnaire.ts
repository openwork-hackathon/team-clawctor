import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

// Security Questionnaire Data Structure
const securityQuestionnaire = {
  companyName: "clawctor",
  source: "system_seed",
  status: "DRAFT" as const,
  sections: [
    {
      sectionKey: "system_info",
      title: "1. System Information",
      icon: "computer",
      order: 1,
      questions: [
        "What is the current operating system type (Linux / Windows / macOS)?",
        "What is the OS distribution name?",
        "What is the OS version number?",
        "What is the kernel version?",
        "What is the system architecture (x86_64 / arm64 / other)?",
        "When was the system last updated or patched?",
        "What is the system uptime?",
        "Is the system running in a virtual machine or bare metal?",
        "Are automatic security updates enabled?"
      ]
    },
    {
      sectionKey: "user_permissions",
      title: "2. User & Permission Information",
      icon: "security",
      order: 2,
      questions: [
        "What user (uid/gid) is OpenClaw currently running as?",
        "Is OpenClaw running as root / Administrator?",
        "Does the current user have sudo privileges?",
        "How many user accounts exist on the machine?",
        "Are there any suspicious or unknown user accounts?",
        "Is passwordless sudo configured for any users?",
        "What are the file permissions on critical application directories?",
        "Are there any world-writable files or directories in the application path?",
        "Is SSH key-based authentication configured?",
        "Are there any users with empty passwords?"
      ]
    },
    {
      sectionKey: "runtime_environment",
      title: "3. Runtime & Development Environment",
      icon: "code",
      order: 3,
      questions: [
        "What runtimes are installed (Node.js/Python/Java/Go/Rust/etc.)?",
        "What is the Node.js version?",
        "What is the Python version?",
        "What is the Java version?",
        "Are multiple versions of the same runtime installed?",
        "Are the runtime versions LTS (Long-Term Support)?",
        "Are any runtimes end-of-life (EOL) or unsupported?",
        "Are development tools (compilers, debuggers) installed in production?",
        "What package managers are installed and what are their versions?"
      ]
    },
    {
      sectionKey: "dependencies",
      title: "4. Dependencies & Third-Party Components",
      icon: "extension",
      order: 4,
      questions: [
        "What package manager is used (npm/yarn/pnpm/pip/maven/gradle)?",
        "Does a lockfile exist (package-lock.json/yarn.lock/pnpm-lock.yaml/poetry.lock)?",
        "Can the dependency list be exported (dependency name + version)?",
        "Are there any known vulnerable dependencies (e.g., log4j, lodash, openssl)?",
        "Is dependency security scanning enabled (npm audit/pip-audit/Snyk/Dependabot)?",
        "Are there any unpinned dependencies (e.g., 'latest' or '>=')?",
        "When was the last dependency security scan performed?",
        "Are transitive dependencies also scanned for vulnerabilities?",
        "Is there a process for reviewing and updating dependencies regularly?"
      ]
    },
    {
      sectionKey: "network_exposure",
      title: "5. Network & Attack Surface",
      icon: "network_check",
      order: 5,
      questions: [
        "What network interfaces exist on the machine (IPs/NICs)?",
        "What ports are exposed externally?",
        "What services are listening on ports?",
        "Are services listening on 0.0.0.0 (all interfaces) or localhost?",
        "Are any management ports exposed to the public (SSH/Redis/MySQL/MongoDB)?",
        "Are there any suspicious port listening behaviors?",
        "Is rate limiting configured for public endpoints?",
        "Are there any unused services listening on ports?",
        "Is the application accessible from the public internet?",
        "What is the network topology (DMZ, internal network, public cloud)?"
      ]
    },
    {
      sectionKey: "tls_https",
      title: "6. TLS / HTTPS Security Configuration",
      icon: "https",
      order: 6,
      questions: [
        "Is HTTPS enabled for the service?",
        "What TLS version is being used (TLS 1.0/1.1/1.2/1.3)?",
        "Is the certificate self-signed?",
        "Is the certificate expired or about to expire?",
        "Are weak cipher suites enabled?",
        "Is HTTP Strict Transport Security (HSTS) enabled?",
        "Is certificate pinning implemented?",
        "Are TLS 1.0 and 1.1 (deprecated protocols) disabled?",
        "Is the certificate chain properly configured?",
        "Is OCSP stapling enabled?"
      ]
    },
    {
      sectionKey: "config_sensitive",
      title: "7. Configuration Files & Sensitive Information",
      icon: "key",
      order: 7,
      questions: [
        "Do .env or configuration files exist?",
        "Are there plaintext passwords in configuration files?",
        "Are there plaintext API keys or tokens in configuration files?",
        "Do environment variables contain sensitive information?",
        "Is sensitive information encrypted or masked in storage?",
        "Are default credentials present in the configuration?",
        "Are test/staging credentials being used in production?",
        "Are configuration files under version control?",
        "Is there a secrets management system in use (Vault, AWS Secrets Manager)?",
        "Are database connection strings properly secured?",
        "Are API keys rotated regularly?"
      ]
    },
    {
      sectionKey: "process_service",
      title: "8. Process & Service Status",
      icon: "settings",
      order: 8,
      questions: [
        "What critical services are currently running?",
        "Are there any suspicious or unknown processes?",
        "Are there any unusual restarts of OpenClaw-related processes?",
        "Are there any processes with abnormally high CPU/memory usage?",
        "Are there any suspicious background services running?",
        "What is the process isolation level?",
        "Are services running with appropriate user privileges?",
        "Is process monitoring/alerting configured?"
      ]
    },
    {
      sectionKey: "startup_cron",
      title: "9. Startup Items & Scheduled Tasks",
      icon: "schedule",
      order: 9,
      questions: [
        "Are there any suspicious startup items (systemd/service)?",
        "What scheduled tasks are configured (crontab/Windows Task Scheduler)?",
        "Are there any scripts from unknown sources in scheduled tasks?",
        "Are there any periodic download/execution behaviors?",
        "Are scheduled task scripts properly validated and reviewed?",
        "Do scheduled tasks run with appropriate permissions?",
        "Are there logs for scheduled task executions?"
      ]
    },
    {
      sectionKey: "resource_health",
      title: "10. Resource & System Health",
      icon: "monitor_heart",
      order: 10,
      questions: [
        "What is the current CPU usage?",
        "What is the current memory usage?",
        "What is the current disk usage?",
        "Is there abnormally low disk space?",
        "Is there abnormal network traffic (sudden spikes)?",
        "Are there any resource usage alerts configured?",
        "What is the average response time for the application?",
        "Are there any resource exhaustion concerns?",
        "Is system health monitoring in place?"
      ]
    },
    {
      sectionKey: "logging_audit",
      title: "11. Logging & Audit Capabilities",
      icon: "description",
      order: 11,
      questions: [
        "Is access logging enabled?",
        "Is error logging enabled?",
        "What is the log retention period?",
        "Is log rotation configured (logrotate)?",
        "Is there a centralized logging system (ELK/Loki/CloudWatch/Splunk)?",
        "Are security audit logs enabled (login, permission changes, critical operations)?",
        "Are logs tamper-proof or integrity-checked?",
        "Is sensitive data properly masked in logs?",
        "Are there alerts configured for suspicious log patterns?",
        "Is log access restricted to authorized personnel?",
        "Are application errors and exceptions properly logged?"
      ]
    },
    {
      sectionKey: "container_deployment",
      title: "12. Container & Deployment Environment (if applicable)",
      icon: "storage",
      order: 12,
      questions: [
        "Is OpenClaw running in a Docker container?",
        "Is OpenClaw running in a Kubernetes cluster?",
        "Is the container running in privileged mode?",
        "Does the container mount sensitive host directories?",
        "What is the base image (image name/tag)?",
        "Is the 'latest' tag being used for images?",
        "Are there container escape risk configurations?",
        "Are containers running as root user?",
        "Is image scanning performed for vulnerabilities?",
        "Are resource limits (CPU/memory) configured for containers?",
        "Are security contexts and pod security policies configured?",
        "Is the container registry secure and access-controlled?"
      ]
    },
    {
      sectionKey: "cloud_environment",
      title: "13. Cloud Environment Information (if applicable)",
      icon: "cloud",
      order: 13,
      questions: [
        "Which cloud provider is being used (AWS/GCP/Azure/Alibaba Cloud)?",
        "Is an IAM role or cloud permissions bound to the instance?",
        "Do cloud permissions exceed the principle of least privilege?",
        "Is the metadata service accessible (cloud instance metadata)?",
        "Are there any exposed cloud access keys?",
        "Are cloud security groups/firewall rules properly configured?",
        "Is multi-factor authentication (MFA) enabled for cloud accounts?",
        "Are cloud storage buckets properly secured and not publicly accessible?",
        "Is encryption at rest enabled for cloud resources?",
        "Are cloud audit logs (CloudTrail/Cloud Audit Logs) enabled?",
        "Is there a backup and disaster recovery plan in place?"
      ]
    },
    {
      sectionKey: "security_tools",
      title: "14. Security Tools & Protection Capabilities",
      icon: "shield",
      order: 14,
      questions: [
        "Is antivirus/EDR installed and enabled?",
        "Is a firewall enabled (iptables/firewalld/ufw/Windows Firewall)?",
        "Are there any firewall rules that allow all ports?",
        "Is SELinux/AppArmor enabled?",
        "Are intrusion detection tools enabled (Fail2ban/OSSEC/AIDE)?",
        "Is a Web Application Firewall (WAF) in use?",
        "Is DDoS protection configured?",
        "Are vulnerability scans performed regularly?",
        "Is there a Security Information and Event Management (SIEM) system?",
        "Are security patches applied automatically or manually reviewed?"
      ]
    },
    {
      sectionKey: "application_security",
      title: "15. Application Security",
      icon: "code_blocks",
      order: 15,
      questions: [
        "Is input validation performed on all user inputs?",
        "Are SQL injection protections in place (parameterized queries)?",
        "Is Cross-Site Scripting (XSS) prevention implemented?",
        "Is Cross-Site Request Forgery (CSRF) protection enabled?",
        "Are security headers configured (CSP, X-Frame-Options, etc.)?",
        "Is authentication properly implemented (password hashing, session management)?",
        "Is authorization checking performed for all protected resources?",
        "Are file uploads validated and restricted?",
        "Is there protection against brute force attacks?",
        "Are API endpoints properly authenticated and rate-limited?",
        "Is sensitive data encrypted in transit and at rest?"
      ]
    },
    {
      sectionKey: "backup_recovery",
      title: "16. Backup & Disaster Recovery",
      icon: "backup",
      order: 16,
      questions: [
        "Are regular backups configured?",
        "What is the backup frequency?",
        "Are backups stored in a separate location?",
        "Are backups encrypted?",
        "Has backup restoration been tested?",
        "Is there a documented disaster recovery plan?",
        "What is the Recovery Time Objective (RTO)?",
        "What is the Recovery Point Objective (RPO)?",
        "Are database backups automated?",
        "Is there version control for infrastructure configurations?"
      ]
    },
    {
      sectionKey: "compliance_policies",
      title: "17. Compliance & Security Policies",
      icon: "policy",
      order: 17,
      questions: [
        "Are there documented security policies?",
        "Is security awareness training provided to team members?",
        "Are there incident response procedures?",
        "Is there a data retention policy?",
        "Are compliance requirements identified (GDPR, HIPAA, PCI-DSS)?",
        "Are regular security audits conducted?",
        "Is there a vulnerability disclosure policy?",
        "Are third-party security assessments performed?",
        "Is there a change management process?",
        "Are security metrics and KPIs tracked?"
      ]
    }
  ]
};

async function seedQuestionnaire() {
  try {
    console.log('Starting security questionnaire generation...\n');

    // Create questionnaire submission record
    const submission = await prisma.questionnaireSubmission.create({
      data: {
        companyName: securityQuestionnaire.companyName,
        source: securityQuestionnaire.source,
        status: securityQuestionnaire.status,
        sessionVerified: false,
      }
    });

    console.log(`✓ Created questionnaire submission: ${submission.id}`);

    // Create sections and questions
    for (const sectionData of securityQuestionnaire.sections) {
      const section = await prisma.questionnaireSection.create({
        data: {
          submissionId: submission.id,
          sectionKey: sectionData.sectionKey,
          title: sectionData.title,
          icon: sectionData.icon,
          order: sectionData.order,
        }
      });

      console.log(`  ✓ Created section: ${sectionData.title}`);

      // Create answer records for each question (initially empty)
      for (let i = 0; i < sectionData.questions.length; i++) {
        const question = sectionData.questions[i];
        const questionCode = `${sectionData.order}.${i + 1}`;

        await prisma.questionnaireAnswer.create({
          data: {
            sectionId: section.id,
            questionCode,
            questionText: question,
            order: i + 1,
            status: 'ANSWERED',
            answerText: null, // Initially empty, waiting to be filled
          }
        });
      }

      console.log(`    → Created ${sectionData.questions.length} questions\n`);
    }

    console.log('━'.repeat(60));
    console.log('✓ Security questionnaire generation completed!');
    console.log(`  Questionnaire ID: ${submission.id}`);
    console.log(`  Total sections: ${securityQuestionnaire.sections.length}`);
    console.log(`  Total questions: ${securityQuestionnaire.sections.reduce((sum, s) => sum + s.questions.length, 0)}`);
    console.log('━'.repeat(60));

  } catch (error) {
    console.error('Failed to generate questionnaire:', error);
    throw error;
  } finally {
    await prisma.$disconnect();
  }
}

// Run the script
seedQuestionnaire();
