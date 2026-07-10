import type { Category } from '../../../types/catalog'

interface Props {
  categories: Category[]
  active: string | null
  onChange: (slug: string | null) => void
}

export default function CategoryTabs({ categories, active, onChange }: Props) {
  return (
    <div className="overflow-x-auto scrollbar-hide -mx-4 px-4">
      <div className="flex gap-2 pb-1 min-w-max">
        <button
          onClick={() => onChange(null)}
          className={`px-4 py-2 rounded-full text-sm font-semibold whitespace-nowrap transition-all ${
            active === null
              ? 'bg-chocolate text-white shadow'
              : 'bg-white border border-cream-dark text-mocha hover:bg-cream-dark'
          }`}
        >
          Todos
        </button>
        {categories.map((cat) => (
          <button
            key={cat.slug}
            onClick={() => onChange(cat.slug)}
            className={`px-4 py-2 rounded-full text-sm font-semibold whitespace-nowrap transition-all ${
              active === cat.slug
                ? 'bg-chocolate text-white shadow'
                : 'bg-white border border-cream-dark text-mocha hover:bg-cream-dark'
            }`}
          >
            {cat.name}
          </button>
        ))}
      </div>
    </div>
  )
}
