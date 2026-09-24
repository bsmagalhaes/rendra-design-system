import { Image } from '@tiptap/extension-image'
import { Placeholder } from '@tiptap/extension-placeholder'
import { TableKit } from '@tiptap/extension-table'
import { TextAlign } from '@tiptap/extension-text-align'
import { EditorContent, useEditor, useEditorState, type Editor } from '@tiptap/react'
import { StarterKit } from '@tiptap/starter-kit'
import {
  AlignCenter,
  AlignJustify,
  AlignLeft,
  AlignRight,
  Bold,
  Code,
  Code2,
  Eraser,
  ImagePlus,
  Italic,
  Link2,
  List,
  ListOrdered,
  Minus,
  Quote,
  Redo2,
  Strikethrough,
  Table as TableIcon,
  Underline,
  Undo2,
} from 'lucide-react'
import { useEffect, useRef, useState, type ReactNode } from 'react'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { Tooltip } from '@/components/ui/tooltip'
import { cn } from '@/lib/cn'

/*
 * Editor de texto rico único (Tiptap, código aberto). Formatação completa, listas,
 * alinhamento, links, tabela, imagem e modo HTML para colar ou editar o código.
 * Imagens: botão, colar (Ctrl+V de um print ou imagem copiada) ou arrastar e soltar; ao
 * tocar na imagem aparecem 4 alças nos cantos para redimensionar, mantendo a proporção.
 * Mobile: a barra quebra em linhas (sem rolagem lateral) e as alças ficam maiores.
 */

export interface RichTextEditorProps {
  /** Conteúdo em HTML. */
  value?: string
  defaultValue?: string
  onChange?: (html: string) => void
  placeholder?: string
  /**
   * Envia a imagem e devolve a URL pública. Sem ela, a imagem entra no conteúdo em base64
   * (bom para demonstração; em produção, envie ao servidor).
   */
  onImageUpload?: (file: File) => Promise<string>
  /** Altura mínima da área de texto. */
  minHeight?: 'sm' | 'md' | 'lg'
  invalid?: boolean
  disabled?: boolean
  id?: string
  'aria-label'?: string
  'aria-describedby'?: string
  className?: string
}

const heights = { sm: 'min-h-24', md: 'min-h-chart-sm', lg: 'min-h-chart-md' } as const

const readAsDataUrl = (file: File) =>
  new Promise<string>((resolve, reject) => {
    const reader = new FileReader()
    reader.onload = () => resolve(String(reader.result))
    reader.onerror = () => reject(reader.error)
    reader.readAsDataURL(file)
  })

function ToolButton({
  label,
  active,
  disabled,
  onClick,
  children,
}: {
  label: string
  active?: boolean
  disabled?: boolean
  onClick: () => void
  children: ReactNode
}) {
  return (
    <Tooltip content={label}>
      <button
        type="button"
        aria-label={label}
        aria-pressed={active}
        disabled={disabled}
        // Mantém a seleção do texto ao clicar no botão.
        onMouseDown={(e) => e.preventDefault()}
        onClick={onClick}
        className={cn(
          'flex size-control-sm shrink-0 cursor-pointer items-center justify-center rounded-item text-muted-foreground transition-colors outline-none hover:bg-accent hover:text-foreground focus-visible:ring-2 focus-visible:ring-ring disabled:pointer-events-none disabled:opacity-40 [&_svg]:size-icon-sm',
          active && 'bg-primary-soft text-primary-soft-foreground hover:bg-primary-soft',
        )}
      >
        {children}
      </button>
    </Tooltip>
  )
}

const Divider = () => <span aria-hidden className="mx-1 h-6 w-px shrink-0 bg-border" />

