'use client'

import { useEditor, EditorContent, BubbleMenu } from '@tiptap/react'
import StarterKit from '@tiptap/starter-kit'
import Placeholder from '@tiptap/extension-placeholder'
import CodeBlockLowlight from '@tiptap/extension-code-block-lowlight'
import Link from '@tiptap/extension-link'
import { common, createLowlight } from 'lowlight'
import { useEffect, useRef } from 'react'
import * as Tooltip from '@radix-ui/react-tooltip'
import * as DropdownMenu from '@radix-ui/react-dropdown-menu'
import {
  Bold, Italic, Strikethrough, Code, Code2,
  Heading1, Heading2, Heading3,
  List, ListOrdered, Quote,
  Undo2, Redo2,
  Sparkles,
} from 'lucide-react'

const TONES = ['formal', 'casual', 'concise', 'creative']

const lowlight = createLowlight(common)

export default function Editor({ content, onChange, onEditorReady, aiActions }) {
  const readyFired = useRef(false)

  const editor = useEditor({
    immediatelyRender: false,
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
        class: 'prose prose-sm max-w-none focus:outline-none min-h-[60vh] font-mono',
        style: 'font-size: 15px; line-height: 1.85; color: var(--text-primary);',
      },
    },
  })

  // Expose editor instance to parent — fires as soon as editor is ready
  useEffect(() => {
    if (editor && onEditorReady && !readyFired.current) {
      readyFired.current = true
      onEditorReady(editor)
    }
  }, [editor, onEditorReady])

  useEffect(() => {
    if (!editor || content === undefined) return
    const current  = JSON.stringify(editor.getJSON())
    const incoming = JSON.stringify(content)
    if (current !== incoming) editor.commands.setContent(content)
  }, [content])

  return (
    <Tooltip.Provider delayDuration={500} skipDelayDuration={100}>
      <div className="w-full">
        {editor && (
          <>
            <Toolbar editor={editor} aiActions={aiActions} />

            {/* Floating bubble menu on text selection */}
            <BubbleMenu
              editor={editor}
              tippyOptions={{ duration: 120, placement: 'top' }}
            >
              <div
                className="flex items-center gap-0.5 rounded-lg px-1.5 py-1.5 shadow-xl"
                style={{ background: '#1C1B18', border: '1px solid rgba(255,255,255,0.08)' }}
              >
                {[
                  { icon: <Bold size={12} />,          label: 'Bold',          action: () => editor.chain().focus().toggleBold().run(),   active: editor.isActive('bold')   },
                  { icon: <Italic size={12} />,         label: 'Italic',        action: () => editor.chain().focus().toggleItalic().run(), active: editor.isActive('italic') },
                  { icon: <Strikethrough size={12} />,  label: 'Strikethrough', action: () => editor.chain().focus().toggleStrike().run(), active: editor.isActive('strike') },
                  { icon: <Code size={12} />,           label: 'Inline code',   action: () => editor.chain().focus().toggleCode().run(),   active: editor.isActive('code')   },
                ].map(({ icon, label, action, active }) => (
                  <button
                    key={label}
                    onMouseDown={(e) => { e.preventDefault(); action() }}
                    aria-label={label}
                    className="w-7 h-7 rounded-md flex items-center justify-center transition-colors"
                    style={{
                      background: active ? 'rgba(255,255,255,0.18)' : 'transparent',
                      color: active ? '#fff' : 'rgba(255,255,255,0.55)',
                    }}
                    onMouseEnter={(e) => {
                      if (!active) e.currentTarget.style.background = 'rgba(255,255,255,0.08)'
                      e.currentTarget.style.color = '#fff'
                    }}
                    onMouseLeave={(e) => {
                      if (!active) e.currentTarget.style.background = 'transparent'
                      e.currentTarget.style.color = active ? '#fff' : 'rgba(255,255,255,0.55)'
                    }}
                  >
                    {icon}
                  </button>
                ))}
              </div>
            </BubbleMenu>
          </>
        )}
        <EditorContent editor={editor} />
      </div>
    </Tooltip.Provider>
  )
}

