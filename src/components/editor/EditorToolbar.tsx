import { motion } from 'framer-motion'
import {
  MousePointer2, Type, ImageIcon, Sticker, Palette,
  Undo2, Redo2, Trash2, Bold, Italic,
} from 'lucide-react'
import { useAppStore } from '../../store/useAppStore'
import { gradientOptions, fontOptions, stickerOptions } from '../../services/mockData'
import type { EditorTool, TextElement } from '../../types'

const tools: { icon: React.ElementType; id: EditorTool; label: string }[] = [
  { icon: MousePointer2, id: 'select', label: 'Selecionar' },
  { icon: Type, id: 'text', label: 'Texto' },
  { icon: ImageIcon, id: 'image', label: 'Imagem' },
  { icon: Sticker, id: 'sticker', label: 'Sticker' },
  { icon: Palette, id: 'background', label: 'Fundo' },
]

function newTextElement(): TextElement {
  return {
    id: crypto.randomUUID(),
    content: 'Toque para editar',
    x: 50,
    y: 50,
    fontSize: 32,
    fontFamily: 'Inter',
    color: '#ffffff',
    rotation: 0,
    bold: false,
    italic: false,
  }
}

export function EditorToolbar() {
  const {
    activeTool, setActiveTool,
    selectedElementId, editorFrame,
    addTextElement, updateTextElement, removeTextElement,
    setBackground, undoEditor, redoEditor, updateFrame,
  } = useAppStore()

  const selectedEl = editorFrame.textElements.find((el) => el.id === selectedElementId)

  const handleAddText = () => addTextElement(newTextElement())

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return
    const reader = new FileReader()
    reader.onload = (ev) => {
      updateFrame({ ...editorFrame, imageUrl: ev.target?.result as string })
    }
    reader.readAsDataURL(file)
  }

  const addSticker = (emoji: string) => {
    updateFrame({
      ...editorFrame,
      stickers: [
        ...editorFrame.stickers,
        { id: crypto.randomUUID(), emoji, x: 50, y: 50, size: 40 },
      ],
    })
  }

  return (
    <div className="flex flex-col gap-3">
      <div className="flex gap-1.5 p-1 rounded-xl" style={{ backgroundColor: 'var(--color-surface-2)' }}>
        {tools.map(({ icon: Icon, id, label }) => (
          <motion.button
            key={id}
            whileTap={{ scale: 0.9 }}
            title={label}
            onClick={() => {
              if (id === 'text') handleAddText()
              else setActiveTool(id)
            }}
            className="flex-1 flex flex-col items-center gap-1 py-2 rounded-lg text-xs transition-colors"
            style={{
              backgroundColor: activeTool === id ? 'rgba(124,58,237,0.2)' : 'transparent',
              color: activeTool === id ? '#a855f7' : '#9ca3af',
            }}>
            <Icon size={16} />
            <span className="hidden lg:block">{label}</span>
          </motion.button>
        ))}
      </div>

      <div className="flex gap-2">
        <button onClick={undoEditor} title="Desfazer"
          className="flex-1 flex items-center justify-center gap-1.5 py-2 rounded-lg text-xs transition-colors hover:bg-white/5"
          style={{ color: '#9ca3af', backgroundColor: 'var(--color-surface-2)' }}>
          <Undo2 size={14} />
        </button>
        <button onClick={redoEditor} title="Refazer"
          className="flex-1 flex items-center justify-center gap-1.5 py-2 rounded-lg text-xs transition-colors hover:bg-white/5"
          style={{ color: '#9ca3af', backgroundColor: 'var(--color-surface-2)' }}>
          <Redo2 size={14} />
        </button>
        {selectedEl && (
          <button onClick={() => removeTextElement(selectedEl.id)} title="Deletar"
            className="flex-1 flex items-center justify-center gap-1.5 py-2 rounded-lg text-xs transition-colors"
            style={{ color: '#f87171', backgroundColor: 'rgba(248,113,113,0.1)' }}>
            <Trash2 size={14} />
          </button>
        )}
      </div>

      {selectedEl && (
        <motion.div
          initial={{ opacity: 0, y: -8 }}
          animate={{ opacity: 1, y: 0 }}
          className="rounded-xl p-3 space-y-3"
          style={{ backgroundColor: 'var(--color-surface-2)', border: '1px solid var(--color-border)' }}>
          <p className="text-xs font-semibold text-white">Estilo do texto</p>

          <div className="flex gap-1.5">
            <button
              onClick={() => updateTextElement(selectedEl.id, { bold: !selectedEl.bold })}
              className="w-8 h-8 rounded-lg flex items-center justify-center text-sm font-bold transition-colors"
              style={{
                backgroundColor: selectedEl.bold ? 'rgba(124,58,237,0.25)' : 'var(--color-surface)',
                color: selectedEl.bold ? '#a855f7' : '#9ca3af',
              }}>
              <Bold size={14} />
            </button>
            <button
              onClick={() => updateTextElement(selectedEl.id, { italic: !selectedEl.italic })}
              className="w-8 h-8 rounded-lg flex items-center justify-center transition-colors"
              style={{
                backgroundColor: selectedEl.italic ? 'rgba(124,58,237,0.25)' : 'var(--color-surface)',
                color: selectedEl.italic ? '#a855f7' : '#9ca3af',
              }}>
              <Italic size={14} />
            </button>
          </div>

          <div>
            <label className="text-xs mb-1 block" style={{ color: '#9ca3af' }}>
              Tamanho: {selectedEl.fontSize}px
            </label>
            <input
              type="range" min={12} max={100} value={selectedEl.fontSize}
              onChange={(e) => updateTextElement(selectedEl.id, { fontSize: Number(e.target.value) })}
              className="w-full h-1.5 rounded-full appearance-none cursor-pointer"
              style={{ accentColor: '#7c3aed' }}
            />
          </div>

          <div>
            <label className="text-xs mb-1.5 block" style={{ color: '#9ca3af' }}>Fonte</label>
            <div className="flex gap-1.5 flex-wrap">
              {fontOptions.map((font) => (
                <button
                  key={font}
                  onClick={() => updateTextElement(selectedEl.id, { fontFamily: font })}
                  className="px-2 py-1 rounded-md text-xs transition-colors"
                  style={{
                    fontFamily: font,
                    backgroundColor: selectedEl.fontFamily === font ? 'rgba(124,58,237,0.25)' : 'var(--color-surface)',
                    color: selectedEl.fontFamily === font ? '#a855f7' : '#9ca3af',
                    border: `1px solid ${selectedEl.fontFamily === font ? '#7c3aed' : 'transparent'}`,
                  }}>
                  {font}
                </button>
              ))}
            </div>
          </div>

          <div>
            <label className="text-xs mb-1.5 block" style={{ color: '#9ca3af' }}>Cor do texto</label>
            <div className="flex gap-1.5 flex-wrap">
              {['#ffffff', '#000000', '#f59e0b', '#ef4444', '#3b82f6', '#10b981', '#ec4899', '#a855f7'].map((color) => (
                <button
                  key={color}
                  onClick={() => updateTextElement(selectedEl.id, { color })}
                  className="w-6 h-6 rounded-full border-2 transition-transform hover:scale-110"
                  style={{
                    backgroundColor: color,
                    borderColor: selectedEl.color === color ? '#fff' : 'transparent',
                  }}
                />
              ))}
              <input
                type="color"
                value={selectedEl.color}
                onChange={(e) => updateTextElement(selectedEl.id, { color: e.target.value })}
                className="w-6 h-6 rounded-full cursor-pointer border-none bg-transparent"
                title="Cor personalizada"
              />
            </div>
          </div>
        </motion.div>
      )}

      {activeTool === 'background' && (
        <motion.div
          initial={{ opacity: 0, y: -8 }}
          animate={{ opacity: 1, y: 0 }}
          className="rounded-xl p-3 space-y-2"
          style={{ backgroundColor: 'var(--color-surface-2)', border: '1px solid var(--color-border)' }}>
          <p className="text-xs font-semibold text-white">Fundo</p>
          <div className="grid grid-cols-5 gap-1.5">
            {gradientOptions.map((g, i) => (
              <button
                key={i}
                onClick={() => setBackground(g)}
                className="w-full aspect-square rounded-lg border-2 transition-transform hover:scale-105"
                style={{
                  background: g,
                  borderColor: editorFrame.backgroundColor === g ? '#7c3aed' : 'transparent',
                }}
              />
            ))}
          </div>
        </motion.div>
      )}

      {activeTool === 'sticker' && (
        <motion.div
          initial={{ opacity: 0, y: -8 }}
          animate={{ opacity: 1, y: 0 }}
          className="rounded-xl p-3"
          style={{ backgroundColor: 'var(--color-surface-2)', border: '1px solid var(--color-border)' }}>
          <p className="text-xs font-semibold text-white mb-2">Stickers</p>
          <div className="grid grid-cols-6 gap-1.5">
            {stickerOptions.map((emoji) => (
              <button
                key={emoji}
                onClick={() => addSticker(emoji)}
                className="text-xl aspect-square rounded-lg flex items-center justify-center hover:bg-white/10 transition-colors">
                {emoji}
              </button>
            ))}
          </div>
        </motion.div>
      )}

      {activeTool === 'image' && (
        <motion.div
          initial={{ opacity: 0, y: -8 }}
          animate={{ opacity: 1, y: 0 }}
          className="rounded-xl p-3"
          style={{ backgroundColor: 'var(--color-surface-2)', border: '1px solid var(--color-border)' }}>
          <p className="text-xs font-semibold text-white mb-2">Imagem de fundo</p>
          <label className="flex flex-col items-center gap-2 p-4 rounded-lg border-2 border-dashed cursor-pointer hover:border-purple-500 transition-colors"
            style={{ borderColor: 'var(--color-border)' }}>
            <ImageIcon size={20} style={{ color: '#9ca3af' }} />
            <span className="text-xs" style={{ color: '#9ca3af' }}>Clique para fazer upload</span>
            <input type="file" accept="image/*" className="hidden" onChange={handleImageUpload} />
          </label>
        </motion.div>
      )}
    </div>
  )
}
