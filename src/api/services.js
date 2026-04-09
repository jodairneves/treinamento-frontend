import api from './axios.js';

// ─── Public ──────────────────────────────────
export const publicApi = {
  listarBarbearias: ()     => api.get('/barbearias').then(r => r.data),
  buscarBarbearia: (slug)  => api.get(`/barbearias/${slug}`).then(r => r.data),
  horarios: (slug, barbeiro_id, data, servico_id) =>
    api.get(`/barbearias/${slug}/horarios`, { params: { barbeiro_id, data, servico_id } }).then(r => r.data),
};

// ─── Auth ────────────────────────────────────
export const authApi = {
  registrarBarbearia: (data) => api.post('/auth/barbearia/registrar', data).then(r => r.data),
  loginBarbearia: (data)     => api.post('/auth/barbearia/login', data).then(r => r.data),
  registrarCliente: (data)   => api.post('/auth/cliente/registrar', data).then(r => r.data),
  loginCliente: (data)       => api.post('/auth/cliente/login', data).then(r => r.data),
  me: ()                     => api.get('/auth/me').then(r => r.data),
};

// ─── Cliente ─────────────────────────────────
export const clienteApi = {
  criarAgendamento: (data) => api.post('/cliente/agendamentos', data).then(r => r.data),
  meusAgendamentos: ()     => api.get('/cliente/agendamentos').then(r => r.data),
  cancelar: (id)           => api.put(`/cliente/agendamentos/${id}/cancelar`).then(r => r.data),
};

// ─── Admin ───────────────────────────────────
export const adminApi = {
  // Perfil
  perfil:          ()           => api.get('/admin/perfil').then(r => r.data),
  atualizarPerfil: (data)      => api.put('/admin/perfil', data).then(r => r.data),

  // Barbeiros
  listarBarbeiros:   ()           => api.get('/admin/barbeiros').then(r => r.data),
  criarBarbeiro:     (data)       => api.post('/admin/barbeiros', data).then(r => r.data),
  atualizarBarbeiro: (id, data)   => api.put(`/admin/barbeiros/${id}`, data).then(r => r.data),
  excluirBarbeiro:   (id)         => api.delete(`/admin/barbeiros/${id}`),

  listarAgenda:  (id)          => api.get(`/admin/barbeiros/${id}/agenda`).then(r => r.data),
  criarAgenda:   (id, data)    => api.post(`/admin/barbeiros/${id}/agenda`, data).then(r => r.data),
  excluirAgenda: (bId, aId)    => api.delete(`/admin/barbeiros/${bId}/agenda/${aId}`),

  listarBloqueios: (id, data) => api.get(`/admin/barbeiros/${id}/bloqueios`, { params: { data } }).then(r => r.data),
  criarBloqueio:   (id, data) => api.post(`/admin/barbeiros/${id}/bloqueios`, data).then(r => r.data),
  excluirBloqueio: (bId, blId)=> api.delete(`/admin/barbeiros/${bId}/bloqueios/${blId}`),

  // Clientes
  listarClientes:   ()           => api.get('/admin/clientes').then(r => r.data),
  criarCliente:     (data)       => api.post('/admin/clientes', data).then(r => r.data),
  atualizarCliente: (id, data)   => api.put(`/admin/clientes/${id}`, data).then(r => r.data),

  // Servicos
  listarServicos:   ()           => api.get('/admin/servicos').then(r => r.data),
  criarServico:     (data)       => api.post('/admin/servicos', data).then(r => r.data),
  atualizarServico: (id, data)   => api.put(`/admin/servicos/${id}`, data).then(r => r.data),

  // Agendamentos
  listarAgendamentos: (params)   => api.get('/admin/agendamentos', { params }).then(r => r.data),
  horarios: (barbeiro_id, data, servico_id) =>
    api.get('/admin/agendamentos/horarios', { params: { barbeiro_id, data, servico_id } }).then(r => r.data),
  criarAgendamento:    (data)    => api.post('/admin/agendamentos', data).then(r => r.data),
  aceitarAgendamento:  (id)      => api.put(`/admin/agendamentos/${id}/aceitar`).then(r => r.data),
  recusarAgendamento:  (id)      => api.put(`/admin/agendamentos/${id}/recusar`).then(r => r.data),
  cancelarAgendamento: (id)      => api.put(`/admin/agendamentos/${id}/cancelar`).then(r => r.data),
  concluirAgendamento: (id)      => api.put(`/admin/agendamentos/${id}/concluir`).then(r => r.data),
};
