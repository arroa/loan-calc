// ========================================
// TEST DE RESUMEN CON ÚLTIMA CUOTA
// ========================================
// Simula la respuesta del servidor para verificar el formato

const data = {
    success: true,
    resumen: {
        cuotaFija: 166625,
        totalIntereses: 998997,
        totalCapital: 3000000,
        saldoFinal: 0,
        cantidadCuotas: 24,
        ultimaCuota: {
            numero: 24,
            valorOriginal: 166625,
            valorAjustado: 166625,
            ajuste: 0
        }
    }
};

// Simular la función mostrarResultados del debug.html
function mostrarResultados(data, debug) {
    let html = '';
    
    // Resumen final
    html += `
        <div class="success">
            <h3>✅ Cálculo Completado</h3>
            <p><strong>Cuota fija:</strong> ${data.resumen.cuotaFija}</p>
            <p><strong>Total intereses:</strong> ${data.resumen.totalIntereses}</p>
            <p><strong>Total capital:</strong> ${data.resumen.totalCapital}</p>
            <p><strong>Saldo final:</strong> ${data.resumen.saldoFinal}</p>
            <p><strong>Cuotas totales:</strong> ${data.resumen.cantidadCuotas}</p>
            <p><strong>Última cuota ajustada:</strong> ${data.resumen.ultimaCuota.valorAjustado} ${data.resumen.ultimaCuota.ajuste !== 0 ? `(ajuste: ${data.resumen.ultimaCuota.ajuste > 0 ? '+' : ''}${data.resumen.ultimaCuota.ajuste})` : '(sin ajuste)'}</p>
        </div>
    `;
    
    return html;
}

console.log('🧪 TEST DE RESUMEN CON ÚLTIMA CUOTA');
console.log('====================================');

// Test 1: Sin ajuste
console.log('\n📊 TEST 1: Sin ajuste (24 cuotas)');
const html1 = mostrarResultados(data, false);
console.log(html1);

// Test 2: Con ajuste
console.log('\n📊 TEST 2: Con ajuste (25 cuotas)');
const dataConAjuste = {
    success: true,
    resumen: {
        cuotaFija: 161298,
        totalIntereses: 1032489,
        totalCapital: 3000000,
        saldoFinal: 0,
        cantidadCuotas: 25,
        ultimaCuota: {
            numero: 25,
            valorOriginal: 161298,
            valorAjustado: 161337,
            ajuste: 39
        }
    }
};

const html2 = mostrarResultados(dataConAjuste, false);
console.log(html2);

console.log('\n✅ Test completado'); 