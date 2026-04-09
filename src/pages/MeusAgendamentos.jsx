import { useState } from 'react';
import { clienteApi } from '../api/services.js';
import { useFetch } from '../hooks/useFetch.js';
import { useToast } from '../hooks/useToast.jsx';
import StatusBadge from '../components/StatusBadge.jsx';

function fmt(time) {
  return time?.substring(0, 5) || time;
}

function fmtDate(d) {
  return new Date(d + 'T12:00:00').toLocaleDateString('pt-BR');
}

export default function MeusAgendamentos() {
  const { data: agendamentos, loading, refetch } = useFetch(() => clienteApi.meusAgendamentos(), []);
  const { success, error, ToastContainer } = useToast();
  const [cancelling, setCancelling] = useState(null);

  async function handleCancelar(id) {
    setCancelling(id);
    try {
      await clienteApi.cancelar(id);
      success('Agendamento cancelado.');
      refetch();
    } catch (err) {
      error(err.message);
    }
    setCancelling(null);
  }

  const list = agendamentos || [];

  return (
    <div className="slide-up">
      <div className="page-header">
        <h2>Meus Agendamentos</h2>
        <p>Acompanhe seus horarios agendados</p>
      </div>

      {loading ? (
        <div className="empty"><p>Carregando...</p></div>
      ) : list.length === 0 ? (
        <div className="empty">
          <div className="empty-icon">&#128197;</div>
          <p>Voce ainda nao possui agendamentos.</p>
        </div>
      ) : (
        <div className="table-wrap">
          <table>
            <thead>
              <tr>
                <th>Data</th>
                <th>Horario</th>
                <th>Barbearia</th>
                <th>Barbeiro</th>
                <th>Servico</th>
                <th>Status</th>
                <th style={{ textAlign: 'right' }}>Acoes</th>
              </tr>
            </thead>
            <tbody>
              {list.map((a) => (
                <tr key={a.id}>
                  <td>{fmtDate(a.data)}</td>
                  <td>
                    <strong>{fmt(a.hora_inicio)}</strong>
                    <span style={{ color: 'var(--text-tertiary)', margin: '0 4px' }}>-</span>
                    {fmt(a.hora_fim)}
                  </td>
                  <td><strong>{a.barbearia_nome || '-'}</strong></td>
                  <td>{a.barbeiro_nome}</td>
                  <td>
                    {a.servico_nome}
                    <div className="sub">R$ {Number(a.preco).toFixed(2)}</div>
                  </td>
                  <td><StatusBadge status={a.status} /></td>
                  <td style={{ textAlign: 'right' }}>
                    {(a.status === 'PRE_AGENDADO' || a.status === 'CONFIRMADO') && (
                      <button
                        className="btn btn-danger btn-sm"
                        disabled={cancelling === a.id}
                        onClick={() => handleCancelar(a.id)}
                      >
                        {cancelling === a.id ? 'Cancelando...' : 'Cancelar'}
                      </button>
                    )}
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
