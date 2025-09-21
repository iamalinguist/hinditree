


import Sidebar from './components/Sidebar';
import MainContent from './components/MainContent';
import SentenceEditor from './components/SentenceEditor';
import TreeViewer from './components/TreeViewer';
import SyntaxRules from './components/SyntaxRules';
import Abbreviations from './components/Abbreviations';
import FAQ from './components/FAQ';
import Support from './components/Support';
import About from './components/About';
import './App.css';
import { useState } from 'react';


function App() {
  const [view, setView] = useState('sentence-editor');

  return (
    <div className="flex min-h-screen">
      <Sidebar view={view} setView={setView} />
      <MainContent>
        {view === 'sentence-editor' && <SentenceEditor />}
        {view === 'tree-viewer' && <TreeViewer />}
        {view === 'syntax-rules' && <SyntaxRules />}
        {view === 'abbreviations' && <Abbreviations />}
        {view === 'faq' && <FAQ />}
        {view === 'support' && <Support />}
        {view === 'about' && <About />}
      </MainContent>
    </div>
  );
}

export default App
