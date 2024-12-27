import { TableIcon, PlusIcon, Trash2Icon } from 'lucide-react';
import React from 'react';

import { Button, type ButtonProps } from '@/components/ui/button';
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from '@/components/ui/tooltip';
import { cn } from '@/lib/utils';
import { useToolbar } from '@/components/toolbars/toolbar-provider';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
} from '@/components/ui/dropdown-menu';

const TableToolbar = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, children, ...props }, ref) => {
    const { editor } = useToolbar();

    const insertTable = (rows: number, cols: number) => {
      editor
        ?.chain()
        .focus()
        .insertTable({ rows, cols, withHeaderRow: true })
        .run();
    };

    return (
      <Tooltip>
        <DropdownMenu>
          <TooltipTrigger asChild>
            <DropdownMenuTrigger asChild>
              <Button
                variant='ghost'
                size='icon'
                className={cn(
                  'h-8 w-8',
                  editor?.isActive('table') && 'bg-accent',
                  className
                )}
                ref={ref}
                {...props}
              >
                {children || <TableIcon className='h-4 w-4' />}
              </Button>
            </DropdownMenuTrigger>
          </TooltipTrigger>
          <DropdownMenuContent>
            <DropdownMenuItem onClick={() => insertTable(3, 3)}>
              Insert 3x3 Table
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => insertTable(4, 4)}>
              Insert 4x4 Table
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => insertTable(5, 5)}>
              Insert 5x5 Table
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem
              onClick={() => editor?.chain().focus().addColumnBefore().run()}
            >
              <PlusIcon className='mr-2 h-4 w-4' />
              Add Column Before
            </DropdownMenuItem>
            <DropdownMenuItem
              onClick={() => editor?.chain().focus().addColumnAfter().run()}
            >
              <PlusIcon className='mr-2 h-4 w-4' />
              Add Column After
            </DropdownMenuItem>
            <DropdownMenuItem
              onClick={() => editor?.chain().focus().addRowBefore().run()}
            >
              <PlusIcon className='mr-2 h-4 w-4' />
              Add Row Before
            </DropdownMenuItem>
            <DropdownMenuItem
              onClick={() => editor?.chain().focus().addRowAfter().run()}
            >
              <PlusIcon className='mr-2 h-4 w-4' />
              Add Row After
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem
              onClick={() => editor?.chain().focus().deleteColumn().run()}
            >
              <Trash2Icon className='mr-2 h-4 w-4' />
              Delete Column
            </DropdownMenuItem>
            <DropdownMenuItem
              onClick={() => editor?.chain().focus().deleteRow().run()}
            >
              <Trash2Icon className='mr-2 h-4 w-4' />
              Delete Row
            </DropdownMenuItem>
            <DropdownMenuItem
              onClick={() => editor?.chain().focus().deleteTable().run()}
            >
              <Trash2Icon className='mr-2 h-4 w-4' />
              Delete Table
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
        <TooltipContent>
          <span>Table</span>
        </TooltipContent>
      </Tooltip>
    );
  }
);

TableToolbar.displayName = 'TableToolbar';

export { TableToolbar };
