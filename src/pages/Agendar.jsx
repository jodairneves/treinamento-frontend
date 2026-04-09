import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { adminApi } from '../api/services.js';
import { useFetch } from '../hooks/useFetch.js';
import { useToast } from '../hooks/useToast.jsx';
import Modal from '../components/Modal.jsx';

function today() {
  return new Date().toISOString().split('T')[0];
}

export default function Agendar() {
  const navigate = useNavigate();
  const [step, setStep] = useState(1);
  const [slots, setSlots] = useState([]);
  const [loadingSlots, setLoadingSlots] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [showNewCliente, setShowNewCliente] = useState(false);
  const [newCliente, setNewCliente] = useState({ nome: '', telefone: '', email: '' });
  const { success, error, ToastContainer } = useToast();

  const { data: barbeiros } = useFetch(() => adminApi.listarBarbeiros(), []);
  const { data: servicos }  = useFetch(() => adminApi.listarServicos(), []);
  const { data: clientes, setData: setClientes } = useFetch(() => adminApi.listarClientes(), []);

  const [form, setForm] = useState({
    cliente_id: '', barbeiro_id: '', servico_id: '',
    data: today(), hora_inicio: '', observacao: '',
  });

  const set = (key) => (e) => setForm((f) => ({ ...f, [key]: e.target.value }));

  // Carregar slots quando barbeiro + data + serviço mudam
  useEffect(() => {
    if (!form.barbeiro_id || !form.data || !form.servico_id) return;
    setLoadingSlots(true);
    setForm((f) => ({ ...f, hora_inicio: '' }));
    adminApi
      .horarios(form.barbeiro_id, form.data, form.servico_id)
      .then(setSlots)
      .catch(() => setSlots([]))
      .finally(() => setLoadingSlots(false));
  }, [form.barbeiro_id, form.data, form.servico_id]);

  async function handleNewCliente(e) {
    e.preventDefault();
    try {
      const c = await adminApi.criarCliente(newCliente);
      setClientes((prev) => [...prev, c]);
      setForm((f) => ({ ...f, cliente_id: String(c.id) }));
      setNewCliente({ nome: '', telefone: '', email: '' });
      setShowNewCliente(false);
      success('Cliente cadastrado!');
    } catch (err) {
      error(err.message);
    }
  }

  async function handleSubmit() {
    setSubmitting(true);
    try {
      await adminApi.criarAgendamento({
        cliente_id: Number(form.cliente_id),
        barbeiro_id: Number(form.barbeiro_id),
        servico_id: Number(form.servico_id),
        data: form.data,
        hora_inicio: form.hora_inicio,
        observacao: form.observacao || undefined,
      });
      setStep(4);
    } catch (err) {
      error(err.message);
    }
    setSubmitting(false);
  }

  const ativos = (arr) => (arr || []).filter((x) => x.ativo !== false);
  const find = (arr, id) => (arr || []).find((x) => String(x.id) === id);

  const selBarbeiro = find(barbeiros, form.barbeiro_id);
  const selServico  = find(servicos, form.servico_id);
  const selCliente  = find(clientes, form.cliente_id);

  return (
    <div className="slide-up">
      <div className="page-header">
        <h2>Novo Agendamento</h2>
        <p>Selecione as opções para agendar um horário</p>
      </div>

      {/* Progress */}
      <div className="steps-bar">
        {[1, 2, 3].map((s) => (
          <div key={s} className={`step ${step >= s ? 'active' : ''}`} />
        ))}
      </div>

      {/* Step 1 */}
      {step === 1 && (
        <div className="card">
          <div className="card-label">Dados do agendamento</div>

          <div className="form-group">
            <label className="form-label">Cliente</label>
            <div style={{ display: 'flex', gap: 8 }}>
              <select className="form-select" value={form.cliente_id} onChange={set('cliente_id')}>
                <option value="">Selecione...</option>
                {(clientes || []).map((c) => (
                  <option key={c.id} value={c.id}>{c.nome} — {c.telefone}</option>
                ))}
              </select>
              <button className="btn btn-secondary btn-sm" onClick={() => setShowNewCliente(true)}>
                + Novo
              </button>
            </div>
          </div>

          <div className="form-row">
            <div className="form-group">
              <label className="form-label">Serviço</label>
              <select className="form-select" value={form.servico_id} onChange={set('servico_id')}>
                <option value="">Selecione...</option>
                {ativos(servicos).map((s) => (
                  <option key={s.id} value={s.id}>
                    {s.nome} — {s.duracao_minutos}min · R$ {Number(s.preco).toFixed(2)}
                  </option>
                ))}
              </select>
            </div>
            <div className="form-group">
              <label className="form-label">Barbeiro</label>
              <select className="form-select" value={form.barbeiro_id} onChange={set('barbeiro_id')}>
                <option value="">Selecione...</option>
                {ativos(barbeiros).map((b) => (
                  <option key={b.id} value={b.id}>{b.nome}</option>
                ))}
              </select>
            </div>
          </div>

          <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: 8 }}>
            <button
              className="btn btn-primary"
              disabled={!form.cliente_id || !form.servico_id || !form.barbeiro_id}
              onClick={() => setStep(2)}
            >
              Continuar
            </button>
          </div>
        </div>
      )}

      {/* Step 2 */}
      {step === 2 && (
        <div className="card">
          <div className="card-label">Escolha data e horário</div>

          <div className="form-group">
            <label className="form-label">Data</label>
            <input
              type="date"
              className="form-input"
              value={form.data}
              min={today()}
              onChange={set('data')}
              style={{ maxWidth: 240 }}
            />
          </div>

          <div className="form-group">
            <label className="form-label">Horários disponíveis</label>
            {loadingSlots ? (
              <p style={{ color: 'var(--text-tertiary)' }}>Carregando...</p>
            ) : slots.length === 0 ? (
              <p style={{ color: 'var(--text-tertiary)' }}>Nenhum horário disponível.</p>
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
            <button className="btn btn-ghost" onClick={() => setStep(1)}>← Voltar</button>
            <button className="btn btn-primary" disabled={!form.hora_inicio} onClick={() => setStep(3)}>
              Continuar
            </button>
          </div>
        </div>
      )}

      {/* Step 3: Resumo */}
      {step === 3 && (
        <div className="card">
          <div className="card-label">Confirme os dados</div>

          <div style={{ marginBottom: 24 }}>
            <div className="summary-row">
              <span className="summary-label">Cliente</span>
              <span className="summary-value">{selCliente?.nome}</span>
            </div>
            <div className="summary-row">
              <span className="summary-label">Barbeiro</span>
              <span className="summary-value">{selBarbeiro?.nome}</span>
            </div>
            <div className="summary-row">
              <span className="summary-label">Serviço</span>
              <span className="summary-value">{selServico?.nome}</span>
            </div>
            <div className="summary-row">
              <span className="summary-label">Data</span>
              <span className="summary-value">{new Date(form.data + 'T12:00:00').toLocaleDateString('pt-BR')}</span>
            </div>
            <div className="summary-row">
              <span className="summary-label">Horário</span>
              <span className="summary-value">{form.hora_inicio}</span>
            </div>
            <div className="summary-row">
              <span className="summary-label">Valor</span>
              <span className="summary-value highlight">
                R$ {Number(selServico?.preco || 0).toFixed(2)}
              </span>
            </div>
          </div>

          <div className="form-group">
            <label className="form-label">Observação (opcional)</label>
            <input
              className="form-input"
              placeholder="Alguma observação?"
              value={form.observacao}
              onChange={set('observacao')}
            />
          </div>

          <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: 8 }}>
            <button className="btn btn-ghost" onClick={() => setStep(2)}>← Voltar</button>
            <button className="btn btn-primary" disabled={submitting} onClick={handleSubmit}>
              {submitting ? 'Enviando...' : 'Confirmar'}
            </button>
          </div>
        </div>
      )}

      {/* Step 4: Sucesso */}
      {step === 4 && (
        <div className="card" style={{ textAlign: 'center', padding: '64px 24px' }}>
          <div style={{ fontSize: 48, marginBottom: 16 }}>✓</div>
          <h3 style={{ fontSize: '1.5rem', fontWeight: 700, marginBottom: 8, letterSpacing: '-0.02em' }}>
            Pré-agendamento enviado
          </h3>
          <p style={{ color: 'var(--text-secondary)', marginBottom: 32, maxWidth: 360, margin: '0 auto 32px' }}>
            O barbeiro receberá uma notificação e confirmará o horário em breve.
          </p>
          <div className="btn-group" style={{ justifyContent: 'center' }}>
            <button className="btn btn-primary" onClick={() => { setStep(1); setForm({ cliente_id: '', barbeiro_id: '', servico_id: '', data: today(), hora_inicio: '', observacao: '' }); }}>
              Novo Agendamento
            </button>
            <button className="btn btn-secondary" onClick={() => navigate('/admin')}>
              Ir ao Dashboard
            </button>
          </div>
        </div>
      )}

      {/* Modal Novo Cliente */}
      {showNewCliente && (
        <Modal title="Novo Cliente" onClose={() => setShowNewCliente(false)}>
          <div className="form-group">
            <label className="form-label">Nome</label>
            <input className="form-input" value={newCliente.nome} onChange={(e) => setNewCliente((p) => ({ ...p, nome: e.target.value }))} placeholder="Nome completo" />
          </div>
          <div className="form-group">
            <label className="form-label">Telefone (WhatsApp)</label>
            <input className="form-input" value={newCliente.telefone} onChange={(e) => setNewCliente((p) => ({ ...p, telefone: e.target.value }))} placeholder="5511999999999" />
          </div>
          <div className="form-group">
            <label className="form-label">Email (opcional)</label>
            <input className="form-input" value={newCliente.email} onChange={(e) => setNewCliente((p) => ({ ...p, email: e.target.value }))} placeholder="email@exemplo.com" />
          </div>
          <div className="modal-actions">
            <button className="btn btn-ghost" onClick={() => setShowNewCliente(false)}>Cancelar</button>
            <button className="btn btn-primary" disabled={!newCliente.nome || !newCliente.telefone} onClick={handleNewCliente}>Cadastrar</button>
          </div>
        </Modal>
      )}

      {ToastContainer}
    </div>
  );
}
