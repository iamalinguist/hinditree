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
import { useState, useRef } from 'react';
// import * as d3 from 'd3';

// --- /src/grammar/rules.js (Simulated File) ---
// Simplified Context-Free Grammar (CFG) for Hindi in Chomsky Normal Form (CNF)
// This is a basic grammar for demonstration and can be expanded.
const method1Grammar = {
  'S': [['NP', 'VP']],
  'NP': [['Nm'], ['Nf'], ['NP', 'PP']],
  'VP': [['Verbi']],
  'Verbi': [['Vi', 'Aux']],
  'Aux': [['Am', 'Tm']],
};

const method1Categories = [
  { label: 'Determiner', hindi: 'D', color: 'bg-purple-500', hover: 'hover:bg-purple-600' },
  { label: 'Adjective', hindi: 'Adj', color: 'bg-pink-500', hover: 'hover:bg-pink-600' },
  { label: 'Adverb', hindi: 'Adv', color: 'bg-red-500', hover: 'hover:bg-red-600' },
  { label: 'Preposition', hindi: 'Prep', color: 'bg-orange-500', hover: 'hover:bg-orange-600' },
  { label: 'Conjunction', hindi: 'Conj', color: 'bg-indigo-500', hover: 'hover:bg-indigo-600' },
  { label: 'Interjection', hindi: 'I', color: 'bg-purple-500', hover: 'hover:bg-purple-600' },
  { label: 'Pronoun', hindi: 'P', color: 'bg-cyan-500', hover: 'hover:bg-cyan-600' },
  { label: 'masculine noun', hindi: 'Nm', color: 'bg-yellow-500', hover: 'hover:bg-yellow-600' },
  { label: 'feminine noun', hindi: 'Nf', color: 'bg-pink-400', hover: 'hover:bg-pink-500' },
  { label: 'transitive verb', hindi: 'Vt', color: 'bg-green-600', hover: 'hover:bg-green-700' },
  { label: 'intransitive verb', hindi: 'Vi', color: 'bg-lime-600', hover: 'hover:bg-lime-700' },
  { label: 'postpositional phrase', hindi: 'PP', color: 'bg-orange-400', hover: 'hover:bg-orange-500' },
  { label: 'negative', hindi: 'neg', color: 'bg-red-600', hover: 'hover:bg-red-700' },
  { label: 'aspect marker', hindi: 'Am', color: 'bg-teal-500', hover: 'hover:bg-teal-600' },
  { label: 'tense marker', hindi: 'Tm', color: 'bg-amber-500', hover: 'hover:bg-amber-600' },
];
// --- End of Grammar file ---

