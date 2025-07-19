// Detalle de la primera iteración con cuotón
// Fecha firma: 25-09-2018
// Primer vencimiento: 05-11-2018
// Tasa mensual: 1.52%
// Monto: 9,886,973
// Cuotas: 48
// Cuotón: 4,000,000

function calcularDiasEntreFechas(fechaInicio, fechaFin) {
    const inicio = new Date(fechaInicio);
    const fin = new Date(fechaFin);
    const diffTime = fin - inicio;
    const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));
    return diffDays;
}

function calcularAmortizacionDetalladaCuoton(monto, tasaMensual, cuotas, fechaFirma, primerVencimiento, cuotaFija, cuoton = 0) {
    const tasaDiaria = tasaMensual / 100 / 30;
    let saldo = monto;
    const cronograma = [];
    const fechaBase = new Date(primerVencimiento);
    console.log('=== DETALLE COMPLETO DE LA AMORTIZACIÓN CON CUOTÓN ===');
    console.log(`Cuota fija de prueba: $${cuotaFija.toFixed(0)}`);
    console.log(`Tasa diaria: ${tasaDiaria.toFixed(8)}`);
    console.log('');
    for (let i = 0; i < cuotas; i++) {
        let fechaVencimiento = new Date(fechaBase);
        fechaVencimiento.setMonth(fechaVencimiento.getMonth() + i);
        let dias;
        if (i === 0) {
            dias = calcularDiasEntreFechas(fechaFirma, fechaVencimiento);
        } else {
            const fechaAnterior = new Date(cronograma[i-1].fechaVencimiento);
            dias = calcularDiasEntreFechas(fechaAnterior, fechaVencimiento);
        }
        const tasaPeriodo = tasaDiaria * dias;
        const interes = saldo * tasaPeriodo; // Sin redondear inmediatamente
        const interesRedondeado = Math.round(interes); // Redondear al final
        const capital = cuotaFija - interesRedondeado;
        cronograma.push({
            cuota: i + 1,
            fechaVencimiento: fechaVencimiento.toISOString().split('T')[0],
            dias: dias,
            saldoInicial: saldo,
            cuota: cuotaFija,
            interes: interesRedondeado,
            capital: capital,
            saldoFinal: saldo - capital
        });
        // Mostrar detalle de TODAS las cuotas
        console.log(`Cuota ${i + 1}:`);
        console.log(`  Fecha: ${fechaVencimiento.toISOString().split('T')[0]}`);
        console.log(`  Días: ${dias}`);
        console.log(`  Tasa período: ${tasaPeriodo.toFixed(8)}`);
        console.log(`  Saldo inicial: $${saldo.toFixed(0)}`);
        console.log(`  Cuota: $${cuotaFija.toFixed(0)}`);
        console.log(`  Interés: $${interesRedondeado.toFixed(0)} (${saldo.toFixed(0)} × ${tasaPeriodo.toFixed(8)})`);
        console.log(`  Capital: $${capital.toFixed(0)} (${cuotaFija.toFixed(0)} - ${interesRedondeado.toFixed(0)})`);
        console.log(`  Saldo final: $${(saldo - capital).toFixed(0)}`);
        console.log('');
        saldo = saldo - capital;
    }
    // Si hay cuotón, agregar la cuota adicional
    if (cuoton > 0) {
        const ultimaFecha = new Date(cronograma[cronograma.length - 1].fechaVencimiento);
        const fechaCuoton = new Date(ultimaFecha);
        fechaCuoton.setMonth(fechaCuoton.getMonth() + 1);
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
        // Mostrar detalle del cuotón
        console.log(`Cuota ${cuotas + 1} (Cuotón):`);
        console.log(`  Fecha: ${fechaCuoton.toISOString().split('T')[0]}`);
        console.log(`  Días: ${diasCuoton}`);
        console.log(`  Tasa período: ${tasaPeriodoCuoton.toFixed(8)}`);
        console.log(`  Saldo inicial: $${saldo.toFixed(0)}`);
        console.log(`  Cuota: $${cuoton.toFixed(0)}`);
        console.log(`  Interés: $${interesCuoton.toFixed(0)} (${saldo.toFixed(0)} × ${tasaPeriodoCuoton.toFixed(8)})`);
        console.log(`  Capital: $${capitalCuoton.toFixed(0)} (${cuoton.toFixed(0)} - ${interesCuoton.toFixed(0)})`);
        console.log(`  Saldo final: $${(saldo - capitalCuoton).toFixed(0)}`);
        console.log('');
        saldo = saldo - capitalCuoton;
    }
    console.log('=== RESUMEN ===');
    console.log(`Saldo final: $${saldo.toFixed(0)}`);
    console.log(`Total intereses: $${cronograma.reduce((sum, fila) => sum + fila.interes, 0).toFixed(0)}`);
    console.log(`Total capital: $${cronograma.reduce((sum, fila) => sum + fila.capital, 0).toFixed(0)}`);
    console.log(`Cuotas efectivas: ${cronograma.length}`);
    return { cronograma, saldoFinal: saldo };
}

// Datos del ejemplo con cuotón
const monto = 9886973;
const tasaMensual = 1.52;
const cuotas = 48;
const fechaFirma = '2018-09-25';
const primerVencimiento = '2018-11-05';
const cuoton = 4000000; // Cuotón de $4,000,000

// Cuota de prueba de la primera iteración de la búsqueda binaria
const cuotaPrueba = 4943487 / 2; // monto/2 / 2 = monto/4 (igual que la primera iteración)

calcularAmortizacionDetalladaCuoton(monto, tasaMensual, cuotas, fechaFirma, primerVencimiento, cuotaPrueba, cuoton); 