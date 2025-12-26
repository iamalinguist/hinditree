import React, { useState } from 'react';

const faqContent = [
  { icon: 'spark', q: 'What is HindiTree?', a: 'An interactive web app for building and visualizing constituency parses for Hindi. Designed for learning, experimentation, and lightweight research.' },
  { icon: 'diff', q: 'How is this different from other parsers?', a: 'Most available tools target dependency parses or are English-centric. HindiTree focuses on constituency structure and lets you edit rules and tags directly.' },
  { icon: 'play', q: 'How do I use it?', a: 'Type a Hindi sentence, split or accept auto-splitting (e.g., suffix auxiliaries), assign POS tags, then press "Generate Tree". Use the Methods panel to switch grammars.' },
  { icon: 'bug', q: 'Parser failed to build a tree — what should I check?', a: 'Ensure every token has a category, check that assigned categories match the selected method’s grammar, and try simpler sentences to narrow the issue.' },
  { icon: 'knife', q: 'Can I add my own grammar or tags?', a: 'Yes — use the "Your Method" section to create custom POS tags, roots, and grammar rules. This is useful for experiments or language extensions.' },
  { icon: 'download', q: 'Can I export trees and cite the tool?', a: 'Yes — the tree viewer supports high-resolution PNG/JPEG export. The project is open-source; cite via the DOI/reference shown in the Methods page.' },
  { icon: 'globe', q: 'Will this work for other Indian languages?', a: 'The UI and parser are language-neutral; add appropriate tags and grammar rules to adapt the system to related languages.' },
  { icon: 'code', q: 'What tech is used?', a: 'Built with React + TypeScript, D3 for visuals, and a custom CKY-like parser implemented in the app.' },
];

const FAQ: React.FC = () => {
  const [openFaq, setOpenFaq] = useState<number | null>(null);

  const renderIcon = (type: string) => {
    switch (type) {
      case 'spark':
        return (<svg className="w-5 h-5 text-indigo-500 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 2v2m0 16v2m8-10h2M2 12H0m15.536-7.536l1.414 1.414M5.05 18.95l-1.414-1.414M18.364 18.364l1.414-1.414M5.05 5.05L3.636 6.464"/></svg>);
      case 'diff':
        return (<svg className="w-5 h-5 text-yellow-500 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 16h-1v-4h-1m1-4h.01M12 2a10 10 0 100 20 10 10 0 000-20z"/></svg>);
      case 'play':
        return (<svg className="w-5 h-5 text-green-500 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M14.752 11.168l-6.518-3.76A1 1 0 007 8.258v7.484a1 1 0 001.234.97l6.518-1.885A1 1 0 0016 14.832V11.168a1 1 0 00-1.248-.998z"/></svg>);
      case 'bug':
        return (<svg className="w-5 h-5 text-red-500 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 8h1a1 1 0 011 1v2a1 1 0 01-1 1h-1M5 8H4a1 1 0 00-1 1v2a1 1 0 001 1h1M7 21h10M12 7v1m0 8v1M7 11h10"/></svg>);
      case 'knife':
        return (<svg className="w-5 h-5 text-pink-500 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M20.24 6.24l-2.12-2.12a4 4 0 00-5.66 0L3 13.66V21h7.34L20.24 11.9a4 4 0 000-5.66z"/></svg>);
      case 'download':
        return (<svg className="w-5 h-5 text-indigo-600 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 3v12m0 0l4-4m-4 4l-4-4M21 21H3"/></svg>);
      case 'globe':
        return (<svg className="w-5 h-5 text-gray-600 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 2a10 10 0 100 20 10 10 0 000-20zM2 12h20"/></svg>);
      case 'code':
        return (<svg className="w-5 h-5 text-sky-500 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M16 18l6-6-6-6M8 6L2 12l6 6"/></svg>);
      default:
        return null;
    }
  };
  return (
    <div className="w-full max-w-4xl mx-auto bg-white rounded-2xl shadow-xl p-6 sm:p-10">
      <div className="flex items-center justify-center gap-3 mb-2">
        <h2 className="text-2xl font-bold text-gray-800">Frequently Asked Questions</h2>
      </div>
      <p className="text-sm text-gray-500 text-center mb-6">Common questions and quick tips to get the most out of HindiTree.</p>
      <div className="space-y-4">
        {faqContent.map((faq, index) => (
          <div key={index} className="border border-gray-200 rounded-lg shadow-sm">
            <button
              onClick={() => setOpenFaq(openFaq === index ? null : index)}
              className="flex justify-between items-center w-full p-4 font-semibold text-left text-gray-700 bg-gray-50 hover:bg-gray-100 transition-colors duration-200 rounded-lg focus:outline-none"
            >
              <div className="flex items-center">
                {renderIcon(faq.icon)}
                <span>{faq.q}</span>
              </div>
              <svg className={`w-5 h-5 text-gray-500 transform transition-transform duration-300 ${openFaq === index ? 'rotate-180' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7"></path></svg>
            </button>
            {openFaq === index && (
              <div className="p-4 bg-white text-gray-600 transition-all duration-300 ease-in-out">
                {faq.a}
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
};

export default FAQ;
