// Test para ejecutar 2 iteraciones y mostrar el resultado de la segunda
import { calcularAmortizacionConCuota } from './loans.js';

console.log('🧪 TEST: 2 iteraciones del algoritmo');
console.log('📊 Mostrando resultado de la segunda iteración');
console.log('');

// Parámetros del usuario
const monto = 3000000;
const tasaMensual = 1.79;
const cuotas = 84;
const fechaFirma = '2025-07-17';
const primerVencimiento = '2025-09-10';
const cuoton = 0;

console.log('=== PARÁMETROS DE ENTRADA ===');
console.log(`Monto: $${monto.toLocaleString()}`);
console.log(`Tasa mensual: ${tasaMensual}%`);
console.log(`Cuotas: ${cuotas}`);
console.log(`Fecha firma: ${fechaFirma}`);
console.log(`Primer vencimiento: ${primerVencimiento}`);
console.log(`Cuotón: $${cuoton.toLocaleString()}`);
console.log('');

// Calcular cuota francesa inicial
const tasaDecimal = tasaMensual / 100;
const factor = Math.pow(1 + tasaDecimal, cuotas);
const cuotaFrancesa = monto * (tasaDecimal * factor) / (factor - 1);
const cuotaInicial = Math.round(cuotaFrancesa);

console.log('=== ITERACIÓN 1 ===');
console.log(`Cuota francesa inicial: $${cuotaFrancesa.toFixed(2)}`);
console.log(`Cuota redondeada: $${cuotaInicial}`);

const resultado1 = calcularAmortizacionConCuota(monto, tasaMensual, cuotas, fechaFirma, primerVencimiento, cuotaInicial, cuoton);
console.log(`Saldo final iteración 1: $${resultado1.saldoFinal.toFixed(2)}`);
console.log('');

// Segunda iteración - búsqueda binaria
let cuotaMin = 0;
let cuotaMax = cuotaInicial * 3;
let cuotaPrueba2;

if (resultado1.saldoFinal > 0) {
    // Saldo positivo, subir la cuota
    cuotaMin = cuotaInicial;
    cuotaPrueba2 = Math.round((cuotaMin + cuotaMax) / 2);
    console.log('=== ITERACIÓN 2 ===');
    console.log(`Saldo iteración 1 > 0, subiendo cuota`);
    console.log(`Cuota min: $${cuotaMin}`);
    console.log(`Cuota max: $${cuotaMax}`);
    console.log(`Cuota prueba 2: $${cuotaPrueba2}`);
} else {
    // Saldo negativo, bajar la cuota
    cuotaMax = cuotaInicial;
    cuotaPrueba2 = Math.round((cuotaMin + cuotaMax) / 2);
    console.log('=== ITERACIÓN 2 ===');
    console.log(`Saldo iteración 1 < 0, bajando cuota`);
    console.log(`Cuota min: $${cuotaMin}`);
    console.log(`Cuota max: $${cuotaMax}`);
    console.log(`Cuota prueba 2: $${cuotaPrueba2}`);
}

const resultado2 = calcularAmortizacionConCuota(monto, tasaMensual, cuotas, fechaFirma, primerVencimiento, cuotaPrueba2, cuoton);
console.log(`Saldo final iteración 2: $${resultado2.saldoFinal.toFixed(2)}`);
console.log('');

// Mostrar TODAS las 84 cuotas de la segunda iteración
console.log('=== TODAS LAS 84 CUOTAS (ITERACIÓN 2) ===');
console.log('Cuota | Fecha      | Días | Saldo Inicial | Cuota    | Interés  | Capital  | Saldo Final');
console.log('------|------------|------|---------------|----------|----------|----------|------------');

resultado2.cronograma.forEach((fila) => {
    console.log(
        `${fila.numeroCuota.toString().padStart(4)} | ${fila.fechaVencimiento} | ${fila.dias.toString().padStart(4)} | ${fila.saldoInicial.toFixed(0).padStart(13)} | ${fila.valorCuota.toFixed(0).padStart(8)} | ${fila.interes.toFixed(0).padStart(8)} | ${fila.capital.toFixed(0).padStart(8)} | ${fila.saldoFinal.toFixed(0).padStart(11)}`
    );
});

console.log('');
console.log('=== RESUMEN 2 ITERACIONES ===');
console.log(`Iteración 1: Cuota $${cuotaInicial} → Saldo $${resultado1.saldoFinal.toFixed(2)}`);
console.log(`Iteración 2: Cuota $${cuotaPrueba2} → Saldo $${resultado2.saldoFinal.toFixed(2)}`);
console.log(`Diferencia cuotas: $${Math.abs(cuotaPrueba2 - cuotaInicial)}`);
console.log(`Diferencia saldos: $${Math.abs(resultado2.saldoFinal - resultado1.saldoFinal).toFixed(2)}`); 