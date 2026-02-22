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
      Placeholder.configure({ placeholder: 'Start writing… (use / for commands)' }),
      CodeBlockLowlight.configure({ lowlight }),
      Link.configure({ openOnClick: false }),
    ],
    content: content ?? '',
    onUpdate: ({ editor }) => {
      onChange(editor.getJSON(), editor.getText())
    },
    editorProps: {
      attributes: {
        class: 'prose prose-gray max-w-none focus:outline-none min-h-[60vh] px-1',
      },
    },
  })

  // Sync external content changes (e.g. initial load)
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

function Toolbar({ editor }) {
  const btn = (label, action, active) => (
    <button
      key={label}
      onMouseDown={(e) => { e.preventDefault(); action() }}
      className={`px-2.5 py-1 rounded text-sm font-medium transition-colors ${
        active ? 'bg-gray-200 text-gray-900' : 'text-gray-500 hover:bg-gray-100'
      }`}
    >
      {label}
    </button>
  )

  return (
    <div className="flex flex-wrap gap-1 pb-3 mb-4 border-b border-gray-100">
      {btn('B', () => editor.chain().focus().toggleBold().run(), editor.isActive('bold'))}
      {btn('I', () => editor.chain().focus().toggleItalic().run(), editor.isActive('italic'))}
      {btn('S', () => editor.chain().focus().toggleStrike().run(), editor.isActive('strike'))}
      {btn('Code', () => editor.chain().focus().toggleCode().run(), editor.isActive('code'))}
      <div className="w-px bg-gray-200 mx-1" />
      {btn('H1', () => editor.chain().focus().toggleHeading({ level: 1 }).run(), editor.isActive('heading', { level: 1 }))}
      {btn('H2', () => editor.chain().focus().toggleHeading({ level: 2 }).run(), editor.isActive('heading', { level: 2 }))}
      {btn('H3', () => editor.chain().focus().toggleHeading({ level: 3 }).run(), editor.isActive('heading', { level: 3 }))}
      <div className="w-px bg-gray-200 mx-1" />
      {btn('• List', () => editor.chain().focus().toggleBulletList().run(), editor.isActive('bulletList'))}
      {btn('1. List', () => editor.chain().focus().toggleOrderedList().run(), editor.isActive('orderedList'))}
      {btn('Quote', () => editor.chain().focus().toggleBlockquote().run(), editor.isActive('blockquote'))}
      {btn('Code Block', () => editor.chain().focus().toggleCodeBlock().run(), editor.isActive('codeBlock'))}
      <div className="w-px bg-gray-200 mx-1" />
      {btn('Undo', () => editor.chain().focus().undo().run(), false)}
      {btn('Redo', () => editor.chain().focus().redo().run(), false)}
    </div>
  )
}
