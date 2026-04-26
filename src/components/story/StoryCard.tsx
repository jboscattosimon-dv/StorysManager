import { motion } from 'framer-motion'
import { Eye, Plus } from 'lucide-react'
import type { Story } from '../../types'

interface StoryAvatarProps {
  story: Story
  index: number
  onClick: () => void
}

export function StoryAvatar({ story, index, onClick }: StoryAvatarProps) {
  return (
    <motion.button
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.05 }}
      whileHover={{ scale: 1.05 }}
      whileTap={{ scale: 0.95 }}
      onClick={onClick}
      className="flex flex-col items-center gap-2 flex-shrink-0">
      <div className="relative">
        <div className="w-16 h-16 rounded-full p-0.5"
          style={{ background: story.user.hasNewStory
            ? 'linear-gradient(135deg, #7c3aed, #ec4899)'
            : 'var(--color-border)' }}>
          <img
            src={story.user.avatar}
            alt={story.user.name}
            className="w-full h-full rounded-full object-cover"
            style={{ backgroundColor: 'var(--color-surface-2)' }}
          />
        </div>
      </div>
      <span className="text-xs font-medium max-w-16 truncate" style={{ color: '#d1d5db' }}>
        {story.user.name.split(' ')[0]}
      </span>
    </motion.button>
  )
}

interface StoryCardProps {
  story: Story
  index: number
  onClick: () => void
}

export function StoryCard({ story, index, onClick }: StoryCardProps) {
  const frame = story.frames[0]

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ delay: index * 0.06 }}
      whileHover={{ y: -4 }}
      onClick={onClick}
      className="cursor-pointer rounded-2xl overflow-hidden flex-shrink-0 relative group"
      style={{
        width: '160px',
        height: '280px',
        background: frame.imageUrl ? `url(${frame.imageUrl})` : frame.backgroundColor,
        backgroundSize: 'cover',
        backgroundPosition: 'center',
      }}>
      <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent" />

      <div className="absolute top-3 left-3">
        <img
          src={story.user.avatar}
          alt={story.user.name}
          className="w-8 h-8 rounded-full border-2"
          style={{ borderColor: '#7c3aed', backgroundColor: 'var(--color-surface-2)' }}
        />
      </div>

      {frame.textElements[0] && (
        <div className="absolute inset-0 flex items-center justify-center p-4">
          <p
            className="text-center leading-tight"
            style={{
              fontFamily: frame.textElements[0].fontFamily,
              fontSize: `${Math.min(frame.textElements[0].fontSize * 0.4, 16)}px`,
              color: frame.textElements[0].color,
              fontWeight: frame.textElements[0].bold ? 'bold' : 'normal',
              fontStyle: frame.textElements[0].italic ? 'italic' : 'normal',
            }}>
            {frame.textElements[0].content}
          </p>
        </div>
      )}

      <div className="absolute bottom-0 left-0 right-0 p-3">
        <p className="text-white text-xs font-medium truncate">{story.user.name}</p>
        <div className="flex items-center gap-1 mt-0.5">
          <Eye size={10} className="text-white/60" />
          <span className="text-white/60 text-xs">{story.views.toLocaleString()}</span>
        </div>
      </div>

      <div className="absolute inset-0 rounded-2xl border-2 border-transparent group-hover:border-purple-500/50 transition-colors" />
    </motion.div>
  )
}

export function AddStoryButton({ onClick }: { onClick: () => void }) {
  return (
    <motion.button
      whileHover={{ scale: 1.05 }}
      whileTap={{ scale: 0.95 }}
      onClick={onClick}
      className="flex flex-col items-center gap-2 flex-shrink-0">
      <div className="w-16 h-16 rounded-full border-2 border-dashed flex items-center justify-center transition-colors hover:border-purple-500"
        style={{ borderColor: 'var(--color-border)' }}>
        <Plus size={20} style={{ color: '#9ca3af' }} />
      </div>
      <span className="text-xs font-medium" style={{ color: '#6b7280' }}>Novo</span>
    </motion.button>
  )
}
