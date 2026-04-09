import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { publicApi, clienteApi } from '../api/services.js';
import { useAuth } from '../context/AuthContext.jsx';
import { useFetch } from '../hooks/useFetch.js';
import { useToast } from '../hooks/useToast.jsx';

function today() {
  return new Date().toISOString().split('T')[0];
}

export default function BarbeariaPublic() {
  const { slug } = useParams();
  const { isAuthenticated, isCliente } = useAuth();
  const { data: barbearia, loading } = useFetch(() => publicApi.buscarBarbearia(slug), [slug]);
  const { success, error, ToastContainer } = useToast();

  // Booking state
  const [step, setStep] = useState(0); // 0 = not started, 1-4 = booking flow
  const [form, setForm] = useState({ servico_id: '', barbeiro_id: '', data: today(), hora_inicio: '' });
  const [slots, setSlots] = useState([]);
  const [loadingSlots, setLoadingSlots] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  const barbeiros = barbearia?.barbeiros || [];
  const servicos = barbearia?.servicos || [];

  // Load slots — só recarrega quando barbeiro, data ou servico mudam (não quando step muda)
  useEffect(() => {
    if (!form.barbeiro_id || !form.data || !form.servico_id) return;
    setLoadingSlots(true);
    setForm((f) => ({ ...f, hora_inicio: '' }));
    publicApi.horarios(slug, form.barbeiro_id, form.data, form.servico_id)
      .then(setSlots)
      .catch(() => setSlots([]))
      .finally(() => setLoadingSlots(false));
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [slug, form.barbeiro_id, form.data, form.servico_id]);

  function startBooking(servicoId) {
    setForm({ servico_id: String(servicoId), barbeiro_id: '', data: today(), hora_inicio: '' });
    setStep(1);
    setTimeout(() => {
      document.getElementById('booking-section')?.scrollIntoView({ behavior: 'smooth' });
    }, 100);
  }

  async function handleSubmit() {
    if (!form.barbeiro_id || !form.servico_id || !form.data || !form.hora_inicio) {
      error('Selecione todos os campos antes de confirmar.');
      return;
    }
    setSubmitting(true);
    try {
      await clienteApi.criarAgendamento({
        barbeiro_id: Number(form.barbeiro_id),
        servico_id: Number(form.servico_id),
        data: form.data,
        hora_inicio: form.hora_inicio,
      });
      setStep(4);
      success('Agendamento realizado com sucesso!');
    } catch (err) {
      error(err.message);
    }
    setSubmitting(false);
  }

  const selServico = servicos.find((s) => String(s.id) === form.servico_id);
  const selBarbeiro = barbeiros.find((b) => String(b.id) === form.barbeiro_id);

  if (loading) return <div className="empty"><p>Carregando...</p></div>;
  if (!barbearia) return <div className="empty"><div className="empty-icon">&#9986;</div><p>Barbearia nao encontrada.</p></div>;

  return (
    <div className="slide-up">
      {/* Header */}
      <div className="detail-header">
        <h1>{barbearia.nome}</h1>
        <div className="detail-info">
          {barbearia.endereco_rua && (
            <span>{[barbearia.endereco_rua, barbearia.endereco_numero, barbearia.endereco_bairro, barbearia.endereco_cidade, barbearia.endereco_estado].filter(Boolean).join(', ')}</span>
          )}
          {barbearia.telefone && <span>{barbearia.telefone}</span>}
        </div>
        {barbearia.descricao && (
          <p style={{ marginTop: 16, color: 'var(--text-secondary)', fontSize: '1.0625rem', lineHeight: 1.6 }}>
            {barbearia.descricao}
          </p>
        )}
      </div>

      {/* Barbers */}
      {barbeiros.length > 0 && (
        <div className="detail-section">
          <h2>Nossos Barbeiros</h2>
          <div className="barbers-grid">
            {barbeiros.filter(b => b.ativo !== false).map((b) => (
              <div key={b.id} className="barber-card">
                <div className="barber-avatar">
                  {b.nome.split(' ').map(n => n[0]).slice(0, 2).join('').toUpperCase()}
                </div>
                <div className="name">{b.nome}</div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Services */}
      {servicos.length > 0 && (
        <div className="detail-section">
          <h2>Servicos</h2>
          <div className="table-wrap">
            <table>
              <thead>
                <tr>
                  <th>Servico</th>
                  <th>Duracao</th>
                  <th>Preco</th>
                  <th style={{ textAlign: 'right' }}></th>
                </tr>
              </thead>
              <tbody>
                {servicos.filter(s => s.ativo !== false).map((s) => (
                  <tr key={s.id}>
                    <td><strong>{s.nome}</strong></td>
                    <td>{s.duracao_minutos} min</td>
                    <td style={{ fontWeight: 600, color: 'var(--blue)' }}>
                      R$ {Number(s.preco).toFixed(2)}
                    </td>
                    <td style={{ textAlign: 'right' }}>
                      <button className="btn btn-primary btn-sm" onClick={() => startBooking(s.id)}>
                        Agendar
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Booking Section */}
      {step > 0 && (
        <div id="booking-section" className="detail-section">
          <h2>Agendar Horario</h2>

          {!isAuthenticated ? (
            <div className="card" style={{ textAlign: 'center', padding: '40px 24px' }}>
              <p style={{ color: 'var(--text-secondary)', marginBottom: 20 }}>
                Voce precisa estar logado para agendar um horario.
              </p>
              <div className="btn-group" style={{ justifyContent: 'center' }}>
                <Link to="/cliente/login" className="btn btn-primary">Entrar</Link>
                <Link to="/cliente/registro" className="btn btn-secondary">Cadastrar</Link>
              </div>
            </div>
          ) : !isCliente ? (
            <div className="card" style={{ textAlign: 'center', padding: '40px 24px' }}>
              <p style={{ color: 'var(--text-secondary)' }}>
                Apenas clientes podem realizar agendamentos. Faca login com uma conta de cliente.
              </p>
            </div>
          ) : (
            <>
              {/* Progress */}
              <div className="steps-bar">
                {[1, 2, 3].map((s) => (
                  <div key={s} className={`step ${step >= s ? 'active' : ''}`} />
                ))}
              </div>

              {/* Step 1: Select barber */}
              {step === 1 && (
                <div className="card">
                  <div className="card-label">Servico selecionado: {selServico?.nome}</div>
                  <div className="form-group">
                    <label className="form-label">Escolha o barbeiro</label>
                    <select
                      className="form-select"
                      value={form.barbeiro_id}
                      onChange={(e) => setForm((f) => ({ ...f, barbeiro_id: e.target.value }))}
                    >
                      <option value="">Selecione...</option>
                      {barbeiros.filter(b => b.ativo !== false).map((b) => (
                        <option key={b.id} value={b.id}>{b.nome}</option>
                      ))}
                    </select>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: 8 }}>
                    <button
                      className="btn btn-primary"
                      disabled={!form.barbeiro_id}
                      onClick={() => setStep(2)}
                    >
                      Continuar
                    </button>
                  </div>
                </div>
              )}

              {/* Step 2: Select date and time */}
              {step === 2 && (
                <div className="card">
                  <div className="card-label">Escolha data e horario</div>

                  <div className="form-group">
                    <label className="form-label">Data</label>
                    <input
                      type="date"
                      className="form-input"
                      value={form.data}
                      min={today()}
                      onChange={(e) => setForm((f) => ({ ...f, data: e.target.value }))}
                      style={{ maxWidth: 240 }}
                    />
                  </div>

                  <div className="form-group">
                    <label className="form-label">Horarios disponiveis</label>
                    {loadingSlots ? (
                      <p style={{ color: 'var(--text-tertiary)' }}>Carregando...</p>
                    ) : slots.length === 0 ? (
                      <p style={{ color: 'var(--text-tertiary)' }}>Nenhum horario disponivel.</p>
                    ) : (
                      <div className="slots-grid">
                        {slots.map((h) => (
                          <div
                            key={h.hora_inicio}
                            className={`slot ${
                              !h.disponivel ? 'slot-off' : form.hora_inicio === h.hora_inicio ? 'slot-on' : ''
                            }`}
                            onClick={() => h.disponivel && setForm((f) => ({ ...f, hora_inicio: h.hora_inicio }))}
                          >
                            {h.hora_inicio}
                          </div>
                        ))}
                      </div>
                    )}
                  </div>

                  <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: 12 }}>
                    <button className="btn btn-ghost" onClick={() => setStep(1)}>&#8592; Voltar</button>
                    <button className="btn btn-primary" disabled={!form.hora_inicio} onClick={() => setStep(3)}>
                      Continuar
                    </button>
                  </div>
                </div>
              )}

              {/* Step 3: Confirm */}
              {step === 3 && (
                <div className="card">
                  <div className="card-label">Confirme os dados</div>

                  <div style={{ marginBottom: 24 }}>
                    <div className="summary-row">
                      <span className="summary-label">Barbearia</span>
                      <span className="summary-value">{barbearia.nome}</span>
                    </div>
                    <div className="summary-row">
                      <span className="summary-label">Barbeiro</span>
                      <span className="summary-value">{selBarbeiro?.nome}</span>
                    </div>
                    <div className="summary-row">
                      <span className="summary-label">Servico</span>
                      <span className="summary-value">{selServico?.nome}</span>
                    </div>
                    <div className="summary-row">
                      <span className="summary-label">Data</span>
                      <span className="summary-value">{new Date(form.data + 'T12:00:00').toLocaleDateString('pt-BR')}</span>
                    </div>
                    <div className="summary-row">
                      <span className="summary-label">Horario</span>
                      <span className="summary-value">{form.hora_inicio}</span>
                    </div>
                    <div className="summary-row">
                      <span className="summary-label">Valor</span>
                      <span className="summary-value highlight">
                        R$ {Number(selServico?.preco || 0).toFixed(2)}
                      </span>
                    </div>
                  </div>

                  <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: 8 }}>
                    <button className="btn btn-ghost" onClick={() => setStep(2)}>&#8592; Voltar</button>
                    <button className="btn btn-primary" disabled={submitting || !form.hora_inicio} onClick={handleSubmit}>
                      {submitting ? 'Enviando...' : 'Confirmar Agendamento'}
                    </button>
                  </div>
                </div>
              )}

              {/* Step 4: Success */}
              {step === 4 && (
                <div className="card" style={{ textAlign: 'center', padding: '64px 24px' }}>
                  <div style={{ fontSize: 48, marginBottom: 16 }}>&#10003;</div>
                  <h3 style={{ fontSize: '1.5rem', fontWeight: 700, marginBottom: 8, letterSpacing: '-0.02em' }}>
                    Agendamento realizado!
                  </h3>
                  <p style={{ color: 'var(--text-secondary)', marginBottom: 32, maxWidth: 360, margin: '0 auto 32px' }}>
                    Voce recebera uma confirmacao em breve. Acompanhe seus agendamentos na sua area.
                  </p>
                  <div className="btn-group" style={{ justifyContent: 'center' }}>
                    <Link to="/cliente/agendamentos" className="btn btn-primary">Meus Agendamentos</Link>
                    <button className="btn btn-secondary" onClick={() => { setStep(0); setForm({ servico_id: '', barbeiro_id: '', data: today(), hora_inicio: '' }); }}>
                      Novo Agendamento
                    </button>
                  </div>
                </div>
              )}
            </>
          )}
        </div>
      )}

      {ToastContainer}
    </div>
  );
}
