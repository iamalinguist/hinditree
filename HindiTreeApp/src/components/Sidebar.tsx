import React, { useState } from 'react';

interface SidebarProps {
  view: string;
  setView: (view: string) => void;
}

const navItems = [
  {
    key: 'sentence-editor',
    label: 'Sentence Editor',
    icon: (
      <svg className="w-5 h-5 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"></path></svg>
    ),
    type: 'button',
  },
  {
    key: 'tree-viewer',
    label: 'Tree Viewer',
    icon: (
      <svg className="w-5 h-5 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13.5 3L12 5.25L10.5 3H6.75L12 12.75L17.25 3H13.5zM17.25 3V5.25L12 15.75L6.75 5.25V3H17.25zM12 15.75L17.25 21H6.75L12 15.75zM12 15.75L10.5 13.5L8.25 18.75H15.75L12 15.75z"></path></svg>
    ),
    type: 'button',
  },
  {
    key: 'syntax-rules',
    label: 'Syntax Rules',
    icon: (
      <svg className="w-5 h-5 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-3 7h3m-3 4h3m-6-4h.01M9 16h.01"></path></svg>
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
      <svg className="w-5 h-5 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8.228 9c.549-1.165 2.03-2 3.772-2 2.21 0 4 1.343 4 3 0 1.4-1.278 2.575-3.006 2.907-.734.145-1.547.34-1.547.495 0 .214.329.418.599.591.944.498 1.405 1.583 1.405 2.507 0 .428-.105.83-.298 1.182M14 10a2 2 0 11-4 0 2 2 0 014 0z"></path></svg>
    ),
    type: 'link',
  },
  {
    key: 'support',
    label: 'Support Page',
    icon: (
      <svg className="w-5 h-5 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M18.364 5.636l-3.536 3.536m-2.828 4.242l-3.536 3.536m2.828-4.242a2 2 0 102.828 2.828m-2.828-4.242a2 2 0 112.828 2.828"></path></svg>
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
              };
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

