// ========================================
// TEST DE AJUSTE DE ÚLTIMA CUOTA
// ========================================

import { calcularPrestamo } from './loansdebug.js';

console.log('🧪 TEST DE AJUSTE DE ÚLTIMA CUOTA');
console.log('==================================');

// Test con parámetros que generen un residual (cuotas impares)
const params = {
    monto: 3000000,
    tasaMensual: 1.79,
    cuotas: 25, // Número impar para generar residual
    fechaFirma: "2025-07-18",
    primerVencimiento: "2025-12-20",
    cuoton: 0
};

const resultado = calcularPrestamo(params, false);
console.log('Success:', resultado.success);

if (resultado.success) {
    console.log('\n📊 RESUMEN:');
    console.log('Cuota fija:', resultado.resumen.cuotaFija);
    console.log('Total intereses:', resultado.resumen.totalIntereses);
    console.log('Total capital:', resultado.resumen.totalCapital);
    console.log('Saldo final:', resultado.resumen.saldoFinal);
    console.log('Cantidad cuotas:', resultado.resumen.cantidadCuotas);
    
    console.log('\n🔧 AJUSTE DE ÚLTIMA CUOTA:');
    if (resultado.resumen.ultimaCuota) {
        console.log('Número de cuota:', resultado.resumen.ultimaCuota.numero);
        console.log('Valor original:', resultado.resumen.ultimaCuota.valorOriginal);
        console.log('Valor ajustado:', resultado.resumen.ultimaCuota.valorAjustado);
        console.log('Ajuste aplicado:', resultado.resumen.ultimaCuota.ajuste);
        
        if (resultado.resumen.ultimaCuota.ajuste !== 0) {
            console.log('✅ AJUSTE APLICADO CORRECTAMENTE');
        } else {
            console.log('ℹ️ No se requirió ajuste (residual = 0)');
        }
    }
    
    console.log('\n📋 ÚLTIMA CUOTA EN CRONOGRAMA:');
    const ultimaCuota = resultado.cronograma[resultado.cronograma.length - 1];
    console.log('Número:', ultimaCuota.numeroCuota);
    console.log('Valor cuota:', ultimaCuota.valorCuota);
    console.log('Interés:', ultimaCuota.interes);
    console.log('Capital:', ultimaCuota.capital);
    console.log('Capital residual:', ultimaCuota.capitalResidual);
    
} else {
    console.log('❌ Error:', resultado.error);
}

console.log('\n✅ Test completado'); 