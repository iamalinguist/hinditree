import React from 'react';

const method1Categories = [
  { hindi: 'N', label: 'Noun' },
  { hindi: 'V', label: 'Verb' },
  { hindi: 'ADJ', label: 'Adjective' },
  { hindi: 'ADV', label: 'Adverb' },
  { hindi: 'PRON', label: 'Pronoun' },
  { hindi: 'POST', label: 'Postposition' },
  { hindi: 'DET', label: 'Determiner' },
  { hindi: 'CONJ', label: 'Conjunction' },
  { hindi: 'NUM', label: 'Number' },
  { hindi: 'PART', label: 'Particle' },
  { hindi: 'INT', label: 'Interjection' },
  { hindi: 'Q', label: 'Question word' },
  { hindi: 'NEG', label: 'Negation' },
  { hindi: 'PUNC', label: 'Punctuation' },
];

const Abbreviations: React.FC = () => (
  <div className="w-full max-w-4xl mx-auto bg-white rounded-2xl shadow-xl p-6 sm:p-10">
    <h2 className="text-2xl font-bold text-gray-800 text-center mb-2">Abbreviations & Symbols</h2>
    <p className="text-sm text-gray-500 text-center mb-6">A reference for the terms used in the parser and grammar.</p>
    <div className="grid md:grid-cols-2 gap-6">
      <div>
        <h3 className="text-xl font-bold mb-3">POS Tags (Terminals)</h3>
        <ul className="list-disc list-inside space-y-2">
          {method1Categories.map(cat => (
            <li key={cat.hindi}>
              <span className="font-mono bg-gray-200 px-2 py-1 rounded-md">{cat.hindi}</span>: {cat.label}
            </li>
          ))}
        </ul>
      </div>
      <div>
        <h3 className="text-xl font-bold mb-3">Non-Terminals</h3>
        <ul className="list-disc list-inside space-y-2">
          <li><span className="font-mono bg-gray-200 px-2 py-1 rounded-md">S</span>: Sentence</li>
          <li><span className="font-mono bg-gray-200 px-2 py-1 rounded-md">NP</span>: Noun Phrase</li>
          <li><span className="font-mono bg-gray-200 px-2 py-1 rounded-md">VP</span>: Verb Phrase</li>
          <li><span className="font-mono bg-gray-200 px-2 py-1 rounded-md">Verbi</span>: Intransitive Verb Phrase</li>
          <li><span className="font-mono bg-gray-200 px-2 py-1 rounded-md">Verbt</span>: Transitive Verb Phrase</li>
          <li><span className="font-mono bg-gray-200 px-2 py-1 rounded-md">Aux</span>: Auxiliary Verb Phrase</li>
        </ul>
      </div>
    </div>
  </div>
);

export default Abbreviations;
