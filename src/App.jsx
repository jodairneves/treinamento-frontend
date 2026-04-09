import { Routes, Route, Navigate } from 'react-router-dom';
import { useAuth } from './context/AuthContext.jsx';
import PublicLayout from './components/PublicLayout.jsx';
import Layout from './components/Layout.jsx';
import ProtectedRoute from './components/ProtectedRoute.jsx';

// Public pages
import Home from './pages/Home.jsx';
import BarbeariaPublic from './pages/BarbeariaPublic.jsx';

// Auth pages
import ClienteLogin from './pages/ClienteLogin.jsx';
import ClienteRegistro from './pages/ClienteRegistro.jsx';
import AdminLogin from './pages/AdminLogin.jsx';
import AdminRegistro from './pages/AdminRegistro.jsx';

// Client pages
import MeusAgendamentos from './pages/MeusAgendamentos.jsx';

// Admin pages
import Dashboard from './pages/Dashboard.jsx';
import Agendar from './pages/Agendar.jsx';
import Agendamentos from './pages/Agendamentos.jsx';
import Barbeiros from './pages/Barbeiros.jsx';
import Servicos from './pages/Servicos.jsx';
import Clientes from './pages/Clientes.jsx';
import AdminPerfil from './pages/AdminPerfil.jsx';

export default function App() {
  const { loading } = useAuth();
  if (loading) return <div className="empty" style={{minHeight:'100vh',display:'flex',alignItems:'center',justifyContent:'center'}}><p>Carregando...</p></div>;

  return (
    <Routes>
      {/* Public */}
      <Route path="/" element={<PublicLayout><Home /></PublicLayout>} />
      <Route path="/barbearia/:slug" element={<PublicLayout><BarbeariaPublic /></PublicLayout>} />

      {/* Auth */}
      <Route path="/cliente/login" element={<PublicLayout><ClienteLogin /></PublicLayout>} />
      <Route path="/cliente/registro" element={<PublicLayout><ClienteRegistro /></PublicLayout>} />
      <Route path="/admin/login" element={<AdminLogin />} />
      <Route path="/admin/registro" element={<AdminRegistro />} />

      {/* Client protected */}
      <Route path="/cliente/agendamentos" element={
        <ProtectedRoute role="cliente"><PublicLayout><MeusAgendamentos /></PublicLayout></ProtectedRoute>
      } />

      {/* Admin protected */}
      <Route path="/admin/*" element={
        <ProtectedRoute role="admin">
          <Layout>
            <Routes>
              <Route path="/" element={<Dashboard />} />
              <Route path="/agendar" element={<Agendar />} />
              <Route path="/agendamentos" element={<Agendamentos />} />
              <Route path="/barbeiros" element={<Barbeiros />} />
              <Route path="/servicos" element={<Servicos />} />
              <Route path="/clientes" element={<Clientes />} />
              <Route path="/perfil" element={<AdminPerfil />} />
              <Route path="*" element={<Navigate to="/admin" replace />} />
            </Routes>
          </Layout>
        </ProtectedRoute>
      } />

      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}
