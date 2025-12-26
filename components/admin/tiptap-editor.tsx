"use client";

import { useEditor, EditorContent, Editor } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
import Underline from '@tiptap/extension-underline';
import Link from '@tiptap/extension-link';
import Image from '@tiptap/extension-image';
import { Table } from '@tiptap/extension-table';
import { TableRow } from '@tiptap/extension-table-row';
import { TableCell } from '@tiptap/extension-table-cell';
import { TableHeader } from '@tiptap/extension-table-header';
import TextAlign from '@tiptap/extension-text-align';
import Placeholder from '@tiptap/extension-placeholder';
import Typography from '@tiptap/extension-typography';
import CodeBlockLowlight from '@tiptap/extension-code-block-lowlight';
import { common, createLowlight } from 'lowlight';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Bold,
  Italic,
  Underline as UnderlineIcon,
  Strikethrough,
  Code,
  Heading1,
  Heading2,
  Heading3,
  List,
  ListOrdered,
  Quote,
  Undo,
  Redo,
  Link as LinkIcon,
  Image as ImageIcon,
  Table as TableIcon,
  AlignLeft,
  AlignCenter,
  AlignRight,
  AlignJustify,
  FileText,
} from 'lucide-react';
import { useCallback, useMemo, useEffect, useState } from 'react';
import { Footnote } from './footnote-extension';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip';
import { mergeAttributes } from '@tiptap/core';

// Helper function to truncate URL for display
function truncateUrl(url: string, startLength: number = 30, endLength: number = 20): string {
  if (!url || url.length <= startLength + endLength + 3) {
    return url;
  }
  const start = url.substring(0, startLength);
  const end = url.substring(url.length - endLength);
  return `${start}...${end}`;
}

// Custom Link extension with hover tooltip
const LinkWithTooltip = Link.extend({
  renderHTML({ HTMLAttributes, mark }) {
    // For Link marks, href can be in mark.attrs or HTMLAttributes
    const href = mark?.attrs?.href || HTMLAttributes?.href || HTMLAttributes.href;
    
    // Merge attributes with options and add title
    const attributes = mergeAttributes(
      this.options.HTMLAttributes,
      HTMLAttributes,
      {
        style: 'cursor: pointer;',
        ...(href ? { title: truncateUrl(href) } : {}),
      }
    );
    
    return ['a', attributes, 0];
  },
});

interface TiptapEditorProps {
  content: string;
  onChange: (content: any) => void;
  placeholder?: string;
}

