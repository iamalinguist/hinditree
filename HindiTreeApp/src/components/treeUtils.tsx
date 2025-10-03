import * as d3 from 'd3';

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
