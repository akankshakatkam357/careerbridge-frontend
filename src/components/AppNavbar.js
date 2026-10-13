export default function AppNavbar({ user, items, activeView, onNavigate, onLogout }) {
  function navButton(view, label) {
    const isActive = activeView === view;

    return (
      <button
        key={view}
        type="button"
        className={`btn btn-sm ${isActive ? 'btn-primary' : 'btn-outline-primary'}`}
        aria-current={isActive ? 'page' : undefined}
        onClick={() => onNavigate(view)}
      >
        {label}
      </button>
    );
  }

  return (
    <nav className="app-navbar bg-white border-bottom">
      <div className="container d-flex flex-wrap align-items-center gap-2 py-2">
        <button
          type="button"
          className="btn btn-link fw-bold text-dark text-decoration-none p-0 me-3"
          onClick={() => onNavigate('overview')}
        >
          Career Bridge
        </button>

        {navButton('overview', 'Home')}
        {items.map((item) => navButton(item.view, item.label))}

        <div className="ms-auto d-flex align-items-center gap-3">
          <span className="small text-muted d-none d-md-inline">
            {user?.fullName || user?.email}
          </span>
          <button type="button" className="btn btn-sm btn-outline-secondary" onClick={onLogout}>
            Log out
          </button>
        </div>
      </div>
    </nav>
  );
}