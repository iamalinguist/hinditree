import React, { useState } from 'react';

const faqContent = [
    { q: "What is HindiTree?", a: "HindiTree is an open-access constituency parser built specifically for Hindi sentences, available as a free web app." },
    { q: "How is this different from existing parsers?", a: "Most existing parsers are English-focused or dependency-based; HindiTree directly models Hindi’s unique structures like free word order, postpositions, and complex predicates." },
    { q: "Isn’t this just a CFG parser?", a: "The first version is CFG-based, but HindiTree is modular and designed to incorporate richer frameworks such as X-bar, Minimalist, Paninian, LFG, TAG, CCG, and HPSG." },
    { q: "Why does Hindi need its own parser?", a: "Because English has decades of advanced parsers and large treebanks, while Hindi still lacks open, accessible tools for exploring constituency structure." },
    { q: "Can the same sentence look different in different theories?", a: "Yes. For example, “राम ने सेब खाया” can be parsed in CFG as NP–VP, in X-bar with XP/X′ layers, or in Paninian with Karta–Karma–Kriya roles." },
    { q: "Who can use HindiTree?", a: "Researchers, teachers, students, and anyone curious about Hindi grammar or NLP can use it freely in their browser." },
    { q: "Does HindiTree need installation?", a: "No. It’s fully web-based. Just open the site, type a Hindi sentence, and see the tree." },
    { q: "Will HindiTree support other Indian languages?", a: "Yes, the framework can be extended to related languages like Marathi, Bhojpuri, or Bangla with adapted grammar rules." },
    { q: "Can I download or cite HindiTree?", a: "Yes. The code and grammar are open-source on GitHub, and a DOI (via Zenodo) will be provided for citation." },
    { q: "What’s next for HindiTree?", a: "Future versions will include more grammatical frameworks, automatic tagging, richer corpora integration, and side-by-side comparisons of different theories." },
    { q: "What technologies are used in Hindi Tree?", a: "Hindi Tree is built with React and D3.js. The parsing logic is a custom CKY-like algorithm written in JavaScript." },
    { q: "Why is the parser failing to generate a tree?", a: "This can happen if the sentence is incomplete or the POS tags you have assigned do not match a valid grammar rule. Make sure every word has a tag and try again." },
    { q: "Can I use this for other Indian languages?", a: "Yes, the framework can be adapted. However, you will need to define the specific POS tags and grammar rules for that language in the 'Your Method' section." },
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
