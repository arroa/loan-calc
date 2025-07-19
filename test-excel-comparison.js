// Test para comparar con el resultado de Excel del usuario
// Excel encontró: cuota 70,877 con residual -3 pesos

import { calcularPrestamo } from './loans.js';

console.log('🧪 TEST: Comparación con resultado de Excel');
console.log('📊 Excel encontró: cuota 70,877 con residual -3 pesos');
console.log('');

// Parámetros del usuario (monto 3,000,000, tasa 1.79%, plazo 84 meses, cuotón 0)
const monto = 3000000;
const tasaMensual = 1.79;
const cuotas = 84;
const fechaFirma = '2025-01-15';
const primerVencimiento = '2025-02-05';
const cuoton = 0;

console.log('=== PARÁMETROS DE PRUEBA ===');
console.log(`Monto: $${monto.toLocaleString()}`);
console.log(`Tasa mensual: ${tasaMensual}%`);
console.log(`Cuotas: ${cuotas}`);
console.log(`Fecha firma: ${fechaFirma}`);
console.log(`Primer vencimiento: ${primerVencimiento}`);
console.log(`Cuotón: $${cuoton.toLocaleString()}`);
console.log('');

try {
    console.log('🔄 Calculando con nuestro algoritmo...');
    const resultado = calcularPrestamo(monto, tasaMensual, cuotas, fechaFirma, primerVencimiento, cuoton);
    
    if (resultado.success) {
        const cuotaCalculada = resultado.resumen.cuotaFija;
        const saldoFinal = resultado.resumen.saldoFinal;
        
        console.log('');
        console.log('=== RESULTADOS ===');
        console.log(`💰 Nuestra cuota: $${cuotaCalculada.toFixed(0)}`);
        console.log(`💵 Saldo final: $${saldoFinal.toFixed(2)}`);
        console.log(`📊 Cuota Excel: $70,877`);
        console.log(`📊 Saldo Excel: $-3`);
        console.log('');
        
        // Comparaciones
        const diferenciaCuota = Math.abs(cuotaCalculada - 70877);
        const diferenciaSaldo = Math.abs(saldoFinal - (-3));
        
        console.log('=== COMPARACIÓN ===');
        console.log(`📏 Diferencia en cuota: $${diferenciaCuota.toFixed(0)}`);
        console.log(`📏 Diferencia en saldo: $${diferenciaSaldo.toFixed(2)}`);
        console.log(`📊 Porcentaje diferencia cuota: ${((diferenciaCuota / 70877) * 100).toFixed(4)}%`);
        
        if (diferenciaCuota <= 100 && diferenciaSaldo <= 100) {
            console.log('✅ RESULTADO: Nuestro algoritmo está muy cerca del Excel');
        } else if (diferenciaCuota <= 500 && diferenciaSaldo <= 500) {
            console.log('⚠️ RESULTADO: Nuestro algoritmo está aceptablemente cerca del Excel');
        } else {
            console.log('❌ RESULTADO: Nuestro algoritmo difiere significativamente del Excel');
        }
        
        // Mostrar primeras y últimas cuotas para análisis
        console.log('');
        console.log('=== PRIMERAS 3 CUOTAS ===');
        resultado.cronograma.slice(0, 3).forEach((fila, idx) => {
            console.log(`Cuota ${fila.numeroCuota}: $${fila.valorCuota.toFixed(0)} (Capital: $${fila.capital.toFixed(0)}, Interés: $${fila.interes.toFixed(0)})`);
        });
        
        console.log('');
        console.log('=== ÚLTIMAS 3 CUOTAS ===');
        resultado.cronograma.slice(-3).forEach((fila, idx) => {
            console.log(`Cuota ${fila.numeroCuota}: $${fila.valorCuota.toFixed(0)} (Capital: $${fila.capital.toFixed(0)}, Interés: $${fila.interes.toFixed(0)})`);
        });
        
    } else {
        console.log('❌ Error en el cálculo:', resultado.error);
    }
    
} catch (error) {
    console.error('❌ Error en el test:', error.message);
} 