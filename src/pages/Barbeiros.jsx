import { useState } from 'react';
import { adminApi } from '../api/services.js';
import { useFetch } from '../hooks/useFetch.js';
import { useToast } from '../hooks/useToast.jsx';
import Modal from '../components/Modal.jsx';

const DIAS = ['Domingo', 'Segunda', 'Terça', 'Quarta', 'Quinta', 'Sexta', 'Sábado'];

export default function Barbeiros() {
  const { data: barbeiros, refetch } = useFetch(() => adminApi.listarBarbeiros(), []);
  const [showForm, setShowForm] = useState(false);
  const [editing, setEditing] = useState(null);
  const [form, setForm] = useState({ nome: '', telefone: '' });
  const [agendaView, setAgendaView] = useState(null);
  const [agenda, setAgenda] = useState([]);
  const [agendaForm, setAgendaForm] = useState({ dia_semana: '1', hora_inicio: '09:00', hora_fim: '19:00' });
  const { success, error, ToastContainer } = useToast();

  function openNew() {
    setEditing(null);
    setForm({ nome: '', telefone: '' });
    setShowForm(true);
  }

  function openEdit(b) {
    setEditing(b);
    setForm({ nome: b.nome, telefone: b.telefone });
    setShowForm(true);
  }

  async function handleSubmit(e) {
    e.preventDefault();
    try {
      if (editing) {
        await adminApi.atualizarBarbeiro(editing.id, form);
        success('Barbeiro atualizado!');
      } else {
        await adminApi.criarBarbeiro(form);
        success('Barbeiro cadastrado!');
      }
      setShowForm(false);
      refetch();
    } catch (err) {
      error(err.message);
    }
  }

  async function toggleAtivo(b) {
    try {
      await adminApi.atualizarBarbeiro(b.id, { ativo: !b.ativo });
      success(b.ativo ? 'Barbeiro desativado.' : 'Barbeiro reativado!');
      refetch();
    } catch (err) {
      error(err.message);
    }
  }

  async function openAgenda(b) {
    setAgendaView(b);
    try {
      setAgenda(await adminApi.listarAgenda(b.id));
    } catch (err) {
      error(err.message);
    }
  }

  async function addAgenda(e) {
    e.preventDefault();
    try {
      await adminApi.criarAgenda(agendaView.id, {
        dia_semana: Number(agendaForm.dia_semana),
        hora_inicio: agendaForm.hora_inicio,
        hora_fim: agendaForm.hora_fim,
      });
      success('Horário adicionado!');
      setAgenda(await adminApi.listarAgenda(agendaView.id));
    } catch (err) {
      error(err.message);
    }
  }

  async function removeAgenda(agendaId) {
    try {
      await adminApi.excluirAgenda(agendaView.id, agendaId);
      setAgenda((prev) => prev.filter((a) => a.id !== agendaId));
      success('Horário removido.');
    } catch (err) {
      error(err.message);
    }
  }

  const list = barbeiros || [];

  return (
    <div className="slide-up">
      <div className="page-header">
        <div className="page-header-row">
          <div>
            <h2>Barbeiros</h2>
            <p>Gerencie a equipe e horários de atendimento</p>
          </div>
          <button className="btn btn-primary" onClick={openNew}>+ Novo Barbeiro</button>
        </div>
      </div>

      {list.length === 0 ? (
        <div className="empty">
          <div className="empty-icon">✂</div>
          <p>Nenhum barbeiro cadastrado.</p>
        </div>
      ) : (
        <div className="table-wrap">
          <table>
            <thead>
              <tr>
                <th>Nome</th>
                <th>Telefone</th>
                <th>Status</th>
                <th style={{ textAlign: 'right' }}>Ações</th>
              </tr>
            </thead>
            <tbody>
              {list.map((b) => (
                <tr key={b.id}>
                  <td><strong>{b.nome}</strong></td>
                  <td>{b.telefone}</td>
                  <td>
                    <span className={`badge ${b.ativo ? 'badge-active' : 'badge-inactive'}`}>
                      {b.ativo ? 'Ativo' : 'Inativo'}
                    </span>
                  </td>
                  <td style={{ textAlign: 'right' }}>
                    <div className="btn-group" style={{ justifyContent: 'flex-end' }}>
                      <button className="btn btn-ghost btn-sm" onClick={() => openEdit(b)}>Editar</button>
                      <button className="btn btn-secondary btn-sm" onClick={() => openAgenda(b)}>Agenda</button>
                      <button
                        className={`btn btn-sm ${b.ativo ? 'btn-danger' : 'btn-success'}`}
                        onClick={() => toggleAtivo(b)}
                      >
                        {b.ativo ? 'Desativar' : 'Ativar'}
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Modal: Criar/Editar */}
      {showForm && (
        <Modal title={editing ? 'Editar Barbeiro' : 'Novo Barbeiro'} onClose={() => setShowForm(false)}>
          <div className="form-group">
            <label className="form-label">Nome</label>
            <input className="form-input" value={form.nome} onChange={(e) => setForm({ ...form, nome: e.target.value })} placeholder="Nome completo" />
          </div>
          <div className="form-group">
            <label className="form-label">Telefone</label>
            <input className="form-input" value={form.telefone} onChange={(e) => setForm({ ...form, telefone: e.target.value })} placeholder="5511999999999" />
          </div>
          <div className="modal-actions">
            <button className="btn btn-ghost" onClick={() => setShowForm(false)}>Cancelar</button>
            <button className="btn btn-primary" disabled={!form.nome || !form.telefone} onClick={handleSubmit}>
              {editing ? 'Salvar' : 'Cadastrar'}
            </button>
          </div>
        </Modal>
      )}

      {/* Modal: Agenda */}
      {agendaView && (
        <Modal title={`Agenda — ${agendaView.nome}`} onClose={() => setAgendaView(null)} wide>
          {agenda.length > 0 && (
            <div className="table-wrap" style={{ marginBottom: 20 }}>
              <table>
                <thead>
                  <tr>
                    <th>Dia</th>
                    <th>Início</th>
                    <th>Fim</th>
                    <th style={{ textAlign: 'right' }}></th>
                  </tr>
                </thead>
                <tbody>
                  {agenda.map((a) => (
                    <tr key={a.id}>
                      <td><strong>{DIAS[a.dia_semana]}</strong></td>
                      <td>{a.hora_inicio?.substring(0, 5)}</td>
                      <td>{a.hora_fim?.substring(0, 5)}</td>
                      <td style={{ textAlign: 'right' }}>
                        <button className="btn btn-danger btn-sm" onClick={() => removeAgenda(a.id)}>Remover</button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}

          <div className="card-label">Adicionar horário</div>
          <div className="form-row">
            <div className="form-group">
              <label className="form-label">Dia</label>
              <select className="form-select" value={agendaForm.dia_semana} onChange={(e) => setAgendaForm({ ...agendaForm, dia_semana: e.target.value })}>
                {DIAS.map((d, i) => <option key={i} value={i}>{d}</option>)}
              </select>
            </div>
            <div className="form-group">
              <label className="form-label">Início</label>
              <input type="time" className="form-input" value={agendaForm.hora_inicio} onChange={(e) => setAgendaForm({ ...agendaForm, hora_inicio: e.target.value })} />
            </div>
            <div className="form-group">
              <label className="form-label">Fim</label>
              <input type="time" className="form-input" value={agendaForm.hora_fim} onChange={(e) => setAgendaForm({ ...agendaForm, hora_fim: e.target.value })} />
            </div>
          </div>
          <div className="modal-actions">
            <button className="btn btn-ghost" onClick={() => setAgendaView(null)}>Fechar</button>
            <button className="btn btn-primary" onClick={addAgenda}>Adicionar</button>
          </div>
        </Modal>
      )}

      {ToastContainer}
    </div>
  );
}
