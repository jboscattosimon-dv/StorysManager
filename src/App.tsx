import { AnimatePresence, motion } from 'framer-motion'
import { AppLayout } from './components/layout/AppLayout'
import { StoryViewer } from './components/story/StoryViewer'
import { HomePage } from './pages/HomePage'
import { EditorPage } from './pages/EditorPage'
import { TemplatesPage } from './pages/TemplatesPage'
import { HistoryPage } from './pages/HistoryPage'
import { useAppStore } from './store/useAppStore'

const pageVariants = {
  initial: { opacity: 0, x: 12 },
  animate: { opacity: 1, x: 0 },
  exit: { opacity: 0, x: -12 },
}

function PageContent() {
  const { currentPage } = useAppStore()

  return (
    <AnimatePresence mode="wait">
      <motion.div
        key={currentPage}
        variants={pageVariants}
        initial="initial"
        animate="animate"
        exit="exit"
        transition={{ duration: 0.18, ease: 'easeInOut' }}
        className="flex-1 flex flex-col overflow-hidden">
        {currentPage === 'home' && <HomePage />}
        {currentPage === 'editor' && <EditorPage />}
        {currentPage === 'templates' && <TemplatesPage />}
        {currentPage === 'history' && <HistoryPage />}
      </motion.div>
    </AnimatePresence>
  )
}

export default function App() {
  return (
    <AppLayout>
      <PageContent />
      <StoryViewer />
    </AppLayout>
  )
}
