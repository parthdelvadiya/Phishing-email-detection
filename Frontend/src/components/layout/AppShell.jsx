import { useState } from 'react'
import { NavLink, Outlet } from 'react-router-dom'
import {
  BrainCircuit,
  History,
  PanelLeftClose,
  PanelLeftOpen,
  ScanSearch,
  ShieldCheck,
} from 'lucide-react'

const NAV_ITEMS = [
  {
    section: 'Safety Tools',
    items: [
      { to: '/', label: 'Check Email', shortLabel: 'Check', icon: ScanSearch, end: true },
      { to: '/history', label: 'Scan History', shortLabel: 'History', icon: History },
    ],
  },
  {
    section: 'AI Performance',
    items: [
      {
        to: '/intelligence',
        label: 'AI Accuracy & Safety',
        shortLabel: 'AI Safety',
        icon: BrainCircuit,
      },
    ],
  },
]

function navClassName({ isActive }) {
  return `nav-item${isActive ? ' active' : ''}`
}

function BrandMark() {
  return (
    <span className="brand__mark">
      <ShieldCheck size={21} aria-hidden="true" />
    </span>
  )
}

function MobileBrandMark() {
  return (
    <span className="mobile-header__mark">
      <ShieldCheck size={18} aria-hidden="true" />
    </span>
  )
}

export function AppShell() {
  const [isCollapsed, setIsCollapsed] = useState(() => {
    try {
      return localStorage.getItem('phishguard_sidebar_collapsed') === 'true'
    } catch {
      return false
    }
  })

  function toggleSidebar() {
    setIsCollapsed((prev) => {
      const next = !prev
      try {
        localStorage.setItem('phishguard_sidebar_collapsed', String(next))
      } catch {}
      return next
    })
  }

  return (
    <div className={`app-shell${isCollapsed ? ' app-shell--collapsed' : ''}`}>
      <a className="skip-link" href="#main-content">
        Skip to main content
      </a>

      <aside
        className={`sidebar${isCollapsed ? ' sidebar--collapsed' : ''}`}
        aria-label="Primary navigation"
      >
        <div className="sidebar__header">
          <NavLink to="/" className="brand" aria-label="PhishGuard home">
            <BrandMark />
            <span className="brand__text-block">
              <span className="brand__name">PhishGuard</span>
              <span className="brand__sub">Phishing Detection AI</span>
            </span>
          </NavLink>

          <button
            type="button"
            className="sidebar-toggle-btn"
            onClick={toggleSidebar}
            title={isCollapsed ? 'Expand sidebar' : 'Collapse sidebar'}
            aria-label={isCollapsed ? 'Expand sidebar' : 'Collapse sidebar'}
          >
            {isCollapsed ? (
              <PanelLeftOpen size={16} aria-hidden="true" />
            ) : (
              <PanelLeftClose size={16} aria-hidden="true" />
            )}
          </button>
        </div>

        <nav className="sidebar__nav">
          {NAV_ITEMS.map((group) => (
            <div key={group.section} className="sidebar__nav-group">
              <p className="sidebar__label">{group.section}</p>
              {group.items.map((item) => {
                const Icon = item.icon
                return (
                  <NavLink
                    key={item.to}
                    to={item.to}
                    end={item.end}
                    className={navClassName}
                    title={isCollapsed ? item.label : undefined}
                  >
                    <Icon size={18} aria-hidden="true" />
                    <span className="nav-item__text">{item.label}</span>
                  </NavLink>
                )
              })}
            </div>
          ))}
        </nav>

        <div className="sidebar__spacer" />

        <div
          className="sidebar__engine"
          title={isCollapsed ? 'AI Protection Active & Scanning' : undefined}
        >
          <div className="sidebar__engine-head">
            <ShieldCheck size={16} aria-hidden="true" />
            <span className="sidebar__engine-title">AI Protection Active</span>
          </div>
          <p className="sidebar__engine-desc">
            Dual AI engines protect you from email fraud, phishing scams, and deceptive links.
          </p>
        </div>
      </aside>

      <div className="app-main">
        <header className="mobile-header">
          <div className="mobile-header__top">
            <NavLink to="/" className="mobile-header__brand" aria-label="PhishGuard home">
              <MobileBrandMark />
              <span>
                <span className="mobile-header__name">PhishGuard</span>
                <span className="mobile-header__sub">Email Threat Intelligence</span>
              </span>
            </NavLink>
          </div>
          <nav className="mobile-nav" aria-label="Primary navigation">
            {NAV_ITEMS.flatMap((group) => group.items).map((item) => {
              const Icon = item.icon
              return (
                <NavLink
                  key={item.to}
                  to={item.to}
                  end={item.end}
                  className={navClassName}
                >
                  <Icon size={15} aria-hidden="true" />
                  <span className="nav-item__text">
                    <span className="nav-item__label--full">{item.label}</span>
                    <span className="nav-item__label--short">{item.shortLabel ?? item.label}</span>
                  </span>
                </NavLink>
              )
            })}
          </nav>
        </header>

        <main className="page-container" id="main-content">
          <Outlet />
        </main>
      </div>
    </div>
  )
}
