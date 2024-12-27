import { Type } from 'lucide-react';
import { Level } from '@tiptap/extension-heading';

import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from '@/components/ui/tooltip';
import { cn } from '@/lib/utils';
import { useToolbar } from '@/components/toolbars/toolbar-provider';

const headingLevels: Level[] = [1, 2, 3, 4, 5, 6];

export function HeadingToolbar() {
  const { editor } = useToolbar();

  const setHeading = (level: Level) => {
    editor?.chain().focus().toggleHeading({ level }).run();
  };

  const isActive = (level: Level) =>
    editor?.isActive('heading', { level }) ?? false;

  const activeHeading = headingLevels.find((level) => isActive(level)) || null;

  return (
    <Tooltip>
      <DropdownMenu>
        <TooltipTrigger asChild>
          <DropdownMenuTrigger asChild>
            <Button variant='ghost' size='icon' className='h-8 w-8 gap-x-1'>
              <Type className='h-4 w-4' />
              {activeHeading !== null && (
                <span className='text-[0.5rem] font-bold'>{activeHeading}</span>
              )}
              <span className='sr-only'>Heading levels</span>
            </Button>
          </DropdownMenuTrigger>
        </TooltipTrigger>
        <DropdownMenuContent>
          {headingLevels.map((level) => (
            <DropdownMenuItem
              key={level}
              onClick={() => setHeading(level)}
              className={cn(
                'flex items-center',
                isActive(level) && 'bg-accent text-accent-foreground'
              )}
            >
              <Type className='mr-2 h-4 w-4' />
              <span>Heading {level}</span>
            </DropdownMenuItem>
          ))}
          <DropdownMenuItem
            onClick={() => editor?.chain().focus().setParagraph().run()}
            className={cn(
              'flex items-center',
              editor?.isActive('paragraph') &&
                'bg-accent text-accent-foreground'
            )}
          >
            <Type className='mr-2 h-4 w-4' />
            <span>Paragraph</span>
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
      <TooltipContent>
        <span>Heading levels</span>
      </TooltipContent>
    </Tooltip>
  );
}