/* ── Toolbar ── */
const TOOLBAR_GROUPS = (editor) => [
  [
    { icon: <Bold size={14} />,         label: 'Bold',       shortcut: '⌘B', action: () => editor.chain().focus().toggleBold().run(),   active: () => editor.isActive('bold')   },
    { icon: <Italic size={14} />,       label: 'Italic',     shortcut: '⌘I', action: () => editor.chain().focus().toggleItalic().run(), active: () => editor.isActive('italic') },
    { icon: <Strikethrough size={14} />,label: 'Strikethrough',              action: () => editor.chain().focus().toggleStrike().run(), active: () => editor.isActive('strike') },
    { icon: <Code size={14} />,         label: 'Inline code',shortcut: '⌘E', action: () => editor.chain().focus().toggleCode().run(),   active: () => editor.isActive('code')   },
  ],
  [
    { icon: <Heading1 size={14} />, label: 'Heading 1', action: () => editor.chain().focus().toggleHeading({ level: 1 }).run(), active: () => editor.isActive('heading', { level: 1 }) },
    { icon: <Heading2 size={14} />, label: 'Heading 2', action: () => editor.chain().focus().toggleHeading({ level: 2 }).run(), active: () => editor.isActive('heading', { level: 2 }) },
    { icon: <Heading3 size={14} />, label: 'Heading 3', action: () => editor.chain().focus().toggleHeading({ level: 3 }).run(), active: () => editor.isActive('heading', { level: 3 }) },
  ],
  [
    { icon: <List size={14} />,        label: 'Bullet list',  action: () => editor.chain().focus().toggleBulletList().run(),  active: () => editor.isActive('bulletList')  },
    { icon: <ListOrdered size={14} />, label: 'Ordered list', action: () => editor.chain().focus().toggleOrderedList().run(), active: () => editor.isActive('orderedList') },
    { icon: <Quote size={14} />,       label: 'Blockquote',   action: () => editor.chain().focus().toggleBlockquote().run(),  active: () => editor.isActive('blockquote')  },
    { icon: <Code2 size={14} />,       label: 'Code block',   action: () => editor.chain().focus().toggleCodeBlock().run(),   active: () => editor.isActive('codeBlock')   },
  ],
  [
    { icon: <Undo2 size={14} />, label: 'Undo', shortcut: '⌘Z', action: () => editor.chain().focus().undo().run(), active: () => false },
    { icon: <Redo2 size={14} />, label: 'Redo', shortcut: '⌘⇧Z',action: () => editor.chain().focus().redo().run(), active: () => false },
  ],
]

function Toolbar({ editor, aiActions }) {
  const groups = TOOLBAR_GROUPS(editor)

  return (
    <div
      className="flex items-center gap-0.5 flex-wrap pb-3 mb-4"
      style={{ borderBottom: '1px solid var(--border)' }}
    >
      {groups.map((group, gi) => (
        <div key={gi} className="flex items-center gap-0.5">
          {group.map(({ icon, label, shortcut, action, active }) => (
            <ToolBtn
              key={label}
              icon={icon}
              label={label}
              shortcut={shortcut}
              action={action}
              active={active()}
            />
          ))}
          {gi < groups.length - 1 && <Sep />}
        </div>
      ))}

      {aiActions && (
        <>
          <Sep />
          <AIToolbarMenu aiActions={aiActions} />
        </>
      )}
    </div>
  )
}

