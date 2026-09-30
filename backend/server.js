const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');
require('dotenv').config();

const db = require('./db');

const app = express();
const PORT = process.env.PORT || 5000;

// ==========================================
// MIDDLEWARES DE SEGURIDAD (ANTI-CAÍDAS)
// ==========================================

// 1. Helmet: Protege modificando las cabeceras HTTP (oculta que usas Express, previene XSS, etc)
app.use(helmet());

// 2. CORS: Define quién puede hacer peticiones a tu API (por ahora abierto, en prod se restringe)
app.use(cors());

// 3. Parseador de JSON (para leer el body de las peticiones)
app.use(express.json({ limit: '10kb' })); // Límite de tamaño para evitar ataques de payload masivo

// 4. Rate Limiter: Previene ataques DDoS o de fuerza bruta limitando peticiones por IP
const limiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutos
    max: 100, // Límite de 100 peticiones por IP por cada ventana de 15 min
    message: 'Demasiadas peticiones desde esta IP, por favor intenta de nuevo más tarde.',
    standardHeaders: true,
    legacyHeaders: false,
});
// Aplicar a todas las rutas
app.use(limiter);


// ==========================================
// RUTAS DE LA API (Endpoints)
// ==========================================

const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');

// Ruta de prueba
app.get('/api/health', (req, res) => {
    res.json({ status: 'OK', message: 'Servidor del Banco funcionando de forma segura.' });
});

// --- AUTENTICACIÓN ---

// Registro de Usuario
app.post('/api/auth/register', async (req, res) => {
    try {
        const { nombre, apellidos, correo, password } = req.body;
        
        // Hashear la contraseña por seguridad
        const salt = await bcrypt.genSalt(10);
        const passwordHash = await bcrypt.hash(password, salt);
        
        // Insertar en la BD
        const [result] = await db.execute(
            'INSERT INTO Usuarios (nombre, apellidos, correo, password_hash) VALUES (?, ?, ?, ?)',
            [nombre, apellidos, correo, passwordHash]
        );
        
        // Crear una cuenta de nómina por defecto
        const userId = result.insertId;
        const numCuenta = Math.floor(100000000000 + Math.random() * 900000000000).toString(); // 12 digitos
        const clabe = '012' + numCuenta + '123';
        await db.execute(
            'INSERT INTO Cuentas (usuario_id, tipo, numero_cuenta, clabe, saldo) VALUES (?, ?, ?, ?, ?)',
            [userId, 'Nómina', numCuenta, clabe, 5000.00]
        );

        res.status(201).json({ message: 'Usuario registrado exitosamente.' });
    } catch (error) {
        console.error(error);
        if (error.code === 'ER_DUP_ENTRY') {
            return res.status(400).json({ error: 'El correo ya está registrado.' });
        }
        res.status(500).json({ error: 'Error al registrar usuario.' });
    }
});

// Inicio de Sesión (Login)
app.post('/api/auth/login', async (req, res) => {
    try {
        const { correo, password } = req.body;

        // Buscar usuario
        const [users] = await db.execute('SELECT * FROM Usuarios WHERE correo = ?', [correo]);
        if (users.length === 0) {
            return res.status(401).json({ error: 'Credenciales inválidas.' });
        }
        
        const user = users[0];
        
        // Verificar contraseña
        const validPassword = await bcrypt.compare(password, user.password_hash);
        if (!validPassword) {
            return res.status(401).json({ error: 'Credenciales inválidas.' });
        }
        
        // Generar Token JWT
        const token = jwt.sign({ id: user.id }, process.env.JWT_SECRET, { expiresIn: '1h' });
        
        res.json({ token, userId: user.id, nombre: user.nombre });
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Error al iniciar sesión.' });
    }
});

// Endpoint para obtener la información principal del usuario (Dashboard)
app.get('/api/dashboard/:userId', async (req, res) => {
    try {
        const { userId } = req.params;
        
        // Usamos consultas parametrizadas (?) para EVITAR SQL INJECTION
        const [usuarios] = await db.execute('SELECT id, nombre, apellidos FROM Usuarios WHERE id = ?', [userId]);
        
        if (usuarios.length === 0) {
            return res.status(404).json({ error: 'Usuario no encontrado' });
        }
        
        const [cuentas] = await db.execute('SELECT id, tipo, numero_cuenta, clabe, saldo FROM Cuentas WHERE usuario_id = ?', [userId]);
        
        res.json({
            usuario: usuarios[0],
            cuentas: cuentas
        });

    } catch (error) {
        console.error('Error en /api/dashboard:', error);
        res.status(500).json({ error: 'Error interno del servidor' });
    }
});

