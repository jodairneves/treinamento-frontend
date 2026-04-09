import { useState } from 'react';
import { adminApi } from '../api/services.js';
import { useFetch } from '../hooks/useFetch.js';
import { useToast } from '../hooks/useToast.jsx';
import Modal from '../components/Modal.jsx';

export default function Clientes() {
  const { data: clientes, refetch } = useFetch(() => adminApi.listarClientes(), []);
  const [showForm, setShowForm] = useState(false);
  const [editing, setEditing] = useState(null);
  const [form, setForm] = useState({ nome: '', telefone: '', email: '' });
  const [busca, setBusca] = useState('');
  const { success, error, ToastContainer } = useToast();

  function openNew() {
    setEditing(null);
    setForm({ nome: '', telefone: '', email: '' });
    setShowForm(true);
  }

  function openEdit(c) {
    setEditing(c);
    setForm({ nome: c.nome, telefone: c.telefone, email: c.email || '' });
    setShowForm(true);
  }

  async function handleSubmit(e) {
    e.preventDefault();
    try {
      if (editing) {
        await adminApi.atualizarCliente(editing.id, form);
        success('Cliente atualizado!');
      } else {
        await adminApi.criarCliente(form);
        success('Cliente cadastrado!');
      }
      setShowForm(false);
      refetch();
    } catch (err) {
      error(err.message);
    }
  }

  const list = (clientes || []).filter((c) =>
    !busca || c.nome.toLowerCase().includes(busca.toLowerCase()) || c.telefone.includes(busca)
  );

  return (
    <div className="slide-up">
      <div className="page-header">
        <div className="page-header-row">
          <div>
            <h2>Clientes</h2>
            <p>{(clientes || []).length} clientes cadastrados</p>
          </div>
          <button className="btn btn-primary" onClick={openNew}>+ Novo Cliente</button>
        </div>
      </div>

      <div style={{ marginBottom: 20 }}>
        <input
          className="form-input"
          placeholder="Buscar por nome ou telefone..."
          value={busca}
          onChange={(e) => setBusca(e.target.value)}
          style={{ maxWidth: 400 }}
        />
      </div>

      {list.length === 0 ? (
        <div className="empty">
          <div className="empty-icon">◉</div>
          <p>{busca ? 'Nenhum resultado encontrado.' : 'Nenhum cliente cadastrado.'}</p>
        </div>
      ) : (
        <div className="table-wrap">
          <table>
            <thead>
              <tr>
                <th>Nome</th>
                <th>Telefone</th>
                <th>Email</th>
                <th>Desde</th>
                <th style={{ textAlign: 'right' }}>Ações</th>
              </tr>
            </thead>
            <tbody>
              {list.map((c) => (
                <tr key={c.id}>
                  <td><strong>{c.nome}</strong></td>
                  <td>{c.telefone}</td>
                  <td>{c.email || <span style={{ color: 'var(--text-placeholder)' }}>—</span>}</td>
                  <td className="sub">{new Date(c.created_at).toLocaleDateString('pt-BR')}</td>
                  <td style={{ textAlign: 'right' }}>
                    <button className="btn btn-ghost btn-sm" onClick={() => openEdit(c)}>Editar</button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {showForm && (
        <Modal title={editing ? 'Editar Cliente' : 'Novo Cliente'} onClose={() => setShowForm(false)}>
          <div className="form-group">
            <label className="form-label">Nome</label>
            <input className="form-input" value={form.nome} onChange={(e) => setForm({ ...form, nome: e.target.value })} placeholder="Nome completo" />
          </div>
          <div className="form-group">
            <label className="form-label">Telefone (WhatsApp)</label>
            <input className="form-input" value={form.telefone} onChange={(e) => setForm({ ...form, telefone: e.target.value })} placeholder="5511999999999" />
          </div>
          <div className="form-group">
            <label className="form-label">Email (opcional)</label>
            <input className="form-input" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} placeholder="email@exemplo.com" />
          </div>
          <div className="modal-actions">
            <button className="btn btn-ghost" onClick={() => setShowForm(false)}>Cancelar</button>
            <button className="btn btn-primary" disabled={!form.nome || !form.telefone} onClick={handleSubmit}>
              {editing ? 'Salvar' : 'Cadastrar'}
            </button>
          </div>
        </Modal>
      )}

      {ToastContainer}
    </div>
  );
}
