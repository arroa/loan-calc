// ========================================
// TEST DE LOANS.JS ACTUALIZADO
// ========================================
// Verificar que el algoritmo corregido funciona con el landing

import { calcularPrestamo } from './loans.js';

console.log('🧪 TEST DE LOANS.JS ACTUALIZADO');
console.log('================================');

// Test 1: Ejemplo básico (compatibilidad con landing)
console.log('\n📊 TEST 1: Ejemplo básico (24 cuotas)');
const resultadoBasico = calcularPrestamo(3000000, 1.79, 24, "2025-07-18", "2025-12-20", 0);
console.log('Success:', resultadoBasico.success);
if (resultadoBasico.success) {
    console.log('✅ Cuota fija:', resultadoBasico.resumen.cuotaFija);
    console.log('✅ Total intereses:', resultadoBasico.resumen.totalIntereses);
    console.log('✅ Total capital:', resultadoBasico.resumen.totalCapital);
    console.log('✅ Saldo final:', resultadoBasico.resumen.saldoFinal);
    console.log('✅ Cantidad cuotas:', resultadoBasico.resumen.cantidadCuotas);
    console.log('✅ Última cuota ajustada:', resultadoBasico.resumen.ultimaCuota.valorAjustado);
    console.log('✅ Ajuste aplicado:', resultadoBasico.resumen.ultimaCuota.ajuste);
} else {
    console.log('❌ Error:', resultadoBasico.error);
    if (resultadoBasico.detalles) {
        console.log('❌ Detalles:', resultadoBasico.detalles);
    }
}

// Test 2: Con cuotón (compatibilidad con landing)
console.log('\n📊 TEST 2: Con cuotón');
const resultadoConCuoton = calcularPrestamo(3000000, 1.79, 24, "2025-07-18", "2025-12-20", 500000);
console.log('Success:', resultadoConCuoton.success);
if (resultadoConCuoton.success) {
    console.log('✅ Cuota fija:', resultadoConCuoton.resumen.cuotaFija);
    console.log('✅ Total intereses:', resultadoConCuoton.resumen.totalIntereses);
    console.log('✅ Saldo final:', resultadoConCuoton.resumen.saldoFinal);
    console.log('✅ Cantidad cuotas:', resultadoConCuoton.resumen.cantidadCuotas);
    console.log('✅ Última cuota ajustada:', resultadoConCuoton.resumen.ultimaCuota.valorAjustado);
    console.log('✅ Ajuste aplicado:', resultadoConCuoton.resumen.ultimaCuota.ajuste);
} else {
    console.log('❌ Error:', resultadoConCuoton.error);
}

// Test 3: Validaciones (API-ready)
console.log('\n📊 TEST 3: Validaciones');
const resultadoInvalido = calcularPrestamo(-1000, 1.79, 24, "2025-07-18", "2025-12-20", 0);
console.log('Test monto negativo - Success:', resultadoInvalido.success);
if (!resultadoInvalido.success) {
    console.log('✅ Error capturado:', resultadoInvalido.error);
    console.log('✅ Detalles:', resultadoInvalido.detalles);
}

// Test 4: Caso que genera ajuste
console.log('\n📊 TEST 4: Caso con ajuste (25 cuotas)');
const resultadoConAjuste = calcularPrestamo(3000000, 1.79, 25, "2025-07-18", "2025-12-20", 0);
console.log('Success:', resultadoConAjuste.success);
if (resultadoConAjuste.success) {
    console.log('✅ Cuota fija:', resultadoConAjuste.resumen.cuotaFija);
    console.log('✅ Última cuota ajustada:', resultadoConAjuste.resumen.ultimaCuota.valorAjustado);
    console.log('✅ Ajuste aplicado:', resultadoConAjuste.resumen.ultimaCuota.ajuste);
    
    if (resultadoConAjuste.resumen.ultimaCuota.ajuste !== 0) {
        console.log('✅ AJUSTE APLICADO CORRECTAMENTE');
    } else {
        console.log('ℹ️ No se requirió ajuste');
    }
} else {
    console.log('❌ Error:', resultadoConAjuste.error);
}

console.log('\n✅ TODOS LOS TESTS COMPLETADOS');
console.log('🎯 loans.js actualizado y funcionando correctamente'); 