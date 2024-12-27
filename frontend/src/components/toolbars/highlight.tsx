import React from 'react';
import { HighlighterIcon } from 'lucide-react';

import { Button, type ButtonProps } from '@/components/ui/button';
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
  TooltipProvider,
} from '@/components/ui/tooltip';
import { cn } from '@/lib/utils';
import { useToolbar } from '@/components/toolbars/toolbar-provider';

export const HighlightToolbar = React.forwardRef<
  HTMLButtonElement,
  ButtonProps
>(({ className, ...props }, ref) => {
  const { editor } = useToolbar();

  if (!editor) {
    return null;
  }

  return (
    <TooltipProvider>
      <Tooltip>
        <TooltipTrigger asChild>
          <Button
            variant='ghost'
            size='icon'
            className={cn(
              'h-8 w-8',
              editor.isActive('highlight') && 'bg-accent',
              className
            )}
            onClick={() => editor.chain().focus().toggleHighlight().run()}
            disabled={!editor.can().chain().focus().toggleHighlight().run()}
            ref={ref}
            {...props}
          >
            <HighlighterIcon className='h-4 w-4' />
            <span className='sr-only'>Highlight</span>
          </Button>
        </TooltipTrigger>
        <TooltipContent>
          <span>Highlight</span>
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );
});

HighlightToolbar.displayName = 'HighlightToolbar';