function AIToolbarMenu({ aiActions }) {
  return (
    <DropdownMenu.Root>
      <DropdownMenu.Trigger asChild>
        <button
          className="w-8 h-8 rounded-lg flex items-center justify-center transition-colors"
          title="AI Assistant"
          style={{ background: 'transparent', color: 'var(--text-tertiary)' }}
          onMouseEnter={(e) => { e.currentTarget.style.background = 'var(--bg-hover)'; e.currentTarget.style.color = 'var(--accent)' }}
          onMouseLeave={(e) => { e.currentTarget.style.background = 'transparent'; e.currentTarget.style.color = 'var(--text-tertiary)' }}
        >
          <Sparkles size={14} />
        </button>
      </DropdownMenu.Trigger>

      <DropdownMenu.Portal>
        <DropdownMenu.Content
          sideOffset={6}
          align="start"
          className="z-50 min-w-[180px] rounded-xl p-1.5 outline-none"
          style={{ background: 'var(--bg-panel)', border: '1px solid var(--border)', boxShadow: '0 8px 32px -8px rgba(0,0,0,0.14)' }}
        >
          <AIMenuItem onSelect={aiActions.onSummarize} icon="✦">Summarize note</AIMenuItem>
          <AIMenuItem onSelect={aiActions.onExpand} icon="↗">Expand text</AIMenuItem>
          <DropdownMenu.Separator className="my-1" style={{ height: '1px', background: 'var(--border)' }} />
          <p className="px-2 py-1 text-[9px] font-mono uppercase tracking-wider" style={{ color: 'var(--text-placeholder)' }}>Rewrite tone</p>
          {TONES.map((tone) => (
            <AIMenuItem key={tone} onSelect={() => aiActions.onRewrite(tone)} icon="↺">
              {tone.charAt(0).toUpperCase() + tone.slice(1)}
            </AIMenuItem>
          ))}
        </DropdownMenu.Content>
      </DropdownMenu.Portal>
    </DropdownMenu.Root>
  )
}

function AIMenuItem({ onSelect, icon, children }) {
  return (
    <DropdownMenu.Item
      onSelect={onSelect}
      className="flex items-center gap-2 px-2 py-1.5 rounded-lg text-[12px] font-mono outline-none cursor-pointer"
      style={{ color: 'var(--text-secondary)' }}
      onMouseEnter={(e) => { e.currentTarget.style.background = 'var(--bg-hover)'; e.currentTarget.style.color = 'var(--text-primary)' }}
      onMouseLeave={(e) => { e.currentTarget.style.background = 'transparent'; e.currentTarget.style.color = 'var(--text-secondary)' }}
    >
      <span className="text-[11px] w-4 text-center" style={{ color: 'var(--accent)' }}>{icon}</span>
      {children}
    </DropdownMenu.Item>
  )
}

function ToolBtn({ icon, label, shortcut, action, active }) {
  return (
    <Tooltip.Root>
      <Tooltip.Trigger asChild>
        <button
          onMouseDown={(e) => { e.preventDefault(); action() }}
          aria-label={label}
          className="w-8 h-8 rounded-lg flex items-center justify-center transition-colors"
          style={{
            background: active ? 'var(--text-primary)' : 'transparent',
            color:      active ? '#fff' : 'var(--text-tertiary)',
          }}
          onMouseEnter={(e) => {
            if (!active) {
              e.currentTarget.style.background = 'var(--bg-hover)'
              e.currentTarget.style.color = 'var(--text-primary)'
            }
          }}
          onMouseLeave={(e) => {
            if (!active) {
              e.currentTarget.style.background = 'transparent'
              e.currentTarget.style.color = 'var(--text-tertiary)'
            }
          }}
        >
          {icon}
        </button>
      </Tooltip.Trigger>
      <Tooltip.Portal>
        <Tooltip.Content
          sideOffset={6}
          className="rounded-md px-2 py-1 text-[11px] font-mono flex items-center gap-1.5 z-50"
          style={{ background: '#1C1B18', color: '#fff' }}
        >
          {label}
          {shortcut && (
            <span className="opacity-40 text-[10px]">{shortcut}</span>
          )}
          <Tooltip.Arrow style={{ fill: '#1C1B18' }} />
        </Tooltip.Content>
      </Tooltip.Portal>
    </Tooltip.Root>
  )
}

function Sep() {
  return (
    <div
      className="mx-1 shrink-0"
      style={{ width: '1px', height: '16px', background: 'var(--border)' }}
    />
  )
}
