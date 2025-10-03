import { Plus, Minus, Download } from 'lucide-react';

interface TreeControlsProps {
  onZoomIn: () => void;
  onZoomOut: () => void;
  onDownload: (format: 'png' | 'jpeg') => void;
}

const TreeControls = ({ onZoomIn, onZoomOut, onDownload }: TreeControlsProps) => {
  return (
    <div className="flex flex-col space-y-2">
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
        title="Download"
      >
        <Download className="w-5 h-5" />
      </button>
    </div>
  );
};

export default TreeControls;
