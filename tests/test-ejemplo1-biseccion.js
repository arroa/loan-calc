// Test ejemplo 1 - Algoritmo de búsqueda binaria (bisección)
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

function calcularAmortizacionConCuota(monto, tasaMensual, cuotas, fechaFirma, primerVencimiento, cuotaFija, cuoton = 0) {
    const tasaDiaria = tasaMensual / 100 / 30;
    let saldo = monto;
    const cronograma = [];
    
    for (let i = 0; i < cuotas; i++) {
        // Calcular fecha de vencimiento
        let fechaVencimiento;
        if (i === 0) {
            fechaVencimiento = new Date(primerVencimiento);
        } else {
            fechaVencimiento = new Date(cronograma[i-1].fechaVencimiento);
            fechaVencimiento.setMonth(fechaVencimiento.getMonth() + 1);
        }
        
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
    
    return { cronograma, saldoFinal: saldo };
}

function buscarCuotaBiseccion(monto, tasaMensual, cuotas, fechaFirma, primerVencimiento, cuoton = 0) {
    const tolerancia = 2; // 2 pesos como mencionaste
    let cuotaMin = 0;
    let cuotaMax = monto * 2; // Un valor alto para empezar
    let iteraciones = 0;
    const maxIteraciones = 50;
    
    console.log('=== BÚSQUEDA BINARIA ===');
    console.log('Iter | Cuota Min | Cuota Max | Cuota Prueba | Saldo Final | Acción');
    console.log('-----|-----------|-----------|--------------|-------------|--------');
    
    while (iteraciones < maxIteraciones) {
        const cuotaPrueba = (cuotaMin + cuotaMax) / 2;
        const resultado = calcularAmortizacionConCuota(monto, tasaMensual, cuotas, fechaFirma, primerVencimiento, cuotaPrueba, cuoton);
        const saldoFinal = resultado.saldoFinal;
        
        console.log(`${(iteraciones + 1).toString().padStart(4)} | ${cuotaMin.toFixed(0).padStart(9)} | ${cuotaMax.toFixed(0).padStart(9)} | ${cuotaPrueba.toFixed(0).padStart(12)} | ${saldoFinal.toFixed(0).padStart(11)} | ${saldoFinal > 0 ? 'SUBIR' : 'BAJAR'}`);
        
        if (Math.abs(saldoFinal) <= tolerancia) {
            console.log(`✅ Convergencia alcanzada en ${iteraciones + 1} iteraciones`);
            console.log(`Cuota final: $${cuotaPrueba.toFixed(6)}`);
            console.log(`Saldo final: $${saldoFinal.toFixed(2)}`);
            
            // Si hay residuo, agregarlo a la última cuota
            if (Math.abs(saldoFinal) > 0) {
                resultado.cronograma[resultado.cronograma.length - 1].cuota += saldoFinal;
                resultado.cronograma[resultado.cronograma.length - 1].capital += saldoFinal;
                resultado.cronograma[resultado.cronograma.length - 1].saldoFinal = 0;
                console.log(`💰 Residuo de $${saldoFinal.toFixed(2)} agregado a la última cuota`);
            }
            
            return resultado.cronograma;
        }
        
        if (saldoFinal > 0) {
            // Saldo positivo, subir la cuota
            cuotaMin = cuotaPrueba;
        } else {
            // Saldo negativo, bajar la cuota
            cuotaMax = cuotaPrueba;
        }
        
        iteraciones++;
    }
    
    console.log(`⚠️ No se alcanzó convergencia después de ${maxIteraciones} iteraciones`);
    return null;
}

// Datos del ejemplo
const monto = 9886973;
const tasaMensual = 1.52;
const cuotas = 48;
const fechaFirma = '2018-09-25';
const primerVencimiento = '2018-11-05';
const cuoton = 0; // Sin cuotón

console.log('=== TEST EJEMPLO 1 - BÚSQUEDA BINARIA ===');
console.log(`Monto: $${monto.toLocaleString()}`);
console.log(`Tasa mensual: ${tasaMensual}%`);
console.log(`Cuotas: ${cuotas}`);
console.log(`Fecha firma: ${fechaFirma}`);
console.log(`Primer vencimiento: ${primerVencimiento}`);
console.log(`Cuotón: $${cuoton.toLocaleString()}`);
console.log('');

const cronograma = buscarCuotaBiseccion(monto, tasaMensual, cuotas, fechaFirma, primerVencimiento, cuoton);

if (cronograma) {
    console.log('');
    console.log('=== PRIMERAS 3 CUOTAS ===');
    console.log('Cuota | Fecha      | Días | Saldo Inicial | Cuota    | Interés  | Capital  | Saldo Final');
    console.log('------|------------|------|---------------|----------|----------|----------|------------');
    
    cronograma.slice(0, 3).forEach((fila) => {
        console.log(
            `${fila.cuota.toString().padStart(4)} | ${fila.fechaVencimiento} | ${fila.dias.toString().padStart(4)} | ${fila.saldoInicial.toFixed(0).padStart(13)} | ${fila.cuota.toFixed(0).padStart(8)} | ${fila.interes.toFixed(0).padStart(8)} | ${fila.capital.toFixed(0).padStart(8)} | ${fila.saldoFinal.toFixed(0).padStart(11)}`
        );
    });
    
    console.log('');
    console.log('=== RESUMEN ===');
    const cuotaFija = cronograma[0].cuota;
    const totalIntereses = cronograma.reduce((sum, fila) => sum + fila.interes, 0);
    const totalCapital = cronograma.reduce((sum, fila) => sum + fila.capital, 0);
    const saldoFinal = cronograma[cronograma.length - 1].saldoFinal;
    
    console.log(`Cuota fija: $${cuotaFija.toFixed(0)}`);
    console.log(`Total intereses: $${totalIntereses.toFixed(0)}`);
    console.log(`Total capital: $${totalCapital.toFixed(0)}`);
    console.log(`Saldo final: $${saldoFinal.toFixed(2)}`);
    console.log(`Total pagado: $${(totalIntereses + totalCapital).toFixed(0)}`);
    console.log(`Diferencia con tu valor: $${(cuotaFija - 294527).toFixed(0)}`);
} 