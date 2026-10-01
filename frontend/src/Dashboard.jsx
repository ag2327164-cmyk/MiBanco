import React, { useState, useEffect } from 'react';
import { ArrowRight, Send, Receipt, Smartphone, Banknote, CreditCard as CardIcon, CheckCircle } from 'lucide-react';
import axios from 'axios';
import { Link } from 'react-router-dom';

const Dashboard = () => {
  const [userData, setUserData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [showRetiroModal, setShowRetiroModal] = useState(false);
  const [showAppModal, setShowAppModal] = useState(false);
  const [codigoRetiro, setCodigoRetiro] = useState(null);

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        const userId = localStorage.getItem('userId');
        if (userId) {
          const response = await axios.get(`https://mibanco-ron5.onrender.com/api/dashboard/${userId}`);
          setUserData(response.data);
        }
      } catch (error) {
        console.error("Error fetching data:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchDashboardData();
  }, []);

  const cuentaNomina = userData?.cuentas?.find(c => c.tipo === 'Nómina') || userData?.cuentas?.[0];

  const generarCodigoRetiro = () => {
    const code = Math.floor(1000000000 + Math.random() * 9000000000).toString(); // 10 dígitos
    setCodigoRetiro(code);
  };

  if (loading) return <div className="p-8 text-center text-gray-500">Cargando tus datos...</div>;

  return (
    <div className="max-w-6xl mx-auto space-y-8 relative">
      
      {/* Welcome Banner */}
      <div className="bg-[#0f172a] rounded-2xl p-8 flex justify-between items-center text-white shadow-lg relative overflow-hidden">
        {/* Background decorative image placeholder */}
        <div className="absolute right-0 top-0 bottom-0 w-1/2 opacity-30 bg-gradient-to-l from-blue-900 to-transparent"></div>
        
        <div className="relative z-10">
          <h1 className="text-4xl font-bold mb-2">Hola, bienvenido a</h1>
          <h1 className="text-4xl font-bold text-blue-400 mb-4">tu banco en línea</h1>
          <p className="text-gray-300 max-w-md">Controla tus finanzas, realiza tus operaciones y alcanza tus metas, todo en un solo lugar.</p>
          <Link to="/cuentas" className="inline-block mt-6 bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded-full font-medium transition-colors">
            Ver mis cuentas
          </Link>
        </div>

        <div className="relative z-10 bg-[#1e293b] rounded-xl p-6 min-w-[300px]">
          <p className="text-gray-400 text-sm mb-1">Cuenta de nómina</p>
          <p className="text-sm mb-4">**** {cuentaNomina ? cuentaNomina.numero_cuenta.slice(-4) : '4582'}</p>
          <div className="flex justify-between items-center">
            <h2 className="text-3xl font-bold">${cuentaNomina ? parseFloat(cuentaNomina.saldo).toFixed(2) : '0.00'}</h2>
            <Link to="/cuentas" className="bg-blue-600 p-2 rounded-full hover:bg-blue-500 transition-colors inline-block">
              <ArrowRight size={20} />
            </Link>
          </div>
          <Link to="/cuentas" className="inline-block mt-6 text-blue-400 text-sm hover:underline">Ver todas mis cuentas</Link>
        </div>
      </div>

      {/* Quick Actions */}
      <div className="bg-white rounded-2xl p-6 shadow-sm flex justify-between">
        <Link to="/transferencias" className="w-1/5"><ActionItem icon={<Send size={24} className="text-blue-600" />} label="Transferir" /></Link>
        <Link to="/pagos" className="w-1/5"><ActionItem icon={<Receipt size={24} className="text-blue-600" />} label="Pagar servicios" /></Link>
        <Link to="/pagos" className="w-1/5"><ActionItem icon={<Smartphone size={24} className="text-blue-600" />} label="Recargar celular" /></Link>
        <div onClick={() => setShowRetiroModal(true)} className="w-1/5"><ActionItem icon={<Banknote size={24} className="text-blue-600" />} label="Retirar sin tarjeta" /></div>
        <Link to="/tarjetas" className="w-1/5"><ActionItem icon={<CardIcon size={24} className="text-blue-600" />} label="Administrar tarjetas" /></Link>
      </div>

      {/* Products */}
      <div>
        <h3 className="text-xl font-bold mb-4">Tus productos</h3>
        <div className="grid grid-cols-5 gap-4">
          <ProductCard title="Cuentas" desc="La cuenta que se adapta a ti." to="/cuentas" />
          <ProductCard title="Tarjetas" desc="Crédito o débito, tú eliges." to="/tarjetas" />
          <ProductCard title="Créditos" desc="Haz realidad tus proyectos." to="/creditos" />
          <ProductCard title="Inversiones" desc="Haz crecer tu dinero." to="/inversiones" />
          <ProductCard title="Seguros" desc="Protege lo que más te importa." to="/seguros" />
        </div>
      </div>

      {/* App Promo Banner */}
      <div className="bg-[#0f172a] rounded-2xl p-8 flex justify-between items-center text-white shadow-lg overflow-hidden">
        <div>
          <h3 className="text-2xl font-bold mb-2">Descarga nuestra app</h3>
          <p className="text-gray-300 mb-6 max-w-md">Realiza tus operaciones desde donde estés, de forma fácil y segura.</p>
          <button onClick={() => setShowAppModal(true)} className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded-full font-medium transition-colors">
            Conocer más
          </button>
        </div>
        <div className="mr-12 transform translate-y-8">
          {/* Mockup phone */}
          <div className="w-48 h-64 border-4 border-gray-800 rounded-t-3xl bg-blue-900 p-2 shadow-2xl relative">
             <div className="w-16 h-4 bg-gray-900 rounded-b-xl mx-auto absolute top-0 left-1/2 transform -translate-x-1/2"></div>
             <div className="mt-8 text-center">
                <p className="text-xs text-blue-200">Saldo disponible</p>
                <p className="text-xl font-bold">${cuentaNomina ? parseFloat(cuentaNomina.saldo).toFixed(2) : '0.00'}</p>
             </div>
          </div>
        </div>
      </div>

      {/* Modal Retiro sin Tarjeta */}
      {showRetiroModal && (
        <div className="absolute inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50 h-[800px] -m-8">
          <div className="bg-white rounded-2xl p-8 w-[400px] shadow-2xl text-center">
            <div className="bg-blue-50 w-16 h-16 rounded-full flex items-center justify-center text-blue-600 mb-6 mx-auto">
              <Banknote size={32} />
            </div>
            <h2 className="text-2xl font-bold mb-2">Retiro sin tarjeta</h2>
            
            {!codigoRetiro ? (
              <>
                <p className="text-gray-500 mb-6">Genera un código para retirar efectivo en cualquier cajero automático de MiBanco.</p>
                <button onClick={generarCodigoRetiro} className="w-full bg-blue-600 text-white rounded-xl py-3 hover:bg-blue-700 font-bold shadow-md mb-4">Generar código</button>
              </>
            ) : (
              <>
                <p className="text-gray-500 mb-4">Ingresa este código de 10 dígitos en el cajero automático:</p>
                <div className="bg-gray-100 p-4 rounded-xl text-3xl font-mono font-bold tracking-widest text-gray-800 mb-6">
                  {codigoRetiro}
                </div>
                <p className="text-xs text-red-500 mb-6">Este código expira en 30 minutos.</p>
              </>
            )}
            
            <button onClick={() => { setShowRetiroModal(false); setCodigoRetiro(null); }} className="w-full py-2 border border-gray-300 rounded-xl text-gray-700 hover:bg-gray-50">Cerrar</button>
          </div>
        </div>
      )}

      {/* Modal App */}
      {showAppModal && (
        <div className="absolute inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50 h-[800px] -m-8">
          <div className="bg-white rounded-2xl p-8 w-[400px] shadow-2xl text-center">
            <div className="bg-blue-50 w-16 h-16 rounded-full flex items-center justify-center text-blue-600 mb-6 mx-auto">
              <Smartphone size={32} />
            </div>
            <h2 className="text-2xl font-bold mb-2">Próximamente</h2>
            <p className="text-gray-500 mb-6">Nuestra aplicación móvil estará disponible muy pronto en la App Store y Google Play Store.</p>
            <button onClick={() => setShowAppModal(false)} className="w-full bg-blue-600 text-white rounded-xl py-3 hover:bg-blue-700 font-bold shadow-md">Entendido</button>
          </div>
        </div>
      )}

    </div>
  );
};

const ActionItem = ({ icon, label }) => (
  <div className="flex flex-col items-center justify-center p-4 hover:bg-gray-50 rounded-xl cursor-pointer transition-colors w-full text-center">
    <div className="bg-blue-50 p-4 rounded-2xl mb-3">
      {icon}
    </div>
    <span className="text-sm font-medium text-gray-700">{label}</span>
  </div>
);

const ProductCard = ({ title, desc, to }) => (
  <Link to={to} className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 hover:shadow-md transition-shadow block">
    <div className="bg-blue-50 w-10 h-10 rounded-lg flex items-center justify-center mb-4 text-blue-600">
      <CardIcon size={20} />
    </div>
    <h4 className="font-bold mb-2">{title}</h4>
    <p className="text-sm text-gray-500 mb-4 h-10">{desc}</p>
    <div className="text-blue-600 text-sm font-medium flex items-center hover:underline">
      Ver {title.toLowerCase()} <ArrowRight size={16} className="ml-1" />
    </div>
  </Link>
);

export default Dashboard;
