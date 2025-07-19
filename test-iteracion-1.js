// Test para validar la primera iteración paso a paso
import { calcularPrestamo, calcularAmortizacionConCuota } from './loans.js';

console.log('🧪 TEST: Primera iteración paso a paso');
console.log('📊 Validación manual con el usuario');
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

console.log('=== CÁLCULO DE CUOTA FRANCESA INICIAL ===');
console.log(`Tasa decimal: ${tasaDecimal}`);
console.log(`Factor: ${factor}`);
console.log(`Cuota francesa: $${cuotaFrancesa.toFixed(2)}`);
console.log(`Cuota redondeada: $${Math.round(cuotaFrancesa)}`);
console.log('');

// Primera iteración con la cuota francesa
const cuotaPrueba = Math.round(cuotaFrancesa);
console.log('=== PRIMERA ITERACIÓN ===');
console.log(`Cuota de prueba: $${cuotaPrueba}`);
console.log('');

// Usar la función real del algoritmo
console.log('=== CÁLCULO DE TODAS LAS 84 CUOTAS ===');
console.log('Cuota | Fecha      | Días | Saldo Inicial | Tasa Período | Interés  | Capital  | Saldo Final');
console.log('------|------------|------|---------------|--------------|----------|----------|------------');

const resultado = calcularAmortizacionConCuota(monto, tasaMensual, cuotas, fechaFirma, primerVencimiento, cuotaPrueba, cuoton);
const cronograma = resultado.cronograma;
const saldo = resultado.saldoFinal;

// Mostrar todas las cuotas
cronograma.forEach((fila, i) => {
    const tasaPeriodo = (tasaMensual / 100 / 30) * fila.dias;
    console.log(
        `${fila.numeroCuota.toString().padStart(4)} | ${fila.fechaVencimiento} | ${fila.dias.toString().padStart(4)} | ${fila.saldoInicial.toFixed(0).padStart(13)} | ${tasaPeriodo.toFixed(6).padStart(12)} | ${fila.interes.toFixed(0).padStart(8)} | ${fila.capital.toFixed(0).padStart(8)} | ${fila.saldoFinal.toFixed(0).padStart(11)}`
    );
});

console.log('');
console.log('=== RESUMEN PRIMERA ITERACIÓN ===');
console.log(`Saldo final después de ${cuotas} cuotas: $${saldo.toFixed(2)}`);
console.log(`Cuota de prueba: $${cuotaPrueba}`);
console.log(`Total intereses: $${cronograma.reduce((sum, fila) => sum + fila.interes, 0).toFixed(0)}`);
console.log(`Total capital: $${cronograma.reduce((sum, fila) => sum + fila.capital, 0).toFixed(0)}`);
console.log('');
console.log('🔍 Por favor valida estos cálculos con tu Excel...'); 