'use client'

import { useEditor, EditorContent } from '@tiptap/react'
import StarterKit from '@tiptap/starter-kit'
import Placeholder from '@tiptap/extension-placeholder'
import CodeBlockLowlight from '@tiptap/extension-code-block-lowlight'
import Link from '@tiptap/extension-link'
import { common, createLowlight } from 'lowlight'
import { useEffect } from 'react'

const lowlight = createLowlight(common)

export default function Editor({ content, onChange }) {
  const editor = useEditor({
    extensions: [
      StarterKit.configure({ codeBlock: false }),
      Placeholder.configure({ placeholder: 'Start writing…' }),
      CodeBlockLowlight.configure({ lowlight }),
      Link.configure({ openOnClick: false }),
    ],
    content: content ?? '',
    onUpdate: ({ editor }) => {
      onChange(editor.getJSON(), editor.getText())
    },
    editorProps: {
      attributes: {
        class:
          'prose prose-zinc max-w-none focus:outline-none min-h-[50vh] font-mono text-[15px] leading-relaxed text-zinc-700',
      },
    },
  })

  useEffect(() => {
    if (!editor || content === undefined) return
    const currentJson = JSON.stringify(editor.getJSON())
    const incomingJson = JSON.stringify(content)
    if (currentJson !== incomingJson) {
      editor.commands.setContent(content)
    }
  }, [content])

  return (
    <div className="w-full">
      {editor && <Toolbar editor={editor} />}
      <EditorContent editor={editor} />
    </div>
  )
}

function Btn({ label, action, active }) {
  return (
    <button
      onMouseDown={(e) => { e.preventDefault(); action() }}
      className={`w-7 h-7 flex items-center justify-center rounded text-xs font-mono font-medium transition-colors ${
        active
          ? 'bg-zinc-900 text-white'
          : 'text-zinc-400 hover:bg-zinc-100 hover:text-zinc-700'
      }`}
    >
      {label}
    </button>
  )
}

function Divider() {
  return <div className="w-px h-4 bg-zinc-200 mx-0.5" />
}

function Toolbar({ editor }) {
  return (
    <div className="flex flex-wrap items-center gap-0.5 pb-4 mb-6 border-b border-zinc-100">
      <Btn label="B" action={() => editor.chain().focus().toggleBold().run()} active={editor.isActive('bold')} />
      <Btn label="I" action={() => editor.chain().focus().toggleItalic().run()} active={editor.isActive('italic')} />
      <Btn label="S" action={() => editor.chain().focus().toggleStrike().run()} active={editor.isActive('strike')} />
      <Btn label="`" action={() => editor.chain().focus().toggleCode().run()} active={editor.isActive('code')} />
      <Divider />
      <Btn label="H1" action={() => editor.chain().focus().toggleHeading({ level: 1 }).run()} active={editor.isActive('heading', { level: 1 })} />
      <Btn label="H2" action={() => editor.chain().focus().toggleHeading({ level: 2 }).run()} active={editor.isActive('heading', { level: 2 })} />
      <Btn label="H3" action={() => editor.chain().focus().toggleHeading({ level: 3 }).run()} active={editor.isActive('heading', { level: 3 })} />
      <Divider />
      <Btn label="•–" action={() => editor.chain().focus().toggleBulletList().run()} active={editor.isActive('bulletList')} />
      <Btn label="1–" action={() => editor.chain().focus().toggleOrderedList().run()} active={editor.isActive('orderedList')} />
      <Btn label="❝" action={() => editor.chain().focus().toggleBlockquote().run()} active={editor.isActive('blockquote')} />
      <Btn label="{}" action={() => editor.chain().focus().toggleCodeBlock().run()} active={editor.isActive('codeBlock')} />
      <Divider />
      <Btn label="↩" action={() => editor.chain().focus().undo().run()} active={false} />
      <Btn label="↪" action={() => editor.chain().focus().redo().run()} active={false} />
    </div>
  )
}
