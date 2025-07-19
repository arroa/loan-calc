// ========================================
// CONFIGURACIÓN CENTRALIZADA
// ========================================

import dotenv from 'dotenv';

// Cargar variables de entorno
dotenv.config();

// ========================================
// CONFIGURACIÓN DEL SERVIDOR
// ========================================

export const SERVER_CONFIG = {
  PORT: process.env.PORT || 3001,
  NODE_ENV: process.env.NODE_ENV || 'development',
  VITE_PORT: process.env.VITE_PORT || 5173,
};

// ========================================
// CONFIGURACIÓN DE APIS
// ========================================

export const API_CONFIG = {
  GEMINI_API_KEY: process.env.GEMINI_API_KEY,
  CMF_API_KEY: process.env.CMF_API_KEY,
  BC_USER: process.env.BC_USER,
  BC_PASS: process.env.BC_PASS,
  BC_API_BASE: process.env.BC_API_BASE || 'https://si3.bcentral.cl/SieteRestWS/SieteRestWS.ashx',
};

// ========================================
// CONFIGURACIÓN DE LÍMITES
// ========================================

export const LIMITS_CONFIG = {
  MAX_LOAN_AMOUNT: parseInt(process.env.MAX_LOAN_AMOUNT) || 50000000,
  MIN_LOAN_AMOUNT: parseInt(process.env.MIN_LOAN_AMOUNT) || 100000,
  MAX_TERM: parseInt(process.env.MAX_TERM) || 120,
  MIN_TERM: parseInt(process.env.MIN_TERM) || 6,
  MIN_MONTHLY_RATE: parseFloat(process.env.MIN_MONTHLY_RATE) || 0.1,
  MAX_MONTHLY_RATE: parseFloat(process.env.MAX_MONTHLY_RATE) || 20.0,
};

// ========================================
// CONFIGURACIÓN DE SEGURIDAD
// ========================================

export const SECURITY_CONFIG = {
  JWT_SECRET: process.env.JWT_SECRET || 'default-secret-change-in-production',
  JWT_EXPIRES_IN: parseInt(process.env.JWT_EXPIRES_IN) || 86400,
  ALLOWED_ORIGINS: process.env.ALLOWED_ORIGINS?.split(',') || [
    'http://localhost:3000',
    'http://localhost:5173',
    'http://localhost:4173'
  ],
};

// ========================================
// CONFIGURACIÓN DE LOGGING
// ========================================

export const LOGGING_CONFIG = {
  LOG_LEVEL: process.env.LOG_LEVEL || 'info',
  LOG_FILE: process.env.LOG_FILE || 'logs/app.log',
};

// ========================================
// CONFIGURACIÓN DE CACHE
// ========================================

export const CACHE_CONFIG = {
  CACHE_DURATION: parseInt(process.env.CACHE_DURATION) || 3600, // 1 hora
};

// ========================================
// CONFIGURACIÓN DE MONITOREO
// ========================================

export const MONITORING_CONFIG = {
  ENABLE_METRICS: process.env.ENABLE_METRICS === 'true',
  MONITORING_URL: process.env.MONITORING_URL || 'http://localhost:9090',
};

// ========================================
// CONFIGURACIÓN DE BASE DE DATOS
// ========================================

export const DATABASE_CONFIG = {
  DATABASE_URL: process.env.DATABASE_URL || 'postgresql://username:password@localhost:5432/loan_simulator',
};

// ========================================
// VALIDACIÓN DE CONFIGURACIÓN
// ========================================

export const validateConfig = () => {
  const errors = [];
  const warnings = [];

  // Validar variables requeridas (solo advertencias en desarrollo)
  // GEMINI_API_KEY es opcional - solo se valida si se está usando
  if (process.env.USE_GEMINI === 'true' && !API_CONFIG.GEMINI_API_KEY) {
    if (SERVER_CONFIG.NODE_ENV === 'production') {
      errors.push('GEMINI_API_KEY es requerida cuando USE_GEMINI=true en producción');
    } else {
      warnings.push('GEMINI_API_KEY no configurada - funcionalidades de IA deshabilitadas');
    }
  }

  // Validar credenciales del Banco Central si se están usando
  if (!API_CONFIG.CMF_API_KEY) {
    warnings.push('CMF_API_KEY no configurada - usando datos de fallback');
  }

  if (!API_CONFIG.BC_USER || !API_CONFIG.BC_PASS) {
    warnings.push('Credenciales del Banco Central no configuradas - funcionalidades limitadas');
  }

  // Validar límites
  if (LIMITS_CONFIG.MIN_LOAN_AMOUNT >= LIMITS_CONFIG.MAX_LOAN_AMOUNT) {
    errors.push('MIN_LOAN_AMOUNT debe ser menor que MAX_LOAN_AMOUNT');
  }

  if (LIMITS_CONFIG.MIN_TERM >= LIMITS_CONFIG.MAX_TERM) {
    errors.push('MIN_TERM debe ser menor que MAX_TERM');
  }

  if (LIMITS_CONFIG.MIN_MONTHLY_RATE >= LIMITS_CONFIG.MAX_MONTHLY_RATE) {
    errors.push('MIN_MONTHLY_RATE debe ser menor que MAX_MONTHLY_RATE');
  }

  // Validar puerto
  if (SERVER_CONFIG.PORT < 1 || SERVER_CONFIG.PORT > 65535) {
    errors.push('PORT debe estar entre 1 y 65535');
  }

  // Mostrar advertencias
  if (warnings.length > 0) {
    console.log('⚠️  Advertencias de configuración:');
    warnings.forEach(warning => console.log(`  - ${warning}`));
  }

  if (errors.length > 0) {
    console.error('❌ Errores de configuración:');
    errors.forEach(error => console.error(`  - ${error}`));
    throw new Error('Configuración inválida');
  }

  console.log('✅ Configuración validada correctamente');
};

// ========================================
// FUNCIÓN DE INICIALIZACIÓN
// ========================================

export const initializeConfig = () => {
  console.log('🔧 Inicializando configuración...');
  
  // Validar configuración
  validateConfig();
  
  // Mostrar configuración en desarrollo
  if (SERVER_CONFIG.NODE_ENV === 'development') {
    console.log('📋 Configuración actual:');
    console.log(`  - Puerto: ${SERVER_CONFIG.PORT}`);
    console.log(`  - Modo: ${SERVER_CONFIG.NODE_ENV}`);
    console.log(`  - Límites: $${LIMITS_CONFIG.MIN_LOAN_AMOUNT.toLocaleString()} - $${LIMITS_CONFIG.MAX_LOAN_AMOUNT.toLocaleString()}`);
    console.log(`  - Plazos: ${LIMITS_CONFIG.MIN_TERM} - ${LIMITS_CONFIG.MAX_TERM} meses`);
    console.log(`  - Tasas: ${LIMITS_CONFIG.MIN_MONTHLY_RATE}% - ${LIMITS_CONFIG.MAX_MONTHLY_RATE}% mensual`);
  }
  
  console.log('✅ Configuración inicializada');
};

// ========================================
// EXPORTAR TODO
// ========================================

export default {
  SERVER_CONFIG,
  API_CONFIG,
  LIMITS_CONFIG,
  SECURITY_CONFIG,
  LOGGING_CONFIG,
  CACHE_CONFIG,
  MONITORING_CONFIG,
  DATABASE_CONFIG,
  validateConfig,
  initializeConfig,
}; 