interface EmptyStateProps {
  icon?: React.ReactNode
  title: string
  description?: string
  action?: React.ReactNode
}

export function EmptyState({ icon, title, description, action }: EmptyStateProps) {
  return (
    <div className="flex flex-col items-center justify-center py-14 text-center">
      {icon && (
        <div className="rounded-full bg-gray-100 p-3 mb-4">
          {icon}
        </div>
      )}
      <p className="text-sm font-medium text-gray-900 mb-1">{title}</p>
      {description && (
        <p className="text-xs text-gray-400 mb-4">{description}</p>
      )}
      {action}
    </div>
  )
}
