<header className="nav-menu">
  <nav className="nav-menu-inner">
    {navItems.map((item) => (
      <Link
        key={item.href}
        href={item.href}
        className={`nav-item ${pathname === item.href ? "active" : ""}`}
      >
        <span className="nav-icon">{item.icon}</span>
        <span className="nav-label">{item.label}</span>
      </Link>
    ))}
  </nav>
</header>
