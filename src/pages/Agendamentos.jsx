import { useState, useEffect, useCallback } from 'react';
import { adminApi } from '../api/services.js';
import { useFetch } from '../hooks/useFetch.js';
import { useToast } from '../hooks/useToast.jsx';
import StatusBadge from '../components/StatusBadge.jsx';
import Modal from '../components/Modal.jsx';

function fmt(time) {
  return time?.substring(0, 5) || time;
}

function fmtDate(d) {
  return new Date(d + 'T12:00:00').toLocaleDateString('pt-BR');
}

function today() {
  return new Date().toISOString().split('T')[0];
}

const STATUS_LIST = [
  { value: 'PRE_AGENDADO', label: 'Pendente' },
  { value: 'CONFIRMADO', label: 'Confirmado' },
  { value: 'RECUSADO', label: 'Recusado' },
  { value: 'CANCELADO', label: 'Cancelado' },
  { value: 'CONCLUIDO', label: 'Concluido' },
  { value: 'NAO_COMPARECEU', label: 'Nao compareceu' },
];

// Transicoes validas de status
const TRANSITIONS = {
  PRE_AGENDADO: [
    { action: 'aceitar', label: 'Aceitar', css: 'btn-success', msg: 'Agendamento aceito!' },
    { action: 'recusar', label: 'Recusar', css: 'btn-danger', msg: 'Agendamento recusado.' },
  ],
  CONFIRMADO: [
    { action: 'concluir', label: 'Concluir', css: 'btn-primary', msg: 'Atendimento concluido!' },
    { action: 'cancelar', label: 'Cancelar', css: 'btn-danger', msg: 'Agendamento cancelado.' },
  ],
};

