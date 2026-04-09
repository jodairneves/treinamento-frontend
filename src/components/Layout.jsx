import { NavLink, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext.jsx';

function SidebarLink({ to, icon, children, end }) {
  return (
    <NavLink
      to={to}
      end={end}
      className={({ isActive }) => `nav-link ${isActive ? 'active' : ''}`}
    >
      <span className="icon">{icon}</span>
      {children}
    </NavLink>
  );
}

export default function Layout({ children }) {
  const { user, logout } = useAuth();

  const initials = user?.nome
    ? user.nome.split(' ').map((n) => n[0]).slice(0, 2).join('').toUpperCase()
    : '??';

  return (
    <div className="app-layout">
      <aside className="sidebar">
        <div className="sidebar-header">
          <div className="sidebar-brand">
            <div className="sidebar-brand-icon">&#9986;</div>
            <div>
              <h1>{user?.nome || 'Barbearia'}</h1>
              <p>Painel Admin</p>
            </div>
          </div>
        </div>

        <nav className="sidebar-nav">
          <span className="sidebar-section-label">Principal</span>
          <SidebarLink to="/admin" icon="&#8862;" end>Dashboard</SidebarLink>
          <SidebarLink to="/admin/agendar" icon="&#65291;">Novo Agendamento</SidebarLink>
          <SidebarLink to="/admin/agendamentos" icon="&#128203;">Agendamentos</SidebarLink>

          <span className="sidebar-section-label">Cadastros</span>
          <SidebarLink to="/admin/barbeiros" icon="&#9986;">Barbeiros</SidebarLink>
          <SidebarLink to="/admin/servicos" icon="&#9734;">Servicos</SidebarLink>
          <SidebarLink to="/admin/clientes" icon="&#9673;">Clientes</SidebarLink>

          <span className="sidebar-section-label">Configuracoes</span>
          <SidebarLink to="/admin/perfil" icon="&#9881;">Perfil</SidebarLink>
          <Link to="/" className="nav-link">
            <span className="icon">&#8599;</span>
            Ver Site
          </Link>
        </nav>

        <div className="sidebar-footer">
          <div className="sidebar-user">
            <div className="sidebar-avatar">{initials}</div>
            <div className="sidebar-user-info">
              <div className="sidebar-user-name">{user?.nome}</div>
              <div className="sidebar-user-role">Administrador</div>
            </div>
            <button
              className="btn btn-ghost btn-sm"
              onClick={logout}
              title="Sair"
              style={{ marginLeft: 'auto', fontSize: '0.75rem' }}
            >
              Sair
            </button>
          </div>
        </div>
      </aside>

      <main className="main-content fade-in">
        {children}
      </main>
    </div>
  );
}
