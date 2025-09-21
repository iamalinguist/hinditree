import { useEffect, useRef } from 'react';
import type { RefObject } from 'react';
import * as d3 from 'd3';

type TreeNode = {
  name: string;
  children?: TreeNode[];
  isLeaf?: boolean;
  pos?: string;
};

interface TreeViewerProps {
  treeData: TreeNode | null;
  error: string | null;
  svgRef: RefObject<SVGSVGElement>;
}

const TreeViewer = ({
  treeData,
  error,
  svgRef
}: TreeViewerProps) => {
  // Download image logic (moved from App)
  const downloadImage = (format: 'png' | 'jpeg') => {
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
      if (!ctx) return;
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
  const zoomRef = useRef<d3.ZoomBehavior<Element, unknown> | null>(null);
  const gRef = useRef<SVGGElement | null>(null);

  // D3 zoom and tree rendering logic

  useEffect(() => {
    if (!svgRef.current) {
      console.log('svgRef not initialized');
      return;
    }
    const svg = d3.select(svgRef.current);
    let g = gRef.current;
    if (!g) {
      g = svg.append('g').node();
      gRef.current = g;
    }
    const width = svg.node()?.getBoundingClientRect().width || 800;
    const height = 600;

    // Setup zoom only once
    if (!zoomRef.current) {
      const zoom = d3.zoom<SVGSVGElement, unknown>()
        .scaleExtent([0.1, 5])
        .on('zoom', (event: d3.D3ZoomEvent<SVGSVGElement, unknown>) => {
          d3.select(g).attr('transform', event.transform);
        });
      svg.call(zoom);
      zoomRef.current = zoom;
    }

    // Only render tree if treeData is present
    if (treeData) {
      d3.select(g).selectAll('*').remove();
      const treeLayout = d3.tree<TreeNode>().size([width - 80, height - 120]);
      const root = d3.hierarchy<TreeNode>(treeData);
      treeLayout(root);
      const linkGenerator = d3.linkVertical<d3.HierarchyPointLink<TreeNode>, d3.HierarchyPointNode<TreeNode>>()
        .x((d: d3.HierarchyPointNode<TreeNode>) => d.x)
        .y((d: d3.HierarchyPointNode<TreeNode>) => d.y);

      d3.select(g).selectAll('.link')
        .data(root.links())
        .enter()
        .append('path')
        .attr('class', 'link')
        .attr('d', linkGenerator)
        .attr('fill', 'none')
        .attr('stroke', '#ccc')
        .attr('stroke-width', 2);

      const nodes = d3.select(g).selectAll<SVGGElement, d3.HierarchyPointNode<TreeNode>>('.node')
        .data(root.descendants())
        .enter()
        .append('g')
        .attr('class', 'node')
        .attr('transform', (d: d3.HierarchyPointNode<TreeNode>) => `translate(${d.x},${d.y})`);

      nodes.append('circle')
        .attr('r', 6)
        .attr('fill', '#6366f1')
        .attr('stroke', '#4f46e5')
        .attr('stroke-width', 2);

      nodes.append('text')
        .attr('dy', '-1.5em')
        .attr('x', 0)
        .attr('text-anchor', 'middle')
        .attr('font-size', 14)
        .text((d: d3.HierarchyPointNode<TreeNode>) => d.data.name);
    }
  }, [treeData, svgRef]);

  // Zoom controls
  const handleZoom = (direction: 'in' | 'out') => {
    if (!zoomRef.current || !svgRef.current) return;
    const svg = d3.select(svgRef.current);
    if (direction === 'in') {
      svg.transition().call(zoomRef.current.scaleBy, 1.2);
    } else {
      svg.transition().call(zoomRef.current.scaleBy, 0.8);
    }
  };

  return (
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
};

export default TreeViewer;
