import * as d3 from 'd3';
import type { RefObject } from 'react';

export type TreeNode = {
  name: string;
  children?: TreeNode[];
  isLeaf?: boolean;
  pos?: string;
};

export function drawTree(
  g: SVGGElement,
  treeData: TreeNode,
  width: number,
  verticalGap: number = 100,
  horizontalGap: number = 120
) {
  const group = d3.select(g);
  group.selectAll('*').remove();
  // Compute leaf counts and assign horizontal positions so subtrees get proportional space
  let leafCounter = 0;

  const getLeafCount = (node: TreeNode): number => {
    if (!node.children || node.children.length === 0) return 1;
    let sum = 0;
    node.children.forEach(c => {
      sum += getLeafCount(c);
    });
    return sum;
  };

  // Assign x positions to leaves (in-order traversal)
  const assignLeafX = (node: TreeNode, depth: number) => {
    if (!node.children || node.children.length === 0) {
      // leaf
      (node as any)._x = leafCounter * horizontalGap;
      (node as any)._y = depth * verticalGap;
      leafCounter++;
      return;
    }
    node.children.forEach(child => assignLeafX(child, depth + 1));
    // internal node x is mean of children x
    const xs = node.children.map(c => (c as any)._x);
    (node as any)._x = xs.reduce((a, b) => a + b, 0) / xs.length;
    (node as any)._y = depth * verticalGap;
  };

  assignLeafX(treeData, 0);

  // Normalize positions so tree is centered in available width
  const minX = (function findMin(n: TreeNode): number {
    let m = (n as any)._x;
    if (n.children) {
      n.children.forEach(c => { m = Math.min(m, findMin(c)); });
    }
    return m;
  })(treeData);
  const maxX = (function findMax(n: TreeNode): number {
    let m = (n as any)._x;
    if (n.children) {
      n.children.forEach(c => { m = Math.max(m, findMax(c)); });
    }
    return m;
  })(treeData);

  const treeWidth = maxX - minX || 1;
  const offsetX = width / 2 - (minX + treeWidth / 2);
  const startY = 80;

  // Apply offset and compute absolute y positions
  const applyOffset = (node: TreeNode) => {
    (node as any)._x = (node as any)._x + offsetX;
    (node as any)._y = (node as any)._y + startY;
    if (node.children) node.children.forEach(c => applyOffset(c));
  };

  applyOffset(treeData);

  // Draw nodes and links using computed coordinates
  const drawNodeAt = (node: TreeNode) => {
    const x = (node as any)._x;
    const y = (node as any)._y;

    // Draw link from parent to children
    if (node.children) {
      node.children.forEach(child => {
        const cx = (child as any)._x;
        const cy = (child as any)._y;
        // Leave a small margin between label text and the connecting line without increasing overall vertical spacing
        const fontSize = 20; // should match text font-size above
        const margin = 6; // gap in px between text bbox and line
        const parentLinkY = y + fontSize / 2 + margin; // slightly below parent text
        const childLinkYRaw = cy - fontSize / 2 - margin; // slightly above child text
        // Reduce the visual bar length by 10% while keeping the gap to labels
        const fullDy = Math.max(0, childLinkYRaw - parentLinkY);
        const shrinkFactor = 0.10; // reduce length by 10%
        const childLinkY = parentLinkY + Math.max(0, fullDy * (1 - shrinkFactor));
        group
          .append('line')
          .attr('class', 'link')
          .attr('x1', x)
          .attr('y1', parentLinkY)
          .attr('x2', cx)
          .attr('y2', childLinkY)
          .attr('stroke', '#000')
          .attr('stroke-width', 2);
        drawNodeAt(child);
      });
    }

    // Determine if this is a lexical (leaf) node early so we can set font-family accordingly
    const isLeaf = !node.children || node.children.length === 0;

    // Draw text label for this node inside a group so we can add a background for leaves
    const nodeGroup = group.append('g').attr('transform', `translate(${x},${y})`);
    const textEl = nodeGroup
      .append('text')
      .attr('class', 'node-text')
      .attr('x', 0)
      .attr('y', 0)
      .attr('dy', '0.35em')
      .attr('text-anchor', 'middle')
      .attr('font-size', 20)
      .attr('font-weight', 'bold')
      .attr('fill', '#22223b')
      .attr('font-family', "'Roboto', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif")
      .text(node.name);

    if (isLeaf) {
      // Measure text bbox after it has been added
      const bbox = (textEl.node() as SVGTextElement).getBBox();
      const padX = 8;
      const padY = 4;
      // Insert rect before text
      nodeGroup
        .insert('rect', 'text')
        .attr('x', bbox.x - padX)
        .attr('y', bbox.y - padY)
        .attr('width', bbox.width + padX * 2)
        .attr('height', bbox.height + padY * 2)
        .attr('rx', 6)
        .attr('ry', 6)
        .attr('fill', '#f3f4f6')
        .attr('stroke', 'none');
    }
  };

  drawNodeAt(treeData);
}

