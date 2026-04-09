const MAP = {
  PRE_AGENDADO:   { label: 'Pendente',        css: 'badge-pre-agendado' },
  CONFIRMADO:     { label: 'Confirmado',       css: 'badge-confirmado' },
  RECUSADO:       { label: 'Recusado',         css: 'badge-recusado' },
  CANCELADO:      { label: 'Cancelado',        css: 'badge-cancelado' },
  CONCLUIDO:      { label: 'Concluído',        css: 'badge-concluido' },
  NAO_COMPARECEU: { label: 'Não compareceu',   css: 'badge-nao-compareceu' },
};

export default function StatusBadge({ status }) {
  const entry = MAP[status] || { label: status, css: '' };
  return <span className={`badge ${entry.css}`}>{entry.label}</span>;
}
