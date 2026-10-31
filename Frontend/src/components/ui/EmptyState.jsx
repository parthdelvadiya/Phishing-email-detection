import { Inbox } from 'lucide-react'

export function EmptyState({ icon: Icon = Inbox, title, description, children }) {
  return (
    <div className="empty-state">
      <div className="empty-state__icon">
        <Icon size={21} aria-hidden="true" />
      </div>
      <h3 className="empty-state__title">{title}</h3>
      {description ? <p className="empty-state__description">{description}</p> : null}
      {children ? <div className="empty-state__actions">{children}</div> : null}
    </div>
  )
}
