import { Component } from 'react'
import { CircleAlert } from 'lucide-react'

class ErrorBoundary extends Component {
  constructor(props) {
    super(props)
    this.state = { hasError: false }
  }

  static getDerivedStateFromError() {
    return { hasError: true }
  }

  componentDidCatch(error, info) {
    console.error('Unexpected application error', error, info)
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="notfound">
          <p className="notfound__code">Unexpected error</p>
          <div className="notfound__icon">
            <CircleAlert size={24} aria-hidden="true" />
          </div>
          <h1 className="notfound__title">Something went wrong</h1>
          <p className="notfound__description">
            Something unexpected happened while displaying this page. Please reload the page or go back home.
          </p>
          <div className="notfound__actions">
            <button
              type="button"
              className="btn btn--primary"
              onClick={() => window.location.reload()}
            >
              Reload page
            </button>
            <a className="btn btn--secondary" href="/">
              Back to home
            </a>
          </div>
        </div>
      )
    }

    return this.props.children
  }
}

export function AppErrorBoundary({ children }) {
  return <ErrorBoundary>{children}</ErrorBoundary>
}
