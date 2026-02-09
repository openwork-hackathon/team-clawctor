interface FooterLink {
  label: string;
  href: string;
}

interface FooterLinkGroupProps {
  title: string;
  links: FooterLink[];
}

function FooterLinkGroup({ title, links }: FooterLinkGroupProps) {
  return (
    <div>
      <h4 className="text-slate-900 dark:text-white font-bold mb-3 text-sm">
        {title}
      </h4>
      <ul className="text-sm text-slate-500 dark:text-slate-400 space-y-2">
        {links.map((link, index) => (
          <li key={index}>
            <a className="hover:text-primary transition-colors" href={link.href}>
              {link.label}
            </a>
          </li>
        ))}
      </ul>
    </div>
  );
}

interface FooterDetailsProps {
  aboutTitle?: string;
  aboutDescription?: string;
  linkGroups?: FooterLinkGroupProps[];
}

const defaultLinkGroups: FooterLinkGroupProps[] = [
  {
    title: 'Resources',
    links: [
      { label: 'Methodology', href: '#' },
      { label: 'Sample Report', href: '#' },
      { label: 'Help Center', href: '#' },
    ],
  },
  {
    title: 'Security',
    links: [
      { label: 'Data Privacy', href: '#' },
      { label: 'SOC2 Compliance', href: '#' },
      { label: 'Terms of Audit', href: '#' },
    ],
  },
];

export function FooterDetails({
  aboutTitle = 'About OpenClaw Reports',
  aboutDescription = 'Our health checks are powered by a combination of static code analysis, dynamic model probing, and proprietary datasets to ensure your AI systems are robust, private, and secure.',
  linkGroups = defaultLinkGroups,
}: FooterDetailsProps) {
  return (
    <div className="mt-12 mb-20 border-t border-slate-200 dark:border-slate-800 pt-8 flex flex-col md:flex-row justify-between items-start gap-8">
      <div className="max-w-md">
        <h4 className="text-slate-900 dark:text-white font-bold mb-2">
          {aboutTitle}
        </h4>
        <p className="text-sm text-slate-500 dark:text-slate-400 leading-relaxed">
          {aboutDescription}
        </p>
      </div>
      <div className="flex gap-12">
        {linkGroups.map((group, index) => (
          <FooterLinkGroup key={index} title={group.title} links={group.links} />
        ))}
      </div>
    </div>
  );
}
