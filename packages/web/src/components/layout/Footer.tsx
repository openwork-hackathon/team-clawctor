import type { FC } from 'react';

interface FooterLink {
  label: string;
  href: string;
}

interface FooterSection {
  title: string;
  links: FooterLink[];
}

const footerSections: FooterSection[] = [
  {
    title: 'Product',
    links: [
      { label: 'Features', href: '#' },
      { label: 'Integrations', href: '#' },
      { label: 'Pricing', href: '#' },
      { label: 'Changelog', href: '#' },
    ],
  },
  {
    title: 'Company',
    links: [
      { label: 'About Us', href: '#' },
      { label: 'Careers', href: '#' },
      { label: 'Privacy Policy', href: '#' },
      { label: 'Terms of Service', href: '#' },
    ],
  },
  {
    title: 'Support',
    links: [
      { label: 'Documentation', href: '#' },
      { label: 'API Reference', href: '#' },
      { label: 'Community', href: '#' },
      { label: 'Help Center', href: '#' },
    ],
  },
];

export const Footer: FC = () => {
  return (
    <footer className="bg-white dark:bg-background-dark border-t border-[#f0f2f4] dark:border-gray-800 py-16">
      <div className="max-w-[1200px] mx-auto px-6">
        <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-12">
          {/* Brand Section */}
          <div className="col-span-2">
            <div className="flex items-center gap-2 mb-6">
              <span className="material-symbols-outlined text-primary text-2xl">
                shield
              </span>
              <h2 className="text-lg font-bold">
                OpenClaw <span className="text-primary">AI</span>
              </h2>
            </div>
            <p className="text-gray-500 text-sm leading-relaxed max-w-xs mb-6">
              The next generation of AI system auditing and health checkups for
              the decentralised world.
            </p>
            <div className="flex gap-4">
              <a
                className="w-10 h-10 rounded-lg bg-gray-100 dark:bg-gray-800 flex items-center justify-center hover:bg-primary/10 hover:text-primary transition-all"
                href="#"
              >
                <span className="material-symbols-outlined text-xl">share</span>
              </a>
              <a
                className="w-10 h-10 rounded-lg bg-gray-100 dark:bg-gray-800 flex items-center justify-center hover:bg-primary/10 hover:text-primary transition-all"
                href="#"
              >
                <span className="material-symbols-outlined text-xl">
                  language
                </span>
              </a>
            </div>
          </div>

          {/* Footer Sections */}
          {footerSections.map((section) => (
            <div key={section.title}>
              <h4 className="font-bold mb-6">{section.title}</h4>
              <ul className="space-y-4 text-sm text-gray-500 dark:text-gray-400">
                {section.links.map((link) => (
                  <li key={link.label}>
                    <a className="hover:text-primary" href={link.href}>
                      {link.label}
                    </a>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        {/* Bottom Bar */}
        <div className="border-t border-[#f0f2f4] dark:border-gray-800 mt-16 pt-8 flex flex-col md:flex-row justify-between items-center gap-4">
          <p className="text-sm text-gray-500">
            © 2026 Clawctor. All rights reserved.
          </p>
          <div className="flex items-center gap-6">
            <span className="flex items-center gap-2 text-xs font-bold text-green-500">
              <span className="w-2 h-2 rounded-full bg-green-500 animate-pulse"></span>
              All Systems Operational
            </span>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
