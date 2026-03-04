'use client'

import { useEditor, EditorContent } from '@tiptap/react'
import StarterKit from '@tiptap/starter-kit'
import { Bold, Italic, List, ListOrdered, Heading3, Minus } from 'lucide-react'

interface RichTextEditorProps {
  value: string
  onChange: (html: string) => void
  placeholder?: string
  error?: string
}

export function RichTextEditor({ value, onChange, placeholder, error }: RichTextEditorProps) {
  const editor = useEditor({
    extensions: [
      StarterKit.configure({
        heading: { levels: [3] },
        codeBlock: false,
        blockquote: false,
        horizontalRule: false,
      }),
    ],
    content: value || '',
    onUpdate({ editor }) {
      // Return empty string when editor is empty (avoid '<p></p>')
      const html = editor.isEmpty ? '' : editor.getHTML()
      onChange(html)
    },
    editorProps: {
      attributes: {
        class: [
          'min-h-[120px] w-full rounded-b-lg border-x border-b bg-white px-3 py-2.5',
          'text-sm text-gray-900 placeholder:text-gray-400',
          'focus:outline-none',
          'prose prose-sm max-w-none',
          error ? 'border-red-300' : 'border-gray-200',
        ].join(' '),
      },
    },
    immediatelyRender: false,
  })

  if (!editor) return null

  return (
    <div>
      {/* Toolbar */}
      <div className={[
        'flex items-center gap-0.5 px-2 py-1.5 rounded-t-lg border border-b-0 bg-gray-50',
        error ? 'border-red-300' : 'border-gray-200',
      ].join(' ')}>
        <ToolbarButton
          onClick={() => editor.chain().focus().toggleBold().run()}
          active={editor.isActive('bold')}
          title="Жирный (Ctrl+B)"
        >
          <Bold className="w-3.5 h-3.5" />
        </ToolbarButton>
        <ToolbarButton
          onClick={() => editor.chain().focus().toggleItalic().run()}
          active={editor.isActive('italic')}
          title="Курсив (Ctrl+I)"
        >
          <Italic className="w-3.5 h-3.5" />
        </ToolbarButton>

        <div className="w-px h-4 bg-gray-200 mx-1" />

        <ToolbarButton
          onClick={() => editor.chain().focus().toggleHeading({ level: 3 }).run()}
          active={editor.isActive('heading', { level: 3 })}
          title="Заголовок"
        >
          <Heading3 className="w-3.5 h-3.5" />
        </ToolbarButton>

        <div className="w-px h-4 bg-gray-200 mx-1" />

        <ToolbarButton
          onClick={() => editor.chain().focus().toggleBulletList().run()}
          active={editor.isActive('bulletList')}
          title="Маркированный список"
        >
          <List className="w-3.5 h-3.5" />
        </ToolbarButton>
        <ToolbarButton
          onClick={() => editor.chain().focus().toggleOrderedList().run()}
          active={editor.isActive('orderedList')}
          title="Нумерованный список"
        >
          <ListOrdered className="w-3.5 h-3.5" />
        </ToolbarButton>

        <div className="w-px h-4 bg-gray-200 mx-1" />

        <ToolbarButton
          onClick={() => editor.chain().focus().setHorizontalRule().run()}
          active={false}
          title="Разделитель"
        >
          <Minus className="w-3.5 h-3.5" />
        </ToolbarButton>
      </div>

      <EditorContent editor={editor} />

      {/* Placeholder — shown when editor is empty */}
      {editor.isEmpty && placeholder && (
        <div className="pointer-events-none absolute mt-[-38px] ml-3 text-sm text-gray-400 select-none">
          {placeholder}
        </div>
      )}

      {error && <p className="mt-1.5 text-xs text-red-500">{error}</p>}
    </div>
  )
}

function ToolbarButton({
  onClick,
  active,
  title,
  children,
}: {
  onClick: () => void
  active: boolean
  title: string
  children: React.ReactNode
}) {
  return (
    <button
      type="button"
      onMouseDown={(e) => {
        e.preventDefault() // prevent editor blur
        onClick()
      }}
      title={title}
      className={[
        'flex h-6 w-6 items-center justify-center rounded transition-colors',
        active
          ? 'bg-gray-200 text-gray-900'
          : 'text-gray-500 hover:bg-gray-100 hover:text-gray-700',
      ].join(' ')}
    >
      {children}
    </button>
  )
}
