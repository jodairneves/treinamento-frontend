import { useState, useEffect, useCallback } from 'react';
import { adminApi } from '../api/services.js';
import { useFetch } from '../hooks/useFetch.js';
import { useToast } from '../hooks/useToast.jsx';
import StatusBadge from '../components/StatusBadge.jsx';

function fmt(time) {
  return time?.substring(0, 5) || time;
}

function fmtDate(d) {
  return new Date(d + 'T12:00:00').toLocaleDateString('pt-BR');
}

function today() {
  return new Date().toISOString().split('T')[0];
}

export default function Dashboard() {
  const [filtro, setFiltro] = useState({ data: today(), barbeiro_id: '', status: '' });
  const [agendamentos, setAgendamentos] = useState([]);
  const [loading, setLoading] = useState(false);
  const { success, error, ToastContainer } = useToast();

  const { data: barbeiros } = useFetch(() => adminApi.listarBarbeiros(), []);

  const carregar = useCallback(async () => {
    setLoading(true);
    try {
      const params = {};
      if (filtro.data) params.data = filtro.data;
      if (filtro.barbeiro_id) params.barbeiro_id = filtro.barbeiro_id;
      if (filtro.status) params.status = filtro.status;
      setAgendamentos(await adminApi.listarAgendamentos(params));
    } catch (err) {
      error(err.message);
    }
    setLoading(false);
  }, [filtro, error]);

  useEffect(() => { carregar(); }, [carregar]);

  async function action(id, fn, msg) {
    try {
      await fn(id);
      success(msg);
      carregar();
    } catch (err) {
      error(err.message);
    }
  }

  const stats = {
    total: agendamentos.length,
    pendentes: agendamentos.filter((a) => a.status === 'PRE_AGENDADO').length,
    confirmados: agendamentos.filter((a) => a.status === 'CONFIRMADO').length,
    concluidos: agendamentos.filter((a) => a.status === 'CONCLUIDO').length,
  };

  return (
    <div className="slide-up">
      <div className="page-header">
        <h2>Dashboard</h2>
        <p>Visão geral dos agendamentos</p>
      </div>

      {/* Stats */}
      <div className="stats-grid">
        <div className="stat-card">
          <div className="stat-label">Total do dia</div>
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
          <div className="stat-label">Concluídos</div>
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
              <option value="PRE_AGENDADO">Pendente</option>
              <option value="CONFIRMADO">Confirmado</option>
              <option value="RECUSADO">Recusado</option>
              <option value="CANCELADO">Cancelado</option>
              <option value="CONCLUIDO">Concluído</option>
            </select>
          </div>
        </div>
      </div>

      {/* Tabela */}
      {loading ? (
        <div className="empty"><p>Carregando...</p></div>
      ) : agendamentos.length === 0 ? (
        <div className="empty">
          <div className="empty-icon">📅</div>
          <p>Nenhum agendamento encontrado.</p>
        </div>
      ) : (
        <div className="table-wrap">
          <table>
            <thead>
              <tr>
                <th>Horário</th>
                <th>Cliente</th>
                <th>Barbeiro</th>
                <th>Serviço</th>
                <th>Status</th>
                <th style={{ textAlign: 'right' }}>Ações</th>
              </tr>
            </thead>
            <tbody>
              {agendamentos.map((a) => (
                <tr key={a.id}>
                  <td>
                    <strong>{fmt(a.hora_inicio)}</strong>
                    <span style={{ color: 'var(--text-tertiary)', margin: '0 4px' }}>–</span>
                    {fmt(a.hora_fim)}
                    {!filtro.data && (
                      <div className="sub">{fmtDate(a.data)}</div>
                    )}
                  </td>
                  <td>
                    <strong>{a.cliente_nome}</strong>
                    <div className="sub">{a.cliente_telefone}</div>
                  </td>
                  <td>{a.barbeiro_nome}</td>
                  <td>
                    {a.servico_nome}
                    <div className="sub">{a.duracao_minutos}min · R$ {Number(a.preco).toFixed(2)}</div>
                  </td>
                  <td><StatusBadge status={a.status} /></td>
                  <td style={{ textAlign: 'right' }}>
                    <div className="btn-group" style={{ justifyContent: 'flex-end' }}>
                      {a.status === 'PRE_AGENDADO' && (
                        <>
                          <button className="btn btn-success btn-sm" onClick={() => action(a.id, adminApi.aceitarAgendamento, 'Agendamento aceito!')}>
                            Aceitar
                          </button>
                          <button className="btn btn-danger btn-sm" onClick={() => action(a.id, adminApi.recusarAgendamento, 'Agendamento recusado.')}>
                            Recusar
                          </button>
                        </>
                      )}
                      {a.status === 'CONFIRMADO' && (
                        <>
                          <button className="btn btn-primary btn-sm" onClick={() => action(a.id, adminApi.concluirAgendamento, 'Atendimento concluído!')}>
                            Concluir
                          </button>
                          <button className="btn btn-danger btn-sm" onClick={() => action(a.id, adminApi.cancelarAgendamento, 'Agendamento cancelado.')}>
                            Cancelar
                          </button>
                        </>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {ToastContainer}
    </div>
  );
}
