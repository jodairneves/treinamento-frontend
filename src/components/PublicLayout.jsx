import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext.jsx';

export default function PublicLayout({ children }) {
  const { user, isAuthenticated, isAdmin, logout } = useAuth();
  return (
    <div>
      <header className="public-header">
        <div className="public-header-inner">
          <Link to="/" className="public-logo">
            <span className="public-logo-icon">&#9986;</span>
            <span className="public-logo-text">Barbearias</span>
          </Link>
          <nav className="public-nav">
            {!isAuthenticated ? (
              <>
                <Link to="/cliente/login" className="btn btn-ghost btn-sm">Entrar</Link>
                <Link to="/cliente/registro" className="btn btn-primary btn-sm">Cadastrar</Link>
              </>
            ) : isAdmin ? (
              <>
                <Link to="/admin" className="btn btn-secondary btn-sm">Painel Admin</Link>
                <button className="btn btn-ghost btn-sm" onClick={logout}>Sair</button>
              </>
            ) : (
              <>
                <Link to="/cliente/agendamentos" className="btn btn-ghost btn-sm">Meus Agendamentos</Link>
                <span style={{ fontSize: '0.875rem', color: 'var(--text-secondary)' }}>{user.nome}</span>
                <button className="btn btn-ghost btn-sm" onClick={logout}>Sair</button>
              </>
            )}
          </nav>
        </div>
      </header>
      <main className="public-main">{children}</main>
    </div>
  );
}
