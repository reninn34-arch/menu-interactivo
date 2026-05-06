import { useState, useRef } from 'react';
import { motion, Reorder } from 'motion/react';
import { GripVertical } from 'lucide-react';

interface DraggableItemProps {
  children: React.ReactNode;
  onDragEnd: (newOrder: string[]) => void;
  ids: string[];
  renderItem: (id: string) => React.ReactNode;
}

export const DraggableList = ({ children, onDragEnd, ids, renderItem }: DraggableItemProps) => {
  const [localIds, setLocalIds] = useState(ids);

  const handleReorder = (newOrder: string[]) => {
    setLocalIds(newOrder);
    onDragEnd(newOrder);
  };

  return (
    <Reorder.Group 
      axis="y" 
      values={localIds} 
      onReorder={handleReorder}
      className="space-y-2"
    >
      {localIds.map((id) => (
        <Reorder.Item 
          key={id} 
          value={id}
          className="cursor-grab active:cursor-grabbing"
        >
          {renderItem(id)}
        </Reorder.Item>
      ))}
    </Reorder.Group>
  );
};

interface DraggableCardProps {
  id: string;
  children: React.ReactNode;
  isDragging?: boolean;
}

export const DraggableCard = ({ id, children, isDragging }: DraggableCardProps) => {
  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -10 }}
      className={`bg-gray-800 rounded-xl border transition-all ${
        isDragging 
          ? 'border-orange-500 shadow-lg shadow-orange-500/20 scale-[1.02]' 
          : 'border-gray-700 hover:border-gray-600'
      }`}
    >
      {children}
    </motion.div>
  );
};

export const DragHandle = () => (
  <div className="flex items-center justify-center w-8 h-8 rounded bg-gray-700/50 hover:bg-gray-700 cursor-grab">
    <GripVertical className="w-4 h-4 text-gray-500" />
  </div>
);