type Tag = { id: string; name: string; color: string }

export function TagPill({ tag, onRemove }: { tag: Tag; onRemove?: () => void }) {
  return (
    <span
      className="inline-flex items-center gap-1 rounded-full border px-2 py-0.5 text-xs"
      style={{
        borderColor: `${tag.color}55`,
        backgroundColor: `${tag.color}15`,
        color: tag.color,
      }}
    >
      <span className="font-medium">{tag.name}</span>
      {onRemove ? (
        <button
          type="button"
          onClick={onRemove}
          aria-label={`Quitar ${tag.name}`}
          className="text-current opacity-60 hover:opacity-100"
        >
          ×
        </button>
      ) : null}
    </span>
  )
}
