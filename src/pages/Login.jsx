import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext.jsx';

export default function Login() {
  const [telefone, setTelefone] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const { login } = useAuth();
  const navigate = useNavigate();

  async function handleSubmit(e) {
    e.preventDefault();
    if (!telefone.trim()) return;

    setLoading(true);
    setError('');

    try {
      await login(telefone);
      navigate('/', { replace: true });
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="login-page">
      <div className="login-card slide-up">
        <div className="login-icon">✂</div>
        <h1>Barbearia</h1>
        <p className="subtitle">Entre com seu telefone para acessar o sistema.</p>

        {error && <div className="login-error">{error}</div>}

        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label className="form-label">Telefone</label>
            <input
              className="form-input"
              type="tel"
              placeholder="5511999999999"
              value={telefone}
              onChange={(e) => setTelefone(e.target.value)}
              autoFocus
              autoComplete="tel"
            />
            <p className="form-hint">
              Use o mesmo número cadastrado como barbeiro.
            </p>
          </div>

          <button className="btn btn-primary" type="submit" disabled={loading || !telefone.trim()}>
            {loading ? 'Entrando...' : 'Entrar'}
          </button>
        </form>

        <p style={{ marginTop: 32, fontSize: '0.8125rem', color: 'var(--text-tertiary)' }}>
          Telefones de teste dos barbeiros seed:<br />
          <span style={{ fontFamily: 'monospace', color: 'var(--text-secondary)' }}>
            5511999990001 · 5511999990002 · 5511999990003
          </span>
        </p>
      </div>
    </div>
  );
}
