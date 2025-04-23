
import React from 'react';
import { ThumbsUp, ThumbsDown } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

interface FeedbackButtonProps {
  type: 'helpful' | 'unhelpful';
  selected?: boolean;
  onSelect: () => void;
  disabled?: boolean;
}

const FeedbackButton = ({ 
  type, 
  selected = false, 
  onSelect, 
  disabled = false 
}: FeedbackButtonProps) => {
  return (
    <Button
      variant="outline"
      size="sm"
      onClick={onSelect}
      disabled={disabled}
      className={cn(
        "rounded-full px-3 py-1 flex items-center gap-1 transition-all",
        selected && type === 'helpful' && "bg-green-50 text-green-600 border-green-200",
        selected && type === 'unhelpful' && "bg-red-50 text-red-600 border-red-200",
        !selected && "hover:bg-gray-50"
      )}
    >
      {type === 'helpful' ? (
        <>
          <ThumbsUp className="h-4 w-4" />
          <span>Helpful</span>
        </>
      ) : (
        <>
          <ThumbsDown className="h-4 w-4" />
          <span>Not helpful</span>
        </>
      )}
    </Button>
  );
};

export default FeedbackButton;
