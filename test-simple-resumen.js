// Test simple del formato de resumen
console.log('🧪 TEST SIMPLE DE RESUMEN');

// Simular datos de respuesta
const data = {
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

// Generar HTML del resumen
const html = `
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

console.log('📊 HTML generado:');
console.log(html);

// Test con ajuste
const dataConAjuste = {
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

const htmlConAjuste = `
<div class="success">
    <h3>✅ Cálculo Completado</h3>
    <p><strong>Cuota fija:</strong> ${dataConAjuste.resumen.cuotaFija}</p>
    <p><strong>Total intereses:</strong> ${dataConAjuste.resumen.totalIntereses}</p>
    <p><strong>Total capital:</strong> ${dataConAjuste.resumen.totalCapital}</p>
    <p><strong>Saldo final:</strong> ${dataConAjuste.resumen.saldoFinal}</p>
    <p><strong>Cuotas totales:</strong> ${dataConAjuste.resumen.cantidadCuotas}</p>
    <p><strong>Última cuota ajustada:</strong> ${dataConAjuste.resumen.ultimaCuota.valorAjustado} ${dataConAjuste.resumen.ultimaCuota.ajuste !== 0 ? `(ajuste: ${dataConAjuste.resumen.ultimaCuota.ajuste > 0 ? '+' : ''}${dataConAjuste.resumen.ultimaCuota.ajuste})` : '(sin ajuste)'}</p>
</div>
`;

console.log('\n📊 HTML con ajuste:');
console.log(htmlConAjuste);

console.log('\n✅ Test completado'); 