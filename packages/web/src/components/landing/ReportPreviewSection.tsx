import type { FC } from 'react';

export const ReportPreviewSection: FC = () => {
  return (
    <section className="py-24 max-w-[1200px] mx-auto px-6">
      <div className="bg-primary/5 rounded-[2rem] p-8 md:p-16 overflow-hidden">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
          {/* Report Preview Card */}
          <div className="order-2 lg:order-1">
            <div className="bg-white dark:bg-gray-800 rounded-xl shadow-2xl p-6 space-y-6">
              <div className="flex items-center justify-between border-b pb-4 dark:border-gray-700">
                <div>
                  <p className="text-[10px] uppercase font-bold text-gray-400">
                    Security Audit Report
                  </p>
                  <h4 className="font-bold">Project_Phoenix_Final</h4>
                </div>
                <span className="bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400 px-3 py-1 rounded-full text-xs font-bold">
                  Secure
                </span>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="p-4 bg-gray-50 dark:bg-gray-900/50 rounded-lg">
                  <p className="text-xs text-gray-500">Compliance Score</p>
                  <p className="text-2xl font-black text-primary">98%</p>
                </div>
                <div className="p-4 bg-gray-50 dark:bg-gray-900/50 rounded-lg">
                  <p className="text-xs text-gray-500">Vulnerabilities</p>
                  <p className="text-2xl font-black text-red-500">02</p>
                </div>
              </div>
              <div className="space-y-3">
                <div className="h-2 w-full bg-gray-100 dark:bg-gray-700 rounded-full overflow-hidden">
                  <div className="h-full bg-primary w-[90%]"></div>
                </div>
                <div className="flex justify-between text-xs font-semibold">
                  <span>Database Integrity</span>
                  <span>Excellent</span>
                </div>
              </div>
            </div>
          </div>

          {/* Content */}
          <div className="order-1 lg:order-2 space-y-6">
            <h2 className="text-4xl font-bold leading-tight">
              Insightful reports at your fingertips
            </h2>
            <p className="text-gray-600 dark:text-gray-400">
              Our AI scans over 2,000 security vectors in seconds, providing a
              comprehensive overview of your system health that's easy to read
              and act upon.
            </p>
            <ul className="space-y-4">
              <li className="flex items-center gap-3">
                <span className="material-symbols-outlined text-primary text-xl">
                  check_circle
                </span>
                <span className="font-semibold">SOC2 & ISO 27001 Readiness</span>
              </li>
              <li className="flex items-center gap-3">
                <span className="material-symbols-outlined text-primary text-xl">
                  check_circle
                </span>
                <span className="font-semibold">Real-time Threat Monitoring</span>
              </li>
              <li className="flex items-center gap-3">
                <span className="material-symbols-outlined text-primary text-xl">
                  check_circle
                </span>
                <span className="font-semibold">Automated Mitigation Steps</span>
              </li>
            </ul>
          </div>
        </div>
      </div>
    </section>
  );
};

export default ReportPreviewSection;