// Endpoint para obtener transacciones de un usuario específico
app.get('/api/transferencias/:userId', async (req, res) => {
    try {
        const { userId } = req.params;
        
        // Obtener cuentas del usuario
        const [cuentas] = await db.execute('SELECT id FROM Cuentas WHERE usuario_id = ?', [userId]);
        if (cuentas.length === 0) return res.json([]);
        
        const idsCuentas = cuentas.map(c => c.id).join(',');
        
        const [transacciones] = await db.execute(`
            SELECT t.id, t.monto, t.tipo, t.concepto, t.fecha, t.estado, 
                   t.cuenta_origen_id, t.cuenta_destino_id
            FROM Transacciones t
            WHERE t.cuenta_origen_id IN (${idsCuentas}) OR t.cuenta_destino_id IN (${idsCuentas})
            ORDER BY t.fecha DESC LIMIT 20
        `);
        
        res.json(transacciones);
    } catch (error) {
        console.error('Error:', error);
        res.status(500).json({ error: 'Error al obtener historial' });
    }
});

// Endpoint para Transferir Dinero (Transacción segura)
app.post('/api/transferir', async (req, res) => {
    const connection = await db.getConnection();
    try {
        const { usuarioId, numeroCuentaDestino, monto, concepto } = req.body;
        
        if (monto <= 0) return res.status(400).json({ error: 'Monto inválido' });

        // Iniciar transacción de base de datos
        await connection.beginTransaction();

        // 1. Obtener la cuenta origen del usuario (la primera que tenga saldo)
        const [cuentasOrigen] = await connection.execute('SELECT id, saldo FROM Cuentas WHERE usuario_id = ? AND saldo >= ? LIMIT 1', [usuarioId, monto]);
        
        if (cuentasOrigen.length === 0) {
            await connection.rollback();
            return res.status(400).json({ error: 'Fondos insuficientes.' });
        }
        const cuentaOrigen = cuentasOrigen[0];

        // 2. Obtener cuenta destino
        const [cuentasDestino] = await connection.execute('SELECT id FROM Cuentas WHERE numero_cuenta = ?', [numeroCuentaDestino]);
        
        if (cuentasDestino.length === 0) {
            await connection.rollback();
            return res.status(404).json({ error: 'La cuenta destino no existe.' });
        }
        const cuentaDestino = cuentasDestino[0];

        // 3. Restar saldo origen
        await connection.execute('UPDATE Cuentas SET saldo = saldo - ? WHERE id = ?', [monto, cuentaOrigen.id]);
        
        // 4. Sumar saldo destino
        await connection.execute('UPDATE Cuentas SET saldo = saldo + ? WHERE id = ?', [monto, cuentaDestino.id]);

        // 5. Registrar la transacción
        await connection.execute(
            'INSERT INTO Transacciones (cuenta_origen_id, cuenta_destino_id, monto, tipo, concepto) VALUES (?, ?, ?, ?, ?)',
            [cuentaOrigen.id, cuentaDestino.id, monto, 'Transferencia', concepto]
        );

        // Confirmar cambios
        await connection.commit();
        res.json({ message: 'Transferencia completada con éxito' });

    } catch (error) {
        await connection.rollback();
        console.error('Error en transferencia:', error);
        res.status(500).json({ error: 'Error interno al procesar la transferencia' });
    } finally {
        connection.release();
    }
});

// Endpoint para obtener las tarjetas del usuario
app.get('/api/tarjetas/:userId', async (req, res) => {
    try {
        const { userId } = req.params;
        
        const [tarjetas] = await db.execute(`
            SELECT t.id, t.numero_tarjeta, t.tipo, t.fecha_expiracion, t.limite_credito, t.estado, c.saldo 
            FROM Tarjetas t
            JOIN Cuentas c ON t.cuenta_id = c.id
            WHERE c.usuario_id = ?
        `, [userId]);
        
        res.json(tarjetas);
    } catch (error) {
        console.error('Error:', error);
        res.status(500).json({ error: 'Error al obtener tarjetas' });
    }
});

// Endpoint para agregar una nueva tarjeta
app.post('/api/tarjetas', async (req, res) => {
    try {
        const { usuarioId, numeroTarjeta, tipo, fechaExpiracion, limiteCredito } = req.body;
        
        // Buscar la cuenta principal del usuario para asociarle la tarjeta
        const [cuentas] = await db.execute('SELECT id FROM Cuentas WHERE usuario_id = ? LIMIT 1', [usuarioId]);
        if (cuentas.length === 0) {
            return res.status(404).json({ error: 'Usuario no tiene cuenta bancaria' });
        }
        
        const cuentaId = cuentas[0].id;
        
        await db.execute(
            'INSERT INTO Tarjetas (cuenta_id, numero_tarjeta, tipo, fecha_expiracion, limite_credito) VALUES (?, ?, ?, ?, ?)',
            [cuentaId, numeroTarjeta, tipo, fechaExpiracion, limiteCredito || null]
        );
        
        res.status(201).json({ message: 'Tarjeta agregada con éxito' });
    } catch (error) {
        console.error('Error:', error);
        if (error.code === 'ER_DUP_ENTRY') {
            return res.status(400).json({ error: 'Esta tarjeta ya está registrada' });
        }
        res.status(500).json({ error: 'Error al agregar tarjeta' });
    }
});

