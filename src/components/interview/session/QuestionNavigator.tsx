import React from 'react';
import { Button } from '@/components/ui/button';
import { ArrowLeft, ArrowRight, CheckCircle2 } from 'lucide-react';

interface Props {
  onPrev: () => void;
  onNext: () => void;
  onFinish: () => void;
  isFirst: boolean;
  isLast: boolean;
  disabled?: boolean;
}

export const QuestionNavigator: React.FC<Props> = ({ onPrev, onNext, onFinish, isFirst, isLast, disabled }) => {
  return (
    <div className="flex items-center gap-4 mt-6">
      <Button 
        onClick={onPrev} 
        disabled={isFirst || disabled}
        variant="outline"
        className="h-12 px-6 rounded-xl border-slate-200 text-slate-600 hover:bg-slate-50 disabled:opacity-50"
      >
        <ArrowLeft size={18} className="mr-2" />
        Previous
      </Button>
      
      {isLast ? (
        <Button 
          onClick={onFinish}
          disabled={disabled}
          className="h-12 px-8 rounded-xl bg-green-600 hover:bg-green-700 text-white font-semibold flex-1 md:flex-none shadow-sm disabled:opacity-50"
        >
          <CheckCircle2 size={18} className="mr-2" />
          Finish Interview
        </Button>
      ) : (
        <Button 
          onClick={onNext}
          disabled={disabled}
          className="h-12 px-8 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-semibold flex-1 md:flex-none shadow-sm disabled:opacity-50"
        >
          Next
          <ArrowRight size={18} className="ml-2" />
        </Button>
      )}
    </div>
  );
};
