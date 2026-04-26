import { motion } from 'framer-motion'
import { TrendingUp, Users, Eye, Plus } from 'lucide-react'
import { Header } from '../components/layout/Header'
import { StoryAvatar, StoryCard, AddStoryButton } from '../components/story/StoryCard'
import { useAppStore } from '../store/useAppStore'

const stats = [
  { label: 'Stories Criados', value: '24', icon: TrendingUp, color: '#7c3aed' },
  { label: 'Visualizações', value: '12.4k', icon: Eye, color: '#ec4899' },
  { label: 'Seguidores', value: '891', icon: Users, color: '#06b6d4' },
]

export function HomePage() {
  const { stories, openViewer, setCurrentPage } = useAppStore()

  const storiesWithNew = stories.filter((s) => s.user.hasNewStory)

  return (
    <div className="flex-1 flex flex-col overflow-hidden">
      <Header
        title="Stories"
        subtitle="Gerencie e visualize seus stories"
      />

      <div className="flex-1 overflow-y-auto p-4 md:p-6 space-y-6">
        <div className="grid grid-cols-3 gap-3">
          {stats.map(({ label, value, icon: Icon, color }, i) => (
            <motion.div
              key={label}
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.07 }}
              className="rounded-xl p-4"
              style={{ backgroundColor: 'var(--color-surface)', border: '1px solid var(--color-border)' }}>
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs font-medium" style={{ color: '#9ca3af' }}>{label}</span>
                <div className="w-7 h-7 rounded-lg flex items-center justify-center"
                  style={{ backgroundColor: `${color}20` }}>
                  <Icon size={14} style={{ color }} />
                </div>
              </div>
              <p className="text-2xl font-bold text-white">{value}</p>
            </motion.div>
          ))}
        </div>

        <section>
          <div className="flex items-center justify-between mb-3">
            <h2 className="text-sm font-semibold text-white">Stories Recentes</h2>
            <span className="text-xs" style={{ color: '#6b7280' }}>{storiesWithNew.length} novos</span>
          </div>
          <div className="flex gap-4 overflow-x-auto pb-2 -mx-1 px-1">
            <AddStoryButton onClick={() => setCurrentPage('editor')} />
            {storiesWithNew.map((story, i) => (
              <StoryAvatar
                key={story.id}
                story={story}
                index={i}
                onClick={() => openViewer(stories.indexOf(story))}
              />
            ))}
          </div>
        </section>

        <section>
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-sm font-semibold text-white">Todos os Stories</h2>
            <button
              onClick={() => setCurrentPage('editor')}
              className="flex items-center gap-1.5 text-xs font-medium px-3 py-1.5 rounded-lg transition-colors hover:opacity-90"
              style={{ backgroundColor: 'rgba(124, 58, 237, 0.15)', color: '#a855f7' }}>
              <Plus size={12} />
              Novo Story
            </button>
          </div>

          <div className="flex gap-3 overflow-x-auto pb-3 -mx-1 px-1">
            {stories.map((story, i) => (
              <StoryCard
                key={story.id}
                story={story}
                index={i}
                onClick={() => openViewer(i)}
              />
            ))}
          </div>
        </section>

        <section>
          <div className="rounded-xl p-5 flex items-center gap-4"
            style={{ background: 'linear-gradient(135deg, rgba(124,58,237,0.2) 0%, rgba(168,85,247,0.1) 100%)', border: '1px solid rgba(124,58,237,0.3)' }}>
            <div className="w-12 h-12 rounded-xl flex items-center justify-center flex-shrink-0"
              style={{ background: 'linear-gradient(135deg, #7c3aed, #a855f7)' }}>
              <Plus size={22} className="text-white" />
            </div>
            <div className="flex-1">
              <p className="text-white font-semibold">Crie seu próximo story</p>
              <p className="text-sm mt-0.5" style={{ color: '#9ca3af' }}>Use templates prontos ou comece do zero</p>
            </div>
            <button
              onClick={() => setCurrentPage('editor')}
              className="px-4 py-2 rounded-lg text-sm font-semibold text-white flex-shrink-0 transition-opacity hover:opacity-90"
              style={{ background: 'linear-gradient(135deg, #7c3aed, #a855f7)' }}>
              Criar agora
            </button>
          </div>
        </section>
      </div>
    </div>
  )
}
