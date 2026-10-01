import React, { useState, useEffect } from 'react';
import { Send, User, Smartphone, Zap, ArrowRight, CheckCircle } from 'lucide-react';
import axios from 'axios';

const Transferencias = () => {
  const [showModal, setShowModal] = useState(false);
  const [modalType, setModalType] = useState('nueva');
  const [cuentaDestino, setCuentaDestino] = useState('');
  const [monto, setMonto] = useState('');
  const [concepto, setConcepto] = useState('');
  const [mensaje, setMensaje] = useState(null);
  const [historial, setHistorial] = useState([]);

  const userId = localStorage.getItem('userId');

  const cargarHistorial = async () => {
    try {
      const response = await axios.get(`https://mibanco-ron5.onrender.com/api/transferencias/${userId}`);
      setHistorial(response.data);
    } catch (error) {
      console.error(error);
    }
  };

  useEffect(() => {
    cargarHistorial();
  }, [userId]);

  const handleTransferir = async (e) => {
    e.preventDefault();
    try {
      const response = await axios.post(`https://mibanco-ron5.onrender.com/api/transferir`, {
        usuarioId: userId,
        numeroCuentaDestino: cuentaDestino,
        monto: parseFloat(monto),
        concepto
      });
      setMensaje({ type: 'success', text: 'Transferencia realizada con éxito.' });
      setCuentaDestino('');
      setMonto('');
      setConcepto('');
      cargarHistorial();
      
      setTimeout(() => {
        setShowModal(false);
        setMensaje(null);
      }, 2000);
    } catch (error) {
      setMensaje({ type: 'error', text: error.response?.data?.error || 'Error al transferir.' });
    }
  };

  return (
    <div className="max-w-6xl mx-auto space-y-8 relative">
      
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-3xl font-bold">Transferencias</h1>
          <p className="text-gray-500">Envía dinero de forma rápida, segura y sin complicaciones.</p>
        </div>
      </div>

      <div className="grid grid-cols-4 gap-6 mb-10">
        <div onClick={() => { setModalType('nueva'); setShowModal(true); }}>
          <TransferCard 
            icon={<Send size={24} />} 
            title="Nueva Transferencia" 
            desc="Enviar a cualquier cuenta." 
          />
        </div>
        <div onClick={() => { setModalType('contactos'); setShowModal(true); }}>
          <TransferCard 
            icon={<User size={24} />} 
            title="Contactos frecuentes" 
            desc="Envía sin pedir cuenta." 
          />
        </div>
        <div onClick={() => { setModalType('clabe'); setShowModal(true); }}>
          <TransferCard 
            icon={<Smartphone size={24} />} 
            title="Transferencia con CLABE" 
            desc="Usa la CLABE interbancaria." 
          />
        </div>
        <div onClick={() => { setModalType('spei'); setShowModal(true); }}>
          <TransferCard 
            icon={<Zap size={24} />} 
            title="Transferencia por SPEI" 
            desc="En minutos, las 24 horas." 
          />
        </div>
      </div>

      <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
        <h3 className="font-bold text-lg mb-6">Transferencias recientes</h3>
        
        <div className="space-y-4">
          {historial.length === 0 ? (
            <p className="text-gray-500 text-sm">Aún no tienes transferencias.</p>
          ) : (
            historial.map((t) => (
              <RecentTransfer 
                key={t.id}
                name={t.concepto} 
                amount={`$${parseFloat(t.monto).toFixed(2)}`} 
                date={new Date(t.fecha).toLocaleDateString()} 
                status={t.estado} 
                isOut={t.tipo === 'Transferencia'}
              />
            ))
          )}
        </div>
      </div>

      {/* Modal para transferir */}
      {showModal && (
        <div className="absolute inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50 h-[800px] -m-8">
          <div className="bg-white rounded-2xl p-8 w-[500px] shadow-2xl">
            <h2 className="text-2xl font-bold mb-6">
              {modalType === 'nueva' && 'Nueva transferencia'}
              {modalType === 'contactos' && 'Envío a Contacto Frecuente'}
              {modalType === 'clabe' && 'Transferencia con CLABE'}
              {modalType === 'spei' && 'Transferencia por SPEI'}
            </h2>
            
            {mensaje && (
              <div className={`p-4 rounded-lg mb-4 ${mensaje.type === 'success' ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
                {mensaje.text}
              </div>
            )}

            <form onSubmit={handleTransferir} className="space-y-4">
              
              {/* Campo dinámico según el tipo */}
              {modalType === 'contactos' ? (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Selecciona tu contacto</label>
                  <select required onChange={(e) => setCuentaDestino('123456787201')} className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-600 outline-none bg-white">
                    <option value="">-- Elige un contacto --</option>
                    <option value="123456787201">Mamá (Cuenta de Ahorro)</option>
                    <option value="987654321012">Carlos García (BBVA)</option>
                    <option value="555544443333">Renta del departamento</option>
                  </select>
                </div>
              ) : modalType === 'clabe' ? (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">CLABE Interbancaria (18 dígitos)</label>
                  <input type="text" required maxLength="18" value={cuentaDestino} onChange={e => setCuentaDestino(e.target.value)} className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-600 outline-none" placeholder="Ej: 012345678901234567" />
                </div>
              ) : (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Cuenta Destino (12 dígitos)</label>
                  <input type="text" required maxLength="12" value={cuentaDestino} onChange={e => setCuentaDestino(e.target.value)} className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-600 outline-none" placeholder="Ej: 123456784582" />
                </div>
              )}

              {modalType === 'spei' && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Banco Destino</label>
                  <select required className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-600 outline-none bg-white">
                    <option value="BBVA">BBVA Bancomer</option>
                    <option value="Santander">Santander</option>
                    <option value="Banamex">Citibanamex</option>
                    <option value="Banorte">Banorte</option>
                  </select>
                </div>
              )}

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Monto ($)</label>
                <input type="number" required min="1" step="0.01" value={monto} onChange={e => setMonto(e.target.value)} className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-600 outline-none" placeholder="0.00" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Concepto</label>
                <input type="text" required value={concepto} onChange={e => setConcepto(e.target.value)} className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-600 outline-none" placeholder="Pago de renta, cena..." />
              </div>
              
              <div className="flex space-x-4 mt-8">
                <button type="button" onClick={() => setShowModal(false)} className="w-1/2 py-2 border border-gray-300 rounded-xl text-gray-700 hover:bg-gray-50">Cancelar</button>
                <button type="submit" className="w-1/2 bg-blue-600 text-white rounded-xl py-2 hover:bg-blue-700 font-bold shadow-md">Transferir</button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
};

const TransferCard = ({ icon, title, desc }) => (
  <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 hover:shadow-md hover:border-blue-200 transition-all cursor-pointer group">
    <div className="bg-blue-50 w-12 h-12 rounded-lg flex items-center justify-center mb-4 text-blue-600 group-hover:bg-blue-600 group-hover:text-white transition-colors">
      {icon}
    </div>
    <h4 className="font-bold text-gray-800 mb-2 leading-tight">{title}</h4>
    <p className="text-xs text-gray-500 mb-4 h-8">{desc}</p>
    <ArrowRight size={20} className="text-blue-400 group-hover:text-blue-600" />
  </div>
);

const RecentTransfer = ({ name, amount, date, status, isOut }) => (
  <div className="flex justify-between items-center py-3 border-b border-gray-50 last:border-0">
    <div className="flex items-center space-x-4">
      <div className={`w-10 h-10 rounded-full flex items-center justify-center ${isOut ? 'bg-red-50 text-red-600' : 'bg-green-50 text-green-600'}`}>
        {isOut ? <ArrowRight size={20} /> : <CheckCircle size={20} />}
      </div>
      <div>
        <p className="font-bold text-sm text-gray-800">{name}</p>
        <p className="text-xs text-gray-500">{isOut ? 'Envío' : 'Recepción'}</p>
      </div>
    </div>
    <div className="flex items-center space-x-12">
      <div className="text-right">
        <p className={`font-bold text-sm ${isOut ? 'text-gray-900' : 'text-green-600'}`}>
          {isOut ? '-' : '+'}{amount}
        </p>
        <p className="text-xs text-gray-500">{date}</p>
      </div>
      <span className="bg-green-100 text-green-700 text-xs px-3 py-1 rounded-full font-medium">
        {status}
      </span>
    </div>
  </div>
);

export default Transferencias;
