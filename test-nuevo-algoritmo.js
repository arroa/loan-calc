// ========================================
// TEST DEL NUEVO ALGORITMO
// ========================================
// Validación con el ejemplo proporcionado

import { calcularPrestamo } from './loansdebug.js';

// Ejemplo del usuario: 3.000.000, 1.79%, 24 cuotas
const params = {
    monto: 3000000,
    tasaMensual: 1.79,
    cuotas: 24,
    fechaFirma: "2025-07-18",
    primerVencimiento: "2025-12-20",
    cuoton: 0
};

console.log('🧪 TEST DEL NUEVO ALGORITMO');
console.log('============================');
console.log('Parámetros de entrada:');
console.log(JSON.stringify(params, null, 2));
console.log('');

// Test sin debug
console.log('📊 Test sin debug:');
const resultadoSinDebug = calcularPrestamo(params, false);
console.log('Success:', resultadoSinDebug.success);
if (resultadoSinDebug.success) {
    console.log('Cuota fija:', resultadoSinDebug.resumen.cuotaFija);
    console.log('Total intereses:', resultadoSinDebug.resumen.totalIntereses);
    console.log('Total capital:', resultadoSinDebug.resumen.totalCapital);
    console.log('Saldo final:', resultadoSinDebug.resumen.saldoFinal);
    console.log('Cantidad cuotas:', resultadoSinDebug.resumen.cantidadCuotas);
    
    // Mostrar primeras 3 cuotas
    console.log('\nPrimeras 3 cuotas:');
    resultadoSinDebug.cronograma.slice(0, 3).forEach(cuota => {
        console.log(`Cuota ${cuota.numeroCuota}: ${cuota.fechaVencimiento}, Días: ${cuota.dias}, Cuota: ${cuota.valorCuota}, Interés: ${cuota.interes}, Capital: ${cuota.capital}, Residual: ${cuota.capitalResidual}`);
    });
} else {
    console.log('Error:', resultadoSinDebug.error);
    if (resultadoSinDebug.detalles) {
        console.log('Detalles:', resultadoSinDebug.detalles);
    }
}

console.log('\n' + '='.repeat(50));

// Test con debug
console.log('🔍 Test con debug:');
const resultadoConDebug = calcularPrestamo(params, true);
console.log('Success:', resultadoConDebug.success);
if (resultadoConDebug.success) {
    console.log('Cuota fija:', resultadoConDebug.resumen.cuotaFija);
    console.log('Total intereses:', resultadoConDebug.resumen.totalIntereses);
    console.log('Total capital:', resultadoConDebug.resumen.totalCapital);
    console.log('Saldo final:', resultadoConDebug.resumen.saldoFinal);
    console.log('Cantidad cuotas:', resultadoConDebug.resumen.cantidadCuotas);
    
    // Mostrar información de debug
    console.log('\nInformación de debug:');
    console.log('Total elementos debugData:', resultadoConDebug.debugData.length);
    
    const iteraciones = resultadoConDebug.debugData.filter(item => item.tipo === 'iteracion');
    console.log('Total iteraciones:', iteraciones.length);
    
    if (iteraciones.length > 0) {
        console.log('\nPrimera iteración:');
        console.log('Cuota prueba:', iteraciones[0].cuotaPrueba);
        console.log('Capital residual final:', iteraciones[0].capitalResidualFinal);
        console.log('Acción:', iteraciones[0].accion);
        
        console.log('\nÚltima iteración:');
        const ultimaIteracion = iteraciones[iteraciones.length - 1];
        console.log('Cuota prueba:', ultimaIteracion.cuotaPrueba);
        console.log('Capital residual final:', ultimaIteracion.capitalResidualFinal);
        console.log('Acción:', ultimaIteracion.accion);
    }
    
    // Mostrar convergencia
    const convergencias = resultadoConDebug.debugData.filter(item => item.tipo === 'convergencia');
    if (convergencias.length > 0) {
        console.log('\nConvergencia:');
        convergencias.forEach(conv => {
            console.log('-', conv.mensaje);
        });
    }
} else {
    console.log('Error:', resultadoConDebug.error);
    if (resultadoConDebug.detalles) {
        console.log('Detalles:', resultadoConDebug.detalles);
    }
}

console.log('\n✅ Test completado'); 