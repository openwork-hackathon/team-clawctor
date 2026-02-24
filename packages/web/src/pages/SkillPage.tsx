import type { FC } from 'react';
import { Link } from '@tanstack/react-router';
import { Header, Footer } from '../components/layout';
import skillMarkdown from '../../../../SKILL.md?raw';

export const SkillPage: FC = () => {
  return (
    <>
      <Header />
      <main className="pt-24 pb-12 min-h-screen bg-[#101922]">
        <div className="max-w-5xl mx-auto px-4 md:px-8">
          <div className="mb-6 flex items-center justify-between gap-3">
            <h1 className="text-white text-2xl font-bold">/SKILL.md</h1>
            <Link
              to="/"
              className="text-sm text-[#9dcaf8] hover:text-white transition-colors"
            >
              ← Back to Home
            </Link>
          </div>
          <article className="rounded-xl border border-[#2a3947] bg-[#16222d] p-4 md:p-6">
            <pre className="text-[#d8e6f4] text-sm leading-6 whitespace-pre-wrap break-words font-mono">
              {skillMarkdown}
            </pre>
          </article>
        </div>
      </main>
      <Footer />
    </>
  );
};
