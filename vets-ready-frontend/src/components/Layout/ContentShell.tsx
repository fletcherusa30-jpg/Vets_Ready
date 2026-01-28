import React, { ReactNode } from 'react';

interface ContentShellProps {
  children: ReactNode;
  maxWidth?: 'narrow' | 'medium' | 'wide' | 'full';
  padding?: 'none' | 'small' | 'medium' | 'large';
}

export const ContentShell: React.FC<ContentShellProps> = ({
  children,
  maxWidth = 'wide',
  padding = 'medium'
}) => {
  const widthClass = {
    'narrow': 'max-w-3xl',
    'medium': 'max-w-5xl',
    'wide': 'max-w-7xl',
    'full': 'max-w-full'
  }[maxWidth];

  const paddingClass = {
    'none': 'p-0',
    'small': 'p-4',
    'medium': 'p-6 md:p-8',
    'large': 'p-8 md:p-12'
  }[padding];

  return (
    <div className={`content-shell ${widthClass} ${paddingClass}`}>
      {children}

      <style>{`
        .content-shell {
          margin: 0 auto;
          width: 100%;
        }

        .max-w-3xl {
          max-width: 48rem;
        }

        .max-w-5xl {
          max-width: 64rem;
        }

        .max-w-7xl {
          max-width: 80rem;
        }

        .max-w-full {
          max-width: 100%;
        }

        .p-0 {
          padding: 0;
        }

        .p-4 {
          padding: 1rem;
        }

        .p-6 {
          padding: 1.5rem;
        }

        .p-8 {
          padding: 2rem;
        }

        @media (min-width: 768px) {
          .md\\:p-8 {
            padding: 2rem;
          }

          .md\\:p-12 {
            padding: 3rem;
          }
        }
      `}</style>
    </div>
  );
};

export default ContentShell;
