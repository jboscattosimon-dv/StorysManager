import { useEffect, useRef, useState, useCallback } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { X, ChevronLeft, ChevronRight, Pause, Play } from 'lucide-react'
import { useAppStore } from '../../store/useAppStore'
import type { Story, StoryFrame } from '../../types'

function FrameRenderer({ frame }: { frame: StoryFrame }) {
  return (
    <div
      className="absolute inset-0"
      style={{
        background: frame.imageUrl ? `url(${frame.imageUrl}) center/cover` : frame.backgroundColor,
      }}>
      {frame.textElements.map((el) => (
        <div
          key={el.id}
          className="absolute select-none pointer-events-none"
          style={{
            left: `${el.x}%`,
            top: `${el.y}%`,
            transform: `translate(-50%, -50%) rotate(${el.rotation}deg)`,
            fontFamily: el.fontFamily,
            fontSize: `${el.fontSize}px`,
            color: el.color,
            fontWeight: el.bold ? 'bold' : 'normal',
            fontStyle: el.italic ? 'italic' : 'normal',
            textShadow: '0 2px 8px rgba(0,0,0,0.4)',
            whiteSpace: 'pre-wrap',
            textAlign: 'center',
            maxWidth: '80%',
          }}>
          {el.content}
        </div>
      ))}
      {frame.stickers.map((s) => (
        <div
          key={s.id}
          className="absolute select-none pointer-events-none"
          style={{
            left: `${s.x}%`,
            top: `${s.y}%`,
            transform: 'translate(-50%, -50%)',
            fontSize: `${s.size}px`,
          }}>
          {s.emoji}
        </div>
      ))}
    </div>
  )
}

export function StoryViewer() {
  const { viewerOpen, viewerStoryIndex, stories, closeViewer } = useAppStore()

  const [storyIdx, setStoryIdx] = useState(viewerStoryIndex)
  const [frameIdx, setFrameIdx] = useState(0)
  const [progress, setProgress] = useState(0)
  const [paused, setPaused] = useState(false)

  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null)
  const TICK = 50

  const currentStory: Story | undefined = stories[storyIdx]
  const currentFrame = currentStory?.frames[frameIdx]
  const duration = currentStory?.duration ?? 5000

  const goNextFrame = useCallback(() => {
    if (!currentStory) return
    if (frameIdx < currentStory.frames.length - 1) {
      setFrameIdx((f) => f + 1)
      setProgress(0)
    } else if (storyIdx < stories.length - 1) {
      setStoryIdx((s) => s + 1)
      setFrameIdx(0)
      setProgress(0)
    } else {
      closeViewer()
    }
  }, [currentStory, frameIdx, storyIdx, stories.length, closeViewer])

  const goPrevFrame = useCallback(() => {
    if (frameIdx > 0) {
      setFrameIdx((f) => f - 1)
      setProgress(0)
    } else if (storyIdx > 0) {
      setStoryIdx((s) => s - 1)
      setFrameIdx(0)
      setProgress(0)
    }
  }, [frameIdx, storyIdx])

  useEffect(() => {
    setStoryIdx(viewerStoryIndex)
    setFrameIdx(0)
    setProgress(0)
  }, [viewerStoryIndex])

  useEffect(() => {
    if (!viewerOpen || paused) {
      if (intervalRef.current) clearInterval(intervalRef.current)
      return
    }
    intervalRef.current = setInterval(() => {
      setProgress((p) => {
        const next = p + (TICK / duration) * 100
        if (next >= 100) {
          goNextFrame()
          return 0
        }
        return next
      })
    }, TICK)
    return () => { if (intervalRef.current) clearInterval(intervalRef.current) }
  }, [viewerOpen, paused, goNextFrame, duration, frameIdx, storyIdx])

  const handleTap = (e: React.MouseEvent<HTMLDivElement>) => {
    const x = e.clientX / window.innerWidth
    if (x < 0.35) goPrevFrame()
    else if (x > 0.65) goNextFrame()
    else setPaused((p) => !p)
  }

  if (!viewerOpen || !currentStory || !currentFrame) return null

  return (
    <AnimatePresence>
      <motion.div
        key="viewer-overlay"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 z-50 flex items-center justify-center"
        style={{ backgroundColor: 'rgba(0,0,0,0.92)' }}>

        <motion.div
          initial={{ scale: 0.9, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          exit={{ scale: 0.9, opacity: 0 }}
          transition={{ type: 'spring', stiffness: 300, damping: 30 }}
          className="relative overflow-hidden shadow-2xl"
          style={{ width: '360px', height: '640px', borderRadius: '24px', maxHeight: '90vh', maxWidth: '90vw' }}>

          <div onClick={handleTap} className="absolute inset-0 z-10 cursor-pointer" />

          <AnimatePresence mode="wait">
            <motion.div
              key={`${storyIdx}-${frameIdx}`}
              initial={{ opacity: 0, x: 30 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -30 }}
              transition={{ duration: 0.2 }}
              className="absolute inset-0">
              <FrameRenderer frame={currentFrame} />
            </motion.div>
          </AnimatePresence>

          <div className="absolute top-3 left-3 right-3 z-20 flex gap-1">
            {currentStory.frames.map((_, i) => (
              <div key={i} className="flex-1 h-0.5 rounded-full overflow-hidden"
                style={{ backgroundColor: 'rgba(255,255,255,0.3)' }}>
                <motion.div
                  className="h-full"
                  style={{
                    backgroundColor: '#fff',
                    width: i < frameIdx ? '100%' : i === frameIdx ? `${progress}%` : '0%',
                  }}
                  transition={{ duration: 0 }}
                />
              </div>
            ))}
          </div>

          <div className="absolute top-6 left-3 right-3 z-20 flex items-center justify-between">
            <div className="flex items-center gap-2 mt-2">
              <img
                src={currentStory.user.avatar}
                alt={currentStory.user.name}
                className="w-8 h-8 rounded-full border-2 border-white"
                style={{ backgroundColor: '#333' }}
              />
              <div>
                <p className="text-white text-sm font-semibold leading-none">{currentStory.user.name}</p>
                <p className="text-white/60 text-xs mt-0.5">agora mesmo</p>
              </div>
            </div>
            <div className="flex items-center gap-2 mt-2">
              <button
                onClick={(e) => { e.stopPropagation(); setPaused((p) => !p) }}
                className="w-8 h-8 rounded-full flex items-center justify-center text-white hover:bg-white/10 z-30 relative">
                {paused ? <Play size={14} fill="white" /> : <Pause size={14} />}
              </button>
              <button
                onClick={(e) => { e.stopPropagation(); closeViewer() }}
                className="w-8 h-8 rounded-full flex items-center justify-center text-white hover:bg-white/10 z-30 relative">
                <X size={16} />
              </button>
            </div>
          </div>
        </motion.div>

        <button
          onClick={goPrevFrame}
          disabled={storyIdx === 0 && frameIdx === 0}
          className="absolute left-4 top-1/2 -translate-y-1/2 w-10 h-10 rounded-full flex items-center justify-center text-white hover:bg-white/10 disabled:opacity-30 transition-all z-30">
          <ChevronLeft size={24} />
        </button>
        <button
          onClick={goNextFrame}
          className="absolute right-4 top-1/2 -translate-y-1/2 w-10 h-10 rounded-full flex items-center justify-center text-white hover:bg-white/10 transition-all z-30">
          <ChevronRight size={24} />
        </button>
      </motion.div>
    </AnimatePresence>
  )
}
