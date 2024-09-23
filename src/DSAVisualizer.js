import React, { useEffect, useRef } from 'react';

const DSAVisualizer = ({ data, algorithm }) => {
  const canvasRef = useRef(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    switch(algorithm) {
      case 'binary_tree':
        drawBinaryTree(ctx, data, canvas.width / 2, 50, canvas.width / 4);
        break;
      case 'sorting':
        drawSortingArray(ctx, data, canvas.width, canvas.height);
        break;
      // Add more cases for other DSA visualizations
    }
  }, [data, algorithm]);

  const drawBinaryTree = (ctx, node, x, y, horizontalSpacing) => {
    if (!node) return;

    ctx.beginPath();
    ctx.arc(x, y, 20, 0, 2 * Math.PI);
    ctx.fillStyle = 'white';
    ctx.fill();
    ctx.strokeStyle = 'black';
    ctx.stroke();

    ctx.fillStyle = 'black';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText(node.value, x, y);

    if (node.left) {
      ctx.beginPath();
      ctx.moveTo(x, y + 20);
      ctx.lineTo(x - horizontalSpacing, y + 80);
      ctx.stroke();
      drawBinaryTree(ctx, node.left, x - horizontalSpacing, y + 100, horizontalSpacing / 2);
    }

    if (node.right) {
      ctx.beginPath();
      ctx.moveTo(x, y + 20);
      ctx.lineTo(x + horizontalSpacing, y + 80);
      ctx.stroke();
      drawBinaryTree(ctx, node.right, x + horizontalSpacing, y + 100, horizontalSpacing / 2);
    }
  };

  const drawSortingArray = (ctx, array, width, height) => {
    const barWidth = width / array.length;
    const maxVal = Math.max(...array);

    array.forEach((val, index) => {
      const barHeight = (val / maxVal) * (height - 50);
      ctx.fillStyle = 'blue';
      ctx.fillRect(index * barWidth, height - barHeight, barWidth - 1, barHeight);
    });
  };

  return <canvas ref={canvasRef} width={800} height={600} />;
};

export default DSAVisualizer ;