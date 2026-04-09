import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext.jsx';

export default function AdminRegistro() {
  const [step, setStep] = useState(1);
  const [form, setForm] = useState({
    nome: '', email: '', telefone: '', senha: '',
    endereco_rua: '', endereco_numero: '', endereco_bairro: '',
    endereco_cidade: '', endereco_estado: '', endereco_cep: '',
    latitude: '', longitude: '',
  });
  const [loading, setLoading] = useState(false);
  const [erro, setErro] = useState('');
  const { registrarBarbearia } = useAuth();
  const navigate = useNavigate();

  const set = (key) => (e) => setForm((f) => ({ ...f, [key]: e.target.value }));

  async function handleSubmit() {
    setLoading(true);
    setErro('');

    try {
      const payload = { ...form };
      if (payload.latitude) payload.latitude = Number(payload.latitude);
      else delete payload.latitude;
      if (payload.longitude) payload.longitude = Number(payload.longitude);
      else delete payload.longitude;

      await registrarBarbearia(payload);
      navigate('/admin', { replace: true });
    } catch (err) {
      setErro(err.message);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="login-page">
      <div className="login-card slide-up" style={{ maxWidth: 480 }}>
        <div className="login-icon">&#9986;</div>
        <h1>Cadastrar Barbearia</h1>
        <p className="subtitle">Crie sua conta e comece a receber agendamentos.</p>

        {erro && <div className="login-error">{erro}</div>}

        {/* Progress */}
        <div className="steps-bar" style={{ marginBottom: 28 }}>
          {[1, 2, 3].map((s) => (
            <div key={s} className={`step ${step >= s ? 'active' : ''}`} />
          ))}
        </div>

        {/* Step 1: Basic info */}
        {step === 1 && (
          <div style={{ textAlign: 'left' }}>
            <div className="form-group">
              <label className="form-label">Nome da barbearia</label>
              <input className="form-input" placeholder="Barbearia do Joao" value={form.nome} onChange={set('nome')} autoFocus />
            </div>
            <div className="form-group">
              <label className="form-label">Email</label>
              <input className="form-input" type="email" placeholder="contato@barbearia.com" value={form.email} onChange={set('email')} />
            </div>
            <div className="form-group">
              <label className="form-label">Telefone</label>
              <input className="form-input" type="tel" placeholder="5511999999999" value={form.telefone} onChange={set('telefone')} />
            </div>
            <div className="form-group">
              <label className="form-label">Senha</label>
              <input className="form-input" type="password" placeholder="Crie uma senha" value={form.senha} onChange={set('senha')} autoComplete="new-password" />
            </div>
            <button
              className="btn btn-primary"
              style={{ width: '100%', padding: '14px', fontSize: '1rem' }}
              disabled={!form.nome.trim() || !form.email.trim() || !form.senha.trim()}
              onClick={() => setStep(2)}
            >
              Continuar
            </button>
          </div>
        )}

        {/* Step 2: Address */}
        {step === 2 && (
          <div style={{ textAlign: 'left' }}>
            <div className="form-group">
              <label className="form-label">Rua</label>
              <input className="form-input" placeholder="Rua das Flores" value={form.endereco_rua} onChange={set('endereco_rua')} autoFocus />
            </div>
            <div className="form-row">
              <div className="form-group">
                <label className="form-label">Numero</label>
                <input className="form-input" placeholder="123" value={form.endereco_numero} onChange={set('endereco_numero')} />
              </div>
              <div className="form-group">
                <label className="form-label">Bairro</label>
                <input className="form-input" placeholder="Centro" value={form.endereco_bairro} onChange={set('endereco_bairro')} />
              </div>
            </div>
            <div className="form-row">
              <div className="form-group">
                <label className="form-label">Cidade</label>
                <input className="form-input" placeholder="Sao Paulo" value={form.endereco_cidade} onChange={set('endereco_cidade')} />
              </div>
              <div className="form-group">
                <label className="form-label">Estado</label>
                <input className="form-input" placeholder="SP" value={form.endereco_estado} onChange={set('endereco_estado')} maxLength={2} />
              </div>
            </div>
            <div className="form-group">
              <label className="form-label">CEP</label>
              <input className="form-input" placeholder="01000-000" value={form.endereco_cep} onChange={set('endereco_cep')} />
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: 8 }}>
              <button className="btn btn-ghost" onClick={() => setStep(1)}>&#8592; Voltar</button>
              <button className="btn btn-primary" onClick={() => setStep(3)}>Continuar</button>
            </div>
          </div>
        )}

        {/* Step 3: Coordinates */}
        {step === 3 && (
          <div style={{ textAlign: 'left' }}>
            <p style={{ color: 'var(--text-secondary)', marginBottom: 20, fontSize: '0.9375rem' }}>
              Opcionais: informe as coordenadas para exibir sua barbearia no mapa.
            </p>
            <div className="form-row">
              <div className="form-group">
                <label className="form-label">Latitude</label>
                <input className="form-input" type="text" placeholder="-23.5505" value={form.latitude} onChange={set('latitude')} />
              </div>
              <div className="form-group">
                <label className="form-label">Longitude</label>
                <input className="form-input" type="text" placeholder="-46.6333" value={form.longitude} onChange={set('longitude')} />
              </div>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: 8 }}>
              <button className="btn btn-ghost" onClick={() => setStep(2)}>&#8592; Voltar</button>
              <button className="btn btn-primary" style={{ padding: '14px 32px', fontSize: '1rem' }} disabled={loading} onClick={handleSubmit}>
                {loading ? 'Cadastrando...' : 'Cadastrar Barbearia'}
              </button>
            </div>
          </div>
        )}

        <div className="auth-links" style={{ marginTop: 24 }}>
          <p>Ja tem conta? <Link to="/admin/login">Entrar</Link></p>
          <p style={{ marginTop: 8 }}><Link to="/">Voltar ao site</Link></p>
        </div>
      </div>
    </div>
  );
}
