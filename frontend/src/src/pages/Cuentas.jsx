import React, { useState, useEffect } from 'react';
import { Wallet, ArrowRight, ArrowDownRight, ArrowUpRight } from 'lucide-react';
import axios from 'axios';

const Cuentas = () => {
  const [cuentas, setCuentas] = useState([]);
  const [movimientos, setMovimientos] = useState([]);
  const [loading, setLoading] = useState(true);

  const userId = localStorage.getItem('userId');

  useEffect(() => {
    const cargarDatos = async () => {
      try {
        // Cargar cuentas (viene del dashboard endpoint por simplicidad o podríamos crear uno específico)
        const resCuentas = await axios.get(`https://mibanco-ron5.onrender.com/api/dashboard/${userId}`);
        setCuentas(resCuentas.data.cuentas || []);

        // Cargar movimientos (usamos el endpoint de transferencias que trae todo)
        const resMovs = await axios.get(`https://mibanco-ron5.onrender.com/api/transferencias/${userId}`);
        setMovimientos(resMovs.data);
      } catch (error) {
        console.error("Error fetching accounts:", error);
      } finally {
        setLoading(false);
      }
    };
    cargarDatos();
  }, [userId]);

  if (loading) return <div className="p-8 text-center text-gray-500">Cargando tus cuentas...</div>;

  return (
    <div className="max-w-6xl mx-auto space-y-8">
      
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-3xl font-bold">Cuentas</h1>
          <p className="text-gray-500">Consulta y administra tus cuentas desde un solo lugar.</p>
        </div>
        <button className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded-full font-medium transition-colors">
          Abrir nueva cuenta
        </button>
      </div>

      <div className="grid grid-cols-3 gap-6 mb-10">
        {cuentas.map(c => (
          <AccountCard 
            key={c.id}
            title={`Cuenta de ${c.tipo.toLowerCase()}`} 
            number={`**** ${c.numero_cuenta.slice(-4)}`} 
            balance={`$${parseFloat(c.saldo).toFixed(2)}`} 
          />
        ))}
      </div>

      <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
        <h3 className="font-bold text-lg mb-6">Movimientos recientes</h3>
        
        <div className="space-y-4">
          {movimientos.length === 0 ? (
            <p className="text-gray-500 text-sm">No tienes movimientos recientes.</p>
          ) : (
            movimientos.map(m => {
              // Determinar si es entrada o salida para este usuario
              // Como la API trae todo, simularemos que si el tipo es 'Pago de servicio' es salida.
              // Para una transferencia, si la cuenta origen es del usuario, es salida.
              // Para simplificar la vista, si es 'Transferencia' asumiremos salida por defecto a menos que sepamos la cuenta exacta.
              // En un banco real compararíamos cuenta_origen_id con la cuenta actual seleccionada.
              const esSalida = m.tipo === 'Pago de servicio' || m.tipo === 'Transferencia';

              return (
                <MovementItem 
                  key={m.id}
                  desc={m.concepto} 
                  date={new Date(m.fecha).toLocaleDateString()} 
                  amount={`${esSalida ? '-' : '+'}$${parseFloat(m.monto).toFixed(2)}`} 
                  type={esSalida ? 'out' : 'in'} 
                />
              )
            })
          )}
        </div>
      </div>

    </div>
  );
};

const AccountCard = ({ title, number, balance }) => (
  <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 hover:shadow-md transition-shadow relative overflow-hidden">
    <div className="absolute top-0 right-0 p-4 opacity-10">
      <Wallet size={64} />
    </div>
    <div className="flex items-center space-x-3 mb-6 relative z-10">
      <div className="bg-blue-100 p-2 rounded-lg text-blue-600">
        <Wallet size={20} />
      </div>
      <div>
        <h4 className="font-bold text-gray-800 text-sm">{title}</h4>
        <p className="text-xs text-gray-500">{number}</p>
      </div>
    </div>
    <div className="relative z-10 flex justify-between items-end">
      <div>
        <p className="text-2xl font-bold text-gray-900">{balance}</p>
        <p className="text-xs text-gray-500">Saldo disponible</p>
      </div>
      <button className="bg-blue-50 p-2 rounded-full text-blue-600 hover:bg-blue-100 transition-colors">
        <ArrowRight size={16} />
      </button>
    </div>
  </div>
);

const MovementItem = ({ desc, date, amount, type }) => (
  <div className="flex justify-between items-center py-3 border-b border-gray-50 last:border-0">
    <div className="flex items-center space-x-4">
      <div className={`w-10 h-10 rounded-full flex items-center justify-center ${type === 'in' ? 'bg-green-100 text-green-600' : 'bg-red-100 text-red-600'}`}>
        {type === 'in' ? <ArrowDownRight size={20} /> : <ArrowUpRight size={20} />}
      </div>
      <div>
        <p className="font-bold text-sm text-gray-800">{desc}</p>
        <p className="text-xs text-gray-500">{date}</p>
      </div>
    </div>
    <p className={`font-bold text-sm ${type === 'in' ? 'text-green-600' : 'text-gray-800'}`}>
      {amount}
    </p>
  </div>
);

export default Cuentas;
