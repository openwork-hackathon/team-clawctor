import type { FC } from 'react';

export const SecurityFooter: FC = () => {
  return (
    <div className="mt-8 pt-6 border-t border-gray-100 dark:border-gray-800 flex items-center justify-center gap-2 text-xs text-gray-400">
      <span className="material-symbols-outlined text-[16px] text-green-500">verified_user</span>
      <span>256-bit SSL Secure &amp; Encrypted</span>
    </div>
  );
};

export default SecurityFooter;
