

import Sidebar from './components/Sidebar';
import MainContent from './components/MainContent';
import './App.css';
import { useState } from 'react';


function App() {
  const [view, setView] = useState('sentence-editor');

  return (
    <div className="flex min-h-screen">
      <Sidebar view={view} setView={setView} />
      <MainContent>
        {view === 'sentence-editor' && (
          <>
            <h1 className="text-3xl font-bold underline mb-4">Sentence Editor</h1>
            <p className="text-lg text-gray-700">Welcome to HindiTree. Select an option from the sidebar to get started.</p>
          </>
        )}
        {view === 'tree-viewer' && (
          <h1 className="text-3xl font-bold mb-4">Tree Viewer</h1>
        )}
        {view === 'syntax-rules' && (
          <h1 className="text-3xl font-bold mb-4">Syntax Rules</h1>
        )}
        {view === 'abbreviations' && (
          <h1 className="text-3xl font-bold mb-4">Abbreviations</h1>
        )}
        {view === 'faq' && (
          <h1 className="text-3xl font-bold mb-4">FAQ</h1>
        )}
        {view === 'support' && (
          <h1 className="text-3xl font-bold mb-4">Support Page</h1>
        )}
        {view === 'about' && (
          <h1 className="text-3xl font-bold mb-4">About</h1>
        )}
      </MainContent>
    </div>
  );
}

export default App
