// Test préstamo CON cuotón - Algoritmo final validado
// Capital: 15.000.000 / Fecha firma: 2025-07-16 / Primer vencimiento: 2025-09-05
// Tasa mensual: 1.48% / Cuotas: 36 / Cuotón: 5.000.000

function calcularDiasEntreFechas(fechaInicio, fechaFin) {
    const inicio = new Date(fechaInicio);
    const fin = new Date(fechaFin);
    const diffTime = fin - inicio;
    const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24)); // Sin +1, como Excel
    return diffDays;
}

function calcularCuotaFrancesa(monto, tasaMensual, plazo) {
    const tasaDecimal = tasaMensual / 100;
    if (tasaDecimal === 0) return monto / plazo;
    const factor = Math.pow(1 + tasaDecimal, plazo);
    return monto * (tasaDecimal * factor) / (factor - 1);
}

function calcularAmortizacionFinal(monto, tasaMensual, cuotas, fechaFirma, primerVencimiento, cuoton = 0) {
    const tasaDiaria = tasaMensual / 100 / 30;
    let cuotaFija = calcularCuotaFrancesa(monto, tasaMensual, cuotas);
    if (cuoton > 0) {
        cuotaFija = calcularCuotaFrancesa(monto - cuoton, tasaMensual, cuotas);
    }
    let saldo = monto;
    let cuotaCalculada = cuotaFija;
    let iteraciones = 0;
    const maxIteraciones = 100;
    const tolerancia = 2;
    while (iteraciones < maxIteraciones) {
        saldo = monto;
        const cronograma = [];
        for (let i = 0; i < cuotas; i++) {
            // Calcular fecha de vencimiento: siempre día 5 de cada mes
            let fechaVencimiento;
            if (i === 0) {
                fechaVencimiento = new Date(primerVencimiento);
            } else {
                const base = new Date(primerVencimiento);
                fechaVencimiento = new Date(base.getFullYear(), base.getMonth() + i, 5);
            }
            let dias;
            if (i === 0) {
                dias = calcularDiasEntreFechas(fechaFirma, fechaVencimiento);
            } else {
                const fechaAnterior = new Date(cronograma[i-1].fechaVencimiento);
                dias = calcularDiasEntreFechas(fechaAnterior, fechaVencimiento);
            }
            const tasaPeriodo = tasaDiaria * dias;
            const interes = Math.round(saldo * tasaPeriodo);
            const capital = cuotaCalculada - interes;
            cronograma.push({
                cuota: i + 1,
                fechaVencimiento: fechaVencimiento.toISOString().split('T')[0],
                dias: dias,
                saldoInicial: saldo,
                cuota: cuotaCalculada,
                interes: interes,
                capital: capital,
                saldoFinal: saldo - capital
            });
            saldo = saldo - capital;
        }
        if (cuoton > 0) {
            const ultimaFecha = new Date(cronograma[cronograma.length - 1].fechaVencimiento);
            const fechaCuoton = new Date(ultimaFecha.getFullYear(), ultimaFecha.getMonth() + 1, 5);
            const diasCuoton = calcularDiasEntreFechas(ultimaFecha, fechaCuoton);
            const tasaPeriodoCuoton = tasaDiaria * diasCuoton;
            const interesCuoton = Math.round(saldo * tasaPeriodoCuoton);
            const capitalCuoton = cuoton - interesCuoton;
            cronograma.push({
                cuota: cuotas + 1,
                fechaVencimiento: fechaCuoton.toISOString().split('T')[0],
                dias: diasCuoton,
                saldoInicial: saldo,
                cuota: cuoton,
                interes: interesCuoton,
                capital: capitalCuoton,
                saldoFinal: saldo - capitalCuoton
            });
            saldo = saldo - capitalCuoton;
        }
        if (Math.abs(saldo) <= tolerancia) {
            console.log(`✅ Convergencia alcanzada en ${iteraciones + 1} iteraciones`);
            console.log(`Saldo final: $${saldo.toFixed(2)}`);
            if (Math.abs(saldo) > 0) {
                const ultimaCuota = cronograma[cronograma.length - 1];
                ultimaCuota.cuota += saldo;
                ultimaCuota.capital += saldo;
                ultimaCuota.saldoFinal = 0;
                console.log(`💰 Residuo de $${saldo.toFixed(2)} agregado a la última cuota`);
            }
            return cronograma;
        }
        const ajuste = saldo / cuotas;
        cuotaCalculada += ajuste;
        iteraciones++;
    }
    console.log(`⚠️ No se alcanzó convergencia después de ${maxIteraciones} iteraciones`);
    console.log(`Saldo final: $${saldo.toFixed(2)}`);
    return cronograma;
}

