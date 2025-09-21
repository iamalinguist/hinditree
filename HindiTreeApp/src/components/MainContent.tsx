import React from 'react';
import type { ReactNode } from 'react';

interface MainContentProps {
  children: ReactNode;
}

const MainContent: React.FC<MainContentProps> = ({ children }) => {
  return (
    <main className="flex-1 p-8 bg-gray-50 min-h-screen overflow-auto">
      {children}
    </main>
  );
};

export default MainContent;
