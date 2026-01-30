import React, { ReactNode } from 'react';
import { Header } from './Header';
import { Footer } from './Footer';
import { ContentShell } from './ContentShell';

interface AppLayoutProps {
  children: ReactNode;
  maxWidth?: 'narrow' | 'medium' | 'wide' | 'full';
  padding?: 'none' | 'small' | 'medium' | 'large';
  showFooter?: boolean;
}

export const AppLayout: React.FC<AppLayoutProps> = ({
  children,
  maxWidth = 'wide',
  padding = 'medium',
  showFooter = true
}) => {
  return (
    <div className="app-layout">
      <Header />
      <main className="app-main">
        <ContentShell maxWidth={maxWidth} padding={padding}>
          {children}
        </ContentShell>
      </main>
      {showFooter && <Footer />}

      <style>{`
        .app-layout {
          min-height: 100vh;
          display: flex;
          flex-direction: column;
          background: var(--bg-primary);
          color: var(--text-primary);
        }

        .app-main {
          flex: 1;
        }
      `}</style>
    </div>
  );
};

export default AppLayout;
