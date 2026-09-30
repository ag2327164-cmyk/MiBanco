import React, { useState, useEffect } from 'react';
import { CreditCard, EyeOff, Settings, Lock, Plus, CheckCircle } from 'lucide-react';
import axios from 'axios';

const Tarjetas = () => {
  const [tarjetas, setTarjetas] = useState([]);
  const [selectedCard, setSelectedCard] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [loading, setLoading] = useState(true);

  // Formulario nueva tarjeta
  const [numero, setNumero] = useState('');
  const [tipo, setTipo] = useState('Débito');
  const [expiracion, setExpiracion] = useState('');
  const [limite, setLimite] = useState('');
  const [mensaje, setMensaje] = useState(null);

  const userId = localStorage.getItem('userId');

  const cargarTarjetas = async () => {
    try {
      const response = await axios.get(`http://${window.location.hostname}:5000/api/tarjetas/${userId}`);
      setTarjetas(response.data);
      if (response.data.length > 0) {
        setSelectedCard(response.data[0]);
      }
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    cargarTarjetas();
  }, [userId]);

  const handleAgregarTarjeta = async (e) => {
    e.preventDefault();
    try {
      await axios.post(`http://${window.location.hostname}:5000/api/tarjetas`, {
        usuarioId: userId,
        numeroTarjeta: numero.replace(/\s/g, ''),
        tipo,
        fechaExpiracion: expiracion,
        limiteCredito: tipo === 'Crédito' ? parseFloat(limite) : null
      });
      setMensaje({ type: 'success', text: 'Tarjeta guardada exitosamente.' });
      setNumero(''); setExpiracion(''); setLimite('');
      cargarTarjetas();
      
      setTimeout(() => {
        setShowModal(false);
        setMensaje(null);
      }, 2000);
    } catch (error) {
      setMensaje({ type: 'error', text: error.response?.data?.error || 'Error al agregar tarjeta.' });
    }
  };

  const formatearNumero = (num) => {
    return num.match(/.{1,4}/g)?.join(' ') || num;
  };

  if (loading) return <div className="p-8 text-center text-gray-500">Cargando tarjetas...</div>;

  return (
    <div className="max-w-6xl mx-auto space-y-8 relative">
      
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-3xl font-bold">Tarjetas</h1>
          <p className="text-gray-500">Administra tus tarjetas de débito y crédito.</p>
        </div>
        <button 
          onClick={() => setShowModal(true)}
          className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded-full font-medium transition-colors flex items-center"
        >
          <Plus size={20} className="mr-2" /> Agregar Tarjeta
        </button>
      </div>

      {tarjetas.length === 0 ? (
        <div className="bg-white rounded-2xl p-12 text-center shadow-sm border border-gray-100">
           <CreditCard size={48} className="mx-auto text-gray-300 mb-4" />
           <h2 className="text-xl font-bold text-gray-700 mb-2">No tienes tarjetas registradas</h2>
           <p className="text-gray-500 mb-6">Agrega una tarjeta real o de prueba para comenzar a gestionarla.</p>
           <button onClick={() => setShowModal(true)} className="bg-blue-100 text-blue-700 px-6 py-2 rounded-full font-bold">Agregar ahora</button>
        </div>
      ) : (
        <div className="bg-white rounded-2xl p-8 shadow-sm flex gap-12 border border-gray-100">
          {/* Card Selector & visualization */}
          <div className="w-1/2 flex flex-col space-y-6">
            
            {/* Lista de tarjetas miniatura */}
            <div className="flex space-x-4 overflow-x-auto pb-2">
              {tarjetas.map(t => (
                <div 
                  key={t.id} 
                  onClick={() => setSelectedCard(t)}
                  className={`p-3 border-2 rounded-xl cursor-pointer min-w-[140px] ${selectedCard?.id === t.id ? 'border-blue-500 bg-blue-50' : 'border-gray-100'}`}
                >
                  <p className="text-xs text-gray-500 mb-1">{t.tipo}</p>
                  <p className="font-bold text-gray-800">**{t.numero_tarjeta.slice(-4)}</p>
                </div>
              ))}
            </div>

            {/* Visualización de la tarjeta seleccionada */}
            {selectedCard && (
              <div className={`rounded-2xl p-6 text-white h-56 flex flex-col justify-between shadow-xl relative overflow-hidden transition-all
                 ${selectedCard.tipo === 'Crédito' ? 'bg-gradient-to-br from-gray-900 to-gray-700' : 'bg-gradient-to-br from-blue-900 to-blue-700'}
              `}>
                 <div className="absolute top-0 right-0 w-32 h-32 bg-white opacity-5 rounded-full -mr-10 -mt-10"></div>
                 
                 <div className="flex justify-between items-center z-10">
                   <span className="font-bold text-lg tracking-wider">MiBanco</span>
                   <CreditCard size={28} className="opacity-80" />
                 </div>
                 
                 <div className="z-10">
                   <p className="font-mono text-xl tracking-widest mb-2">{formatearNumero(selectedCard.numero_tarjeta)}</p>
                   <div className="flex justify-between items-end">
                     <div>
                       <p className="text-xs opacity-70">Vencimiento</p>
                       <p className="font-mono">{selectedCard.fecha_expiracion}</p>
                     </div>
                     <div className="text-2xl font-bold italic opacity-90">VISA</div>
                   </div>
                 </div>
              </div>
            )}
          </div>

          {/* Card details and actions */}
          {selectedCard && (
            <div className="w-1/2 flex flex-col justify-center">
              <div className="mb-8 flex justify-between items-start">
                <div>
                  <h3 className="text-xl font-bold text-gray-800">Tarjeta de {selectedCard.tipo.toLowerCase()}</h3>
                  <p className="text-sm text-gray-500 flex items-center mt-1">
                    <span className={`w-2 h-2 rounded-full mr-2 ${selectedCard.estado === 'Activa' ? 'bg-green-500' : 'bg-red-500'}`}></span>
                    Estado: {selectedCard.estado}
                  </p>
                </div>
              </div>
              
              <div className="mb-8">
                <p className="text-sm text-gray-500 mb-1">
                  {selectedCard.tipo === 'Crédito' ? 'Límite de crédito' : 'Saldo de la cuenta'}
                </p>
                <div className="flex justify-between items-center border-b pb-4">
                  <span className="text-3xl font-bold text-gray-900">
                    ${selectedCard.tipo === 'Crédito' ? selectedCard.limite_credito : selectedCard.saldo}
                  </span>
                  <button className="text-blue-600 p-2 hover:bg-blue-50 rounded-full transition-colors">
                    <EyeOff size={20} />
                  </button>
                </div>
              </div>

              <div className="flex justify-between mt-4">
                <ActionBtn icon={<CreditCard size={20} />} label={selectedCard.tipo === 'Crédito' ? "Pagar tarjeta" : "Depositar"} />
                <ActionBtn icon={<Lock size={20} />} label="Bloquear" />
                <ActionBtn icon={<Settings size={20} />} label="Ajustes" />
              </div>
            </div>
          )}
        </div>
      )}

      {/* Modal para Agregar Tarjeta */}
      {showModal && (
        <div className="absolute inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50 h-[800px] -m-8">
          <div className="bg-white rounded-2xl p-8 w-[500px] shadow-2xl">
            <h2 className="text-2xl font-bold mb-6">Agregar nueva tarjeta</h2>
            
            {mensaje && (
              <div className={`p-4 rounded-lg mb-4 ${mensaje.type === 'success' ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
                {mensaje.text}
              </div>
            )}

            <form onSubmit={handleAgregarTarjeta} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Número de Tarjeta (16 dígitos)</label>
                <input type="text" required maxLength="16" value={numero} onChange={e => setNumero(e.target.value)} className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-600 outline-none" placeholder="4532 1234 5678 9012" />
              </div>
              <div className="flex space-x-4">
                <div className="w-1/2">
                  <label className="block text-sm font-medium text-gray-700 mb-1">Fecha de Expiración</label>
                  <input type="text" required maxLength="5" value={expiracion} onChange={e => setExpiracion(e.target.value)} className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-600 outline-none" placeholder="12/28" />
                </div>
                <div className="w-1/2">
                  <label className="block text-sm font-medium text-gray-700 mb-1">Tipo</label>
                  <select value={tipo} onChange={e => setTipo(e.target.value)} className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-600 outline-none bg-white">
                    <option value="Débito">Débito</option>
                    <option value="Crédito">Crédito</option>
                  </select>
                </div>
              </div>
              
              {tipo === 'Crédito' && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Límite de Crédito ($)</label>
                  <input type="number" required min="1" step="0.01" value={limite} onChange={e => setLimite(e.target.value)} className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-600 outline-none" placeholder="20000.00" />
                </div>
              )}
              
              <div className="flex space-x-4 mt-8">
                <button type="button" onClick={() => setShowModal(false)} className="w-1/2 py-2 border border-gray-300 rounded-xl text-gray-700 hover:bg-gray-50">Cancelar</button>
                <button type="submit" className="w-1/2 bg-blue-600 text-white rounded-xl py-2 hover:bg-blue-700 font-bold shadow-md">Guardar</button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
};

const ActionBtn = ({ icon, label }) => (
  <button className="flex flex-col items-center group w-1/3">
    <div className="bg-gray-50 text-blue-600 p-4 rounded-2xl mb-2 group-hover:bg-blue-50 transition-colors">
      {icon}
    </div>
    <span className="text-xs text-gray-600 font-medium text-center">{label}</span>
  </button>
);

export default Tarjetas;
