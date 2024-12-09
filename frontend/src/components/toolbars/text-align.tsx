'use client';

import {
  AlignLeftIcon,
  AlignCenterIcon,
  AlignRightIcon,
  AlignJustifyIcon,
} from 'lucide-react';

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

const alignOptions = [
  { name: 'left', icon: AlignLeftIcon },
  { name: 'center', icon: AlignCenterIcon },
  { name: 'right', icon: AlignRightIcon },
  { name: 'justify', icon: AlignJustifyIcon },
];

export function TextAlignToolbar() {
  const { editor } = useToolbar();

  const setAlignment = (alignment: string) => {
    editor?.chain().focus().setTextAlign(alignment).run();
  };

  const isActive = (alignment: string) =>
    editor?.isActive({ textAlign: alignment }) ?? false;

  const activeAlignment =
    alignOptions.find((option) => isActive(option.name)) || alignOptions[0];

  return (
    <Tooltip>
      <DropdownMenu>
        <TooltipTrigger asChild>
          <DropdownMenuTrigger asChild>
            <Button variant='ghost' size='icon' className='h-8 w-8'>
              <activeAlignment.icon className='h-4 w-4' />
              <span className='sr-only'>Text alignment</span>
            </Button>
          </DropdownMenuTrigger>
        </TooltipTrigger>
        <DropdownMenuContent>
          {alignOptions.map((option) => (
            <DropdownMenuItem
              key={option.name}
              onClick={() => setAlignment(option.name)}
              className={cn(
                'flex items-center',
                isActive(option.name) && 'bg-accent text-accent-foreground'
              )}
            >
              <option.icon className='mr-2 h-4 w-4' />
              <span className='capitalize'>{option.name}</span>
            </DropdownMenuItem>
          ))}
        </DropdownMenuContent>
      </DropdownMenu>
      <TooltipContent>
        <span>Text alignment</span>
      </TooltipContent>
    </Tooltip>
  );
}
