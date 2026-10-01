import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Link, useLocation, Navigate } from 'react-router-dom';
import { Home, CreditCard, Send, Wallet, PieChart, Shield, HelpCircle, Bell, Search, User, LogOut } from 'lucide-react';
import Dashboard from './pages/Dashboard';
import Tarjetas from './pages/Tarjetas';
import Transferencias from './pages/Transferencias';
import Cuentas from './pages/Cuentas';
import Pagos from './pages/Pagos';
import Seguros from './pages/Seguros';
import Login from './pages/Login';
import Admin from './pages/Admin';

// Componente auxiliar para manejar estilos de links activos
const NavLink = ({ to, icon, label, exact = false }) => {
  const location = useLocation();
  const isActive = exact ? location.pathname === to : location.pathname.startsWith(to);
  
  return (
    <Link to={to} className={`flex items-center space-x-3 px-4 py-3 rounded-lg transition-colors ${isActive ? 'bg-[#1e293b] text-white font-medium' : 'text-gray-400 hover:text-white hover:bg-[#1e293b]'}`}>
      {icon}
      <span>{label}</span>
    </Link>
  );
};

const TopNavLink = ({ to, label, exact = false }) => {
  const location = useLocation();
  const isActive = exact ? location.pathname === to : location.pathname.startsWith(to);
  return (
    <Link to={to} className={`${isActive ? 'text-white font-medium' : 'hover:text-white'}`}>
      {label}
    </Link>
  );
};

function AppContent({ setIsAuthenticated }) {
  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('userId');
    localStorage.removeItem('nombre');
    setIsAuthenticated(false);
  };

  const nombreUser = localStorage.getItem('nombre') || 'Usuario';
  const isAdmin = localStorage.getItem('correo') === 'admin@mibanco.com';

  return (
      <div className="flex h-screen bg-mibanco-bg font-sans text-gray-800">
        
        {/* Sidebar */}
        <aside className="w-64 bg-[#0f172a] text-white flex flex-col">
          <div className="p-4 flex items-center space-x-3 mb-6 mt-2">
            <div className="bg-white rounded-full p-1">
              <div className="w-6 h-6 border-t-4 border-l-4 border-blue-600 rounded-sm transform rotate-45"></div>
            </div>
            <span className="text-xl font-bold tracking-wide">MiBanco</span>
          </div>

          <nav className="flex-1 px-2 space-y-1">
            <NavLink to="/" icon={<Home size={20} />} label="Inicio" exact={true} />
            <NavLink to="/cuentas" icon={<Wallet size={20} />} label="Cuentas" />
            <NavLink to="/tarjetas" icon={<CreditCard size={20} />} label="Tarjetas" />
            <NavLink to="/transferencias" icon={<Send size={20} />} label="Transferencias" />
            <NavLink to="/pagos" icon={<span className="font-bold w-5 text-center">$</span>} label="Pagos" />
            <NavLink to="/creditos" icon={<span className="font-bold border border-current rounded-sm px-1 w-5 text-center text-xs">Cr</span>} label="Créditos" />
            <NavLink to="/inversiones" icon={<PieChart size={20} />} label="Inversiones" />
            <NavLink to="/seguros" icon={<Shield size={20} />} label="Seguros" />
          </nav>

          <div className="p-4 border-t border-gray-800">
            {isAdmin && (
               <Link to="/admin" className="w-full flex items-center space-x-3 px-4 py-3 mb-2 text-blue-400 hover:text-white hover:bg-[#1e293b] rounded-lg transition-colors font-bold">
                 <Shield size={20} />
                 <span>Panel Admin</span>
               </Link>
            )}
            <NavLink to="/ayuda" icon={<HelpCircle size={20} />} label="Ayuda" />
            <button onClick={handleLogout} className="w-full flex items-center space-x-3 px-4 py-3 mt-2 text-red-400 hover:text-red-300 hover:bg-[#1e293b] rounded-lg transition-colors">
              <LogOut size={20} />
              <span>Cerrar Sesión</span>
            </button>
          </div>
        </aside>

        {/* Main Content */}
        <main className="flex-1 flex flex-col overflow-hidden">
          {/* Topbar */}
          <header className="h-16 bg-[#0f172a] text-white flex items-center justify-between px-6 border-b border-gray-800">
            <div className="flex items-center space-x-6 text-sm text-gray-300">
              <TopNavLink to="/" label="Inicio" exact={true} />
              <TopNavLink to="/cuentas" label="Cuentas" />
              <TopNavLink to="/tarjetas" label="Tarjetas" />
              <TopNavLink to="/creditos" label="Créditos" />
              <TopNavLink to="/inversiones" label="Inversiones" />
              <TopNavLink to="/seguros" label="Seguros" />
            </div>
            
            <div className="flex items-center space-x-4 text-gray-400">
              <button className="hover:text-white"><Search size={20} /></button>
              <button className="hover:text-white"><Bell size={20} /></button>
              <div className="flex items-center space-x-2">
                <span className="text-sm font-medium hidden md:block">Hola, {nombreUser}</span>
                <button className="bg-blue-600 rounded-full p-1 text-white"><User size={20} /></button>
              </div>
            </div>
          </header>

          {/* Page Content */}
          <div className="flex-1 overflow-auto bg-gray-100 p-8">
            <Routes>
              <Route path="/" element={<Dashboard />} />
              <Route path="/tarjetas" element={<Tarjetas />} />
              <Route path="/transferencias" element={<Transferencias />} />
              <Route path="/cuentas" element={<Cuentas />} />
              <Route path="/pagos" element={<Pagos />} />
              <Route path="/seguros" element={<Seguros />} />
              <Route path="*" element={<div className="text-center mt-20 text-gray-500"><h1>Próximamente</h1><p>Esta sección está en construcción.</p></div>} />
            </Routes>
          </div>
        </main>

      </div>
  );
}

function App() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  useEffect(() => {
    // Verificar si hay un token guardado al recargar la página
    const token = localStorage.getItem('token');
    if (token) {
      setIsAuthenticated(true);
    }
  }, []);

  return (
    <Router>
      {!isAuthenticated ? (
        <Routes>
          <Route path="/login" element={<Login onLogin={setIsAuthenticated} />} />
          <Route path="*" element={<Navigate to="/login" replace />} />
        </Routes>
      ) : (
        <Routes>
          <Route path="/login" element={<Navigate to="/" replace />} />
          <Route path="/admin" element={<Admin />} />
          <Route path="*" element={<AppContent setIsAuthenticated={setIsAuthenticated} />} />
        </Routes>
      )}
    </Router>
  );
}

export default App;