// --- /src/lib/parser.js (Simulated File) ---
// A CKY-like chart parser to construct a parse tree.
const parse = (words, assignments, grammar, rootTags) => {
  const n = words.length;
  if (n === 0) return { tree: null, error: 'Empty sentence.' };

  const table = new Array(n).fill(null).map(() => new Array(n).fill(null).map(() => ({})));
  const backpointers = new Array(n).fill(null).map(() => new Array(n).fill(null).map(() => ({})));

  // Step 1: Initialize the diagonal with terminals and apply unary rules
  for (let i = 0; i < n; i++) {
    const word = words[i];
    const assignedCategory = assignments[i];
    
    // Check for unknown POS category
    if (!assignedCategory) {
      return { tree: null, error: `Unexpected token '${assignments[i]}' found at position ${i + 1} in the following sentence: ${words.join(' ')}` };
    }

    table[i][i][assignedCategory] = true;
    backpointers[i][i][assignedCategory] = { type: 'terminal', word: word, pos: assignedCategory };

    // Apply unary closure for terminals
    let changed = true;
    while (changed) {
        changed = false;
        for (const A in grammar) {
            for (const rule of grammar[A]) {
                if (rule.length === 1 && rule[0] === assignedCategory && !table[i][i][A]) {
                    table[i][i][A] = true;
                    backpointers[i][i][A] = {
                        type: 'unary',
                        child: { i, j: i, nonTerminal: assignedCategory }
                    };
                    changed = true;
                }
            }
        }
    }
  }

  // Step 2: Fill the rest of the table with binary rules and apply unary closure
  for (let len = 2; len <= n; len++) {
    for (let i = 0; i <= n - len; i++) {
      const j = i + len - 1;

      // Binary Rules
      for (let k = i; k < j; k++) {
        for (const A in grammar) {
          for (const rule of grammar[A]) {
            if (rule.length === 2) {
              const [B, C] = rule;
              if (table[i][k][B] && table[k + 1][j][C]) {
                if (!table[i][j][A]) {
                  table[i][j][A] = true;
                  backpointers[i][j][A] = {
                    type: 'binary',
                    left: { i, j: k, nonTerminal: B },
                    right: { i: k + 1, j, nonTerminal: C }
                  };
                }
              }
            }
          }
        }
      }

      // Unary Closure
      let changed = true;
      while (changed) {
        changed = false;
        for (const A in grammar) {
          for (const rule of grammar[A]) {
            if (rule.length === 1) {
              const B = rule[0];
              if (table[i][j][B] && !table[i][j][A]) {
                table[i][j][A] = true;
                backpointers[i][j][A] = {
                  type: 'unary',
                  child: { i, j, nonTerminal: B }
                };
                changed = true;
              }
            }
          }
        }
      }
    }
  }

  // Step 3: Reconstruct the tree
  const reconstructTree = (nodeInfo) => {
    const { i, j, nonTerminal } = nodeInfo;
    const ptr = backpointers[i][j][nonTerminal];

    if (!ptr) {
        return { name: nonTerminal };
    }

    if (ptr.type === 'terminal') {
      return {
        name: ptr.pos,
        children: [{ name: ptr.word, isLeaf: true, pos: ptr.pos }]
      };
    } else if (ptr.type === 'unary') {
        return {
            name: nonTerminal,
            children: [reconstructTree(ptr.child)]
        };
    } else {
      const leftChild = reconstructTree(ptr.left);
      const rightChild = reconstructTree(ptr.right);
      return {
        name: nonTerminal,
        children: [leftChild, rightChild]
      };
    }
  };

  const possibleRoots = Object.keys(table[0][n - 1]).filter(tag => rootTags.includes(tag));
  if (possibleRoots.length > 0) {
    const rootTag = possibleRoots[0];
    return { tree: reconstructTree({ i: 0, j: n - 1, nonTerminal: rootTag }), error: null };
  } else {
    return { tree: null, error: `No complete trees found.` };
  }
};

