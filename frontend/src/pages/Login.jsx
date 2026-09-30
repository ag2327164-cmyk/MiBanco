import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { Lock, Mail, User as UserIcon } from 'lucide-react';

const Login = ({ onLogin }) => {
  const [isRegistering, setIsRegistering] = useState(false);
  const [nombre, setNombre] = useState('');
  const [apellidos, setApellidos] = useState('');
  const [correo, setCorreo] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    try {
      if (isRegistering) {
        // Modo Registro
        await axios.post(`http://${window.location.hostname}:5000/api/auth/register`, {
          nombre, apellidos, correo, password
        });
        setSuccess('¡Cuenta creada con éxito! Ahora puedes iniciar sesión.');
        setIsRegistering(false);
        setPassword('');
      } else {
        // Modo Login
        const response = await axios.post(`http://${window.location.hostname}:5000/api/auth/login`, {
          correo, password
        });
        
        const { token, userId, nombre: nombreUser } = response.data;
        
        localStorage.setItem('token', token);
        localStorage.setItem('userId', userId);
        localStorage.setItem('nombre', nombreUser);
        localStorage.setItem('correo', correo); // Para panel admin
        
        onLogin(true);
        navigate('/');
      }
    } catch (err) {
      if (err.response && err.response.data && err.response.data.error) {
        setError(err.response.data.error);
      } else {
        setError('Ocurrió un error de conexión con el servidor.');
      }
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-mibanco-bg p-4">
      <div className="bg-white rounded-3xl shadow-xl overflow-hidden w-full max-w-4xl flex">
        
        {/* Panel Decorativo */}
        <div className="w-1/2 bg-[#0f172a] p-12 text-white flex flex-col justify-between relative overflow-hidden hidden md:flex">
          <div className="absolute top-0 right-0 w-64 h-64 bg-blue-600 opacity-20 rounded-full -mr-32 -mt-32 blur-3xl"></div>
          <div className="absolute bottom-0 left-0 w-64 h-64 bg-blue-400 opacity-20 rounded-full -ml-32 -mb-32 blur-3xl"></div>
          
          <div className="z-10 relative">
             <div className="flex items-center space-x-3 mb-12">
              <div className="bg-white rounded-full p-1">
                <div className="w-6 h-6 border-t-4 border-l-4 border-blue-600 rounded-sm transform rotate-45"></div>
              </div>
              <span className="text-2xl font-bold tracking-wide">MiBanco</span>
            </div>
            
            <h2 className="text-4xl font-bold mb-6">Tu dinero, <br/><span className="text-blue-400">seguro y contigo.</span></h2>
            <p className="text-gray-300">Accede a la plataforma más moderna para gestionar tus finanzas personales desde cualquier lugar del mundo.</p>
          </div>
          
          <div className="text-sm text-gray-500 z-10">
            © 2026 MiBanco Inc. Todos los derechos reservados.
          </div>
        </div>

        {/* Panel de Formulario */}
        <div className="w-full md:w-1/2 p-12 flex flex-col justify-center">
          <h2 className="text-3xl font-bold text-gray-900 mb-2">
            {isRegistering ? 'Crea tu cuenta' : 'Bienvenido de nuevo'}
          </h2>
          <p className="text-gray-500 mb-8">
            {isRegistering ? 'Ingresa tus datos para registrarte.' : 'Ingresa tus credenciales para acceder a tu cuenta.'}
          </p>
          
          {error && <div className="bg-red-50 text-red-600 p-4 rounded-lg mb-6 text-sm">{error}</div>}
          {success && <div className="bg-green-50 text-green-600 p-4 rounded-lg mb-6 text-sm">{success}</div>}

          <form onSubmit={handleSubmit} className="space-y-4">
            
            {isRegistering && (
              <div className="flex space-x-4">
                <div className="w-1/2">
                  <label className="block text-sm font-medium text-gray-700 mb-2">Nombre</label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      <UserIcon size={20} className="text-gray-400" />
                    </div>
                    <input type="text" required value={nombre} onChange={(e) => setNombre(e.target.value)} className="w-full pl-10 pr-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-600 outline-none" placeholder="Juan" />
                  </div>
                </div>
                <div className="w-1/2">
                  <label className="block text-sm font-medium text-gray-700 mb-2">Apellidos</label>
                  <input type="text" required value={apellidos} onChange={(e) => setApellidos(e.target.value)} className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-600 outline-none" placeholder="Pérez" />
                </div>
              </div>
            )}

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Correo electrónico</label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Mail size={20} className="text-gray-400" />
                </div>
                <input 
                  type="email" 
                  required
                  value={correo}
                  onChange={(e) => setCorreo(e.target.value)}
                  className="w-full pl-10 pr-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-600 outline-none transition-all"
                  placeholder="ejemplo@mibanco.com"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Contraseña</label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Lock size={20} className="text-gray-400" />
                </div>
                <input 
                  type="password" 
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full pl-10 pr-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-600 outline-none transition-all"
                  placeholder="••••••••"
                />
              </div>
              {!isRegistering && (
                <div className="flex justify-end mt-2">
                  <a href="#" className="text-sm text-blue-600 hover:underline">¿Olvidaste tu contraseña?</a>
                </div>
              )}
            </div>

            <button type="submit" className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 px-4 rounded-xl transition-colors shadow-lg shadow-blue-200 mt-4">
              {isRegistering ? 'Registrarme' : 'Iniciar Sesión'}
            </button>
          </form>
          
          <p className="text-center mt-8 text-sm text-gray-500">
            {isRegistering ? '¿Ya tienes cuenta?' : '¿No tienes cuenta?'} 
            <span 
              onClick={() => { setIsRegistering(!isRegistering); setError(''); setSuccess(''); }} 
              className="text-blue-600 font-medium cursor-pointer hover:underline ml-1"
            >
              {isRegistering ? 'Inicia sesión aquí' : 'Regístrate aquí'}
            </span>
          </p>
        </div>
      </div>
    </div>
  );
};

export default Login;
