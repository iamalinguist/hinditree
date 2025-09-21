import React from 'react';

const TreeViewerFull = ({
  treeData,
  error,
  svgRef,
  handleZoom,
  downloadImage
}: any) => (
  <div className="w-full max-w-4xl mx-auto bg-white rounded-2xl shadow-xl p-6 sm:p-10">
    <h2 className="text-2xl font-bold text-gray-800 text-center mb-2">Tree Viewer</h2>
    <p className="text-sm text-gray-500 text-center mb-6">Your parse tree is displayed below.</p>
    {treeData ? (
      <>
        <div className="flex justify-center gap-4 mb-4">
          <button onClick={() => handleZoom('in')} className="px-4 py-2 bg-slate-200 text-gray-800 rounded-lg shadow-sm hover:bg-slate-300 transition-colors">Zoom In</button>
          <button onClick={() => handleZoom('out')} className="px-4 py-2 bg-slate-200 text-gray-800 rounded-lg shadow-sm hover:bg-slate-300 transition-colors">Zoom Out</button>
          <button onClick={() => downloadImage('png')} className="px-4 py-2 bg-slate-200 text-gray-800 rounded-lg shadow-sm hover:bg-slate-300 transition-colors">Download PNG</button>
          <button onClick={() => downloadImage('jpeg')} className="px-4 py-2 bg-slate-200 text-gray-800 rounded-lg shadow-sm hover:bg-slate-300 transition-colors">Download JPEG</button>
        </div>
        <p className="text-center text-sm text-gray-500 mb-4">
          Use mouse wheel to zoom or click and hold to drag.
        </p>
        <div className="overflow-hidden border border-gray-300 rounded-lg shadow-inner">
          <svg ref={svgRef} width="100%" height="600"></svg>
        </div>
      </>
    ) : (
      <p className="text-center text-red-500 font-medium">{error}</p>
    )}
  </div>
);

export default TreeViewerFull;
