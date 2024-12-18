import StarterKit from '@tiptap/starter-kit';
import Underline from '@tiptap/extension-underline';
import Table from '@tiptap/extension-table';
import TableRow from '@tiptap/extension-table-row';
import TableCell from '@tiptap/extension-table-cell';
import TableHeader from '@tiptap/extension-table-header';
import TextAlign from '@tiptap/extension-text-align';
import Heading from '@tiptap/extension-heading';
import Highlight from '@tiptap/extension-highlight';
import Link from '@tiptap/extension-link';

export const extensions = [
  StarterKit.configure({
    heading: false, // Disable the default heading to use our custom configuration
    orderedList: {
      HTMLAttributes: {
        class: 'list-decimal',
      },
    },
    bulletList: {
      HTMLAttributes: {
        class: 'list-disc',
      },
    },
    code: {
      HTMLAttributes: {
        class: 'bg-accent rounded-md p-1',
      },
    },
    horizontalRule: {
      HTMLAttributes: {
        class: 'my-2',
      },
    },
    codeBlock: {
      HTMLAttributes: {
        class: 'bg-primary text-primary-foreground p-2 text-sm rounded-md',
      },
    },
  }),
  Underline,
  Table.configure({
    resizable: true,
  }),
  Heading.configure({
    levels: [1, 2, 3, 4, 5, 6],
    HTMLAttributes: {
      class: 'tiptap-heading',
    },
  }),
  TableRow,
  TableHeader,
  TableCell,
  TextAlign.configure({
    types: ['heading', 'paragraph'],
  }),
  Highlight,
  Link.configure({
    openOnClick: false,
    HTMLAttributes: {
      class: 'text-blue-500 underline',
    },
  }),
];
