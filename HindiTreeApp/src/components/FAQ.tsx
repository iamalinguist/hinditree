import React, { useState } from 'react';

const faqContent = [
  {
    q: 'What is HindiTree?',
    a: 'HindiTree is an open-access constituency parser for Hindi and related languages, allowing users to build and explore syntactic trees using customizable grammar rules.'
  },
  {
    q: 'Can I add my own syntax rules?',
    a: 'Yes! The platform is designed to be modular and theory-flexible, so you can add or modify rules to fit your needs.'
  },
  {
    q: 'What frameworks does HindiTree support?',
    a: 'Currently, HindiTree uses phrase-structure rules (CFG) as a baseline, but it is designed to support a variety of grammatical frameworks in the future.'
  },
  {
    q: 'Who can use HindiTree?',
    a: 'Researchers, teachers, students, and anyone interested in Hindi syntax can use HindiTree for free.'
  },
  {
    q: 'How do I get support?',
    a: 'For technical issues or questions, please visit the Support page or email sopan.tripathi@gmail.com.'
  },
];

const FAQ: React.FC = () => {
  const [openFaq, setOpenFaq] = useState<number | null>(null);
  return (
    <div className="w-full max-w-4xl mx-auto bg-white rounded-2xl shadow-xl p-6 sm:p-10">
      <h2 className="text-2xl font-bold text-gray-800 text-center mb-2">Frequently Asked Questions</h2>
      <p className="text-sm text-gray-500 text-center mb-6">A reference for the terms used in the parser and grammar.</p>
      <div className="space-y-4">
        {faqContent.map((faq, index) => (
          <div key={index} className="border border-gray-200 rounded-lg shadow-sm">
            <button
              onClick={() => setOpenFaq(openFaq === index ? null : index)}
              className="flex justify-between items-center w-full p-4 font-semibold text-left text-gray-700 bg-gray-50 hover:bg-gray-100 transition-colors duration-200 rounded-lg focus:outline-none"
            >
              <span>{faq.q}</span>
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
