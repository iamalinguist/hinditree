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

  function drawNode(node: TreeNode, x: number, y: number, parentX?: number, parentY?: number, isChild: boolean = false) {
    // Draw line
    if (parentX !== undefined && parentY !== undefined) {
      const dx = x - parentX;
      const dy = y - parentY;
      const dist = Math.sqrt(dx * dx + dy * dy);
      const textOffset = 16;
      const offsetX = (dx / dist) * textOffset;
      const offsetY = (dy / dist) * textOffset;

      group
        .append('line')
        .attr('class', 'link')
        .attr('x1', parentX)
        .attr('y1', parentY + (isChild ? 18 : 0))
        .attr('x2', x - offsetX)
        .attr('y2', y - offsetY)
        .attr('stroke', '#ccc')
        .attr('stroke-width', 2);
    }

    // Draw text
    group
      .append('text')
      .attr('class', 'node-text')
      .attr('x', x)
      .attr('y', y)
      .attr('dy', '0.35em')
      .attr('text-anchor', 'middle')
      .attr('font-size', 16)
      .attr('font-weight', 'bold')
      .attr('fill', '#22223b')
      .text(node.name);

    // Recurse children
    if (node.children && node.children.length > 0) {
      if (node.children.length === 1) {
        drawNode(node.children[0], x, y + verticalGap, x, y, true);
      } else {
        node.children.forEach((child, i) => {
          const childX = x + (i === 0 ? -horizontalGap : horizontalGap);
          const childY = y + verticalGap;
          drawNode(child, childX, childY, x, y, true);
        });
      }
    }
  }

  const startX = width / 2;
  const startY = 80;
  drawNode(treeData, startX, startY);
}

// Download as image (high resolution PNG)
export function downloadImage(svgRef: RefObject<SVGSVGElement>) {
  const svgElement = svgRef.current;
  if (!svgElement) return;

  const svgData = new XMLSerializer().serializeToString(svgElement);

  // Create canvas
  const svgSize = svgElement.getBoundingClientRect();
  const scale = 4; // increase this for sharper images (2 = 2x, 4 = 4x resolution)
  const canvas = document.createElement('canvas');
  canvas.width = svgSize.width * scale;
  canvas.height = svgSize.height * scale;

  const ctx = canvas.getContext('2d');
  const img = new Image();

  img.onload = () => {
    if (!ctx) return;

    // White background
    ctx.fillStyle = '#fff';
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    // Draw scaled image
    ctx.setTransform(scale, 0, 0, scale, 0, 0);
    ctx.drawImage(img, 0, 0);

    // Export as PNG
    const dataUrl = canvas.toDataURL('image/png', 1.0);
    const link = document.createElement('a');
    link.href = dataUrl;
    link.download = 'parse-tree.png';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // Encode SVG for <img>
  const encodedSvg =
    'data:image/svg+xml;base64,' +
    window.btoa(unescape(encodeURIComponent(svgData)));
  img.src = encodedSvg;
};
