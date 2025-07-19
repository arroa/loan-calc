// ========================================
// TEST COMPLETO DEL NUEVO ALGORITMO
// ========================================
// Validación con todos los parámetros y casos especiales

import { calcularPrestamo } from './loansdebug.js';

console.log('🧪 TEST COMPLETO DEL NUEVO ALGORITMO');
console.log('=====================================');

// Test 1: Ejemplo básico (sin casos especiales)
console.log('\n📊 TEST 1: Ejemplo básico');
const paramsBasico = {
    monto: 3000000,
    tasaMensual: 1.79,
    cuotas: 24,
    fechaFirma: "2025-07-18",
    primerVencimiento: "2025-12-20",
    cuoton: 0
};

const resultadoBasico = calcularPrestamo(paramsBasico, true);
console.log('Success:', resultadoBasico.success);
if (resultadoBasico.success) {
    console.log('✅ Cuota fija:', resultadoBasico.resumen.cuotaFija);
    console.log('✅ Total intereses:', resultadoBasico.resumen.totalIntereses);
    console.log('✅ Saldo final:', resultadoBasico.resumen.saldoFinal);
    console.log('✅ Iteraciones:', resultadoBasico.debugData.filter(item => item.tipo === 'iteracion').length);
} else {
    console.log('❌ Error:', resultadoBasico.error);
}

// Test 2: Con cuotón
console.log('\n📊 TEST 2: Con cuotón');
const paramsConCuoton = {
    monto: 3000000,
    tasaMensual: 1.79,
    cuotas: 24,
    fechaFirma: "2025-07-18",
    primerVencimiento: "2025-12-20",
    cuoton: 500000
};

const resultadoConCuoton = calcularPrestamo(paramsConCuoton, true);
console.log('Success:', resultadoConCuoton.success);
if (resultadoConCuoton.success) {
    console.log('✅ Cuota fija:', resultadoConCuoton.resumen.cuotaFija);
    console.log('✅ Total intereses:', resultadoConCuoton.resumen.totalIntereses);
    console.log('✅ Saldo final:', resultadoConCuoton.resumen.saldoFinal);
    console.log('✅ Cantidad cuotas:', resultadoConCuoton.resumen.cantidadCuotas);
} else {
    console.log('❌ Error:', resultadoConCuoton.error);
}

// Test 3: Con meses sin pago
console.log('\n📊 TEST 3: Con meses sin pago');
const paramsSinPago = {
    monto: 3000000,
    tasaMensual: 1.79,
    cuotas: 24,
    fechaFirma: "2025-07-18",
    primerVencimiento: "2025-12-20",
    cuoton: 0,
    mesesSinPago: [3, 8] // marzo y agosto
};

const resultadoSinPago = calcularPrestamo(paramsSinPago, true);
console.log('Success:', resultadoSinPago.success);
if (resultadoSinPago.success) {
    console.log('✅ Cuota fija:', resultadoSinPago.resumen.cuotaFija);
    console.log('✅ Total intereses:', resultadoSinPago.resumen.totalIntereses);
    console.log('✅ Saldo final:', resultadoSinPago.resumen.saldoFinal);
    
    // Verificar que los meses sin pago tienen cuota = 0
    const mesesSinPagoEncontrados = resultadoSinPago.cronograma.filter(cuota => cuota.valorCuota === 0);
    console.log('✅ Meses sin pago encontrados:', mesesSinPagoEncontrados.map(c => c.numeroCuota));
} else {
    console.log('❌ Error:', resultadoSinPago.error);
}

// Test 4: Con cuotas especiales
console.log('\n📊 TEST 4: Con cuotas especiales');
const paramsEspeciales = {
    monto: 3000000,
    tasaMensual: 1.79,
    cuotas: 24,
    fechaFirma: "2025-07-18",
    primerVencimiento: "2025-12-20",
    cuoton: 0,
    cuotasEspeciales: [
        {mes: 4, valor: 200000},
        {mes: 10, valor: 150000}
    ]
};

const resultadoEspeciales = calcularPrestamo(paramsEspeciales, true);
console.log('Success:', resultadoEspeciales.success);
if (resultadoEspeciales.success) {
    console.log('✅ Cuota fija:', resultadoEspeciales.resumen.cuotaFija);
    console.log('✅ Total intereses:', resultadoEspeciales.resumen.totalIntereses);
    console.log('✅ Saldo final:', resultadoEspeciales.resumen.saldoFinal);
    
    // Verificar cuotas especiales
    const cuota4 = resultadoEspeciales.cronograma.find(c => c.numeroCuota === 4);
    const cuota10 = resultadoEspeciales.cronograma.find(c => c.numeroCuota === 10);
    console.log('✅ Cuota 4 especial:', cuota4 ? cuota4.valorCuota : 'No encontrada');
    console.log('✅ Cuota 10 especial:', cuota10 ? cuota10.valorCuota : 'No encontrada');
} else {
    console.log('❌ Error:', resultadoEspeciales.error);
}

// Test 5: Combinación de casos especiales
console.log('\n📊 TEST 5: Combinación completa');
const paramsCompleto = {
    monto: 3000000,
    tasaMensual: 1.79,
    cuotas: 24,
    fechaFirma: "2025-07-18",
    primerVencimiento: "2025-12-20",
    cuoton: 300000,
    mesesSinPago: [3, 8],
    cuotasEspeciales: [
        {mes: 4, valor: 200000},
        {mes: 10, valor: 150000}
    ]
};

const resultadoCompleto = calcularPrestamo(paramsCompleto, true);
console.log('Success:', resultadoCompleto.success);
if (resultadoCompleto.success) {
    console.log('✅ Cuota fija:', resultadoCompleto.resumen.cuotaFija);
    console.log('✅ Total intereses:', resultadoCompleto.resumen.totalIntereses);
    console.log('✅ Saldo final:', resultadoCompleto.resumen.saldoFinal);
    console.log('✅ Cantidad cuotas:', resultadoCompleto.resumen.cantidadCuotas);
    
    // Verificar casos especiales
    const mesesSinPago = resultadoCompleto.cronograma.filter(c => c.valorCuota === 0);
    const cuotasEspeciales = resultadoCompleto.cronograma.filter(c => 
        c.numeroCuota === 4 || c.numeroCuota === 10
    );
    const cuoton = resultadoCompleto.cronograma[resultadoCompleto.cronograma.length - 1];
    
    console.log('✅ Meses sin pago:', mesesSinPago.map(c => c.numeroCuota));
    console.log('✅ Cuotas especiales:', cuotasEspeciales.map(c => `${c.numeroCuota}: ${c.valorCuota}`));
    console.log('✅ Cuotón final:', cuoton.valorCuota);
} else {
    console.log('❌ Error:', resultadoCompleto.error);
}

// Test 6: Validaciones de entrada
console.log('\n📊 TEST 6: Validaciones de entrada');

// Test con monto inválido
const paramsInvalido = {
    monto: -1000,
    tasaMensual: 1.79,
    cuotas: 24,
    fechaFirma: "2025-07-18",
    primerVencimiento: "2025-12-20"
};

const resultadoInvalido = calcularPrestamo(paramsInvalido, false);
console.log('Test monto negativo - Success:', resultadoInvalido.success);
if (!resultadoInvalido.success) {
    console.log('✅ Error capturado:', resultadoInvalido.error);
    console.log('✅ Detalles:', resultadoInvalido.detalles);
}

console.log('\n✅ TODOS LOS TESTS COMPLETADOS'); 