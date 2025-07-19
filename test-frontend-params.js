import { calcularPrestamo } from './loans.js';

// Parámetros exactos que envía el frontend según la imagen
const params = {
    monto: 15000000,
    tasaMensual: 1.48,
    cuotas: 36,
    fechaFirma: '2025-07-17',
    primerVencimiento: '2025-09-05',
    cuoton: 0
};

console.log('=== PRUEBA CON PARÁMETROS DEL FRONTEND ===');
console.log('Parámetros:', params);
console.log('');

try {
    const resultado = calcularPrestamo(
        params.monto,
        params.tasaMensual,
        params.cuotas,
        params.fechaFirma,
        params.primerVencimiento,
        params.cuoton
    );
    
    console.log('=== RESULTADO ===');
    console.log('Success:', resultado.success);
    
    if (resultado.success) {
        console.log('Cuota fija:', resultado.resumen.cuotaFija);
        console.log('Total intereses:', resultado.resumen.totalIntereses);
        console.log('Saldo final:', resultado.resumen.saldoFinal);
        console.log('Cantidad de cuotas:', resultado.resumen.cantidadCuotas);
    } else {
        console.log('Error:', resultado.error);
    }
    
} catch (error) {
    console.error('Error en la prueba:', error.message);
} 