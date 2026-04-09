import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext.jsx';

export default function ClienteLogin() {
  const [email, setEmail] = useState('');
  const [senha, setSenha] = useState('');
  const [loading, setLoading] = useState(false);
  const [erro, setErro] = useState('');
  const { loginCliente } = useAuth();
  const navigate = useNavigate();

  async function handleSubmit(e) {
    e.preventDefault();
    if (!email.trim() || !senha.trim()) return;

    setLoading(true);
    setErro('');

    try {
      await loginCliente(email, senha);
      navigate('/', { replace: true });
    } catch (err) {
      setErro(err.message);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="auth-page slide-up">
      <h2>Entrar como cliente</h2>
      <p className="subtitle">Acesse sua conta para agendar horarios.</p>

      {erro && <div className="login-error">{erro}</div>}

      <form onSubmit={handleSubmit}>
        <div className="form-group">
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
        <div className="form-group">
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

        <button className="btn btn-primary" type="submit" disabled={loading || !email.trim() || !senha.trim()} style={{ width: '100%', padding: '14px', fontSize: '1rem', marginTop: 8 }}>
          {loading ? 'Entrando...' : 'Entrar'}
        </button>
      </form>

      <div className="auth-links">
        <p>Nao tem conta? <Link to="/cliente/registro">Cadastre-se</Link></p>
        <p style={{ marginTop: 8 }}>Possui uma barbearia? <Link to="/admin/login">Acesse aqui</Link></p>
      </div>
    </div>
  );
}
