import type { Category } from '../../../types/catalog'

interface Props {
  categories: Category[]
  active: string | null
  onChange: (slug: string | null) => void
}

export default function CategoryTabs({ categories, active, onChange }: Props) {
  return (
    <div className="overflow-x-auto -mx-4 px-4" style={{ scrollbarWidth: 'none' }}>
      <div className="flex gap-2 pb-1" style={{ minWidth: 'max-content' }}>
        {[{ slug: null, name: 'Todos' }, ...categories].map((cat) => {
          const isActive = active === cat.slug
          return (
            <button
              key={cat.slug ?? '__all__'}
              onClick={() => onChange(cat.slug)}
              className="text-sm font-semibold whitespace-nowrap"
              style={{
                padding: '8px 20px', borderRadius: 100,
                border: isActive ? 'none' : '1.5px solid rgba(58,36,23,0.15)',
                background: isActive
                  ? 'linear-gradient(135deg, #F0A0C4, #E285AF)'
                  : '#fff',
                color: isActive ? '#fff' : '#5A3B29',
                boxShadow: isActive ? '0 4px 12px rgba(226,133,175,0.35)' : 'none',
                cursor: 'pointer',
                transition: 'all 0.2s ease',
              }}
            >
              {cat.name}
            </button>
          )
        })}
      </div>
    </div>
  )
}
