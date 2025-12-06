import React from 'react';
import { Button } from '@/components/ui/button';
import { Direction } from '@/types/game';
import { ArrowUp, ArrowDown, ArrowLeft, ArrowRight } from 'lucide-react';

interface MobileControlsProps {
  onDirectionChange: (direction: Direction) => void;
  disabled?: boolean;
}

export const MobileControls: React.FC<MobileControlsProps> = ({
  onDirectionChange,
  disabled = false,
}) => {
  return (
    <div className="grid grid-cols-3 gap-2 w-40 mx-auto mt-4 md:hidden">
      <div />
      <Button
        variant="outline"
        size="icon"
        onClick={() => onDirectionChange('UP')}
        disabled={disabled}
        className="w-12 h-12"
      >
        <ArrowUp className="w-6 h-6" />
      </Button>
      <div />
      <Button
        variant="outline"
        size="icon"
        onClick={() => onDirectionChange('LEFT')}
        disabled={disabled}
        className="w-12 h-12"
      >
        <ArrowLeft className="w-6 h-6" />
      </Button>
      <Button
        variant="outline"
        size="icon"
        onClick={() => onDirectionChange('DOWN')}
        disabled={disabled}
        className="w-12 h-12"
      >
        <ArrowDown className="w-6 h-6" />
      </Button>
      <Button
        variant="outline"
        size="icon"
        onClick={() => onDirectionChange('RIGHT')}
        disabled={disabled}
        className="w-12 h-12"
      >
        <ArrowRight className="w-6 h-6" />
      </Button>
    </div>
  );
};

export default MobileControls;
