import React from 'react';

const SentenceEditor = ({
  sentence,
  setSentence,
  words,
  assignments,
  setAssignments,
  selectedMethod,
  customPOS,
  method1Categories,
  handleSentenceSubmit,
  handleAssignCategory,
  handleGenerateTree,
  error
}: any) => (
  <div className="w-full max-w-4xl mx-auto bg-white rounded-2xl shadow-xl p-6 sm:p-10">
    <h2 className="text-2xl font-bold text-gray-800 text-center mb-2">Sentence Editor</h2>
    <p className="text-sm text-gray-500 text-center mb-6">Assign syntactic categories to each word.</p>
    <div className="mb-6">
      <textarea
        className="w-full h-24 p-4 border-2 border-gray-300 rounded-lg focus:outline-none focus:border-indigo-500 transition-colors duration-300 shadow-inner"
        placeholder="Enter your sentence in Devanagari script here..."
        value={sentence}
        onChange={e => setSentence(e.target.value)}
      ></textarea>
    </div>
    <button
      onClick={handleSentenceSubmit}
      className="w-full px-6 py-3 bg-gradient-to-r from-indigo-500 to-purple-600 text-white font-semibold rounded-xl shadow-lg hover:shadow-xl transform hover:-translate-y-1 transition-all duration-300"
    >
      Split Sentence
    </button>
  {words.length > 0 && (
      <div className="mt-8">
        {error && <p className="text-red-500 text-center mb-4 font-medium">{error}</p>}
        <div className="flex flex-wrap gap-4 justify-center sm:justify-start">
          {words.map((word: string, index: number) => (
            <div key={index} className="flex flex-col items-center p-4 border border-gray-200 rounded-lg shadow-sm bg-gray-50 transition-transform duration-200 hover:scale-105">
              <span className="text-xl font-medium text-gray-900 mb-2">{word}</span>
              <div className="grid grid-cols-3 gap-2 mt-2">
                {(selectedMethod === 'Your Method' ? customPOS : method1Categories).map((cat: any, catIndex: number) => (
                  <button
                    key={catIndex}
                    onClick={() => handleAssignCategory(index, cat.hindi)}
                    className={`w-8 h-8 rounded-full text-white text-xs font-bold flex items-center justify-center transition-colors duration-200 ${assignments[index] === cat.hindi ? cat.color : 'bg-gray-400'}`}
                  >
                    {cat.hindi}
                  </button>
                ))}
              </div>
            </div>
          ))}
        </div>
        <button
          onClick={handleGenerateTree}
          className="w-full mt-6 px-6 py-3 bg-gradient-to-r from-green-500 to-lime-600 text-white font-semibold rounded-xl shadow-lg hover:shadow-xl transform hover:-translate-y-1 transition-all duration-300"
        >
          Generate Tree
        </button>
      </div>
    )}
  </div>
);

export default SentenceEditor;
