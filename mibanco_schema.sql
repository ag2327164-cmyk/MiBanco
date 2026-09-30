-- Script para inicializar la base de datos de MiBanco
-- Ejecuta esto en MySQL Workbench

CREATE DATABASE IF NOT EXISTS mibanco;
USE mibanco;

-- Tabla de Usuarios
CREATE TABLE Usuarios (
    id INT AUTO_INCREMENT PRIMARY KEY,
    nombre VARCHAR(100) NOT NULL,
    apellidos VARCHAR(100) NOT NULL,
    correo VARCHAR(150) UNIQUE NOT NULL,
    password_hash VARCHAR(255) NOT NULL, -- Aquí se guardarán contraseñas encriptadas (bcrypt)
    fecha_creacion TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Tabla de Cuentas Bancarias
CREATE TABLE Cuentas (
    id INT AUTO_INCREMENT PRIMARY KEY,
    usuario_id INT NOT NULL,
    tipo ENUM('Nómina', 'Ahorro', 'Dólares') NOT NULL,
    numero_cuenta VARCHAR(20) UNIQUE NOT NULL,
    clabe VARCHAR(18) UNIQUE NOT NULL,
    saldo DECIMAL(15, 2) DEFAULT 0.00,
    fecha_creacion TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (usuario_id) REFERENCES Usuarios(id) ON DELETE CASCADE
);

-- Tabla de Tarjetas (Crédito y Débito)
CREATE TABLE Tarjetas (
    id INT AUTO_INCREMENT PRIMARY KEY,
    cuenta_id INT NOT NULL,
    numero_tarjeta VARCHAR(16) UNIQUE NOT NULL,
    tipo ENUM('Débito', 'Crédito') NOT NULL,
    fecha_expiracion VARCHAR(5) NOT NULL, -- Formato MM/YY
    limite_credito DECIMAL(15, 2) DEFAULT NULL, -- Solo aplica para Crédito
    estado ENUM('Activa', 'Bloqueada temporalmente', 'Cancelada') DEFAULT 'Activa',
    fecha_emision TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (cuenta_id) REFERENCES Cuentas(id) ON DELETE CASCADE
);

-- Tabla de Transacciones (Historial y Movimientos)
CREATE TABLE Transacciones (
    id INT AUTO_INCREMENT PRIMARY KEY,
    cuenta_origen_id INT, -- Nulo si es un depósito externo
    cuenta_destino_id INT, -- Nulo si es un retiro o pago de servicio externo
    monto DECIMAL(15, 2) NOT NULL,
    tipo ENUM('Depósito', 'Retiro', 'Transferencia', 'Pago de servicio') NOT NULL,
    concepto VARCHAR(255) NOT NULL, -- Ej: "Pago de luz CFE", "Transferencia a María"
    fecha TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    estado ENUM('Completada', 'Pendiente', 'Rechazada') DEFAULT 'Completada',
    FOREIGN KEY (cuenta_origen_id) REFERENCES Cuentas(id),
    FOREIGN KEY (cuenta_destino_id) REFERENCES Cuentas(id)
);

-- ==========================================
-- DATOS DE PRUEBA (MOCK DATA) PARA EL DISEÑO
-- ==========================================

-- 1. Insertar un usuario de prueba
INSERT INTO Usuarios (nombre, apellidos, correo, password_hash) 
VALUES ('Gonza', 'Admin', 'admin@mibanco.com', '$2b$10$EjemploDeHashBcryptGeneradoParaContrasena123');
SET @usuario_id = LAST_INSERT_ID();

-- 2. Insertar cuentas basadas en la imagen
INSERT INTO Cuentas (usuario_id, tipo, numero_cuenta, clabe, saldo) VALUES 
(@usuario_id, 'Nómina', '123456784582', '012345678912345821', 12450.00),
(@usuario_id, 'Ahorro', '123456787201', '012345678912347201', 5320.00),
(@usuario_id, 'Dólares', '123456781938', '012345678912341938', 2180.00);

-- Obtener el ID de la cuenta de nómina para asociarle una tarjeta
SET @cuenta_nomina_id = (SELECT id FROM Cuentas WHERE numero_cuenta = '123456784582' LIMIT 1);

-- 3. Insertar tarjeta de crédito basada en la imagen
INSERT INTO Tarjetas (cuenta_id, numero_tarjeta, tipo, fecha_expiracion, limite_credito) VALUES
(@cuenta_nomina_id, '4532123456784552', 'Crédito', '12/28', 28750.00);

-- 4. Insertar algunas transacciones recientes
INSERT INTO Transacciones (cuenta_destino_id, monto, tipo, concepto) VALUES
(@cuenta_nomina_id, 12450.00, 'Depósito', 'Depósito nómina');

INSERT INTO Transacciones (cuenta_origen_id, monto, tipo, concepto) VALUES
(@cuenta_nomina_id, 2350.00, 'Pago de servicio', 'Pago de tarjeta');

INSERT INTO Transacciones (cuenta_origen_id, monto, tipo, concepto) VALUES
(@cuenta_nomina_id, 1000.00, 'Transferencia', 'Transferencia a cuenta');

-- Confirmar que los datos se insertaron correctamente
-- SELECT * FROM Usuarios;
-- SELECT * FROM Cuentas;
-- SELECT * FROM Tarjetas;
-- SELECT * FROM Transacciones;
