import { useEffect, useRef } from 'react';
import type { RefObject } from 'react';
import * as d3 from 'd3';
import TreeControls from './TreeControls';
import { downloadImage, drawTree, type TreeNode } from './treeUtils';

interface TreeViewerProps {
  treeData: TreeNode | null;
  error: string | null;
  svgRef: RefObject<SVGSVGElement | null>;
}

const TreeViewer = ({ treeData, error, svgRef }: TreeViewerProps) => {
  const zoomRef = useRef<d3.ZoomBehavior<Element, unknown> | null>(null);
  const gRef = useRef<SVGGElement | null>(null);


  // D3 logic
  useEffect(() => {
    if (!svgRef.current) return;

    const svg = d3.select(svgRef.current);
    let g = gRef.current;
    if (!g) {
      g = svg.append('g').node();
      gRef.current = g;
    }

    const width = svg.node()?.getBoundingClientRect().width || 800;

    if (!zoomRef.current) {
      const zoom = d3
        .zoom<SVGSVGElement, unknown>()
        .scaleExtent([0.1, 5])
        .on('zoom', (event: d3.D3ZoomEvent<SVGSVGElement, unknown>) => {
          d3.select(g).attr('transform', event.transform);
        });
      svg.call(zoom);
      zoomRef.current = zoom;
    }

    if (treeData) {
      drawTree(g!, treeData, width);
    }
  }, [treeData, svgRef]);

  const handleZoom = (direction: 'in' | 'out') => {
    if (!zoomRef.current || !svgRef.current) return;
    const svg = d3.select(svgRef.current);
    svg.transition().call(
      zoomRef.current.scaleBy,
      direction === 'in' ? 1.2 : 0.8
    );
  };

  return (
    <div className="w-full max-w-4xl mx-auto bg-white rounded-2xl shadow-xl p-6 sm:p-10">
      <h2 className="text-2xl font-bold text-gray-800 text-center mb-2">Tree Viewer</h2>
      <p className="text-sm text-gray-500 text-center mb-6">Your parse tree is displayed below.</p>

      {treeData ? (
        <>
          {/* Container with relative positioning so controls can be placed inside */}
          <div className="relative overflow-hidden border border-gray-300 rounded-lg shadow-inner">
            {/* Controls pinned to top-right inside the canvas */}
            <div className="absolute top-2 right-2 z-10 flex space-x-2 bg-white bg-opacity-80 p-1 rounded-md shadow">
              <TreeControls
                onZoomIn={() => handleZoom('in')}
                onZoomOut={() => handleZoom('out')}
                onDownload={() => downloadImage(svgRef, gRef)}
              />
            </div>

            {/* The SVG canvas */}
            <svg ref={svgRef} width="100%" height="600"></svg>
          </div>
        </>
      ) : (
        <p className="text-center text-red-500 font-medium">{error}</p>
      )}
    </div>
  );
};

export default TreeViewer;
