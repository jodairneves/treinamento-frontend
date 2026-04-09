import { useState, useEffect } from 'react';
import { adminApi } from '../api/services.js';
import { useToast } from '../hooks/useToast.jsx';

export default function AdminPerfil() {
  const [form, setForm] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const { success, error, ToastContainer } = useToast();

  useEffect(() => {
    adminApi.perfil()
      .then((data) => {
        setForm({
          nome: data.nome || '',
          telefone: data.telefone || '',
          descricao: data.descricao || '',
          endereco_rua: data.endereco_rua || '',
          endereco_numero: data.endereco_numero || '',
          endereco_bairro: data.endereco_bairro || '',
          endereco_cidade: data.endereco_cidade || '',
          endereco_estado: data.endereco_estado || '',
          endereco_cep: data.endereco_cep || '',
          latitude: data.latitude != null ? String(data.latitude) : '',
          longitude: data.longitude != null ? String(data.longitude) : '',
        });
      })
      .catch((err) => error(err.message))
      .finally(() => setLoading(false));
  }, [error]);

  const set = (key) => (e) => setForm((f) => ({ ...f, [key]: e.target.value }));

  async function handleSave(e) {
    e.preventDefault();
    setSaving(true);
    try {
      const payload = { ...form };
      if (payload.latitude) payload.latitude = Number(payload.latitude);
      else delete payload.latitude;
      if (payload.longitude) payload.longitude = Number(payload.longitude);
      else delete payload.longitude;

      await adminApi.atualizarPerfil(payload);
      success('Perfil atualizado!');
    } catch (err) {
      error(err.message);
    }
    setSaving(false);
  }

  if (loading || !form) return <div className="empty"><p>Carregando...</p></div>;

  return (
    <div className="slide-up">
      <div className="page-header">
        <h2>Perfil da Barbearia</h2>
        <p>Atualize as informacoes da sua barbearia</p>
      </div>

      <div className="card" style={{ maxWidth: 640 }}>
        <form onSubmit={handleSave}>
          <div className="form-group">
            <label className="form-label">Nome</label>
            <input className="form-input" value={form.nome} onChange={set('nome')} placeholder="Nome da barbearia" />
          </div>

          <div className="form-row">
            <div className="form-group">
              <label className="form-label">Telefone</label>
              <input className="form-input" value={form.telefone} onChange={set('telefone')} placeholder="5511999999999" />
            </div>
          </div>

          <div className="form-group">
            <label className="form-label">Descricao</label>
            <textarea className="form-textarea" value={form.descricao} onChange={set('descricao')} placeholder="Descreva sua barbearia..." rows={3} />
          </div>

          <div className="card-label" style={{ marginTop: 8 }}>Endereco</div>

          <div className="form-group">
            <label className="form-label">Rua</label>
            <input className="form-input" value={form.endereco_rua} onChange={set('endereco_rua')} placeholder="Rua das Flores" />
          </div>
          <div className="form-row">
            <div className="form-group">
              <label className="form-label">Numero</label>
              <input className="form-input" value={form.endereco_numero} onChange={set('endereco_numero')} placeholder="123" />
            </div>
            <div className="form-group">
              <label className="form-label">Bairro</label>
              <input className="form-input" value={form.endereco_bairro} onChange={set('endereco_bairro')} placeholder="Centro" />
            </div>
          </div>
          <div className="form-row">
            <div className="form-group">
              <label className="form-label">Cidade</label>
              <input className="form-input" value={form.endereco_cidade} onChange={set('endereco_cidade')} placeholder="Sao Paulo" />
            </div>
            <div className="form-group">
              <label className="form-label">Estado</label>
              <input className="form-input" value={form.endereco_estado} onChange={set('endereco_estado')} placeholder="SP" maxLength={2} />
            </div>
            <div className="form-group">
              <label className="form-label">CEP</label>
              <input className="form-input" value={form.endereco_cep} onChange={set('endereco_cep')} placeholder="01000-000" />
            </div>
          </div>

          <div className="card-label" style={{ marginTop: 8 }}>Coordenadas (opcional)</div>
          <div className="form-row">
            <div className="form-group">
              <label className="form-label">Latitude</label>
              <input className="form-input" value={form.latitude} onChange={set('latitude')} placeholder="-23.5505" />
            </div>
            <div className="form-group">
              <label className="form-label">Longitude</label>
              <input className="form-input" value={form.longitude} onChange={set('longitude')} placeholder="-46.6333" />
            </div>
          </div>

          <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: 8 }}>
            <button className="btn btn-primary" type="submit" disabled={saving}>
              {saving ? 'Salvando...' : 'Salvar'}
            </button>
          </div>
        </form>
      </div>

      {ToastContainer}
    </div>
  );
}
