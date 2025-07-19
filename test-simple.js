// Prueba simple del algoritmo
import { calcularPrestamo } from './loans.js';

console.log('=== PRUEBA SIMPLE DEL ALGORITMO ===');

// Prueba con parámetros reales del frontend - CON CUOTÓN
const resultado = calcularPrestamo(
    15000000,   // monto: 15 millones
    1.48,       // tasa mensual: 1.48%
    36,         // cuotas: 36 meses
    '2025-07-17', // fecha firma: 17-07-2025
    '2025-09-05', // primer vencimiento: 05-09-2025
    5000000     // cuotón: 5 millones
);

console.log('Resultado:', resultado); 