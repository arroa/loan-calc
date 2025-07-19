// Test detallado para analizar la lógica paso a paso
// Comparar con el resultado de Excel: cuota 70,877 con residual -3

import { calcularPrestamo } from './loans.js';

console.log('🔍 ANÁLISIS DETALLADO DE LA LÓGICA');
console.log('📊 Comparando con Excel: cuota 70,877, residual -3');
console.log('');

// Parámetros del usuario
const monto = 3000000;
const tasaMensual = 1.79;
const cuotas = 84;
const fechaFirma = '2025-01-15';
const primerVencimiento = '2025-02-05';
const cuoton = 0;

console.log('=== PARÁMETROS ===');
console.log(`Monto: $${monto.toLocaleString()}`);
console.log(`Tasa mensual: ${tasaMensual}%`);
console.log(`Cuotas: ${cuotas}`);
console.log(`Fecha firma: ${fechaFirma}`);
console.log(`Primer vencimiento: ${primerVencimiento}`);
console.log('');

// Análisis de la tasa diaria
const tasaDiariaActual = tasaMensual / 100 / 30;
console.log('=== ANÁLISIS DE TASA DIARIA ===');
console.log(`Tasa diaria actual: ${tasaDiariaActual.toFixed(8)} (tasaMensual/100/30)`);
console.log(`Esto asume 30 días por mes, pero usamos días reales en el cálculo`);
console.log('');

// Calcular días reales para las primeras cuotas
function calcularDiasEntreFechas(fechaInicio, fechaFin) {
    const inicio = new Date(fechaInicio);
    const fin = new Date(fechaFin);
    const diffTime = fin - inicio;
    const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));
    return diffDays;
}

console.log('=== CÁLCULO DE DÍAS REALES ===');
const diasPrimeraCuota = calcularDiasEntreFechas(fechaFirma, primerVencimiento);
console.log(`Días primera cuota (${fechaFirma} → ${primerVencimiento}): ${diasPrimeraCuota}`);

// Calcular fechas de las primeras cuotas
const fecha1 = new Date(primerVencimiento);
const fecha2 = new Date(fecha1.getFullYear(), fecha1.getMonth() + 1, 5);
const fecha3 = new Date(fecha2.getFullYear(), fecha2.getMonth() + 1, 5);

const diasSegundaCuota = calcularDiasEntreFechas(fecha1, fecha2);
const diasTerceraCuota = calcularDiasEntreFechas(fecha2, fecha3);

console.log(`Días segunda cuota (${fecha1.toISOString().split('T')[0]} → ${fecha2.toISOString().split('T')[0]}): ${diasSegundaCuota}`);
console.log(`Días tercera cuota (${fecha2.toISOString().split('T')[0]} → ${fecha3.toISOString().split('T')[0]}): ${diasTerceraCuota}`);
console.log('');

// Calcular tasas de período reales
console.log('=== TASAS DE PERÍODO REALES ===');
const tasaPeriodo1 = tasaDiariaActual * diasPrimeraCuota;
const tasaPeriodo2 = tasaDiariaActual * diasSegundaCuota;
const tasaPeriodo3 = tasaDiariaActual * diasTerceraCuota;

console.log(`Tasa período 1: ${tasaPeriodo1.toFixed(6)} (${(tasaPeriodo1 * 100).toFixed(4)}%)`);
console.log(`Tasa período 2: ${tasaPeriodo2.toFixed(6)} (${(tasaPeriodo2 * 100).toFixed(4)}%)`);
console.log(`Tasa período 3: ${tasaPeriodo3.toFixed(6)} (${(tasaPeriodo3 * 100).toFixed(4)}%)`);
console.log('');

// Simular cálculo manual con cuota de Excel
const cuotaExcel = 70877;
console.log('=== SIMULACIÓN CON CUOTA DE EXCEL ===');
console.log(`Cuota Excel: $${cuotaExcel.toLocaleString()}`);
console.log('');

let saldo = monto;
console.log('Cuota | Días | Saldo Inicial | Interés | Capital | Saldo Final');
console.log('------|------|---------------|---------|---------|------------');

// Primera cuota
const interes1 = Math.round(saldo * tasaPeriodo1);
const capital1 = cuotaExcel - interes1;
const saldo1 = saldo - capital1;
console.log(`  1   | ${diasPrimeraCuota.toString().padStart(4)} | ${saldo.toFixed(0).padStart(13)} | ${interes1.toFixed(0).padStart(7)} | ${capital1.toFixed(0).padStart(7)} | ${saldo1.toFixed(0).padStart(11)}`);

// Segunda cuota
saldo = saldo1;
const interes2 = Math.round(saldo * tasaPeriodo2);
const capital2 = cuotaExcel - interes2;
const saldo2 = saldo - capital2;
console.log(`  2   | ${diasSegundaCuota.toString().padStart(4)} | ${saldo.toFixed(0).padStart(13)} | ${interes2.toFixed(0).padStart(7)} | ${capital2.toFixed(0).padStart(7)} | ${saldo2.toFixed(0).padStart(11)}`);

// Tercera cuota
saldo = saldo2;
const interes3 = Math.round(saldo * tasaPeriodo3);
const capital3 = cuotaExcel - interes3;
const saldo3 = saldo - capital3;
console.log(`  3   | ${diasTerceraCuota.toString().padStart(4)} | ${saldo.toFixed(0).padStart(13)} | ${interes3.toFixed(0).padStart(7)} | ${capital3.toFixed(0).padStart(7)} | ${saldo3.toFixed(0).padStart(11)}`);

console.log('');

// Comparar con nuestro algoritmo
console.log('=== COMPARACIÓN CON NUESTRO ALGORITMO ===');
try {
    const resultado = calcularPrestamo(monto, tasaMensual, cuotas, fechaFirma, primerVencimiento, cuoton);
    
    if (resultado.success) {
        const cuotaCalculada = resultado.resumen.cuotaFija;
        const saldoFinal = resultado.resumen.saldoFinal;
        
        console.log(`Nuestra cuota: $${cuotaCalculada.toFixed(0)}`);
        console.log(`Cuota Excel: $${cuotaExcel.toFixed(0)}`);
        console.log(`Diferencia: $${Math.abs(cuotaCalculada - cuotaExcel).toFixed(0)}`);
        console.log('');
        
        console.log('Primeras 3 cuotas de nuestro algoritmo:');
        resultado.cronograma.slice(0, 3).forEach((fila, idx) => {
            console.log(`Cuota ${fila.numeroCuota}: $${fila.valorCuota.toFixed(0)} (Interés: $${fila.interes.toFixed(0)}, Capital: $${fila.capital.toFixed(0)})`);
        });
        
        console.log('');
        console.log('=== ANÁLISIS DE DIFERENCIAS ===');
        
        // Verificar si el problema está en el redondeo
        const interes1SinRedondear = saldo * tasaPeriodo1;
        const interes1Redondeado = Math.round(interes1SinRedondear);
        const diferenciaRedondeo1 = interes1SinRedondear - interes1Redondeado;
        
        console.log(`Interés 1 sin redondear: ${interes1SinRedondear.toFixed(2)}`);
        console.log(`Interés 1 redondeado: ${interes1Redondeado.toFixed(0)}`);
        console.log(`Diferencia por redondeo: ${diferenciaRedondeo1.toFixed(2)}`);
        
    } else {
        console.log('❌ Error en nuestro algoritmo:', resultado.error);
    }
    
} catch (error) {
 