// Endpoint para obtener el historial de pagos de servicios
app.get('/api/pagos/:userId', async (req, res) => {
    try {
        const { userId } = req.params;
        
        // Obtener cuentas del usuario
        const [cuentas] = await db.execute('SELECT id FROM Cuentas WHERE usuario_id = ?', [userId]);
        if (cuentas.length === 0) return res.json([]);
        
        const idsCuentas = cuentas.map(c => c.id).join(',');
        
        const [pagos] = await db.execute(`
            SELECT t.id, t.monto, t.concepto, t.fecha, t.estado 
            FROM Transacciones t
            WHERE t.cuenta_origen_id IN (${idsCuentas}) AND t.tipo = 'Pago de servicio'
            ORDER BY t.fecha DESC LIMIT 20
        `);
        
        res.json(pagos);
    } catch (error) {
        console.error('Error:', error);
        res.status(500).json({ error: 'Error al obtener pagos' });
    }
});

// Endpoint para procesar un pago de servicio
app.post('/api/pagos', async (req, res) => {
    const connection = await db.getConnection();
    try {
        const { usuarioId, servicio, monto, referencia } = req.body;
        
        if (monto <= 0) return res.status(400).json({ error: 'Monto inválido' });

        await connection.beginTransaction();

        // Obtener cuenta origen con saldo
        const [cuentasOrigen] = await connection.execute('SELECT id, saldo FROM Cuentas WHERE usuario_id = ? AND saldo >= ? LIMIT 1', [usuarioId, monto]);
        
        if (cuentasOrigen.length === 0) {
            await connection.rollback();
            return res.status(400).json({ error: 'Fondos insuficientes para realizar el pago.' });
        }
        const cuenta = cuentasOrigen[0];

        // Restar saldo
        await connection.execute('UPDATE Cuentas SET saldo = saldo - ? WHERE id = ?', [monto, cuenta.id]);

        // Registrar el pago
        const conceptoFinal = `Pago de ${servicio} (Ref: ${referencia})`;
        await connection.execute(
            'INSERT INTO Transacciones (cuenta_origen_id, monto, tipo, concepto) VALUES (?, ?, ?, ?)',
            [cuenta.id, monto, 'Pago de servicio', conceptoFinal]
        );

        await connection.commit();
        res.json({ message: 'Pago realizado con éxito' });

    } catch (error) {
        await connection.rollback();
        console.error('Error en pago:', error);
        res.status(500).json({ error: 'Error al procesar el pago' });
    } finally {
        connection.release();
    }
});

// Endpoint para panel de administrador
app.get('/api/admin/stats', async (req, res) => {
    try {
        // Obtener total de usuarios
        const [users] = await db.execute('SELECT COUNT(*) as total FROM Usuarios');
        
        // Obtener total de dinero en el banco
        const [saldos] = await db.execute('SELECT SUM(saldo) as total_dinero FROM Cuentas');
        
        // Obtener lista de todos los usuarios con su saldo
        const [listaUsuarios] = await db.execute(`
            SELECT u.id, u.nombre, u.apellidos, u.correo, c.numero_cuenta, c.saldo 
            FROM Usuarios u
            LEFT JOIN Cuentas c ON u.id = c.usuario_id
            ORDER BY u.id DESC
        `);

        // Obtener todas las transacciones globales recientes
        const [transacciones] = await db.execute(`
            SELECT t.id, t.monto, t.tipo, t.fecha, u.nombre as cliente
            FROM Transacciones t
            JOIN Cuentas c ON t.cuenta_origen_id = c.id
            JOIN Usuarios u ON c.usuario_id = u.id
            ORDER BY t.fecha DESC LIMIT 10
        `);

        res.json({
            totalUsuarios: users[0].total,
            dineroTotal: saldos[0].total_dinero || 0,
            usuarios: listaUsuarios,
            transaccionesRecientes: transacciones
        });
    } catch (error) {
        console.error('Error admin stats:', error);
        res.status(500).json({ error: 'Error al obtener datos de administrador' });
    }
});

// Endpoint para que el admin regale o quite dinero (modificar saldo)
app.post('/api/admin/saldo', async (req, res) => {
    try {
        const { cuenta_numero, nuevo_saldo } = req.body;
        
        await db.execute('UPDATE Cuentas SET saldo = ? WHERE numero_cuenta = ?', [nuevo_saldo, cuenta_numero]);
        
        res.json({ message: 'Saldo actualizado correctamente' });
    } catch (error) {
        console.error('Error al modificar saldo:', error);
        res.status(500).json({ error: 'Error al actualizar el saldo' });
    }
});

// ==========================================
// INICIAR SERVIDOR
// ==========================================
app.listen(PORT, () => {
    console.log(`\n=================================================`);
    console.log(`🚀 Servidor Seguro de MiBanco corriendo en puerto ${PORT}`);
    console.log(`🔒 Helmet Activado | Rate Limit Activado | CORS Activado`);
    console.log(`=================================================\n`);
});