// Download as image (high resolution PNG)
export function downloadImage(svgRef: RefObject<SVGSVGElement | null>, gRef: RefObject<SVGGElement | null>, format: 'png' | 'jpeg' = 'png') {
  const svgElement = svgRef.current;
  const gElement = gRef.current;
  if (!svgElement || !gElement) return;
  const padding = 20; // extra space in pixels around tree
  const scale = 6; // export scale for high resolution

  // Get rendered sizes and positions (in CSS pixels)
  const svgRect = svgElement.getBoundingClientRect();
  const gRect = (gElement as Element).getBoundingClientRect();
  if (svgRect.width === 0 || svgRect.height === 0 || gRect.width === 0 || gRect.height === 0) return;

  // Serialize the SVG but set explicit width/height to the rendered size so the <img> renders at correct pixel dimensions
  const svgClone = svgElement.cloneNode(true) as SVGSVGElement;
  svgClone.setAttribute('width', String(Math.round(svgRect.width)));
  svgClone.setAttribute('height', String(Math.round(svgRect.height)));
  svgClone.setAttribute('viewBox', `0 0 ${Math.round(svgRect.width)} ${Math.round(svgRect.height)}`);

  // Ensure SVG has namespace attributes
  if (!svgClone.getAttribute('xmlns')) svgClone.setAttribute('xmlns', 'http://www.w3.org/2000/svg');
  if (!svgClone.getAttribute('xmlns:xlink')) svgClone.setAttribute('xmlns:xlink', 'http://www.w3.org/1999/xlink');

  // Inline computed styles from the live SVG into the clone so exported raster matches on-screen appearance
  try {
    const srcElems = svgElement.querySelectorAll('*');
    const cloneElems = svgClone.querySelectorAll('*');
    for (let i = 0; i < srcElems.length && i < cloneElems.length; i++) {
      const src = srcElems[i] as Element;
      const dst = cloneElems[i] as Element;
      const comp = window.getComputedStyle(src as Element);
      // Apply relevant properties only to avoid overly verbose SVG
      const props = [
        'font-family', 'font-size', 'font-weight', 'fill', 'stroke', 'stroke-width', 'text-anchor', 'letter-spacing'
      ];
      const styleParts: string[] = [];
      props.forEach(p => {
        const v = comp.getPropertyValue(p);
        if (v) styleParts.push(`${p}: ${v};`);
      });
      if (styleParts.length) dst.setAttribute('style', styleParts.join(' '));
    }
  } catch (e) {
    // If inlining fails, continue — export may fallback to default fonts
    // eslint-disable-next-line no-console
    console.warn('Failed to inline SVG styles for export', e);
  }

  const serialized = new XMLSerializer().serializeToString(svgClone);
  const encoded = 'data:image/svg+xml;charset=utf-8,' + encodeURIComponent(serialized);

  const img = new Image();
  img.onload = () => {
    // Draw the full svg onto a temporary high-res canvas, then crop the tree bounding box area
    const tmpCanvas = document.createElement('canvas');
    tmpCanvas.width = Math.round(svgRect.width * scale);
    tmpCanvas.height = Math.round(svgRect.height * scale);
    const tctx = tmpCanvas.getContext('2d');
    if (!tctx) return;

    // Fill white background
    tctx.fillStyle = '#fff';
    tctx.fillRect(0, 0, tmpCanvas.width, tmpCanvas.height);

    // Draw the SVG scaled up to high resolution
    tctx.drawImage(img, 0, 0, tmpCanvas.width, tmpCanvas.height);

    // Compute crop rect in pixels relative to svg image
    const dx = Math.round((gRect.left - svgRect.left) * scale);
    const dy = Math.round((gRect.top - svgRect.top) * scale);
    const dw = Math.round((gRect.width + padding * 2) * scale);
    const dh = Math.round((gRect.height + padding * 2) * scale);

    // Create final canvas sized to the cropped tree area
    const finalCanvas = document.createElement('canvas');
    finalCanvas.width = dw;
    finalCanvas.height = dh;
    const fctx = finalCanvas.getContext('2d');
    if (!fctx) return;

    // Fill background
    fctx.fillStyle = '#fff';
    fctx.fillRect(0, 0, finalCanvas.width, finalCanvas.height);

    // Draw the cropped region from the temp canvas into the final canvas
    fctx.drawImage(
      tmpCanvas,
      dx - padding * scale,
      dy - padding * scale,
      dw,
      dh,
      0,
      0,
      dw,
      dh
    );

      // Export image according to requested format
      let dataUrl: string;
      let filename = 'parse-tree';
      if (format === 'jpeg') {
        dataUrl = finalCanvas.toDataURL('image/jpeg', 0.95);
        filename += '.jpg';
      } else {
        dataUrl = finalCanvas.toDataURL('image/png');
        filename += '.png';
      }
      const link = document.createElement('a');
      link.href = dataUrl;
      link.download = filename;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  img.onerror = (e) => {
    console.error('Failed to load SVG image for export', e);
  };

  img.src = encoded;
};

