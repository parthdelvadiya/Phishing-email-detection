import { Link } from 'react-router-dom'
import { History, RouteOff } from 'lucide-react'
import { useDocumentTitle } from '../hooks/useDocumentTitle'
import { ButtonLink } from '../components/ui/ButtonLink'

export function NotFoundPage() {
  useDocumentTitle('Page not found')

  return (
    <div className="notfound">
      <p className="notfound__code">Error 404</p>
      <div className="notfound__icon">
        <RouteOff size={24} aria-hidden="true" />
      </div>
      <h1 className="notfound__title">Page not found</h1>
      <p className="notfound__description">
        The page you are looking for does not exist. You can check a new email or review your scan history.
      </p>
      <div className="notfound__actions">
        <ButtonLink to="/">Check an email</ButtonLink>
        <Link className="btn btn--secondary" to="/history">
          <History size={16} aria-hidden="true" />
          <span>Scan history</span>
        </Link>
      </div>
    </div>
  )
}
