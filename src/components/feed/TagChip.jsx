import { CATEGORY_BY_ID } from '../../config/constants'

export function TagChip({ tagId }) {
  const category = CATEGORY_BY_ID[tagId]
  if (!category) return null
  return (
    <span className={`rounded-full px-2 py-0.5 text-[11px] font-semibold ${category.color}`}>
      {category.label}
    </span>
  )
}
