import { motion } from 'framer-motion'
import { Layers, Tag } from 'lucide-react'
import { Header } from '../components/layout/Header'
import { useAppStore } from '../store/useAppStore'
import { mockTemplates } from '../services/mockData'
import type { Template } from '../types'

const categoryLabels: Record<Template['category'], string> = {
  promotion: 'Promoção',
  product: 'Produto',
  quote: 'Frase',
  announcement: 'Anúncio',
}

const categoryColors: Record<Template['category'], string> = {
  promotion: '#ef4444',
  product: '#3b82f6',
  quote: '#10b981',
  announcement: '#f59e0b',
}

function TemplatePreview({ template }: { template: Template }) {
  return (
    <div
      className="w-full rounded-xl overflow-hidden relative"
      style={{ aspectRatio: '9/16', background: template.backgroundColor }}>
      {template.textElements.map((el, i) => (
        <div
          key={i}
          className="absolute"
          style={{
            left: `${el.x}%`,
            top: `${el.y}%`,
            transform: `translate(-50%, -50%) rotate(${el.rotation}deg)`,
            fontFamily: el.fontFamily,
            fontSize: `${el.fontSize * 0.45}px`,
            color: el.color,
            fontWeight: el.bold ? 'bold' : 'normal',
            fontStyle: el.italic ? 'italic' : 'normal',
            textShadow: '0 1px 4px rgba(0,0,0,0.3)',
            whiteSpace: 'pre-wrap',
            textAlign: 'center',
            maxWidth: '85%',
          }}>
          {el.content}
        </div>
      ))}
    </div>
  )
}

export function TemplatesPage() {
  const { loadTemplate, setCurrentPage } = useAppStore()

  const categories = Array.from(new Set(mockTemplates.map((t) => t.category)))

  const handleUseTemplate = (template: Template) => {
    loadTemplate({
      backgroundColor: template.backgroundColor,
      textElements: template.textElements as never,
    })
    setCurrentPage('editor')
  }

  return (
    <div className="flex-1 flex flex-col overflow-hidden">
      <Header title="Templates" subtitle="Escolha um template e personalize" />

      <div className="flex-1 overflow-y-auto p-4 md:p-6 space-y-8">
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          className="rounded-xl p-4 flex items-center gap-3"
          style={{ background: 'linear-gradient(135deg, rgba(124,58,237,0.15) 0%, rgba(168,85,247,0.08) 100%)', border: '1px solid rgba(124,58,237,0.25)' }}>
          <div className="w-10 h-10 rounded-xl flex items-center justify-center"
            style={{ background: 'linear-gradient(135deg, #7c3aed, #a855f7)' }}>
            <Layers size={18} className="text-white" />
          </div>
          <div>
            <p className="text-white font-semibold text-sm">{mockTemplates.length} templates disponíveis</p>
            <p className="text-xs mt-0.5" style={{ color: '#9ca3af' }}>Clique em qualquer template para começar a editar</p>
          </div>
        </motion.div>

        {categories.map((category) => {
          const filtered = mockTemplates.filter((t) => t.category === category)
          return (
            <section key={category}>
              <div className="flex items-center gap-2 mb-4">
                <Tag size={14} style={{ color: categoryColors[category] }} />
                <h2 className="text-sm font-semibold text-white">{categoryLabels[category]}</h2>
                <span className="text-xs px-2 py-0.5 rounded-full"
                  style={{ backgroundColor: `${categoryColors[category]}20`, color: categoryColors[category] }}>
                  {filtered.length}
                </span>
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-3">
                {filtered.map((template, i) => (
                  <motion.div
                    key={template.id}
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ delay: i * 0.05 }}
                    className="group cursor-pointer"
                    onClick={() => handleUseTemplate(template)}>
                    <div className="relative rounded-xl overflow-hidden transition-transform group-hover:scale-[1.02]">
                      <TemplatePreview template={template} />
                      <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
                        style={{ backgroundColor: 'rgba(0,0,0,0.5)' }}>
                        <span className="px-3 py-1.5 rounded-lg text-white text-xs font-semibold"
                          style={{ background: 'linear-gradient(135deg, #7c3aed, #a855f7)' }}>
                          Usar template
                        </span>
                      </div>
                    </div>
                    <p className="text-xs font-medium mt-2 text-white truncate">{template.name}</p>
                  </motion.div>
                ))}
              </div>
            </section>
          )
        })}
      </div>
    </div>
  )
}
