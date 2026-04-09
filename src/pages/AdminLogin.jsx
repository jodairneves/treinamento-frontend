import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext.jsx';

export default function AdminLogin() {
  const [email, setEmail] = useState('');
  const [senha, setSenha] = useState('');
  const [loading, setLoading] = useState(false);
  const [erro, setErro] = useState('');
  const { loginBarbearia } = useAuth();
  const navigate = useNavigate();

  async function handleSubmit(e) {
    e.preventDefault();
    if (!email.trim() || !senha.trim()) return;

    setLoading(true);
    setErro('');

    try {
      await loginBarbearia(email, senha);
      navigate('/admin', { replace: true });
    } catch (err) {
      setErro(err.message);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="login-page">
      <div className="login-card slide-up">
        <div className="login-icon">&#9986;</div>
        <h1>Painel da Barbearia</h1>
        <p className="subtitle">Entre com suas credenciais para gerenciar sua barbearia.</p>

        {erro && <div className="login-error">{erro}</div>}

        <form onSubmit={handleSubmit}>
          <div className="form-group" style={{ textAlign: 'left' }}>
            <label className="form-label">Email</label>
            <input
              className="form-input"
              type="email"
              placeholder="seu@email.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              autoFocus
              autoComplete="email"
            />
          </div>
          <div className="form-group" style={{ textAlign: 'left' }}>
            <label className="form-label">Senha</label>
            <input
              className="form-input"
              type="password"
              placeholder="Sua senha"
              value={senha}
              onChange={(e) => setSenha(e.target.value)}
              autoComplete="current-password"
            />
          </div>

          <button className="btn btn-primary" type="submit" disabled={loading || !email.trim() || !senha.trim()}>
            {loading ? 'Entrando...' : 'Entrar'}
          </button>
        </form>

        <div className="auth-links" style={{ marginTop: 32 }}>
          <p>Nao tem uma barbearia? <Link to="/admin/registro">Cadastre-se</Link></p>
          <p style={{ marginTop: 8 }}><Link to="/">Voltar ao site</Link></p>
        </div>
      </div>
    </div>
  );
}
