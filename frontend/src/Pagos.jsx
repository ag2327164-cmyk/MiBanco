import React, { useState, useEffect } from 'react';
import { Lightbulb, CreditCard, Landmark, Smartphone, Zap, Wifi, ArrowRight } from 'lucide-react';
import axios from 'axios';

const Pagos = () => {
  const [pagos, setPagos] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [servicioSeleccionado, setServicioSeleccionado] = useState('');
  
  // Form fields
  const [referencia, setReferencia] = useState('');
  const [monto, setMonto] = useState('');
  const [mensaje, setMensaje] = useState(null);

  const userId = localStorage.getItem('userId');

  const cargarPagos = async () => {
    try {
      const response = await axios.get(`https://mibanco-ron5.onrender.com/api/pagos/${userId}`);
      setPagos(response.data);
    } catch (error) {
      console.error(error);
    }
  };

  useEffect(() => {
    cargarPagos();
  }, [userId]);

  const abrirModal = (servicio) => {
    setServicioSeleccionado(servicio);
    setShowModal(true);
  };

  const handlePagar = async (e) => {
    e.preventDefault();
    try {
      await axios.post(`https://mibanco-ron5.onrender.com/api/pagos`, {
        usuarioId: userId,
        servicio: servicioSeleccionado,
        monto: parseFloat(monto),
        referencia
      });
      setMensaje({ type: 'success', text: `Pago de ${servicioSeleccionado} exitoso.` });
      setReferencia(''); setMonto('');
      cargarPagos();
      
      setTimeout(() => {
        setShowModal(false);
        setMensaje(null);
      }, 2000);
    } catch (error) {
      setMensaje({ type: 'error', text: error.response?.data?.error || 'Error al procesar el pago.' });
    }
  };

  return (
    <div className="max-w-6xl mx-auto space-y-8 relative">
      
      <div className="mb-6">
        <h1 className="text-3xl font-bold">Pagos</h1>
        <p className="text-gray-500">Realiza el pago de tus servicios, tarjetas y más.</p>
      </div>

      <div className="grid grid-cols-4 gap-6 mb-10">
        <div onClick={() => abrirModal('Luz / Agua')}>
          <PagoActionCard icon={<Lightbulb size={24} />} title="Servicios" desc="Luz, agua, internet, etc." />
        </div>
        <div onClick={() => abrirModal('Tarjeta de Crédito')}>
          <PagoActionCard icon={<CreditCard size={24} />} title="Tarjetas" desc="Pago de tarjeta de crédito." />
        </div>
        <div onClick={() => abrirModal('Impuestos')}>
          <PagoActionCard icon={<Landmark size={24} />} title="Impuestos" desc="SAT, predial, etc." />
        </div>
        <div onClick={() => abrirModal('Recarga Telefónica')}>
          <PagoActionCard icon={<Smartphone size={24} />} title="Recargas" desc="Celular y tiempo aire." />
        </div>
      </div>

      <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
        <div className="flex justify-between items-center mb-6">
          <h3 className="font-bold text-lg">Servicios recientes</h3>
        </div>
        
        <div className="space-y-4">
          {pagos.length === 0 ? (
            <p className="text-gray-500 text-sm">Aún no has realizado pagos de servicios.</p>
          ) : (
            pagos.map((p) => (
              <PagoItem 
                key={p.id}
                icon={<Zap size={20} />}
                name={p.concepto.split(' (')[0]} 
                desc={p.concepto.split(' (')[1]?.replace(')', '') || 'Pago general'} 
                amount={`$${parseFloat(p.monto).toFixed(2)}`} 
                date={new Date(p.fecha).toLocaleDateString()} 
                status={p.estado} 
              />
            ))
          )}
        </div>
      </div>

      {/* Modal para Pagar */}
      {showModal && (
        <div className="absolute inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50 h-[800px] -m-8">
          <div className="bg-white rounded-2xl p-8 w-[500px] shadow-2xl">
            <h2 className="text-2xl font-bold mb-2">Pago de {servicioSeleccionado}</h2>
            <p className="text-gray-500 mb-6">Ingresa los datos para realizar el pago.</p>
            
            {mensaje && (
              <div className={`p-4 rounded-lg mb-4 ${mensaje.type === 'success' ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
                {mensaje.text}
              </div>
            )}

            <form onSubmit={handlePagar} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Referencia o Número de Servicio</label>
                <input type="text" required value={referencia} onChange={e => setReferencia(e.target.value)} className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-600 outline-none" placeholder="1234567890" />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Monto a Pagar ($)</label>
                <input type="number" required min="1" step="0.01" value={monto} onChange={e => setMonto(e.target.value)} className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-600 outline-none" placeholder="0.00" />
              </div>
              
              <div className="flex space-x-4 mt-8">
                <button type="button" onClick={() => setShowModal(false)} className="w-1/2 py-2 border border-gray-300 rounded-xl text-gray-700 hover:bg-gray-50">Cancelar</button>
                <button type="submit" className="w-1/2 bg-blue-600 text-white rounded-xl py-2 hover:bg-blue-700 font-bold shadow-md">Pagar</button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
};

const PagoActionCard = ({ icon, title, desc }) => (
  <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 hover:shadow-md transition-shadow cursor-pointer text-center flex flex-col items-center">
    <div className="bg-blue-50 w-14 h-14 rounded-full flex items-center justify-center mb-4 text-blue-600">
      {icon}
    </div>
    <h4 className="font-bold text-gray-800 mb-1">{title}</h4>
    <p className="text-xs text-gray-500">{desc}</p>
  </div>
);

const PagoItem = ({ icon, name, desc, amount, date, status }) => (
  <div className="flex justify-between items-center py-3 border-b border-gray-50 last:border-0">
    <div className="flex items-center space-x-4">
      <div className="bg-gray-100 w-10 h-10 rounded-full flex items-center justify-center text-blue-600">
        {icon}
      </div>
      <div>
        <p className="font-bold text-sm text-gray-800">{name}</p>
        <p className="text-xs text-gray-500">{desc}</p>
      </div>
    </div>
    <div className="flex items-center space-x-12">
      <div className="text-right">
        <p className="font-bold text-sm text-gray-800">{amount}</p>
        <p className="text-xs text-gray-500">{date}</p>
      </div>
      <span className="bg-green-100 text-green-700 text-xs px-3 py-1 rounded-full font-medium">
        {status}
      </span>
    </div>
  </div>
);

export default Pagos;