// Datos del ejemplo CON cuotón
const monto = 15000000;
const tasaMensual = 1.48;
const cuotas = 36;
const fechaFirma = '2025-07-16';
const primerVencimiento = '2025-09-05';
const cuoton = 5000000;

console.log('=== TEST PRÉSTAMO CON CUOTÓN - ALGORITMO FINAL ===');
console.log(`Monto: $${monto.toLocaleString()}`);
console.log(`Tasa mensual: ${tasaMensual}%`);
console.log(`Cuotas: ${cuotas}`);
console.log(`Fecha firma: ${fechaFirma}`);
console.log(`Primer vencimiento: ${primerVencimiento}`);
console.log(`Cuotón: $${cuoton.toLocaleString()}`);
console.log('Verificar cálculo de días');
const diasPrimeraCuota = calcularDiasEntreFechas(fechaFirma, primerVencimiento);
console.log(`Días primera cuota: ${diasPrimeraCuota}`);
console.log('');

const cronograma = calcularAmortizacionFinal(monto, tasaMensual, cuotas, fechaFirma, primerVencimiento, cuoton);

console.log('=== PRIMERAS 3 CUOTAS ===');
console.log('Cuota | Fecha      | Días | Saldo Inicial | Cuota    | Interés  | Capital  | Saldo Final');
console.log('------|------------|------|---------------|----------|----------|----------|------------');

cronograma.slice(0,3).forEach((fila) => {
    console.log(
        `${fila.cuota.toString().padStart(4)} | ${fila.fechaVencimiento} | ${fila.dias.toString().padStart(4)} | ${fila.saldoInicial.toFixed(0).padStart(13)} | ${fila.cuota.toFixed(0).padStart(8)} | ${fila.interes.toFixed(0).padStart(8)} | ${fila.capital.toFixed(0).padStart(8)} | ${fila.saldoFinal.toFixed(0).padStart(11)}`
    );
});

console.log('');
console.log('=== ÚLTIMA CUOTA ===');
const ultimaFila = cronograma[cronograma.length -1];
console.log(
    `${ultimaFila.cuota.toString().padStart(4)} | ${ultimaFila.fechaVencimiento} | ${ultimaFila.dias.toString().padStart(4)} | ${ultimaFila.saldoInicial.toFixed(0).padStart(13)} | ${ultimaFila.cuota.toFixed(0).padStart(8)} | ${ultimaFila.interes.toFixed(0).padStart(8)} | ${ultimaFila.capital.toFixed(0).padStart(8)} | ${ultimaFila.saldoFinal.toFixed(0).padStart(11)}`
);

console.log('');
console.log('=== RESUMEN FINAL ===');
const cuotaFija = cronograma[0].cuota;
const totalIntereses = cronograma.reduce((sum, fila) => sum + fila.interes, 0);
const totalCapital = cronograma.reduce((sum, fila) => sum + fila.capital, 0);
const saldoFinal = cronograma[cronograma.length - 1].saldoFinal;

console.log(`Cuota fija: $${cuotaFija.toFixed(0)}`);
console.log(`Total intereses: $${totalIntereses.toFixed(0)}`);
console.log(`Total capital: $${totalCapital.toFixed(0)}`);
console.log(`Saldo final: $${saldoFinal.toFixed(2)}`);
console.log(`Total pagado: $${(totalIntereses + totalCapital).toFixed(0)}`);
console.log(`Cuotas totales: ${cronograma.length}`); 