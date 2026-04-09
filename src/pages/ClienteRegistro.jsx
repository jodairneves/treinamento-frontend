import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext.jsx';

export default function ClienteRegistro() {
  const [form, setForm] = useState({ nome: '', telefone: '', email: '', senha: '' });
  const [loading, setLoading] = useState(false);
  const [erro, setErro] = useState('');
  const { registrarCliente } = useAuth();
  const navigate = useNavigate();

  const set = (key) => (e) => setForm((f) => ({ ...f, [key]: e.target.value }));

  async function handleSubmit(e) {
    e.preventDefault();
    if (!form.nome.trim() || !form.email.trim() || !form.senha.trim()) return;

    setLoading(true);
    setErro('');

    try {
      await registrarCliente(form);
      navigate('/', { replace: true });
    } catch (err) {
      setErro(err.message);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="auth-page slide-up">
      <h2>Criar conta</h2>
      <p className="subtitle">Cadastre-se para agendar horarios em qualquer barbearia.</p>

      {erro && <div className="login-error">{erro}</div>}

      <form onSubmit={handleSubmit}>
        <div className="form-group">
          <label className="form-label">Nome</label>
          <input className="form-input" placeholder="Nome completo" value={form.nome} onChange={set('nome')} autoFocus />
        </div>
        <div className="form-group">
          <label className="form-label">Telefone</label>
          <input className="form-input" type="tel" placeholder="5511999999999" value={form.telefone} onChange={set('telefone')} />
        </div>
        <div className="form-group">
          <label className="form-label">Email</label>
          <input className="form-input" type="email" placeholder="seu@email.com" value={form.email} onChange={set('email')} autoComplete="email" />
        </div>
        <div className="form-group">
          <label className="form-label">Senha</label>
          <input className="form-input" type="password" placeholder="Crie uma senha" value={form.senha} onChange={set('senha')} autoComplete="new-password" />
        </div>

        <button className="btn btn-primary" type="submit" disabled={loading || !form.nome.trim() || !form.email.trim() || !form.senha.trim()} style={{ width: '100%', padding: '14px', fontSize: '1rem', marginTop: 8 }}>
          {loading ? 'Cadastrando...' : 'Cadastrar'}
        </button>
      </form>

      <div className="auth-links">
        <p>Ja tem conta? <Link to="/cliente/login">Entrar</Link></p>
      </div>
    </div>
  );
}
