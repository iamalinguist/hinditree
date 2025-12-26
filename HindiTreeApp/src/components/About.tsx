import React from 'react';

const About: React.FC = () => (
  <div className="w-full max-w-4xl mx-auto bg-white rounded-2xl shadow-xl p-6 sm:p-10">
    <h2 className="text-2xl font-bold text-gray-800 mb-4">About Hindi Tree</h2>
    <div className="text-lg text-gray-700 leading-relaxed space-y-6">
        <p className="text-base">Hindi Tree is a lightweight, open-access tool to create and explore constituency (phrase-structure) parses for Hindi and Hindi-like languages. It focuses on clarity, teachability, and extensibility — you can view built-in rules or add your own.</p>

        <section className="flex items-start gap-3">
          <svg className="w-6 h-6 text-indigo-500 mt-1" viewBox="0 0 24 24" fill="none" stroke="currentColor" xmlns="http://www.w3.org/2000/svg"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 16h-1v-4h-1m1-4h.01M12 2a10 10 0 100 20 10 10 0 000-20z"/></svg>
          <div>
            <h4 className="font-semibold">Overview</h4>
            <p className="text-sm text-gray-600">Builds syntax trees from user-assigned parts of speech and grammar rules. The parser uses a simple chart algorithm and is intended for teaching, experimentation, and lightweight research.</p>
          </div>
        </section>

        <section className="flex items-start gap-3">
          <svg className="w-6 h-6 text-yellow-500 mt-1" viewBox="0 0 24 24" fill="none" stroke="currentColor" xmlns="http://www.w3.org/2000/svg"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M11 2v2M4.22 4.22l1.42 1.42M2 11h2m16 0h2M18.36 4.22l-1.42 1.42M6.34 17.66l-1.42 1.42M20 11a9 9 0 11-18 0 9 9 0 0118 0z"/></svg>
          <div>
            <h4 className="font-semibold">Why this project</h4>
            <p className="text-sm text-gray-600">Hindi lacks widely available constituency tools that capture its morphology and agreement patterns. This project provides a modular CFG-based parser and UI so users can experiment with different rule sets and study parses interactively.</p>
          </div>
        </section>

        <section className="flex items-start gap-3">
          <svg className="w-6 h-6 text-green-500 mt-1" viewBox="0 0 24 24" fill="none" stroke="currentColor" xmlns="http://www.w3.org/2000/svg"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"/></svg>
          <div>
            <h4 className="font-semibold">Key features</h4>
            <ul className="text-sm text-gray-600 list-disc ml-5 space-y-1">
              <li>Interactive sentence editor with assignable POS tags.</li>
              <li>Multiple parsing methods (toggleable) and editable grammar rules.</li>
              <li>SVG tree visualizer with download/export support.</li>
              <li>Designed for teaching: compare parses and tweak rules live.</li>
            </ul>
          </div>
        </section>

        <section className="flex items-start gap-3">
          <svg className="w-6 h-6 text-gray-500 mt-1" viewBox="0 0 24 24" fill="none" stroke="currentColor" xmlns="http://www.w3.org/2000/svg"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8c-1.657 0-3 1.567-3 3.5S10.343 15 12 15s3-1.567 3-3.5S13.657 8 12 8z"/><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 2v2m0 16v2M4.93 4.93l1.41 1.41M17.66 17.66l1.41 1.41M2 12h2m16 0h2M4.93 19.07l1.41-1.41M17.66 6.34l1.41-1.41"/></svg>
          <div>
            <h4 className="font-semibold">Version</h4>
            <p className="text-sm text-gray-600">v1.0 — CFG-based parsing (September 2025). Future plans include improved grammar formats, better font embedding for exports, and richer parsing backends.</p>
          </div>
        </section>
      </div>
  </div>
);

export default About;
