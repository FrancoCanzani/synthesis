import { Button } from './ui/button';
import { Bold, Italic, List, BookOpen } from 'lucide-react';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip';
import { useSearchParams } from 'react-router';
import { cn } from '@/lib/utils';
import { Editor } from '@tiptap/core';

const EditorSideMenuButton = ({
  icon: Icon,
  label,
  className,
  onClick,
}: {
  icon: React.ElementType;
  label: string;
  className?: string;
  onClick?: () => void;
}) => (
  <TooltipProvider>
    <Tooltip>
      <TooltipTrigger asChild>
        <Button
          variant='ghost'
          size='icon'
          className={cn('h-8 w-8', className)}
          onClick={onClick}
        >
          <Icon className='h-4 w-4' />
        </Button>
      </TooltipTrigger>
      <TooltipContent side='left'>
        <p>{label}</p>
      </TooltipContent>
    </Tooltip>
  </TooltipProvider>
);

export default function EditorSideMenu({ editor }: { editor: Editor }) {
  const [searchParams, setSearchParams] = useSearchParams();

  const editorMode = searchParams.get('editorMode');

  return (
    <div className='fixed z-50 right-9 top-1/2 -translate-y-1/2 flex flex-col items-center space-y-4 p-1 border rounded-md transition-opacity duration-300 ease-in-out bg-background opacity-70 md:opacity-100 hover:opacity-100'>
      <EditorSideMenuButton
        icon={BookOpen}
        label='Enter read mode'
        className={cn(editorMode === 'read' && 'bg-accent')}
        onClick={() => {
          if (editorMode === 'read') {
            setSearchParams({ editorMode: 'edit' });
            editor.setEditable(true);
          } else {
            setSearchParams({ editorMode: 'read' });
            editor.setEditable(false);
          }
        }}
      />
      <EditorSideMenuButton icon={Bold} label='Bold' />
      <EditorSideMenuButton icon={Italic} label='Italic' />
      <EditorSideMenuButton icon={List} label='List' />
    </div>
  );
}