export default function Agendamentos() {
  const [filtro, setFiltro] = useState({ data: '', barbeiro_id: '', cliente_id: '', status: '' });
  const [agendamentos, setAgendamentos] = useState([]);
  const [loading, setLoading] = useState(false);
  const [detail, setDetail] = useState(null);
  const { success, error, ToastContainer } = useToast();

  const { data: barbeiros } = useFetch(() => adminApi.listarBarbeiros(), []);
  const { data: clientes } = useFetch(() => adminApi.listarClientes(), []);

  const carregar = useCallback(async () => {
    setLoading(true);
    try {
      const params = {};
      if (filtro.data) params.data = filtro.data;
      if (filtro.barbeiro_id) params.barbeiro_id = filtro.barbeiro_id;
      if (filtro.status) params.status = filtro.status;
      const result = await adminApi.listarAgendamentos(params);
      // Filtrar por cliente no frontend (backend nao suporta filtro por cliente)
      const filtered = filtro.cliente_id
        ? result.filter((a) => String(a.cliente_id) === filtro.cliente_id)
        : result;
      setAgendamentos(filtered);
    } catch (err) {
      error(err.message);
    }
    setLoading(false);
  }, [filtro, error]);

  useEffect(() => { carregar(); }, [carregar]);

  const actionMap = {
    aceitar: adminApi.aceitarAgendamento,
    recusar: adminApi.recusarAgendamento,
    cancelar: adminApi.cancelarAgendamento,
    concluir: adminApi.concluirAgendamento,
  };

  async function handleAction(id, actionName, msg) {
    try {
      await actionMap[actionName](id);
      success(msg);
      setDetail(null);
      carregar();
    } catch (err) {
      error(err.message);
    }
  }

  function clearFilters() {
    setFiltro({ data: '', barbeiro_id: '', cliente_id: '', status: '' });
  }

  const hasFilters = filtro.data || filtro.barbeiro_id || filtro.cliente_id || filtro.status;

  const stats = {
    total: agendamentos.length,
    pendentes: agendamentos.filter((a) => a.status === 'PRE_AGENDADO').length,
    confirmados: agendamentos.filter((a) => a.status === 'CONFIRMADO').length,
    concluidos: agendamentos.filter((a) => a.status === 'CONCLUIDO').length,
  };

  return (
    <div className="slide-up">
      <div className="page-header">
        <div className="page-header-row">
          <div>
            <h2>Agendamentos</h2>
            <p>Gerencie todos os agendamentos</p>
          </div>
          <button className="btn btn-primary" onClick={carregar}>
            Atualizar
          </button>
        </div>
      </div>

      {/* Stats */}
      <div className="stats-grid">
        <div className="stat-card">
          <div className="stat-label">Total</div>
          <div className="stat-value">{stats.total}</div>
        </div>
        <div className="stat-card">
          <div className="stat-label">Pendentes</div>
          <div className="stat-value orange">{stats.pendentes}</div>
        </div>
        <div className="stat-card">
          <div className="stat-label">Confirmados</div>
          <div className="stat-value green">{stats.confirmados}</div>
        </div>
        <div className="stat-card">
          <div className="stat-label">Concluidos</div>
          <div className="stat-value blue">{stats.concluidos}</div>
        </div>
      </div>

      {/* Filtros */}
      <div className="card card-flat" style={{ marginBottom: 24 }}>
        <div className="form-row">
          <div className="form-group" style={{ marginBottom: 0 }}>
            <label className="form-label">Data</label>
            <input
              type="date"
              className="form-input"
              value={filtro.data}
              onChange={(e) => setFiltro((f) => ({ ...f, data: e.target.value }))}
            />
          </div>
          <div className="form-group" style={{ marginBottom: 0 }}>
            <label className="form-label">Cliente</label>
            <select
              className="form-select"
              value={filtro.cliente_id}
              onChange={(e) => setFiltro((f) => ({ ...f, cliente_id: e.target.value }))}
            >
              <option value="">Todos</option>
              {(clientes || []).map((c) => (
                <option key={c.id} value={c.id}>{c.nome}</option>
              ))}
            </select>
          </div>
          <div className="form-group" style={{ marginBottom: 0 }}>
            <label className="form-label">Barbeiro</label>
            <select
              className="form-select"
              value={filtro.barbeiro_id}
              onChange={(e) => setFiltro((f) => ({ ...f, barbeiro_id: e.target.value }))}
            >
              <option value="">Todos</option>
              {(barbeiros || []).map((b) => (
                <option key={b.id} value={b.id}>{b.nome}</option>
              ))}
            </select>
          </div>
          <div className="form-group" style={{ marginBottom: 0 }}>
            <label className="form-label">Status</label>
            <select
              className="form-select"
              value={filtro.status}
              onChange={(e) => setFiltro((f) => ({ ...f, status: e.target.value }))}
            >
              <option value="">Todos</option>
              {STATUS_LIST.map((s) => (
                <option key={s.value} value={s.value}>{s.label}</option>
              ))}
            </select>
          </div>
        </div>
        <div style={{ display: 'flex', gap: 8, marginTop: 16 }}>
          <button className="btn btn-primary btn-sm" onClick={carregar}>Filtrar</button>
          {hasFilters && (
            <button className="btn btn-ghost btn-sm" onClick={clearFilters}>Limpar filtros</button>
          )}
        </div>
      </div>

      {/* Tabela */}
      {loading ? (
        <div className="empty"><p>Carregando...</p></div>
      ) : agendamentos.length === 0 ? (
        <div className="empty">
          <div className="empty-icon">📋</div>
          <p>Nenhum agendamento encontrado.</p>
        </div>
      ) : (
        <div className="table-wrap">
          <table>
            <thead>
              <tr>
                <th>Data</th>
                <th>Horario</th>
                <th>Cliente</th>
                <th>Barbeiro</th>
                <th>Servico</th>
                <th>Status</th>
                <th style={{ textAlign: 'right' }}>Acoes</th>
              </tr>
            </thead>
            <tbody>
              {agendamentos.map((a) => (
                <tr key={a.id}>
                  <td>{fmtDate(a.data)}</td>
                  <td>
                    <strong>{fmt(a.hora_inicio)}</strong>
                    <span style={{ color: 'var(--text-tertiary)', margin: '0 4px' }}>-</span>
                    {fmt(a.hora_fim)}
                  </td>
                  <td>
                    <strong>{a.cliente_nome}</strong>
                    <div className="sub">{a.cliente_telefone}</div>
                  </td>
                  <td>{a.barbeiro_nome}</td>
                  <td>
                    {a.servico_nome}
                    <div className="sub">{a.duracao_minutos}min - R$ {Number(a.preco).toFixed(2)}</div>
                  </td>
                  <td><StatusBadge status={a.status} /></td>
                  <td style={{ textAlign: 'right' }}>
                    <div className="btn-group" style={{ justifyContent: 'flex-end' }}>
                      <button className="btn btn-ghost btn-sm" onClick={() => setDetail(a)}>
                        Detalhes
                      </button>
                      {(TRANSITIONS[a.status] || []).map((t) => (
                        <button
                          key={t.action}
                          className={`btn ${t.css} btn-sm`}
                          onClick={() => handleAction(a.id, t.action, t.msg)}
                        >
                          {t.label}
                        </button>
                      ))}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Modal Detalhes */}
      {detail && (
        <Modal title="Detalhes do Agendamento" onClose={() => setDetail(null)} wide>
          <div style={{ marginBottom: 24 }}>
            <div className="summary-row">
              <span className="summary-label">Status</span>
              <StatusBadge status={detail.status} />
            </div>
            <div className="summary-row">
              <span className="summary-label">Cliente</span>
              <span className="summary-value">{detail.cliente_nome}</span>
            </div>
            <div className="summary-row">
              <span className="summary-label">Telefone</span>
              <span className="summary-value">{detail.cliente_telefone}</span>
            </div>
            <div className="summary-row">
              <span className="summary-label">Barbeiro</span>
              <span className="summary-value">{detail.barbeiro_nome}</span>
            </div>
            <div className="summary-row">
              <span className="summary-label">Servico</span>
              <span className="summary-value">{detail.servico_nome}</span>
            </div>
            <div className="summary-row">
              <span className="summary-label">Data</span>
              <span className="summary-value">{fmtDate(detail.data)}</span>
            </div>
            <div className="summary-row">
              <span className="summary-label">Horario</span>
              <span className="summary-value">{fmt(detail.hora_inicio)} - {fmt(detail.hora_fim)}</span>
            </div>
            <div className="summary-row">
              <span className="summary-label">Duracao</span>
              <span className="summary-value">{detail.duracao_minutos} min</span>
            </div>
            <div className="summary-row">
              <span className="summary-label">Valor</span>
              <span className="summary-value highlight">R$ {Number(detail.preco).toFixed(2)}</span>
            </div>
            {detail.observacao && (
              <div className="summary-row">
                <span className="summary-label">Observacao</span>
                <span className="summary-value">{detail.observacao}</span>
              </div>
            )}
            <div className="summary-row">
              <span className="summary-label">Criado em</span>
              <span className="summary-value" style={{ color: 'var(--text-tertiary)' }}>
                {new Date(detail.created_at).toLocaleString('pt-BR')}
              </span>
            </div>
          </div>

          <div className="modal-actions">
            <button className="btn btn-ghost" onClick={() => setDetail(null)}>Fechar</button>
            {(TRANSITIONS[detail.status] || []).map((t) => (
              <button
                key={t.action}
                className={`btn ${t.css}`}
                onClick={() => handleAction(detail.id, t.action, t.msg)}
              >
                {t.label}
              </button>
            ))}
          </div>
        </Modal>
      )}

      {ToastContainer}
    </div>
  );
}
