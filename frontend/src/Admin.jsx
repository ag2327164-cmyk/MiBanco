import React, { useState, useEffect } from 'react';
import { Users, DollarSign, Activity, Settings, Search, LogOut } from 'lucide-react';
import axios from 'axios';

const Admin = () => {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  
  // Estado para el Modal de Gestión
  const [usuarioSeleccionado, setUsuarioSeleccionado] = useState(null);
  const [nuevoSaldo, setNuevoSaldo] = useState('');
  const [mensajeExito, setMensajeExito] = useState('');

  const fetchAdminData = async () => {
    try {
      const response = await axios.get(`https://mibanco-ron5.onrender.com/api/admin/stats`);
      setStats(response.data);
    } catch (error) {
      console.error("Error fetching admin stats:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAdminData();
  }, []);

  const abrirModalGestion = (usuario) => {
    setUsuarioSeleccionado(usuario);
    setNuevoSaldo(usuario.saldo || 0);
    setMensajeExito('');
  };

  const guardarSaldo = async (e) => {
    e.preventDefault();
    try {
      await axios.post(`https://mibanco-ron5.onrender.com/api/admin/saldo`, {
        cuenta_numero: usuarioSeleccionado.numero_cuenta,
        nuevo_saldo: parseFloat(nuevoSaldo)
      });
      setMensajeExito('¡Saldo actualizado exitosamente!');
      fetchAdminData(); // Recargar datos
      setTimeout(() => {
        setUsuarioSeleccionado(null);
      }, 2000);
    } catch (error) {
      console.error(error);
    }
  };

  if (loading) return <div className="min-h-screen flex items-center justify-center bg-gray-900 text-white">Cargando panel de control...</div>;

  return (
    <div className="min-h-screen bg-gray-900 text-gray-100 p-8 relative">
      
      {/* Header */}
      <div className="max-w-7xl mx-auto flex justify-between items-center mb-10">
        <div>
          <h1 className="text-3xl font-bold text-white flex items-center">
            <Settings className="mr-3 text-blue-500" size={32} />
            Panel de Administrador (Back-Office)
          </h1>
          <p className="text-gray-400 mt-1">Monitoreo global del banco en tiempo real.</p>
        </div>
        <div className="flex space-x-4">
          <div className="bg-gray-800 px-4 py-2 rounded-lg flex items-center text-sm">
            <span className="w-2 h-2 bg-green-500 rounded-full mr-2 animate-pulse"></span>
            Sistema En Línea
          </div>
          <button onClick={() => window.location.href = '/'} className="bg-red-500 hover:bg-red-600 px-4 py-2 rounded-lg font-medium flex items-center transition-colors">
            <LogOut size={16} className="mr-2" /> Salir del Panel
          </button>
        </div>
      </div>

      <div className="max-w-7xl mx-auto space-y-8">
        
        {/* Top KPIs */}
        <div className="grid grid-cols-3 gap-6">
          <div className="bg-gray-800 rounded-2xl p-6 border border-gray-700 shadow-lg">
            <div className="flex justify-between items-start mb-4">
              <div className="bg-blue-500 bg-opacity-20 p-3 rounded-xl text-blue-400">
                <Users size={24} />
              </div>
            </div>
            <h3 className="text-gray-400 text-sm font-medium">Clientes Registrados</h3>
            <p className="text-4xl font-bold text-white mt-1">{stats?.totalUsuarios}</p>
          </div>
          
          <div className="bg-gray-800 rounded-2xl p-6 border border-gray-700 shadow-lg">
            <div className="flex justify-between items-start mb-4">
              <div className="bg-green-500 bg-opacity-20 p-3 rounded-xl text-green-400">
                <DollarSign size={24} />
              </div>
            </div>
            <h3 className="text-gray-400 text-sm font-medium">Capital Total en el Banco</h3>
            <p className="text-4xl font-bold text-white mt-1">${parseFloat(stats?.dineroTotal || 0).toLocaleString('en-US', {minimumFractionDigits: 2})}</p>
          </div>
          
          <div className="bg-gray-800 rounded-2xl p-6 border border-gray-700 shadow-lg">
            <div className="flex justify-between items-start mb-4">
              <div className="bg-purple-500 bg-opacity-20 p-3 rounded-xl text-purple-400">
                <Activity size={24} />
              </div>
            </div>
            <h3 className="text-gray-400 text-sm font-medium">Transacciones (Últimas)</h3>
            <p className="text-4xl font-bold text-white mt-1">{stats?.transaccionesRecientes?.length || 0}</p>
          </div>
        </div>

        <div className="grid grid-cols-3 gap-8">
          
          {/* Tabla de Usuarios */}
          <div className="col-span-2 bg-gray-800 rounded-2xl p-6 border border-gray-700 shadow-lg">
            <div className="flex justify-between items-center mb-6">
              <h3 className="text-xl font-bold text-white">Directorio de Clientes</h3>
              <div className="relative">
                <Search size={16} className="absolute left-3 top-3 text-gray-500" />
                <input type="text" placeholder="Buscar cliente..." className="bg-gray-900 border border-gray-700 rounded-lg pl-10 pr-4 py-2 text-sm focus:outline-none focus:border-blue-500 text-white" />
              </div>
            </div>
            
            <div className="overflow-x-auto">
              <table className="w-full text-left text-sm">
                <thead>
                  <tr className="border-b border-gray-700 text-gray-400">
                    <th className="pb-3 font-medium">ID</th>
                    <th className="pb-3 font-medium">Cliente</th>
                    <th className="pb-3 font-medium">Correo</th>
                    <th className="pb-3 font-medium">Cuenta</th>
                    <th className="pb-3 font-medium text-right">Saldo</th>
                    <th className="pb-3 font-medium text-center">Acciones</th>
                  </tr>
                </thead>
                <tbody>
                  {stats?.usuarios.map(u => (
                    <tr key={u.id} className="border-b border-gray-700 hover:bg-gray-750 transition-colors">
                      <td className="py-4 text-gray-500">#{u.id}</td>
                      <td className="py-4 font-medium text-white">{u.nombre} {u.apellidos}</td>
                      <td className="py-4 text-gray-400">{u.correo}</td>
                      <td className="py-4 text-gray-400">{u.numero_cuenta || 'Sin cuenta'}</td>
                      <td className="py-4 text-right font-bold text-green-400">${parseFloat(u.saldo || 0).toLocaleString()}</td>
                      <td className="py-4 text-center">
                        <button 
                          onClick={() => abrirModalGestion(u)}
                          className="bg-blue-600 hover:bg-blue-500 text-white px-3 py-1 rounded-md text-xs font-bold transition-colors"
                        >
                          Gestionar
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* Log de Actividad Reciente */}
          <div className="bg-gray-800 rounded-2xl p-6 border border-gray-700 shadow-lg">
             <h3 className="text-xl font-bold text-white mb-6">Actividad Global</h3>
             <div className="space-y-4">
                {stats?.transaccionesRecientes.map(t => (
                  <div key={t.id} className="bg-gray-900 p-4 rounded-xl border border-gray-700">
                    <div className="flex justify-between items-start mb-2">
                      <span className="text-xs font-bold bg-gray-800 text-gray-300 px-2 py-1 rounded">
                        {t.tipo}
                      </span>
                      <span className="text-xs text-gray-500">{new Date(t.fecha).toLocaleTimeString()}</span>
                    </div>
                    <p className="text-sm text-gray-300 mb-1">
                      <span className="font-bold text-white">{t.cliente}</span> realizó una operación.
                    </p>
                    <p className="text-lg font-bold text-blue-400">${parseFloat(t.monto).toLocaleString()}</p>
                  </div>
                ))}
                {stats?.transaccionesRecientes.length === 0 && (
                  <p className="text-gray-500 text-sm text-center">Sin actividad reciente.</p>
                )}
             </div>
          </div>

        </div>

      </div>

      {/* Modal de Gestión de Usuario (Superpoder de Admin) */}
      {usuarioSeleccionado && (
        <div className="absolute inset-0 z-50 flex items-center justify-center bg-black bg-opacity-70">
          <div className="bg-gray-800 rounded-2xl p-8 w-[450px] shadow-2xl border border-gray-700">
            <h2 className="text-2xl font-bold mb-2 text-white">Gestionar Cliente</h2>
            <p className="text-gray-400 mb-6">Modifica directamente los fondos de {usuarioSeleccionado.nombre}.</p>
            
            {mensajeExito && (
              <div className="bg-green-500 bg-opacity-20 text-green-400 p-3 rounded-lg mb-4 text-sm font-medium text-center">
                {mensajeExito}
              </div>
            )}

            {!usuarioSeleccionado.numero_cuenta ? (
              <p className="text-red-400 text-center mb-6">Este usuario aún no tiene una cuenta bancaria asignada.</p>
            ) : (
              <form onSubmit={guardarSaldo} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-400 mb-1">Cuenta</label>
                  <input type="text" disabled value={usuarioSeleccionado.numero_cuenta} className="w-full px-4 py-2 bg-gray-900 border border-gray-700 rounded-lg text-gray-500 cursor-not-allowed" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-400 mb-1">Nuevo Saldo Total ($)</label>
                  <input 
                    type="number" 
                    step="0.01" 
                    required 
                    value={nuevoSaldo} 
                    onChange={e => setNuevoSaldo(e.target.value)} 
                    className="w-full px-4 py-2 bg-gray-900 border border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none text-white font-bold" 
                  />
                  <p className="text-xs text-gray-500 mt-2">Como administrador, al guardar este monto se reemplazará el saldo actual del cliente.</p>
                </div>
                
                <div className="flex space-x-4 mt-8">
                  <button type="button" onClick={() => setUsuarioSeleccionado(null)} className="w-1/2 py-2 border border-gray-600 rounded-xl text-gray-300 hover:bg-gray-700 transition-colors">Cancelar</button>
                  <button type="submit" className="w-1/2 bg-blue-600 text-white rounded-xl py-2 hover:bg-blue-700 font-bold shadow-md transition-colors">Aplicar Saldo</button>
                </div>
              </form>
            )}
          </div>
        </div>
      )}

    </div>
  );
};

export default Admin;
