import React, { useState } from 'react';
import { Heart, Car, Home as HomeIcon, Stethoscope, ShieldCheck, ArrowRight, CheckCircle } from 'lucide-react';
import axios from 'axios';

const Seguros = () => {
  const [showModal, setShowModal] = useState(false);
  const [seguroSeleccionado, setSeguroSeleccionado] = useState(null);
  const [mensaje, setMensaje] = useState(null);

  const userId = localStorage.getItem('userId');

  const segurosDisponibles = [
    { id: 'vida', icon: <Heart size={24} />, title: 'Seguro de vida', desc: 'Tu tranquilidad, siempre.', precio: 150.00 },
    { id: 'auto', icon: <Car size={24} />, title: 'Seguro de auto', desc: 'Protege tu camino.', precio: 300.00 },
    { id: 'hogar', icon: <HomeIcon size={24} />, title: 'Seguro de hogar', desc: 'Tu hogar, seguro.', precio: 250.00 },
    { id: 'medico', icon: <Stethoscope size={24} />, title: 'Gastos médicos', desc: 'Tu salud es lo más importante.', precio: 500.00 },
  ];

  const abrirSeguro = (seguro) => {
    setSeguroSeleccionado(seguro);
    setShowModal(true);
  };

  const contratarSeguro = async () => {
    try {
      // Reutilizamos el endpoint de pagos para simular el cobro del seguro
      await axios.post(`http://${window.location.hostname}:5000/api/pagos`, {
        usuarioId: userId,
        servicio: `Contratación ${seguroSeleccionado.title}`,
        monto: seguroSeleccionado.precio,
        referencia: `POLIZA-${Math.floor(Math.random() * 90000) + 10000}`
      });
      
      setMensaje({ type: 'success', text: `¡Has contratado el ${seguroSeleccionado.title} exitosamente!` });
      
      setTimeout(() => {
        setShowModal(false);
        setMensaje(null);
      }, 3000);
    } catch (error) {
      setMensaje({ type: 'error', text: error.response?.data?.error || 'Error al contratar seguro.' });
    }
  };

  return (
    <div className="max-w-6xl mx-auto space-y-8 relative">
      
      <div className="mb-6">
        <h1 className="text-3xl font-bold">Seguros</h1>
        <p className="text-gray-500">Protege lo que más te importa, con la confianza de siempre.</p>
      </div>

      <div className="grid grid-cols-2 gap-6 mb-10">
        {segurosDisponibles.map(seg => (
          <div key={seg.id} onClick={() => abrirSeguro(seg)}>
            <SeguroCard 
              icon={seg.icon} 
              title={seg.title} 
              desc={seg.desc} 
            />
          </div>
        ))}
      </div>

      {/* Security Banner */}
      <div className="bg-[#0f172a] rounded-2xl p-6 flex justify-between items-center text-white shadow-lg">
        <div className="flex items-center space-x-4">
          <div className="bg-blue-900 p-3 rounded-full text-blue-400">
            <ShieldCheck size={32} />
          </div>
          <div>
            <h3 className="text-lg font-bold">Tu seguridad también es nuestra prioridad</h3>
            <p className="text-sm text-gray-400">Contamos con la tecnología y respaldo que necesitas.</p>
          </div>
        </div>
        <button className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded-full text-sm font-medium transition-colors">
          Conocer más
        </button>
      </div>

      {/* Modal para Contratar Seguro */}
      {showModal && seguroSeleccionado && (
        <div className="absolute inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50 h-[800px] -m-8">
          <div className="bg-white rounded-2xl p-8 w-[500px] shadow-2xl">
            <div className="bg-blue-50 w-16 h-16 rounded-full flex items-center justify-center text-blue-600 mb-6 mx-auto">
              {seguroSeleccionado.icon}
            </div>
            <h2 className="text-2xl font-bold mb-2 text-center">{seguroSeleccionado.title}</h2>
            <p className="text-gray-500 mb-6 text-center">{seguroSeleccionado.desc}</p>
            
            {mensaje ? (
              <div className={`p-4 rounded-lg mb-4 text-center ${mensaje.type === 'success' ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
                {mensaje.text}
              </div>
            ) : (
              <div className="bg-gray-50 p-6 rounded-xl mb-8">
                <div className="flex justify-between items-center mb-2">
                  <span className="text-gray-600">Costo mensual:</span>
                  <span className="font-bold text-lg">${parseFloat(seguroSeleccionado.precio).toFixed(2)}</span>
                </div>
                <p className="text-xs text-gray-400 mt-4 text-center">El monto será descontado de tu cuenta principal automáticamente.</p>
              </div>
            )}
            
            {!mensaje && (
              <div className="flex space-x-4 mt-4">
                <button type="button" onClick={() => setShowModal(false)} className="w-1/2 py-2 border border-gray-300 rounded-xl text-gray-700 hover:bg-gray-50">Cancelar</button>
                <button onClick={contratarSeguro} className="w-1/2 bg-blue-600 text-white rounded-xl py-2 hover:bg-blue-700 font-bold shadow-md">Contratar ahora</button>
              </div>
            )}
          </div>
        </div>
      )}

    </div>
  );
};

const SeguroCard = ({ icon, title, desc }) => (
  <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 hover:shadow-md transition-shadow cursor-pointer flex justify-between items-center group">
    <div className="flex items-center space-x-4">
      <div className="bg-blue-50 w-12 h-12 rounded-lg flex items-center justify-center text-blue-600">
        {icon}
      </div>
      <div>
        <h4 className="font-bold text-gray-800 mb-1">{title}</h4>
        <p className="text-xs text-gray-500">{desc}</p>
      </div>
    </div>
    <ArrowRight size={20} className="text-gray-300 group-hover:text-blue-600 transition-colors" />
  </div>
);

export default Seguros;