function Toolbar({
  editor,
  source,
  onToggleSource,
  onPickImage,
}: {
  editor: Editor
  source: boolean
  onToggleSource: () => void
  onPickImage: () => void
}) {
  const s = useEditorState({
    editor,
    selector: ({ editor: e }) => ({
      bold: e.isActive('bold'),
      italic: e.isActive('italic'),
      underline: e.isActive('underline'),
      strike: e.isActive('strike'),
      code: e.isActive('code'),
      link: e.isActive('link'),
      bullet: e.isActive('bulletList'),
      ordered: e.isActive('orderedList'),
      quote: e.isActive('blockquote'),
      table: e.isActive('table'),
      h: [1, 2, 3].find((level) => e.isActive('heading', { level })) ?? 0,
      align:
        (['center', 'right', 'justify'] as const).find((a) => e.isActive({ textAlign: a })) ??
        'left',
      canUndo: e.can().undo(),
      canRedo: e.can().redo(),
    }),
  })
  const chain = () => editor.chain().focus()
  const off = source

  const setLink = () => {
    const prev = editor.getAttributes('link').href as string | undefined
    const url = window.prompt('Endereço do link', prev ?? 'https://')
    if (url === null) return
    if (!url) chain().extendMarkRange('link').unsetLink().run()
    else chain().extendMarkRange('link').setLink({ href: url }).run()
  }

  const blockLabel = s.h ? `Título ${s.h}` : 'Parágrafo'

  return (
    <div
      role="toolbar"
      aria-label="Formatação"
      className="flex flex-wrap items-center gap-1 border-b p-1"
    >
      <ToolButton
        label="Desfazer"
        disabled={off || !s.canUndo}
        onClick={() => chain().undo().run()}
      >
        <Undo2 />
      </ToolButton>
      <ToolButton label="Refazer" disabled={off || !s.canRedo} onClick={() => chain().redo().run()}>
        <Redo2 />
      </ToolButton>
      <Divider />
      <DropdownMenu>
        <DropdownMenuTrigger
          disabled={off}
          className="flex h-control-sm cursor-pointer items-center gap-1 rounded-item px-2 text-sm font-medium text-foreground outline-none hover:bg-accent focus-visible:ring-2 focus-visible:ring-ring disabled:opacity-40"
          onMouseDown={(e) => e.preventDefault()}
        >
          {blockLabel}
        </DropdownMenuTrigger>
        <DropdownMenuContent align="start">
          <DropdownMenuItem onSelect={() => chain().setParagraph().run()}>
            Parágrafo
          </DropdownMenuItem>
          {([1, 2, 3] as const).map((level) => (
            <DropdownMenuItem key={level} onSelect={() => chain().toggleHeading({ level }).run()}>
              Título {level}
            </DropdownMenuItem>
          ))}
        </DropdownMenuContent>
      </DropdownMenu>
      <Divider />
      <ToolButton
        label="Negrito (Ctrl+B)"
        active={s.bold}
        disabled={off}
        onClick={() => chain().toggleBold().run()}
      >
        <Bold />
      </ToolButton>
      <ToolButton
        label="Itálico (Ctrl+I)"
        active={s.italic}
        disabled={off}
        onClick={() => chain().toggleItalic().run()}
      >
        <Italic />
      </ToolButton>
      <ToolButton
        label="Sublinhado (Ctrl+U)"
        active={s.underline}
        disabled={off}
        onClick={() => chain().toggleUnderline().run()}
      >
        <Underline />
      </ToolButton>
      <ToolButton
        label="Riscado"
        active={s.strike}
        disabled={off}
        onClick={() => chain().toggleStrike().run()}
      >
        <Strikethrough />
      </ToolButton>
      <ToolButton
        label="Código"
        active={s.code}
        disabled={off}
        onClick={() => chain().toggleCode().run()}
      >
        <Code />
      </ToolButton>
      <ToolButton label="Link" active={s.link} disabled={off} onClick={setLink}>
        <Link2 />
      </ToolButton>
      <Divider />
      <ToolButton
        label="Lista com marcadores"
        active={s.bullet}
        disabled={off}
        onClick={() => chain().toggleBulletList().run()}
      >
        <List />
      </ToolButton>
      <ToolButton
        label="Lista numerada"
        active={s.ordered}
        disabled={off}
        onClick={() => chain().toggleOrderedList().run()}
      >
        <ListOrdered />
      </ToolButton>
      <ToolButton
        label="Citação"
        active={s.quote}
        disabled={off}
        onClick={() => chain().toggleBlockquote().run()}
      >
        <Quote />
      </ToolButton>
      <Divider />
      <ToolButton
        label="Alinhar à esquerda"
        active={s.align === 'left'}
        disabled={off}
        onClick={() => chain().setTextAlign('left').run()}
      >
        <AlignLeft />
      </ToolButton>
      <ToolButton
        label="Centralizar"
        active={s.align === 'center'}
        disabled={off}
        onClick={() => chain().setTextAlign('center').run()}
      >
        <AlignCenter />
      </ToolButton>
      <ToolButton
        label="Alinhar à direita"
        active={s.align === 'right'}
        disabled={off}
        onClick={() => chain().setTextAlign('right').run()}
      >
        <AlignRight />
      </ToolButton>
      <ToolButton
        label="Justificar"
        active={s.align === 'justify'}
        disabled={off}
        onClick={() => chain().setTextAlign('justify').run()}
      >
        <AlignJustify />
      </ToolButton>
      <Divider />
      <ToolButton label="Inserir imagem" disabled={off} onClick={onPickImage}>
        <ImagePlus />
      </ToolButton>
      <DropdownMenu>
        <Tooltip content="Tabela">
          <DropdownMenuTrigger
            aria-label="Tabela"
            disabled={off}
            onMouseDown={(e) => e.preventDefault()}
            className={cn(
              'flex size-control-sm cursor-pointer items-center justify-center rounded-item text-muted-foreground outline-none hover:bg-accent hover:text-foreground focus-visible:ring-2 focus-visible:ring-ring disabled:opacity-40 [&_svg]:size-icon-sm',
              s.table && 'bg-primary-soft text-primary-soft-foreground',
            )}
          >
            <TableIcon />
          </DropdownMenuTrigger>
        </Tooltip>
        <DropdownMenuContent align="start">
          <DropdownMenuItem
            onSelect={() => chain().insertTable({ rows: 3, cols: 3, withHeaderRow: true }).run()}
          >
            Inserir tabela 3 x 3
          </DropdownMenuItem>
          <DropdownMenuSeparator />
          <DropdownMenuItem disabled={!s.table} onSelect={() => chain().addRowAfter().run()}>
            Adicionar linha abaixo
          </DropdownMenuItem>
          <DropdownMenuItem disabled={!s.table} onSelect={() => chain().addColumnAfter().run()}>
            Adicionar coluna à direita
          </DropdownMenuItem>
          <DropdownMenuItem disabled={!s.table} onSelect={() => chain().deleteRow().run()}>
            Excluir linha
          </DropdownMenuItem>
          <DropdownMenuItem disabled={!s.table} onSelect={() => chain().deleteColumn().run()}>
            Excluir coluna
          </DropdownMenuItem>
          <DropdownMenuItem
            disabled={!s.table}
            destructive
            onSelect={() => chain().deleteTable().run()}
          >
            Excluir tabela
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
      <ToolButton
        label="Linha divisória"
        disabled={off}
        onClick={() => chain().setHorizontalRule().run()}
      >
        <Minus />
      </ToolButton>
      <ToolButton
        label="Limpar formatação"
        disabled={off}
        onClick={() => chain().unsetAllMarks().clearNodes().run()}
      >
        <Eraser />
      </ToolButton>
      <Divider />
      <ToolButton
        label={source ? 'Voltar ao editor visual' : 'Editar HTML'}
        active={source}
        onClick={onToggleSource}
      >
        <Code2 />
      </ToolButton>
    </div>
  )
}

