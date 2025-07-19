import { calcularPrestamo } from './loans.js';

// Prueba sin cuotón
console.log('=== PRUEBA SIN CUOTÓN ===');
const resultadoSinCuoton = calcularPrestamo(
    15000000,  // monto
    1.48,      // tasa mensual
    36,        // cuotas
    '2025-07-16', // fecha firma (igual que el algoritmo correcto)
    '2025-09-05', // primer vencimiento
    0          // cuotón
);

console.log('\n' + '='.repeat(50) + '\n');

// Prueba con cuotón
console.log('=== PRUEBA CON CUOTÓN ===');
const resultadoConCuoton = calcularPrestamo(
    15000000,  // monto
    1.48,      // tasa mensual
    36,        // cuotas
    '2025-07-16', // fecha firma (igual que el algoritmo correcto)
    '2025-09-05', // primer vencimiento
    5000000    // cuotón
); 