const MenuBar = ({ editor }: { editor: Editor | null }) => {
  const [footnoteDialogOpen, setFootnoteDialogOpen] = useState(false);
  const [footnoteText, setFootnoteText] = useState('');
  const [updateTrigger, setUpdateTrigger] = useState(0);

  if (!editor) return null;

  // Listen to editor updates to refresh footnote list
  useEffect(() => {
    if (!editor || !footnoteDialogOpen) return;

    const handleUpdate = () => {
      setUpdateTrigger((prev) => prev + 1);
    };

    editor.on('update', handleUpdate);
    return () => {
      editor.off('update', handleUpdate);
    };
  }, [editor, footnoteDialogOpen]);

  const addLink = useCallback(() => {
    const url = window.prompt('Enter URL:');
    if (url) {
      editor.chain().focus().setLink({ href: url }).run();
    }
  }, [editor]);


  const addImage = useCallback(() => {
    const url = window.prompt('Enter image URL:');
    if (url) {
      editor.chain().focus().setImage({ src: url }).run();
    }
  }, [editor]);

  const addTable = useCallback(() => {
    editor.chain().focus().insertTable({ rows: 3, cols: 3, withHeaderRow: true }).run();
  }, [editor]);

  // Get all existing footnotes from the editor
  const getExistingFootnotes = useCallback(() => {
    const footnotes: Array<{ number: number; text: string }> = [];
    editor.state.doc.descendants((node) => {
      if (node.type.name === 'footnote') {
        footnotes.push({
          number: node.attrs.number,
          text: node.attrs.text,
        });
      }
    });
    return footnotes.sort((a, b) => a.number - b.number);
  }, [editor, updateTrigger]);

  const openFootnoteDialog = useCallback(() => {
    setFootnoteText('');
    setFootnoteDialogOpen(true);
  }, []);

  const addFootnote = useCallback(() => {
    if (footnoteText.trim()) {
      (editor.chain().focus() as any).setFootnote({ text: footnoteText.trim() }).run();
      setFootnoteText('');
      // Keep dialog open for adding more footnotes
    }
  }, [editor, footnoteText]);

  return (
    <TooltipProvider>
      <div className="border-b p-2 flex flex-wrap gap-1 bg-background/95 backdrop-blur-sm shadow-sm rounded-t-lg">
        {/* Text Formatting */}
        <Tooltip>
          <TooltipTrigger asChild>
            <Button
              type="button"
              variant="ghost"
              size="sm"
              onClick={() => editor.chain().focus().toggleBold().run()}
              className={editor.isActive('bold') ? 'bg-secondary' : ''}
            >
              <Bold className="w-4 h-4" />
            </Button>
          </TooltipTrigger>
          <TooltipContent>
            <p>Bold</p>
          </TooltipContent>
        </Tooltip>
        <Tooltip>
          <TooltipTrigger asChild>
            <Button
              type="button"
              variant="ghost"
              size="sm"
              onClick={() => editor.chain().focus().toggleItalic().run()}
              className={editor.isActive('italic') ? 'bg-secondary' : ''}
            >
              <Italic className="w-4 h-4" />
            </Button>
          </TooltipTrigger>
          <TooltipContent>
            <p>Italic</p>
          </TooltipContent>
        </Tooltip>
        <Tooltip>
          <TooltipTrigger asChild>
            <Button
              type="button"
              variant="ghost"
              size="sm"
              onClick={() => editor.chain().focus().toggleUnderline().run()}
              className={editor.isActive('underline') ? 'bg-secondary' : ''}
            >
              <UnderlineIcon className="w-4 h-4" />
            </Button>
          </TooltipTrigger>
          <TooltipContent>
            <p>Underline</p>
          </TooltipContent>
        </Tooltip>
        <Tooltip>
          <TooltipTrigger asChild>
            <Button
              type="button"
              variant="ghost"
              size="sm"
              onClick={() => editor.chain().focus().toggleStrike().run()}
              className={editor.isActive('strike') ? 'bg-secondary' : ''}
            >
              <Strikethrough className="w-4 h-4" />
            </Button>
          </TooltipTrigger>
          <TooltipContent>
            <p>Strikethrough</p>
          </TooltipContent>
        </Tooltip>
        <Tooltip>
          <TooltipTrigger asChild>
            <Button
              type="button"
              variant="ghost"
              size="sm"
              onClick={() => editor.chain().focus().toggleCode().run()}
              className={editor.isActive('code') ? 'bg-secondary' : ''}
            >
              <Code className="w-4 h-4" />
            </Button>
          </TooltipTrigger>
          <TooltipContent>
            <p>Code</p>
          </TooltipContent>
        </Tooltip>

      <Separator orientation="vertical" className="h-8" />

      {/* Headings */}
      <Tooltip>
        <TooltipTrigger asChild>
          <Button
            type="button"
            variant="ghost"
            size="sm"
            onClick={() => editor.chain().focus().toggleHeading({ level: 1 }).run()}
            className={editor.isActive('heading', { level: 1 }) ? 'bg-secondary' : ''}
          >
            <Heading1 className="w-4 h-4" />
          </Button>
        </TooltipTrigger>
        <TooltipContent>
          <p>Heading 1</p>
        </TooltipContent>
      </Tooltip>
      <Tooltip>
        <TooltipTrigger asChild>
          <Button
            type="button"
            variant="ghost"
            size="sm"
            onClick={() => editor.chain().focus().toggleHeading({ level: 2 }).run()}
            className={editor.isActive('heading', { level: 2 }) ? 'bg-secondary' : ''}
          >
            <Heading2 className="w-4 h-4" />
          </Button>
        </TooltipTrigger>
        <TooltipContent>
          <p>Heading 2</p>
        </TooltipContent>
      </Tooltip>
      <Tooltip>
        <TooltipTrigger asChild>
          <Button
            type="button"
            variant="ghost"
            size="sm"
            onClick={() => editor.chain().focus().toggleHeading({ level: 3 }).run()}
            className={editor.isActive('heading', { level: 3 }) ? 'bg-secondary' : ''}
          >
            <Heading3 className="w-4 h-4" />
          </Button>
        </TooltipTrigger>
        <TooltipContent>
          <p>Heading 3</p>
        </TooltipContent>
      </Tooltip>

      <Separator orientation="vertical" className="h-8" />

      {/* Lists */}
      <Tooltip>
        <TooltipTrigger asChild>
          <Button
            type="button"
            variant="ghost"
            size="sm"
            onClick={() => editor.chain().focus().toggleBulletList().run()}
            className={editor.isActive('bulletList') ? 'bg-secondary' : ''}
          >
            <List className="w-4 h-4" />
          </Button>
        </TooltipTrigger>
        <TooltipContent>
          <p>Bullet List</p>
        </TooltipContent>
      </Tooltip>
      <Tooltip>
        <TooltipTrigger asChild>
          <Button
            type="button"
            variant="ghost"
            size="sm"
            onClick={() => editor.chain().focus().toggleOrderedList().run()}
            className={editor.isActive('orderedList') ? 'bg-secondary' : ''}
          >
            <ListOrdered className="w-4 h-4" />
          </Button>
        </TooltipTrigger>
        <TooltipContent>
          <p>Ordered List</p>
        </TooltipContent>
      </Tooltip>
      <Tooltip>
        <TooltipTrigger asChild>
          <Button
            type="button"
            variant="ghost"
            size="sm"
            onClick={() => editor.chain().focus().toggleBlockquote().run()}
            className={editor.isActive('blockquote') ? 'bg-secondary' : ''}
          >
            <Quote className="w-4 h-4" />
          </Button>
        </TooltipTrigger>
        <TooltipContent>
          <p>Blockquote</p>
        </TooltipContent>
      </Tooltip>

      <Separator orientation="vertical" className="h-8" />

      {/* Alignment */}
      <Tooltip>
        <TooltipTrigger asChild>
          <Button
            type="button"
            variant="ghost"
            size="sm"
            onClick={() => editor.chain().focus().setTextAlign('left').run()}
            className={editor.isActive({ textAlign: 'left' }) ? 'bg-secondary' : ''}
          >
            <AlignLeft className="w-4 h-4" />
          </Button>
        </TooltipTrigger>
        <TooltipContent>
          <p>Align Left</p>
        </TooltipContent>
      </Tooltip>
      <Tooltip>
        <TooltipTrigger asChild>
          <Button
            type="button"
            variant="ghost"
            size="sm"
            onClick={() => editor.chain().focus().setTextAlign('center').run()}
            className={editor.isActive({ textAlign: 'center' }) ? 'bg-secondary' : ''}
          >
            <AlignCenter className="w-4 h-4" />
          </Button>
        </TooltipTrigger>
        <TooltipContent>
          <p>Align Center</p>
        </TooltipContent>
      </Tooltip>
      <Tooltip>
        <TooltipTrigger asChild>
          <Button
            type="button"
            variant="ghost"
            size="sm"
            onClick={() => editor.chain().focus().setTextAlign('right').run()}
            className={editor.isActive({ textAlign: 'right' }) ? 'bg-secondary' : ''}
          >
            <AlignRight className="w-4 h-4" />
          </Button>
        </TooltipTrigger>
        <TooltipContent>
          <p>Align Right</p>
        </TooltipContent>
      </Tooltip>
      <Tooltip>
        <TooltipTrigger asChild>
          <Button
            type="button"
            variant="ghost"
            size="sm"
            onClick={() => editor.chain().focus().setTextAlign('justify').run()}
            className={editor.isActive({ textAlign: 'justify' }) ? 'bg-secondary' : ''}
          >
            <AlignJustify className="w-4 h-4" />
          </Button>
        </TooltipTrigger>
        <TooltipContent>
          <p>Align Justify</p>
        </TooltipContent>
      </Tooltip>

      <Separator orientation="vertical" className="h-8" />

      {/* Insert */}
      <Tooltip>
        <TooltipTrigger asChild>
          <Button type="button" variant="ghost" size="sm" onClick={addLink}>
            <LinkIcon className="w-4 h-4" />
          </Button>
        </TooltipTrigger>
        <TooltipContent>
          <p>Link</p>
        </TooltipContent>
      </Tooltip>
      <Tooltip>
        <TooltipTrigger asChild>
          <Button type="button" variant="ghost" size="sm" onClick={addImage}>
            <ImageIcon className="w-4 h-4" />
          </Button>
        </TooltipTrigger>
        <TooltipContent>
          <p>Image</p>
        </TooltipContent>
      </Tooltip>
      <Tooltip>
        <TooltipTrigger asChild>
          <Button type="button" variant="ghost" size="sm" onClick={addTable}>
            <TableIcon className="w-4 h-4" />
          </Button>
        </TooltipTrigger>
        <TooltipContent>
          <p>Table</p>
        </TooltipContent>
      </Tooltip>
      <Tooltip>
        <TooltipTrigger asChild>
          <Button type="button" variant="ghost" size="sm" onClick={openFootnoteDialog}>
            <FileText className="w-4 h-4" />
          </Button>
        </TooltipTrigger>
        <TooltipContent>
          <p>Footnote</p>
        </TooltipContent>
      </Tooltip>

      <Separator orientation="vertical" className="h-8" />

      {/* Undo/Redo */}
      <Tooltip>
        <TooltipTrigger asChild>
          <Button
            type="button"
            variant="ghost"
            size="sm"
            onClick={() => editor.chain().focus().undo().run()}
            disabled={!editor.can().undo()}
          >
            <Undo className="w-4 h-4" />
          </Button>
        </TooltipTrigger>
        <TooltipContent>
          <p>Undo</p>
        </TooltipContent>
      </Tooltip>
      <Tooltip>
        <TooltipTrigger asChild>
          <Button
            type="button"
            variant="ghost"
            size="sm"
            onClick={() => editor.chain().focus().redo().run()}
            disabled={!editor.can().redo()}
          >
            <Redo className="w-4 h-4" />
          </Button>
        </TooltipTrigger>
        <TooltipContent>
          <p>Redo</p>
        </TooltipContent>
      </Tooltip>

      {/* Footnote Dialog */}
      <Dialog open={footnoteDialogOpen} onOpenChange={setFootnoteDialogOpen}>
        <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Footnotes</DialogTitle>
            <DialogDescription>
              Add and manage footnotes. Enter text and click "Add Footnote" to insert a new one.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            {/* Existing Footnotes */}
            {getExistingFootnotes().length > 0 && (
              <div className="space-y-2">
                <Label>Existing Footnotes</Label>
                <div className="border rounded-lg p-4 space-y-2 max-h-60 overflow-y-auto bg-muted/50">
                  {getExistingFootnotes().map((fn) => (
                    <div
                      key={fn.number}
                      className="flex gap-3 items-start text-sm p-2 rounded hover:bg-background/50"
                    >
                      <span className="font-semibold text-primary min-w-[2rem]">
                        {fn.number}.
                      </span>
                      <span className="text-muted-foreground flex-1">{fn.text}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Add New Footnote */}
            <div className="space-y-2">
              <Label htmlFor="footnote-text">Add New Footnote</Label>
              <Input
                id="footnote-text"
                value={footnoteText}
                onChange={(e) => setFootnoteText(e.target.value)}
                placeholder="Enter footnote text..."
                onKeyDown={(e) => {
                  if (e.key === 'Enter' && (e.metaKey || e.ctrlKey)) {
                    e.preventDefault();
                    addFootnote();
                  }
                }}
                autoFocus
              />
            </div>
          </div>
          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={() => {
                setFootnoteDialogOpen(false);
                setFootnoteText('');
              }}
            >
              Close
            </Button>
            <Button type="button" onClick={addFootnote} disabled={!footnoteText.trim()}>
              Add Footnote
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      </div>
    </TooltipProvider>
  );
};

export function TiptapEditor({ content, onChange, placeholder }: TiptapEditorProps) {
  // Create lowlight instance safely - this is a client component so window is available
  const lowlight = useMemo(() => {
    try {
      return createLowlight(common);
    } catch (error) {
      console.error('Failed to initialize lowlight:', error);
      // Return a minimal lowlight instance as fallback
      return createLowlight();
    }
  }, []);

  const editor = useEditor({
    immediatelyRender: false,
    extensions: [
      StarterKit.configure({
        codeBlock: false,
      }),
      Underline,
      LinkWithTooltip.configure({
        openOnClick: false,
        HTMLAttributes: {
          class: 'text-primary underline',
        },
      }),
      Image.configure({
        HTMLAttributes: {
          class: 'max-w-full h-auto rounded-lg',
        },
      }),
      Table.configure({
        resizable: true,
      }),
      TableRow,
      TableHeader,
      TableCell,
      TextAlign.configure({
        types: ['heading', 'paragraph'],
      }),
      Placeholder.configure({
        placeholder: placeholder || 'Start writing your article...',
      }),
      Typography,
      CodeBlockLowlight.configure({
        lowlight,
        defaultLanguage: null,
        HTMLAttributes: {
          class: 'rounded-md bg-muted p-4 font-mono text-sm',
        },
        exitOnTripleEnter: true,
        exitOnArrowDown: true,
      }),
      Footnote.configure({
        HTMLAttributes: {
          class: 'footnote-reference',
        },
      }),
    ],
    content,
    onUpdate: ({ editor }) => {
      onChange(editor.getJSON());
      // Ensure links have proper styling after update
      setTimeout(() => {
        const editorElement = editor.view.dom;
        const links = editorElement.querySelectorAll('a[href]');
        links.forEach((linkElement) => {
          const link = linkElement as HTMLAnchorElement;
          if (!link.style.cursor) {
            link.style.cursor = 'pointer';
          }
          // Ensure title attribute is set if missing
          if (link.href && !link.title) {
            link.title = truncateUrl(link.href);
          }
        });
      }, 0);
    },
    editorProps: {
      attributes: {
        class: 'prose prose-invert max-w-none focus:outline-none min-h-[500px] p-4',
      },
    },
  });

  // Add error handler for uncaught errors from code blocks
  useEffect(() => {
    const handleError = (event: ErrorEvent) => {
      if (event.message?.includes('ReadableStream') || event.message?.includes('code block')) {
        console.error('Code block error caught:', event.error);
        event.preventDefault();
        // Optionally show a user-friendly message
      }
    };

    window.addEventListener('error', handleError);
    return () => {
      window.removeEventListener('error', handleError);
    };
  }, []);

  // Add CSS for links to ensure they're clickable and show cursor
  useEffect(() => {
    if (!editor) return;
    
    const style = document.createElement('style');
    style.textContent = `
      .ProseMirror a[href] {
        cursor: pointer !important;
        pointer-events: auto !important;
      }
      .ProseMirror a[href]:hover {
        text-decoration: underline;
      }
    `;
    document.head.appendChild(style);
    
    return () => {
      document.head.removeChild(style);
    };
  }, [editor]);

  if (!editor) {
    return (
      <div className="border rounded-lg bg-background p-4">
        <div className="animate-pulse">Loading editor...</div>
      </div>
    );
  }

  return (
    <div className="border rounded-lg bg-background relative">
      <div className="sticky top-0 z-50">
        <MenuBar editor={editor} />
      </div>
      <EditorContent editor={editor} />
    </div>
  );
}