export function RichTextEditor({
  value,
  defaultValue,
  onChange,
  placeholder = 'Escreva aqui...',
  onImageUpload,
  minHeight = 'md',
  invalid,
  disabled,
  id,
  className,
  ...aria
}: RichTextEditorProps) {
  const [source, setSource] = useState(false)
  const [html, setHtml] = useState(value ?? defaultValue ?? '')
  const fileRef = useRef<HTMLInputElement>(null)
  const cb = useRef({ onChange, onImageUpload })
  cb.current = { onChange, onImageUpload }

  const insertFiles = async (editor: Editor, files: File[], pos?: number) => {
    for (const file of files.filter((f) => f.type.startsWith('image/'))) {
      const src = cb.current.onImageUpload
        ? await cb.current.onImageUpload(file)
        : await readAsDataUrl(file)
      const chain = editor.chain().focus()
      if (pos !== undefined)
        chain.insertContentAt(pos, { type: 'image', attrs: { src, alt: file.name } })
      else chain.setImage({ src, alt: file.name })
      chain.run()
    }
  }

  const editor = useEditor({
    immediatelyRender: false,
    editable: !disabled,
    content: value ?? defaultValue ?? '',
    extensions: [
      StarterKit.configure({ link: { openOnClick: false, autolink: true } }),
      TextAlign.configure({ types: ['heading', 'paragraph'] }),
      TableKit.configure({ table: { resizable: false } }),
      Image.configure({
        allowBase64: true,
        resize: {
          enabled: true,
          directions: ['top-left', 'top-right', 'bottom-left', 'bottom-right'],
          minWidth: 48,
          minHeight: 48,
          alwaysPreserveAspectRatio: true,
        },
      }),
      Placeholder.configure({ placeholder }),
    ],
    editorProps: {
      attributes: {
        class: cn(
          'rich-text min-w-0 px-4 py-3 text-base outline-none md:text-sm',
          heights[minHeight],
        ),
        ...(id ? { id } : {}),
        role: 'textbox',
        'aria-multiline': 'true',
        // Nome acessível: o rótulo do Field não nomeia uma div editável; sem aria-label, usa o
        // placeholder.
        'aria-label': aria['aria-label'] ?? placeholder,
        ...(aria['aria-describedby'] ? { 'aria-describedby': aria['aria-describedby'] } : {}),
        ...(invalid ? { 'aria-invalid': 'true' } : {}),
      },
      // Colar um print ou imagem copiada (Ctrl+V): vira imagem no conteúdo.
      handlePaste: (_view, event) => {
        const files = [...(event.clipboardData?.files ?? [])]
        if (!files.some((f) => f.type.startsWith('image/')) || !editorRef.current) return false
        void insertFiles(editorRef.current, files)
        return true
      },
      // Arrastar e soltar imagens na posição em que caem.
      handleDrop: (view, event, _slice, moved) => {
        const files = [...(event.dataTransfer?.files ?? [])]
        if (moved || !files.some((f) => f.type.startsWith('image/')) || !editorRef.current)
          return false
        const pos = view.posAtCoords({ left: event.clientX, top: event.clientY })?.pos
        void insertFiles(editorRef.current, files, pos)
        return true
      },
    },
    onUpdate: ({ editor: e }) => {
      const next = e.getHTML()
      setHtml(next)
      cb.current.onChange?.(next)
    },
  })
  const editorRef = useRef<Editor | null>(null)
  editorRef.current = editor

  // Valor controlado vindo de fora.
  useEffect(() => {
    if (!editor || value === undefined || value === editor.getHTML()) return
    editor.commands.setContent(value, { emitUpdate: false })
    setHtml(value)
  }, [editor, value])

  useEffect(() => {
    editor?.setEditable(!disabled)
  }, [editor, disabled])

  const toggleSource = () => {
    if (!editor) return
    if (source) editor.commands.setContent(html, { emitUpdate: true })
    else setHtml(editor.getHTML())
    setSource((v) => !v)
  }

  return (
    <div
      data-slot="control"
      className={cn(
        'flex min-w-0 flex-col overflow-hidden rounded-control border border-input bg-field text-foreground transition-[border-color,box-shadow] duration-150 focus-within:border-ring focus-within:bg-card focus-within:ring-2 focus-within:ring-ring/25',
        invalid &&
          'border-destructive focus-within:border-destructive focus-within:ring-destructive/25',
        disabled && 'opacity-60',
        className,
      )}
    >
      {editor && (
        <Toolbar
          editor={editor}
          source={source}
          onToggleSource={toggleSource}
          onPickImage={() => fileRef.current?.click()}
        />
      )}
      {source ? (
        <textarea
          aria-label="Código HTML do conteúdo"
          value={html}
          onChange={(e) => {
            setHtml(e.target.value)
            cb.current.onChange?.(e.target.value)
          }}
          spellCheck={false}
          className={cn(
            'w-full resize-y bg-transparent px-4 py-3 font-mono text-sm outline-none',
            heights[minHeight],
          )}
        />
      ) : (
        <EditorContent editor={editor} className="min-w-0 cursor-text" />
      )}
      <input
        ref={fileRef}
        type="file"
        accept="image/*"
        multiple
        hidden
        onChange={(e) => {
          if (editor && e.target.files) void insertFiles(editor, [...e.target.files])
          e.target.value = ''
        }}
      />
    </div>
  )
}
