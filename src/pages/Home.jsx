import { useState } from 'react';
import { Link } from 'react-router-dom';
import { publicApi } from '../api/services.js';
import { useFetch } from '../hooks/useFetch.js';

export default function Home() {
  const { data: barbearias, loading } = useFetch(() => publicApi.listarBarbearias(), []);
  const [busca, setBusca] = useState('');

  const list = (barbearias || []).filter((b) =>
    !busca ||
    b.nome.toLowerCase().includes(busca.toLowerCase()) ||
    (b.endereco_cidade && b.endereco_cidade.toLowerCase().includes(busca.toLowerCase()))
  );

  return (
    <div className="slide-up">
      <div className="page-header" style={{ textAlign: 'center', marginBottom: 40 }}>
        <h2 style={{ fontSize: '2.5rem' }}>Encontre sua barbearia</h2>
        <p>Agende um horario na barbearia mais proxima de voce</p>
      </div>

      <div style={{ maxWidth: 480, margin: '0 auto 32px' }}>
        <input
          className="form-input"
          placeholder="Buscar por nome ou cidade..."
          value={busca}
          onChange={(e) => setBusca(e.target.value)}
        />
      </div>

      {loading ? (
        <div className="empty"><p>Carregando...</p></div>
      ) : list.length === 0 ? (
        <div className="empty">
          <div className="empty-icon">&#9986;</div>
          <p>{busca ? 'Nenhuma barbearia encontrada.' : 'Nenhuma barbearia cadastrada ainda.'}</p>
        </div>
      ) : (
        <div className="barbearias-grid">
          {list.map((b) => (
            <Link key={b.id || b.slug} to={`/barbearia/${b.slug}`} className="barbearia-card">
              <h3>{b.nome}</h3>
              {(b.endereco_cidade || b.endereco_estado) && (
                <div className="location">
                  {[b.endereco_cidade, b.endereco_estado].filter(Boolean).join(' - ')}
                </div>
              )}
              {b.descricao && <div className="description">{b.descricao}</div>}
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