function App() {
  const [view, setView] = useState('sentence-editor');
  const [sentence, setSentence] = useState('राम चल रहा है');
  const [words, setWords] = useState(['राम', 'चल', 'रहा', 'है']);
  const [assignments, setAssignments] = useState(['Nm', 'Vi', 'Am', 'Tm']);
  const [treeData, setTreeData] = useState(null);
  const [error, setError] = useState(null);
  const [selectedMethod, setSelectedMethod] = useState('Method 1');
  const [method1Editable, setMethod1Editable] = useState(false);
  const [showMethod1Rules, setShowMethod1Rules] = useState(false);
  const [hiddenMethods, setHiddenMethods] = useState([]);

  const [customGrammar, setCustomGrammar] = useState({});
  const [customPOS, setCustomPOS] = useState([]);
  const [customRoots, setCustomRoots] = useState([]);
  const [newRuleLHS, setNewRuleLHS] = useState('');
  const [newRuleRHS, setNewRuleRHS] = useState('');
  const [newPosInput, setNewPosInput] = useState('');
  const [newRootInput, setNewRootInput] = useState('');
  const [openFaq, setOpenFaq] = useState(null);

  const svgRef = useRef(null);

  const tailwindColors = ['red', 'orange', 'amber', 'yellow', 'lime', 'green', 'emerald', 'teal', 'cyan', 'sky', 'blue', 'indigo', 'violet', 'purple', 'fuchsia', 'pink', 'rose'];

  const handleEditMethod1 = () => {
      const password = window.prompt("Enter password to edit rules:");
      if (password === 'makeitbig') {
          setMethod1Editable(true);
      } else {
          alert('Incorrect password.');
      }
  };

  // Handle sentence input
  const handleSentenceSubmit = () => {
    const wordList = sentence.trim().split(/\s+/).filter(w => w);
    setWords(wordList);
    setAssignments(new Array(wordList.length).fill(''));
    setTreeData(null);
    setError(null);
  };

  // Handle category assignment for a specific word
  const handleAssignCategory = (index, category) => {
    const newAssignments = [...assignments];
    newAssignments[index] = category;
    setAssignments(newAssignments);
  };

  // Run the CKY parser and generate the tree
  const handleGenerateTree = () => {
    if (assignments.some(a => a === '')) {
      setError('Please assign a syntactic category to every word.');
      setTreeData(null);
      return;
    }

    let grammarToUse;
    let assignmentTags;
    let rootTagsToUse;

    if (selectedMethod === 'Your Method') {
        grammarToUse = customGrammar;
        assignmentTags = assignments;
        rootTagsToUse = customRoots.map(r => r.label);
    } else {
        grammarToUse = method1Grammar;
        assignmentTags = assignments.map(a => method1Categories.find(c => c.hindi === a)?.hindi);
        rootTagsToUse = ['S', 'NP', 'VP']; // Default roots for Method 1
    }

    const { tree, error } = parse(words, assignmentTags, grammarToUse, rootTagsToUse);
    setTreeData(tree);
    setError(error);
    setView('tree-viewer'); // Switch to the Tree Viewer after parsing
  };

  const downloadImage = (format) => {
    const svgElement = svgRef.current;
    if (!svgElement) {
      console.error('SVG element not found.');
      return;
    }
    const svgData = new XMLSerializer().serializeToString(svgElement);
    const canvas = document.createElement('canvas');
    const svgSize = svgElement.getBoundingClientRect();
    canvas.width = svgSize.width * 2;
    canvas.height = svgSize.height * 2;
    const ctx = canvas.getContext('2d');
    const img = new Image();
    img.onload = () => {
      ctx.fillStyle = '#ffffff';
      ctx.fillRect(0, 0, canvas.width, canvas.height);
      ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
      const dataUrl = canvas.toDataURL(`image/${format}`, 1.0);
      const link = document.createElement('a');
      link.href = dataUrl;
      link.download = `parse-tree.${format}`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    };
  // Unicode-safe base64 encoding for SVG
  const encodedSvg = 'data:image/svg+xml;base64,' + window.btoa(unescape(encodeURIComponent(svgData)));
  img.src = encodedSvg;
  };

  const handleAddCustomPOS = () => {
    if (newPosInput.trim() !== '') {
        const randomColor = tailwindColors[Math.floor(Math.random() * tailwindColors.length)];
        setCustomPOS(prev => [...prev, { label: newPosInput.trim(), color: `bg-${randomColor}-500` }]);
        setNewPosInput('');
    }
  };

  const handleAddCustomRoot = () => {
      if (newRootInput.trim() !== '') {
          const randomColor = tailwindColors[Math.floor(Math.random() * tailwindColors.length)];
          setCustomRoots(prev => [...prev, { label: newRootInput.trim(), color: `bg-${randomColor}-500` }]);
          setNewRootInput('');
      }
  };

  const handleAddRule = () => {
      if (newRuleLHS && newRuleRHS) {
          const rhsArray = newRuleRHS.split(' ').filter(r => r);
          setCustomGrammar(prev => {
              const newGrammar = { ...prev };
              if (!newGrammar[newRuleLHS]) {
                  newGrammar[newRuleLHS] = [];
              }
              newGrammar[newRuleLHS].push(rhsArray);
              return newGrammar;
          });
          setNewRuleLHS('');
          setNewRuleRHS('');
      }
  };

  const handleDeleteMethod = (method) => {
    setHiddenMethods(prev => [...prev, method]);
  };
  
  const handleResetMethods = () => {
    setHiddenMethods([]);
  };

  const handleDeleteCustomPOS = (index) => {
    setCustomPOS(prev => prev.filter((_, i) => i !== index));
  };
  
  const handleDeleteCustomRoot = (index) => {
    setCustomRoots(prev => prev.filter((_, i) => i !== index));
  };
  
  const handleDeleteCustomRule = (lhs, ruleIndex) => {
    setCustomGrammar(prev => {
      const newGrammar = { ...prev };
      newGrammar[lhs] = newGrammar[lhs].filter((_, i) => i !== ruleIndex);
      if (newGrammar[lhs].length === 0) {
        delete newGrammar[lhs];
      }
      return newGrammar;
    });
  };

  return (
    <div className="flex min-h-screen">
      <Sidebar view={view} setView={setView} />
      <MainContent>
        {view === 'sentence-editor' && (
          <SentenceEditor
            sentence={sentence}
            setSentence={setSentence}
            words={words}
            assignments={assignments}
            setAssignments={setAssignments}
            selectedMethod={selectedMethod}
            customPOS={customPOS}
            method1Categories={method1Categories}
            handleSentenceSubmit={handleSentenceSubmit}
            handleAssignCategory={handleAssignCategory}
            handleGenerateTree={() => handleGenerateTree()}
            error={error}
          />
        )}
        {view === 'tree-viewer' && <TreeViewer
          treeData={treeData}
          error={error}
          svgRef={svgRef}
        />}
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
