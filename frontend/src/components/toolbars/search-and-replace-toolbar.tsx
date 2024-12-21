import { ArrowLeft, ArrowRight, Search, Repeat, X } from 'lucide-react';
import { useEffect, useState } from 'react';

import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';
import { Separator } from '@/components/ui/separator';
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from '@/components/ui/tooltip';
import { cn } from '@/lib/utils';
import type { SearchAndReplaceStorage } from '@/components/extensions/search-and-replace';
import { useToolbar } from '@/components/toolbars/toolbar-provider';

export function SearchAndReplaceToolbar() {
  const { editor } = useToolbar();

  const [open, setOpen] = useState(false);
  const [replacing, setReplacing] = useState(false);
  const [searchText, setSearchText] = useState('');
  const [replaceText, setReplaceText] = useState('');
  const [checked, setChecked] = useState(false);

  const results = editor?.storage?.searchAndReplace
    .results as SearchAndReplaceStorage['results'];
  const selectedResult = editor?.storage?.searchAndReplace
    .selectedResult as SearchAndReplaceStorage['selectedResult'];

  const replace = () => editor?.chain().replace().run();
  const replaceAll = () => editor?.chain().replaceAll().run();
  const selectNext = () => editor?.chain().selectNextResult().run();
  const selectPrevious = () => editor?.chain().selectPreviousResult().run();

  useEffect(() => {
    editor?.chain().setSearchTerm(searchText).run();
  }, [searchText, editor]);

  useEffect(() => {
    editor?.chain().setReplaceTerm(replaceText).run();
  }, [replaceText, editor]);

  useEffect(() => {
    editor?.chain().setCaseSensitive(checked).run();
  }, [checked, editor]);

  useEffect(() => {
    if (!open) {
      setReplaceText('');
      setSearchText('');
      setReplacing(false);
    }
  }, [open]);

  return (
    <Popover open={open}>
      <Tooltip>
        <TooltipTrigger asChild>
          <PopoverTrigger disabled={!editor} asChild>
            <Button
              variant='ghost'
              size='sm'
              onClick={() => {
                setOpen(!open);
              }}
              className={cn('h-8 w-8')}
            >
              <Search className='h-4 w-4' />
              <span className='sr-only'>Search & Replace</span>
            </Button>
          </PopoverTrigger>
        </TooltipTrigger>
        <TooltipContent>
          <span>Search & Replace</span>
        </TooltipContent>
      </Tooltip>

      <PopoverContent
        align='end'
        onCloseAutoFocus={(e) => {
          e.preventDefault();
        }}
        onEscapeKeyDown={() => {
          setOpen(false);
        }}
        className='relative flex w-[400px] px-3 py-2.5 bg-background'
      >
        {!replacing ? (
          <div className={cn('relative flex gap-1.5 items-center')}>
            <Input
              value={searchText}
              className='w-48 h-8 px-1.5 mr-1.5 text-sm'
              onChange={(e) => {
                setSearchText(e.target.value);
              }}
              placeholder='Search...'
            />
            <span className='text-sm'>
              {results?.length === 0 ? selectedResult : selectedResult + 1}/
              {results?.length}
            </span>
            <Button
              onClick={selectPrevious}
              size='icon'
              variant='ghost'
              className='size-7'
            >
              <ArrowLeft className='size-4' />
            </Button>
            <Button
              onClick={selectNext}
              size='icon'
              className='size-7'
              variant='ghost'
            >
              <ArrowRight className='h-4 w-4' />
            </Button>
            <Separator orientation='vertical' className='h-7 mx-0.5' />
            <Button
              onClick={() => {
                setReplacing(true);
              }}
              size='icon'
              className='size-7'
              variant='ghost'
            >
              <Repeat className='h-4 w-4' />
            </Button>
            <Button
              onClick={() => {
                setOpen(false);
              }}
              size='icon'
              className='size-7'
              variant='ghost'
            >
              <X className='h-4 w-4' />
            </Button>
          </div>
        ) : (
          <div className={cn('relative w-full')}>
            <X
              onClick={() => {
                setOpen(false);
              }}
              className='absolute right-1 top-1.5 h-4 w-4 cursor-pointer'
            />
            <div className='flex w-full items-center gap-3'>
              <Button
                size='icon'
                className='size-7 rounded-full'
                variant='ghost'
                onClick={() => {
                  setReplacing(false);
                }}
              >
                <ArrowLeft className='h-4 w-4' />
              </Button>
              <h2 className='text-sm font-medium'>Search and replace</h2>
            </div>

            <div className='my-2 w-full'>
              <div className='mb-3'>
                <Label className='mb-1 text-xs text-gray-11'>Search</Label>
                <div className='mb-3 flex items-center justify-start gap-x-2 text-sm'>
                  <Input
                    value={searchText}
                    onChange={(e) => {
                      setSearchText(e.target.value);
                    }}
                    placeholder='Search...'
                    className='h-8 px-1.5'
                  />
                  {results?.length === 0 ? selectedResult : selectedResult + 1}/
                  {results?.length}
                </div>
              </div>
              <div className='mb-2'>
                <Label className='mb-1 text-xs text-gray-11'>
                  Replace with
                </Label>
                <Input
                  className='h-8 px-1.5'
                  value={replaceText}
                  onChange={(e) => {
                    setReplaceText(e.target.value);
                  }}
                  placeholder='Replace...'
                />
              </div>
              <div className='mt-3 flex items-center space-x-2'>
                <Checkbox
                  checked={checked}
                  onCheckedChange={(checked: boolean) => {
                    setChecked(checked);
                  }}
                  id='match_case'
                />
                <Label
                  htmlFor='match_case'
                  className='text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70'
                >
                  Match case
                </Label>
              </div>
            </div>

            <div className='actions mt-6 flex items-center justify-between'>
              <div className='flex items-center gap-2'>
                <Button
                  onClick={selectPrevious}
                  size='icon'
                  className='h-7 w-7'
                  variant='secondary'
                >
                  <ArrowLeft className='h-4 w-4' />
                </Button>
                <Button
                  onClick={selectNext}
                  size='icon'
                  className='h-7 w-7'
                  variant='secondary'
                >
                  <ArrowRight className='h-4 w-4' />
                </Button>
              </div>

              <div className='main-actions flex items-center gap-2'>
                <Button
                  size='sm'
                  className='h-7 px-3 text-xs'
                  variant='secondary'
                  onClick={replaceAll}
                >
                  Replace All
                </Button>
                <Button
                  onClick={replace}
                  size='sm'
                  className='h-7 px-3 text-xs'
                >
                  Replace
                </Button>
              </div>
            </div>
          </div>
        )}
      </PopoverContent>
    </Popover>
  );
}