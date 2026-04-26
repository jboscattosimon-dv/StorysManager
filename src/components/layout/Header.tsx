import { Bell, Search } from 'lucide-react'

interface HeaderProps {
  title: string
  subtitle?: string
}

export function Header({ title, subtitle }: HeaderProps) {
  return (
    <header className="h-16 flex items-center justify-between px-4 md:px-6 border-b flex-shrink-0"
      style={{ borderColor: 'var(--color-border)', backgroundColor: 'var(--color-bg)' }}>
      <div>
        <h1 className="text-lg font-semibold text-white">{title}</h1>
        {subtitle && <p className="text-xs" style={{ color: '#6b7280' }}>{subtitle}</p>}
      </div>

      <div className="flex items-center gap-2">
        <button className="w-9 h-9 rounded-lg flex items-center justify-center transition-colors hover:bg-white/5"
          style={{ color: '#9ca3af' }}>
          <Search size={18} />
        </button>
        <button className="w-9 h-9 rounded-lg flex items-center justify-center transition-colors hover:bg-white/5 relative"
          style={{ color: '#9ca3af' }}>
          <Bell size={18} />
          <span className="absolute top-1.5 right-1.5 w-2 h-2 rounded-full"
            style={{ backgroundColor: '#7c3aed' }} />
        </button>
      </div>
    </header>
  )
}
