import React from 'react';

const About: React.FC = () => (
  <div className="w-full max-w-4xl mx-auto bg-white rounded-2xl shadow-xl p-6 sm:p-10">
    <h2 className="text-2xl font-bold text-gray-800 mb-4">About Hindi Tree</h2>
    <div className="text-lg text-gray-700 leading-relaxed space-y-6">
      <h3 className="text-xl font-bold">What?</h3>
      <p>This tool automatically builds linguistics syntax trees for Hindi and Hindi-like (syntactically) languages.</p>
      <p>A major goal of this tool is to accept a broad set of syntax rules. Nearly every textbook has different rules and standards. Along with standard rules, I want others to be able to add/modify the rules to work for them.</p>
      <p>I have included an annotated sentence and syntax rules from my Paper 'Hindi Tree: An Open-Access Constituency Parser for Hindi'.</p>

      <h3 className="text-xl font-bold">Why?</h3>
      <p>In English, syntactic parsing has already gone through decades of development. Researchers have created large annotated treebanks like the Penn Treebank, and today’s parsers are statistical or neural, trained on millions of examples. By 2014, building a purely rule-based CFG parser for English already looked outdated, because more advanced approaches had become standard.</p>
      <p>Hindi, however, is still in an earlier stage. Most work has focused on dependency parsing, and the few constituency parsers available are usually adapted from English frameworks that do not capture Hindi’s unique features such as gender, free word order, postpositions, agreement, and complex predicates. Large-scale treebanks are limited, and there is no easy, open-access tool that allows researchers, teachers, or learners to explore Hindi syntax directly.</p>
      <p>Hindi Tree aims to change that. It is the first open-access constituency parser built specifically for Hindi. The current version is implemented with phrase-structure rules (CFG), but the platform is designed to be "modular and theory-flexible". That means the same Hindi sentence could eventually be parsed under a variety of grammatical frameworks, including:</p>
      <ol className="list-decimal list-inside space-y-1 ml-4">
        <li>Phrase Structure Grammar / CFG (baseline)</li>
        <li>X-bar Theory</li>
        <li>Government and Binding / Principles and Parameters</li>
        <li>Minimalist Program</li>
        <li>Categorial Grammar (CG)</li>
        <li>Lexical Functional Grammar (LFG)</li>
        <li>Tree Adjoining Grammar (TAG)</li>
        <li>Combinatory Categorial Grammar (CCG)</li>
        <li>Head-Driven Phrase Structure Grammar (HPSG)</li>
      </ol>
      <p>This flexibility allows HindiTree not only to provide practical parses, but also to serve as a teaching and research tool: users can compare how the same Hindi sentence looks when analyzed under different theoretical traditions. By making the tool freely available on the web, HindiTree opens up Hindi syntax for exploration, experimentation, and future advancement.</p>

      <h3 className="text-xl font-bold">When?</h3>
      <p>[Sept, 2025] This is version 1.0 of Hindi tree that uses CFG to parse sentences.</p>
    </div>
  </div>
);

export default About;
