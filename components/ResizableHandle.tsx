import React from 'react';

interface ResizableHandleProps {
  onResize: (delta: number) => void;
  direction: 'horizontal' | 'vertical';
}

const ResizableHandle: React.FC<ResizableHandleProps> = ({ onResize, direction }) => {
  const handleMouseDown = (e: React.MouseEvent<HTMLDivElement>) => {
    e.preventDefault();
    let lastX = e.clientX;
    let lastY = e.clientY;

    const handleMouseMove = (moveEvent: MouseEvent) => {
      if (direction === 'horizontal') {
        const deltaX = moveEvent.clientX - lastX;
        lastX = moveEvent.clientX;
        onResize(deltaX);
      } else {
        const deltaY = moveEvent.clientY - lastY;
        lastY = moveEvent.clientY;
        onResize(deltaY);
      }
    };

    const handleMouseUp = () => {
      document.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('mouseup', handleMouseUp);
      document.body.style.cursor = '';
      document.body.style.userSelect = '';
    };

    document.body.style.cursor = direction === 'horizontal' ? 'col-resize' : 'row-resize';
    document.body.style.userSelect = 'none';
    document.addEventListener('mousemove', handleMouseMove);
    document.addEventListener('mouseup', handleMouseUp);
  };

  const cursorClass = direction === 'horizontal' ? 'cursor-col-resize' : 'cursor-row-resize';
  const dimensionClass = direction === 'horizontal' ? 'w-1.5 h-full' : 'h-1.5 w-full';

  return (
    <div
      onMouseDown={handleMouseDown}
      className={`bg-border hover:bg-primary transition-colors z-10 ${cursorClass} ${dimensionClass}`}
    />
  );
};

export default ResizableHandle;
