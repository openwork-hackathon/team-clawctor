import type { FC } from 'react';

interface LegalLinksProps {
  termsUrl?: string;
  privacyUrl?: string;
  supportUrl?: string;
}

export const LegalLinks: FC<LegalLinksProps> = ({
  termsUrl = '#',
  privacyUrl = '#',
  supportUrl = '#',
}) => {
  return (
    <div className="mt-8 flex justify-center gap-6 text-xs font-medium text-gray-500 dark:text-gray-500">
      <a className="hover:text-primary transition-colors" href={termsUrl}>
        Terms of Service
      </a>
      <a className="hover:text-primary transition-colors" href={privacyUrl}>
        Privacy Policy
      </a>
      <a className="hover:text-primary transition-colors" href={supportUrl}>
        Contact Support
      </a>
    </div>
  );
};

export default LegalLinks;
