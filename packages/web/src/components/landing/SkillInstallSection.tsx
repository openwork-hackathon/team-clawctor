import { useState } from 'react';
import type { FC } from 'react';

const SKILL_URL = 'https://raw.githubusercontent.com/openwork-hackathon/team-clawctor/main/SKILL.md';
const INSTALL_COMMAND = `Install the SKILL from
https://raw.githubusercontent.com/openwork-hackathon/team-clawctor/main/SKILL.md
Then call team-clawctor to retrieve the checklist and fill it out.`;

export const SkillInstallSection: FC = () => {
  const [copied, setCopied] = useState(false);

  const handleCopyCommand = async () => {
    try {
      await navigator.clipboard.writeText(INSTALL_COMMAND);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error('Failed to copy:', err);
    }
  };

  return (
    <section
      className="py-24 bg-gradient-to-b from-gray-50 to-white dark:from-gray-900 dark:to-background-dark"
      id="install-skill"
    >
      <div className="max-w-[1000px] mx-auto px-6">
        <div className="text-center mb-12">
          <div className="inline-flex items-center gap-2 px-4 py-2 bg-primary/10 rounded-full text-primary text-sm font-medium mb-6">
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
            </svg>
            Quick Setup
          </div>
          <h2 className="text-3xl md:text-4xl font-bold mb-4">
            Install OpenClaw Skill
          </h2>
          <p className="text-lg text-gray-600 dark:text-gray-400 max-w-2xl mx-auto">
            Add our API integration skill to your OpenClaw workspace in seconds. 
            Simply copy the URL below and save it as a skill.
          </p>
        </div>

        {/* Installation Steps */}
        <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl border border-gray-200 dark:border-gray-700 overflow-hidden">
          {/* Header */}
          <div className="bg-gray-50 dark:bg-gray-900 px-6 py-4 border-b border-gray-200 dark:border-gray-700">
            <div className="flex items-center gap-3">
              <div className="flex gap-1.5">
                <div className="w-3 h-3 rounded-full bg-red-500"></div>
                <div className="w-3 h-3 rounded-full bg-yellow-500"></div>
                <div className="w-3 h-3 rounded-full bg-green-500"></div>
              </div>
              <span className="text-sm text-gray-500 dark:text-gray-400 font-mono">
                SKILL.md
              </span>
            </div>
          </div>

          {/* Content */}
          <div className="p-6 md:p-8">
            {/* Step 1 */}
            <div className="flex gap-4 mb-8">
              <div className="flex-shrink-0 w-8 h-8 bg-primary text-white rounded-full flex items-center justify-center font-bold text-sm">
                1
              </div>
              <div className="flex-1">
                <h3 className="font-semibold text-lg mb-2">Send this to your agent to get started</h3>
                <p className="text-gray-600 dark:text-gray-400 text-sm mb-4">
                  Click the button below to copy the instructions to your clipboard, then paste it in your agent chat.
                </p>
                <div className="flex flex-col sm:flex-row gap-3">
                  <div className="flex-1 bg-gray-100 dark:bg-gray-900 rounded-lg px-4 py-3 font-mono text-sm text-gray-700 dark:text-gray-300 overflow-x-auto">
                    <pre className="whitespace-pre-wrap">{INSTALL_COMMAND}</pre>
                  </div>
                  <button
                    onClick={handleCopyCommand}
                    className={`flex-shrink-0 px-6 py-3 rounded-lg font-medium transition-all flex items-center justify-center gap-2 ${
                      copied
                        ? 'bg-green-500 text-white'
                        : 'bg-primary text-white hover:bg-primary-dark'
                    }`}
                  >
                    {copied ? (
                      <>
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                        </svg>
                        Copied!
                      </>
                    ) : (
                      <>
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
                        </svg>
                        Copy
                      </>
                    )}
                  </button>
                </div>
              </div>
            </div>

            {/* Step 2 */}
            <div className="flex gap-4 mb-8">
              <div className="flex-shrink-0 w-8 h-8 bg-primary text-white rounded-full flex items-center justify-center font-bold text-sm">
                2
              </div>
              <div className="flex-1">
                <h3 className="font-semibold text-lg mb-2">Open the Report to View Results</h3>
                <p className="text-gray-600 dark:text-gray-400 text-sm">
                  After completing the questionnaire, the system will automatically generate a security assessment report. Click to view the report for detailed security evaluation results and improvement recommendations.
                </p>
              </div>
            </div>

            {/* Divider */}
            <div className="border-t border-gray-200 dark:border-gray-700 my-8"></div>

            {/* What's Included */}
            <div>
              <h3 className="font-semibold text-lg mb-4 flex items-center gap-2">
                <svg className="w-5 h-5 text-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                What's Included
              </h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="flex items-start gap-3 p-4 bg-gray-50 dark:bg-gray-900 rounded-lg">
                  <div className="w-10 h-10 bg-blue-100 dark:bg-blue-900/30 rounded-lg flex items-center justify-center flex-shrink-0">
                    <svg className="w-5 h-5 text-blue-600 dark:text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                    </svg>
                  </div>
                  <div>
                    <h4 className="font-medium text-sm">Questionnaire API</h4>
                    <p className="text-xs text-gray-500 dark:text-gray-400">Submit security questionnaires programmatically</p>
                  </div>
                </div>
                <div className="flex items-start gap-3 p-4 bg-gray-50 dark:bg-gray-900 rounded-lg">
                  <div className="w-10 h-10 bg-green-100 dark:bg-green-900/30 rounded-lg flex items-center justify-center flex-shrink-0">
                    <svg className="w-5 h-5 text-green-600 dark:text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-3 7h3m-3 4h3m-6-4h.01M9 16h.01" />
                    </svg>
                  </div>
                  <div>
                    <h4 className="font-medium text-sm">Task Tracking</h4>
                    <p className="text-xs text-gray-500 dark:text-gray-400">Monitor assessment progress in real-time</p>
                  </div>
                </div>
                <div className="flex items-start gap-3 p-4 bg-gray-50 dark:bg-gray-900 rounded-lg">
                  <div className="w-10 h-10 bg-purple-100 dark:bg-purple-900/30 rounded-lg flex items-center justify-center flex-shrink-0">
                    <svg className="w-5 h-5 text-purple-600 dark:text-purple-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 17v-2m3 2v-4m3 4v-6m2 10H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                    </svg>
                  </div>
                  <div>
                    <h4 className="font-medium text-sm">Report Generation</h4>
                    <p className="text-xs text-gray-500 dark:text-gray-400">Get detailed HTML security reports</p>
                  </div>
                </div>
                <div className="flex items-start gap-3 p-4 bg-gray-50 dark:bg-gray-900 rounded-lg">
                  <div className="w-10 h-10 bg-orange-100 dark:bg-orange-900/30 rounded-lg flex items-center justify-center flex-shrink-0">
                    <svg className="w-5 h-5 text-orange-600 dark:text-orange-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 20l4-16m4 4l4 4-4 4M6 16l-4-4 4-4" />
                    </svg>
                  </div>
                  <div>
                    <h4 className="font-medium text-sm">SDK Examples</h4>
                    <p className="text-xs text-gray-500 dark:text-gray-400">Ready-to-use code in JS/TS and Python</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Additional Info */}
        <div className="mt-8 text-center">
          <p className="text-sm text-gray-500 dark:text-gray-400">
            Need help? Check out our{' '}
            <a href="/docs" className="text-primary hover:underline">
              documentation
            </a>{' '}
            or{' '}
            <a href="mailto:support@clawctor.com" className="text-primary hover:underline">
              contact support
            </a>
          </p>
        </div>
      </div>
    </section>
  );
};

export default SkillInstallSection;
