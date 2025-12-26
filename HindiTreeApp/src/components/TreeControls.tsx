import { Plus, Minus, Download } from 'lucide-react';

interface TreeControlsProps {
  onZoomIn: () => void;
  onZoomOut: () => void;
  onDownload: (format: 'png' | 'jpeg') => void;
  orientation?: 'row' | 'column';
}

const TreeControls = ({ onZoomIn, onZoomOut, onDownload, orientation = 'column' }: TreeControlsProps) => {
  const containerClass = orientation === 'row' ? 'flex flex-row space-x-2' : 'flex flex-col space-y-2';
  return (
    <div className={containerClass}>
      <button
        onClick={onZoomIn}
        className="p-2 rounded-full bg-white shadow hover:bg-gray-100"
        title="Zoom In"
      >
        <Plus className="w-5 h-5" />
      </button>
      <button
        onClick={onZoomOut}
        className="p-2 rounded-full bg-white shadow hover:bg-gray-100"
        title="Zoom Out"
      >
        <Minus className="w-5 h-5" />
      </button>
      <button
        onClick={() => onDownload('png')}
        className="p-2 rounded-full bg-white shadow hover:bg-gray-100"
        title="Download PNG"
      >
        <Download className="w-5 h-5" />
      </button>
    </div>
  );
};

export default TreeControls;
