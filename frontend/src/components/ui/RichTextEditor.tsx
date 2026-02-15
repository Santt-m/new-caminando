import { useEditor, EditorContent } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
import Link from '@tiptap/extension-link';
import { Button } from '@/components/ui/button';
import { Bold, Italic, List, ListOrdered, Link as LinkIcon, Undo, Redo, Code } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useEffect } from 'react';

interface RichTextEditorProps {
    value: string;
    onChange: (value: string) => void;
    className?: string;
}

export const RichTextEditor = ({ value, onChange, className }: RichTextEditorProps) => {
    const editor = useEditor({
        extensions: [
            StarterKit,
            Link.configure({
                openOnClick: false,
                HTMLAttributes: {
                    class: 'text-primary underline cursor-pointer',
                },
            }),
        ],
        content: value,
        onUpdate: ({ editor }) => {
            onChange(editor.getHTML());
        },
        editorProps: {
            attributes: {
                class: 'min-h-[200px] w-full rounded-md border border-input bg-transparent px-3 py-2 text-sm shadow-sm placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50',
            },
        },
    });

    // Update content if value changes externally (and isn't the same as current logic)
    // Careful with loops here, only update if significantly different to avoid cursor jumps
    useEffect(() => {
        if (editor && value !== editor.getHTML()) {
            // Check if it's empty to avoid initial flash, or just compare
            // For simple use cases, this might be enough, but for real-time it needs diffing
            // Here we assume value primarily comes from local state which is updated by onChange above.
            // But if we load a new template, we need to set content.
            if (editor.getText() === '' && value) {
                editor.commands.setContent(value);
            }
        }
    }, [value, editor]);

    // Better effect for content sync when switching templates
    useEffect(() => {
        if (editor && value && value !== editor.getHTML()) {
            editor.commands.setContent(value);
        }
    }, [editor, value]);


    if (!editor) {
        return null;
    }

    const setLink = () => {
        const previousUrl = editor.getAttributes('link').href;
        const url = window.prompt('URL', previousUrl);

        if (url === null) {
            return;
        }

        if (url === '') {
            editor.chain().focus().extendMarkRange('link').unsetLink().run();
            return;
        }

        editor.chain().focus().extendMarkRange('link').setLink({ href: url }).run();
    };

    return (
        <div className={cn("flex flex-col gap-2 p-1 border rounded-md", className)}>
            <div className="flex flex-wrap gap-1 p-1 border-b bg-muted/30">
                <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => editor.chain().focus().toggleBold().run()}
                    className={cn(editor.isActive('bold') && "bg-muted")}
                    type="button"
                >
                    <Bold className="h-4 w-4" />
                </Button>
                <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => editor.chain().focus().toggleItalic().run()}
                    className={cn(editor.isActive('italic') && "bg-muted")}
                    type="button"
                >
                    <Italic className="h-4 w-4" />
                </Button>
                <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => editor.chain().focus().toggleCode().run()}
                    className={cn(editor.isActive('code') && "bg-muted")}
                    type="button"
                >
                    <Code className="h-4 w-4" />
                </Button>
                <div className="w-px h-6 bg-border mx-1 my-auto" />
                <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => editor.chain().focus().toggleBulletList().run()}
                    className={cn(editor.isActive('bulletList') && "bg-muted")}
                    type="button"
                >
                    <List className="h-4 w-4" />
                </Button>
                <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => editor.chain().focus().toggleOrderedList().run()}
                    className={cn(editor.isActive('orderedList') && "bg-muted")}
                    type="button"
                >
                    <ListOrdered className="h-4 w-4" />
                </Button>
                <div className="w-px h-6 bg-border mx-1 my-auto" />
                <Button
                    variant="ghost"
                    size="sm"
                    onClick={setLink}
                    className={cn(editor.isActive('link') && "bg-muted")}
                    type="button"
                >
                    <LinkIcon className="h-4 w-4" />
                </Button>
                <div className="w-px h-6 bg-border mx-1 my-auto" />
                <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => editor.chain().focus().undo().run()}
                    disabled={!editor.can().undo()}
                    type="button"
                >
                    <Undo className="h-4 w-4" />
                </Button>
                <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => editor.chain().focus().redo().run()}
                    disabled={!editor.can().redo()}
                    type="button"
                >
                    <Redo className="h-4 w-4" />
                </Button>
            </div>
            <EditorContent editor={editor} className="min-h-[200px] prose prose-sm max-w-none p-2 focus:outline-none" />
        </div>
    );
};
