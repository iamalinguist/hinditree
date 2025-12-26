import React, { useState } from 'react';

interface SidebarProps {
  view: string;
  setView: (view: string) => void;
}

const navItems = [
  {
    key: 'sentence-editor',
    label: 'Sentence',
    icon: (
      <svg className="w-5 h-5 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"></path></svg>
    ),
    type: 'button',
  },
  {
    key: 'syntax-rules',
    label: 'Methods',
    icon: (
      <svg className="w-5 h-5 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-3 7h3m-3 4h3m-6-4h.01M9 16h.01"></path></svg>
    ),
    type: 'button',
  },
  {
    key: 'tree-viewer',
    label: 'Tree Viewer',
    icon: (
      <svg className="w-5 h-5 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
        <circle cx="12" cy="5" r="2" strokeWidth="2" />
        <circle cx="6" cy="17" r="2" strokeWidth="2" />
        <circle cx="18" cy="17" r="2" strokeWidth="2" />
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 7v6M6 15h12" />
      </svg>
    ),
    type: 'button',
  },
  {
    key: 'abbreviations',
    label: 'Abbreviations',
    icon: (
      <svg className="w-5 h-5 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 20l4-16m4 4l4 4-4 4M6 16l-4-4 4-4"></path></svg>
    ),
    type: 'button',
  },
  { type: 'divider' },
  {
    key: 'faq',
    label: 'FAQ',
    icon: (
      <svg className="w-5 h-5 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 10h.01M12 10h.01M16 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 16h8M8 12h8" />
      </svg>
    ),
    type: 'link',
  },
  {
    key: 'support',
    label: 'Support Page',
    icon: (
      <svg className="w-5 h-5 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 15v-3a8 8 0 0116 0v3M6 15v4a2 2 0 002 2h.5a2.5 2.5 0 002.5-2.5V15M18 15v4a2 2 0 01-2 2h-.5a2.5 2.5 0 01-2.5-2.5V15"></path></svg>
    ),
    type: 'link',
  },
  {
    key: 'about',
    label: 'About',
    icon: (
      <svg className="w-5 h-5 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path></svg>
    ),
    type: 'link',
  },
];

const Sidebar: React.FC<SidebarProps> = ({ view, setView }) => {
  const [isOpen, setIsOpen] = useState(false); // mobile toggle

  return (
    <>
      {/* Mobile menu button */}
      <button
        className="md:hidden fixed top-4 left-4 z-50 p-2 rounded bg-indigo-600 text-white shadow"
        onClick={() => setIsOpen(!isOpen)}
        aria-label="Toggle sidebar"
      >
        ☰
      </button>

      {/* Sidebar overlay for mobile */}
      <div
        className={`fixed inset-0 z-40 bg-black bg-opacity-25 transition-opacity md:hidden ${
          isOpen ? 'opacity-100 pointer-events-auto' : 'opacity-0 pointer-events-none'
        }`}
        onClick={() => setIsOpen(false)}
      ></div>

      {/* Sidebar container */}
      <div
        className={`fixed top-0 left-0 h-full w-64 bg-white shadow-lg p-6 flex flex-col justify-between transform transition-transform duration-300 z-50
          ${isOpen ? 'translate-x-0' : '-translate-x-full'}
          md:translate-x-0 md:relative md:flex`}
      >
        <div>
          <h1
            onClick={() => setView('sentence-editor')}
            className="text-4xl font-bold mb-1 font-serif text-indigo-700 cursor-pointer text-center bg-gradient-to-r from-indigo-600 to-purple-600 text-transparent bg-clip-text"
          >
            hindi tree
          </h1>
          <p className="text-xs text-gray-500 mb-8 text-center">open access hindi parser</p>

          <nav className="space-y-4">
            {navItems.map((item, idx) => {
              if (item.type === 'divider') {
                return <div key={idx} className="border-t border-gray-200 my-4"></div>;
              }
              const isActive = typeof item.key === 'string' && view === item.key;
              const commonProps = {
                className: `flex items-center w-full p-3 rounded-lg font-semibold transition-colors duration-200 ${
                  isActive ? 'bg-indigo-100 text-indigo-700' : 'hover:bg-gray-100'
                }`,
                onClick: () => {
                  if (typeof item.key === 'string') setView(item.key);
                  setIsOpen(false); // close sidebar on mobile after click
                },
              } as any;
              if (item.type === 'button') {
                return (
                  <button key={item.key} type="button" {...commonProps}>
                    {item.icon}
                    {item.label}
                  </button>
                );
              }
              return (
                <a key={item.key} {...commonProps}>
                  {item.icon}
                  {item.label}
                </a>
              );
            })}
          </nav>
        </div>
      </div>
    </>
  );
};

export default Sidebar;

