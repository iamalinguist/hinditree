import React from 'react';

const SyntaxRules = ({
  selectedMethod,
  setSelectedMethod,
  showMethod1Rules,
  setShowMethod1Rules,
  hiddenMethods,
  handleResetMethods,
  handleEditMethod1,
  handleDeleteMethod,
  method1Categories,
  method1Grammar,
  customPOS,
  customRoots,
  customGrammar,
  newPosInput,
  setNewPosInput,
  handleAddCustomPOS,
  handleDeleteCustomPOS,
  newRootInput,
  setNewRootInput,
  handleAddCustomRoot,
  handleDeleteCustomRoot,
  newRuleLHS,
  setNewRuleLHS,
  newRuleRHS,
  setNewRuleRHS,
  handleAddRule,
  handleDeleteCustomRule
}: any) => (
  <div className="w-full max-w-4xl mx-auto bg-white rounded-2xl shadow-xl p-6 sm:p-10">
    <h2 className="text-2xl font-bold text-gray-800 text-center mb-2">Syntax Rules</h2>
    <p className="text-sm text-gray-500 text-center mb-6">Select a method for parsing your sentences.</p>
    <div className="flex justify-end mb-4">
      <button onClick={handleResetMethods} className="px-4 py-2 rounded-lg bg-gray-200 text-gray-700 hover:bg-gray-300 transition-colors">Reset Methods</button>
    </div>
    <ul className="divide-y divide-gray-200">
      {!hiddenMethods.includes('Method 1') && (
        <>
          <li onClick={() => { setSelectedMethod('Method 1'); setShowMethod1Rules(!showMethod1Rules); }} className={`flex items-center justify-between py-4 cursor-pointer rounded-lg px-2 transition-colors duration-200 ${selectedMethod === 'Method 1' ? 'bg-indigo-50' : 'hover:bg-gray-50'}`}>
            <div className="flex items-center">
              {selectedMethod === 'Method 1' && <span className="text-green-500 mr-2 font-bold text-lg">✔</span>}
              <div>
                <h3 className="text-lg font-semibold text-gray-900">Method 1: Constituency, Trees, and Rules</h3>
                <p className="text-sm text-gray-500">15 POS Tags, 7 Syntax Rules</p>
              </div>
            </div>
            <div className="flex items-center space-x-2">
              <button onClick={(e) => { e.stopPropagation(); handleEditMethod1(); }} className="text-gray-400 hover:text-gray-600">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"></path></svg>
              </button>
              <button onClick={(e) => { e.stopPropagation(); handleDeleteMethod('Method 1'); }} className="text-gray-400 hover:text-gray-600">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"></path></svg>
              </button>
            </div>
          </li>
          {selectedMethod === 'Method 1' && showMethod1Rules && (
            <div className="mt-4">
              <div className="w-full max-w-4xl mx-auto bg-white rounded-2xl shadow-xl p-6 sm:p-10">
                <h3 className="text-xl font-bold mb-4">POS Tags and Rule Set (Method 1)</h3>
                <div className="bg-gray-50 p-6 rounded-lg shadow-inner mb-6">
                  <h4 className="text-lg font-semibold mb-2">Parts of Speech</h4>
                  <div className="flex flex-wrap gap-2 mb-4">
                    {method1Categories.map((pos, index) => (
                      <span key={index} className={`px-4 py-2 rounded-full text-white font-bold text-sm ${pos.color}`}>{pos.hindi}</span>
                    ))}
                  </div>
                  <h4 className="text-lg font-semibold mb-2">Syntax Rules</h4>
                  <div className="space-y-2 mb-4">
                    {Object.entries(method1Grammar).map(([lhs, rules], index) => (
                      <div key={index}>
                        <span className="font-semibold">{lhs} →</span>
                        {rules.map((rhs, ruleIndex) => (
                          <span key={ruleIndex} className="ml-2 bg-gray-200 px-2 py-1 rounded-md">{rhs.join(' ')}</span>
                        ))}
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          )}
        </>
      )}
      {!hiddenMethods.includes('Your Method') && (
        <>
          <li onClick={() => setSelectedMethod('Your Method')} className={`flex items-center justify-between py-4 cursor-pointer rounded-lg px-2 transition-colors duration-200 ${selectedMethod === 'Your Method' ? 'bg-indigo-50' : 'hover:bg-gray-50'}`}>
            <div className="flex items-center">
              {selectedMethod === 'Your Method' && <span className="text-green-500 mr-2 font-bold text-lg">✔</span>}
              <div>
                <h3 className="text-lg font-semibold text-gray-900">Your Method</h3>
                <p className="text-sm text-gray-500">Create your own rules and parts of speech.</p>
              </div>
            </div>
            <div className="flex items-center space-x-2">
              <button onClick={(e) => { e.stopPropagation(); handleDeleteMethod('Your Method'); }} className="text-gray-400 hover:text-gray-600">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"></path></svg>
              </button>
            </div>
          </li>
          {selectedMethod === 'Your Method' && (
            <div className="mt-8">
              <div className="w-full max-w-4xl mx-auto bg-white rounded-2xl shadow-xl p-6 sm:p-10">
                <h3 className="text-xl font-bold mb-4">Build Tags and Rules</h3>
                <div className="bg-gray-50 p-6 rounded-lg shadow-inner mb-6">
                  <h4 className="text-lg font-semibold mb-2">Parts of Speech</h4>
                  <div className="flex flex-wrap gap-2 mb-4 items-center">
                    {customPOS.map((pos, index) => (
                      <div key={index} draggable="true" onDragStart={(e) => e.dataTransfer.setData('text/plain', pos.label)} className="relative group cursor-hand">
                        <span className={`px-4 py-2 rounded-full text-white font-bold text-sm bg-${pos.color}-500`}>{pos.label}</span>
                        <button onClick={() => handleDeleteCustomPOS(index)} className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full h-5 w-5 flex items-center justify-center text-xs opacity-0 group-hover:opacity-100 transition-opacity">x</button>
                      </div>
                    ))}
                    <div className="flex items-center gap-2">
                      <input
                        type="text"
                        value={newPosInput}
                        onChange={(e) => setNewPosInput(e.target.value)}
                        placeholder="New POS"
                        className="w-24 p-2 rounded-lg border"
                      />
                      <button onClick={handleAddCustomPOS} className="px-4 py-2 rounded-full border border-gray-300 bg-white text-gray-700 font-bold text-sm hover:bg-gray-100 transition-colors">Create</button>
                    </div>
                  </div>
                  <h4 className="text-lg font-semibold mb-2">Root Tags</h4>
                  <div className="flex flex-wrap gap-2 mb-4 items-center">
                    {customRoots.map((root, index) => (
                      <div key={index} draggable="true" onDragStart={(e) => e.dataTransfer.setData('text/plain', root.label)} className="relative group cursor-hand">
                        <span className={`px-4 py-2 rounded-full text-white font-bold text-sm ${root.color}`}>{root.label}</span>
                        <button onClick={() => handleDeleteCustomRoot(index)} className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full h-5 w-5 flex items-center justify-center text-xs opacity-0 group-hover:opacity-100 transition-opacity">x</button>
                      </div>
                    ))}
                    <div className="flex items-center gap-2">
                      <input
                        type="text"
                        value={newRootInput}
                        onChange={(e) => setNewRootInput(e.target.value)}
                        placeholder="New Root"
                        className="w-24 p-2 rounded-lg border"
                      />
                      <button onClick={handleAddCustomRoot} className="px-4 py-2 rounded-full border border-gray-300 bg-white text-gray-700 font-bold text-sm hover:bg-gray-100 transition-colors">Create</button>
                    </div>
                  </div>
                  <h4 className="text-lg font-semibold mb-2">Syntax Rules</h4>
                  <div className="space-y-2 mb-4">
                    {Object.entries(customGrammar).map(([lhs, rules], index) => (
                      <div key={index} className="relative group">
                        <div className="flex items-center space-x-2">
                          <span className="font-semibold">{lhs} →</span>
                          {rules.map((rhs, ruleIndex) => (
                            <span key={ruleIndex} className="ml-2 bg-gray-200 px-2 py-1 rounded-md">{rhs.join(' ')}</span>
                          ))}
                          <button onClick={() => handleDeleteCustomRule(lhs, 0)} className="bg-red-500 text-white rounded-full h-5 w-5 flex items-center justify-center text-xs opacity-0 group-hover:opacity-100 transition-opacity">x</button>
                        </div>
                      </div>
                    ))}
                  </div>
                  <div className="flex items-center gap-2">
                    <input type="text" value={newRuleLHS} onDragOver={(e) => e.preventDefault()} onDrop={(e) => setNewRuleLHS(e.dataTransfer.getData('text/plain'))} onChange={(e) => setNewRuleLHS(e.target.value)} placeholder="LHS" className="w-24 p-2 rounded-lg border"/>
                    <span>→</span>
                    <input type="text" value={newRuleRHS} onDragOver={(e) => e.preventDefault()} onDrop={(e) => setNewRuleRHS(prev => prev + (prev ? ' ' : '') + e.dataTransfer.getData('text/plain'))} onChange={(e) => setNewRuleRHS(e.target.value)} placeholder="RHS (space separated)" className="flex-1 p-2 rounded-lg border"/>
                    <button onClick={handleAddRule} className="px-4 py-2 rounded-full border border-gray-300 bg-white text-gray-700 font-bold text-sm hover:bg-gray-100 transition-colors">Create</button>
                  </div>
                </div>
              </div>
            </div>
          )}
        </>
      )}
    </ul>
  </div>
);

export default SyntaxRules;
