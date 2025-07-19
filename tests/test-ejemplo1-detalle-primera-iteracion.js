// Test ejemplo 1 - Detalle completo de la primera iteración
// Fecha firma: 25-09-2018
// Primer vencimiento: 05-11-2018
// Tasa mensual: 1.52%
// Monto: 9,886,973
// Cuotas: 48

function calcularDiasEntreFechas(fechaInicio, fechaFin) {
    const inicio = new Date(fechaInicio);
    const fin = new Date(fechaFin);
    const diffTime = fin - inicio;
    const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));
    return diffDays;
}

function calcularAmortizacionDetallada(monto, tasaMensual, cuotas, fechaFirma, primerVencimiento, cuotaFija, cuoton = 0) {
    const tasaDiaria = tasaMensual / 100 / 30;
    let saldo = monto;
    const cronograma = [];
    
    console.log('=== DETALLE COMPLETO DE LA AMORTIZACIÓN ===');
    console.log(`Cuota fija de prueba: $${cuotaFija.toFixed(0)}`);
    console.log(`Tasa diaria: ${tasaDiaria.toFixed(8)}`);
    console.log('');
    
    // Guardar el día original del primer vencimiento
    const diaVencimiento = new Date(primerVencimiento).getDate();
    const fechaBase = new Date(primerVencimiento);
    for (let i = 0; i < cuotas; i++) {
        // Calcular fecha de vencimiento
        let fechaVencimiento = new Date(fechaBase);
        fechaVencimiento.setMonth(fechaVencimiento.getMonth() + i);
        
        // Calcular días exactos como en Excel
        let dias;
        if (i === 0) {
            dias = calcularDiasEntreFechas(fechaFirma, fechaVencimiento);
        } else {
            const fechaAnterior = new Date(cronograma[i-1].fechaVencimiento);
            dias = calcularDiasEntreFechas(fechaAnterior, fechaVencimiento);
        }
        
        const tasaPeriodo = tasaDiaria * dias;
        const interes = Math.round(saldo * tasaPeriodo); // REDONDEAR como en Excel
        const capital = cuotaFija - interes;
        
        cronograma.push({
            cuota: i + 1,
            fechaVencimiento: fechaVencimiento.toISOString().split('T')[0],
            dias: dias,
            saldoInicial: saldo,
            cuota: cuotaFija,
            interes: interes,
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
            console.log(`  Interés: $${interes.toFixed(0)} (${saldo.toFixed(0)} × ${tasaPeriodo.toFixed(8)})`);
            console.log(`  Capital: $${capital.toFixed(0)} (${cuotaFija.toFixed(0)} - ${interes.toFixed(0)})`);
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
        
        saldo = saldo - capitalCuoton;
    }
    
    console.log('=== RESUMEN ===');
    console.log(`Saldo final: $${saldo.toFixed(0)}`);
    console.log(`Total intereses: $${cronograma.reduce((sum, fila) => sum + fila.interes, 0).toFixed(0)}`);
    console.log(`Total capital: $${cronograma.reduce((sum, fila) => sum + fila.capital, 0).toFixed(0)}`);
    
    return { cronograma, saldoFinal: saldo };
}

// Datos del ejemplo
const monto = 9886973;
const tasaMensual = 1.52;
const cuotas = 48;
const fechaFirma = '2018-09-25';
const primerVencimiento = '2018-11-05';
const cuoton = 0; // Sin cuotón

console.log('=== TEST EJEMPLO 1 - DETALLE PRIMERA ITERACIÓN ===');
console.log(`Monto: $${monto.toLocaleString()}`);
console.log(`Tasa mensual: ${tasaMensual}%`);
console.log(`Cuotas: ${cuotas}`);
console.log(`Fecha firma: ${fechaFirma}`);
console.log(`Primer vencimiento: ${primerVencimiento}`);
console.log(`Cuotón: $${cuoton.toLocaleString()}`);
console.log('');

// Probar con la primera cuota de la búsqueda binaria
const cuotaPrueba = 2471743; // Primera iteración
const resultado = calcularAmortizacionDetallada(monto, tasaMensual, cuotas, fechaFirma, primerVencimiento, cuotaPrueba, cuoton);

console.log('=== COMPARACIÓN CON EXCEL ===');
console.log(`Cuota de prueba: $${cuotaPrueba.toFixed(0)}`);
console.log(`Saldo final calculado: $${resultado.saldoFinal.toFixed(0)}`);
console.log(`¿Cuál es el saldo final en tu Excel con esta cuota?`); 