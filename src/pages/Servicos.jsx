import { useState } from 'react';
import { adminApi } from '../api/services.js';
import { useFetch } from '../hooks/useFetch.js';
import { useToast } from '../hooks/useToast.jsx';
import Modal from '../components/Modal.jsx';

export default function Servicos() {
  const { data: servicos, refetch } = useFetch(() => adminApi.listarServicos(), []);
  const [showForm, setShowForm] = useState(false);
  const [editing, setEditing] = useState(null);
  const [form, setForm] = useState({ nome: '', duracao_minutos: '', preco: '' });
  const { success, error, ToastContainer } = useToast();

  function openNew() {
    setEditing(null);
    setForm({ nome: '', duracao_minutos: '', preco: '' });
    setShowForm(true);
  }

  function openEdit(s) {
    setEditing(s);
    setForm({
      nome: s.nome,
      duracao_minutos: String(s.duracao_minutos),
      preco: String(s.preco),
    });
    setShowForm(true);
  }

  async function handleSubmit(e) {
    e.preventDefault();
    const payload = {
      nome: form.nome,
      duracao_minutos: Number(form.duracao_minutos),
      preco: Number(form.preco),
    };
    try {
      if (editing) {
        await adminApi.atualizarServico(editing.id, payload);
        success('Serviço atualizado!');
      } else {
        await adminApi.criarServico(payload);
        success('Serviço cadastrado!');
      }
      setShowForm(false);
      refetch();
    } catch (err) {
      error(err.message);
    }
  }

  async function toggle(s) {
    try {
      await adminApi.atualizarServico(s.id, { ativo: !s.ativo });
      success(s.ativo ? 'Serviço desativado.' : 'Serviço reativado!');
      refetch();
    } catch (err) {
      error(err.message);
    }
  }

  const list = servicos || [];

  return (
    <div className="slide-up">
      <div className="page-header">
        <div className="page-header-row">
          <div>
            <h2>Serviços</h2>
            <p>Configure os serviços oferecidos pela barbearia</p>
          </div>
          <button className="btn btn-primary" onClick={openNew}>+ Novo Serviço</button>
        </div>
      </div>

      {list.length === 0 ? (
        <div className="empty">
          <div className="empty-icon">☆</div>
          <p>Nenhum serviço cadastrado.</p>
        </div>
      ) : (
        <div className="table-wrap">
          <table>
            <thead>
              <tr>
                <th>Serviço</th>
                <th>Duração</th>
                <th>Preço</th>
                <th>Status</th>
                <th style={{ textAlign: 'right' }}>Ações</th>
              </tr>
            </thead>
            <tbody>
              {list.map((s) => (
                <tr key={s.id}>
                  <td><strong>{s.nome}</strong></td>
                  <td>{s.duracao_minutos} min</td>
                  <td style={{ fontWeight: 600, color: 'var(--blue)' }}>
                    R$ {Number(s.preco).toFixed(2)}
                  </td>
                  <td>
                    <span className={`badge ${s.ativo ? 'badge-active' : 'badge-inactive'}`}>
                      {s.ativo ? 'Ativo' : 'Inativo'}
                    </span>
                  </td>
                  <td style={{ textAlign: 'right' }}>
                    <div className="btn-group" style={{ justifyContent: 'flex-end' }}>
                      <button className="btn btn-ghost btn-sm" onClick={() => openEdit(s)}>Editar</button>
                      <button
                        className={`btn btn-sm ${s.ativo ? 'btn-danger' : 'btn-success'}`}
                        onClick={() => toggle(s)}
                      >
                        {s.ativo ? 'Desativar' : 'Ativar'}
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {showForm && (
        <Modal title={editing ? 'Editar Serviço' : 'Novo Serviço'} onClose={() => setShowForm(false)}>
          <div className="form-group">
            <label className="form-label">Nome</label>
            <input className="form-input" value={form.nome} onChange={(e) => setForm({ ...form, nome: e.target.value })} placeholder="Ex: Corte Masculino" />
          </div>
          <div className="form-row">
            <div className="form-group">
              <label className="form-label">Duração (min)</label>
              <input type="number" className="form-input" value={form.duracao_minutos} onChange={(e) => setForm({ ...form, duracao_minutos: e.target.value })} placeholder="30" min="5" />
            </div>
            <div className="form-group">
              <label className="form-label">Preço (R$)</label>
              <input type="number" className="form-input" value={form.preco} onChange={(e) => setForm({ ...form, preco: e.target.value })} placeholder="45.00" step="0.01" min="0" />
            </div>
          </div>
          <div className="modal-actions">
            <button className="btn btn-ghost" onClick={() => setShowForm(false)}>Cancelar</button>
            <button className="btn btn-primary" disabled={!form.nome || !form.duracao_minutos} onClick={handleSubmit}>
              {editing ? 'Salvar' : 'Cadastrar'}
            </button>
          </div>
        </Modal>
      )}

      {ToastContainer}
    </div>
  );
}
