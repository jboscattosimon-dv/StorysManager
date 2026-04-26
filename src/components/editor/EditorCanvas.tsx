import { useRef, useState, useCallback } from 'react'
import { motion } from 'framer-motion'
import { useAppStore } from '../../store/useAppStore'
import type { TextElement } from '../../types'

interface DragState {
  id: string
  startX: number
  startY: number
  origX: number
  origY: number
}

export function EditorCanvas() {
  const { editorFrame, selectedElementId, setSelectedElementId, updateTextElement } = useAppStore()
  const canvasRef = useRef<HTMLDivElement>(null)
  const [dragging, setDragging] = useState<DragState | null>(null)


  const onMouseDown = useCallback((e: React.MouseEvent, el: TextElement) => {
    e.stopPropagation()
    setSelectedElementId(el.id)
    setDragging({ id: el.id, startX: e.clientX, startY: e.clientY, origX: el.x, origY: el.y })
  }, [setSelectedElementId])

  const onMouseMove = useCallback((e: React.MouseEvent) => {
    if (!dragging || !canvasRef.current) return
    const rect = canvasRef.current.getBoundingClientRect()
    const dx = ((e.clientX - dragging.startX) / rect.width) * 100
    const dy = ((e.clientY - dragging.startY) / rect.height) * 100
    updateTextElement(dragging.id, {
      x: Math.max(5, Math.min(95, dragging.origX + dx)),
      y: Math.max(5, Math.min(95, dragging.origY + dy)),
    })
  }, [dragging, updateTextElement])

  const onMouseUp = useCallback(() => setDragging(null), [])

  const onTouchStart = useCallback((e: React.TouchEvent, el: TextElement) => {
    e.stopPropagation()
    const touch = e.touches[0]
    setSelectedElementId(el.id)
    setDragging({ id: el.id, startX: touch.clientX, startY: touch.clientY, origX: el.x, origY: el.y })
  }, [setSelectedElementId])

  const onTouchMove = useCallback((e: React.TouchEvent) => {
    if (!dragging || !canvasRef.current) return
    const touch = e.touches[0]
    const rect = canvasRef.current.getBoundingClientRect()
    const dx = ((touch.clientX - dragging.startX) / rect.width) * 100
    const dy = ((touch.clientY - dragging.startY) / rect.height) * 100
    updateTextElement(dragging.id, {
      x: Math.max(5, Math.min(95, dragging.origX + dx)),
      y: Math.max(5, Math.min(95, dragging.origY + dy)),
    })
  }, [dragging, updateTextElement])

  const { backgroundColor, imageUrl, textElements, stickers } = editorFrame

  return (
    <div
      ref={canvasRef}
      className="relative overflow-hidden select-none rounded-2xl shadow-2xl mx-auto"
      style={{
        width: '100%',
        maxWidth: '360px',
        aspectRatio: '9/16',
        background: imageUrl ? `url(${imageUrl}) center/cover` : backgroundColor,
        cursor: dragging ? 'grabbing' : 'default',
      }}
      onClick={() => setSelectedElementId(null)}
      onMouseMove={onMouseMove}
      onMouseUp={onMouseUp}
      onMouseLeave={onMouseUp}
      onTouchMove={onTouchMove}
      onTouchEnd={onMouseUp}>

      {textElements.map((el) => {
        const isSelected = selectedElementId === el.id
        return (
          <motion.div
            key={el.id}
            className="absolute"
            style={{
              left: `${el.x}%`,
              top: `${el.y}%`,
              transform: `translate(-50%, -50%) rotate(${el.rotation}deg)`,
              cursor: 'grab',
              fontFamily: el.fontFamily,
              fontSize: `${el.fontSize}px`,
              color: el.color,
              fontWeight: el.bold ? 'bold' : 'normal',
              fontStyle: el.italic ? 'italic' : 'normal',
              textShadow: '0 2px 8px rgba(0,0,0,0.35)',
              whiteSpace: 'pre-wrap',
              textAlign: 'center',
              zIndex: isSelected ? 20 : 10,
              userSelect: 'none',
              outline: isSelected ? '2px dashed rgba(124,58,237,0.8)' : 'none',
              outlineOffset: '4px',
              borderRadius: '4px',
              padding: '2px 6px',
            }}
            onMouseDown={(e) => onMouseDown(e, el)}
            onTouchStart={(e) => onTouchStart(e, el)}
            animate={{ scale: isSelected ? 1.02 : 1 }}
            transition={{ duration: 0.1 }}>
            {el.content}
          </motion.div>
        )
      })}

      {stickers.map((s) => (
        <div
          key={s.id}
          className="absolute select-none pointer-events-none"
          style={{
            left: `${s.x}%`,
            top: `${s.y}%`,
            transform: 'translate(-50%, -50%)',
            fontSize: `${s.size}px`,
            zIndex: 10,
          }}>
          {s.emoji}
        </div>
      ))}

    </div>
  )
}
