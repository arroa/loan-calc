// Test ejemplo 1 - Sin cuotón (PRECISIÓN EXACTA)
// Fecha firma: 25-09-2018
// Primer vencimiento: 05-11-2018
// Tasa mensual 1,52
// Monto Préstamo 9886973
// Cuotas 48

function calcularDiasEntreFechas(fechaInicio, fechaFin) {
    const inicio = new Date(fechaInicio);
    const fin = new Date(fechaFin);
    const diffTime = Math.abs(fin - inicio);
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays;
}

function calcularCuotaFrancesa(monto, tasaMensual, plazo) {
    const tasaDecimal = tasaMensual / 100;
    if (tasaDecimal === 0) return monto / plazo;
    
    const factor = Math.pow(1 + tasaDecimal, plazo);
    return monto * (tasaDecimal * factor) / (factor - 1);
}

function calcularAmortizacionConDiasExactos(monto, tasaMensual, cuotas, fechaFirma, primerVencimiento, cuoton = 0) {
    const tasaDiaria = tasaMensual / 100 / 30;
    let cuotaFija = calcularCuotaFrancesa(monto, tasaMensual, cuotas);
    
    // Si hay cuotón, ajustamos la cuota
    if (cuoton > 0) {
        cuotaFija = calcularCuotaFrancesa(monto - cuoton, tasaMensual, cuotas);
    }
    
    let saldo = monto;
    let cuotaCalculada = cuotaFija;
    let iteraciones = 0;
    const maxIteraciones = 100;
    const tolerancia = 0.01;
    
    while (iteraciones < maxIteraciones) {
        saldo = monto;
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
            
            // Calcular días desde la firma (para la primera cuota) o desde la cuota anterior
            let dias;
            if (i === 0) {
                dias = calcularDiasEntreFechas(fechaFirma, fechaVencimiento);
            } else {
                const fechaAnterior = new Date(cronograma[i-1].fechaVencimiento);
                dias = calcularDiasEntreFechas(fechaAnterior, fechaVencimiento);
            }
            
            const tasaPeriodo = tasaDiaria * dias;
            const interes = saldo * tasaPeriodo;
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
        
        // Si hay cuotón, agregar la cuota adicional
        if (cuoton > 0) {
            const ultimaFecha = new Date(cronograma[cronograma.length - 1].fechaVencimiento);
            const fechaCuoton = new Date(ultimaFecha);
            fechaCuoton.setMonth(fechaCuoton.getMonth() + 1);
            
            const diasCuoton = calcularDiasEntreFechas(ultimaFecha, fechaCuoton);
            const tasaPeriodoCuoton = tasaDiaria * diasCuoton;
            const interesCuoton = saldo * tasaPeriodoCuoton;
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
        
        // Verificar convergencia
        if (Math.abs(saldo) < tolerancia) {
            console.log(`✅ Convergencia alcanzada en ${iteraciones + 1} iteraciones`);
            console.log(`Saldo final: $${saldo.toFixed(6)}`);
            return cronograma;
        }
        
        // Ajustar cuota para la siguiente iteración
        const ajuste = saldo / cuotas;
        cuotaCalculada += ajuste;
        
        iteraciones++;
    }
    
    console.log(`⚠️ No se alcanzó convergencia después de ${maxIteraciones} iteraciones`);
    console.log(`Saldo final: $${saldo.toFixed(6)}`);
    return cronograma;
}

// Datos del ejemplo
const monto = 9886973;
const tasaMensual = 1.52;
const cuotas = 48;
const fechaFirma = '2018-09-25';
const primerVencimiento = '2018-11-05';
const cuoton = 0; // Sin cuotón

console.log('=== TEST EJEMPLO 1 - SIN CUOTÓN (PRECISIÓN EXACTA) ===');
console.log(`Monto: $${monto.toLocaleString()}`);
console.log(`Tasa mensual: ${tasaMensual}%`);
console.log(`Cuotas: ${cuotas}`);
console.log(`Fecha firma: ${fechaFirma}`);
console.log(`Primer vencimiento: ${primerVencimiento}`);
console.log(`Cuotón: $${cuoton.toLocaleString()}`);
console.log('');

// Calcular cuota francesa inicial
const cuotaInicial = calcularCuotaFrancesa(monto, tasaMensual, cuotas);
console.log(`Cuota francesa inicial: $${cuotaInicial.toFixed(6)}`);
console.log('');

const cronograma = calcularAmortizacionConDiasExactos(monto, tasaMensual, cuotas, fechaFirma, primerVencimiento, cuoton);

console.log('=== VALORES EXACTOS (SIN REDONDEO) ===');
console.log(`Cuota final calculada: $${cronograma[0].cuota.toFixed(6)}`);
console.log('');

console.log('=== PRIMERAS 3 CUOTAS (VALORES EXACTOS) ===');
console.log('Cuota | Fecha      | Días | Saldo Inicial | Cuota        | Interés      | Capital      | Saldo Final');
console.log('------|------------|------|---------------|--------------|--------------|--------------|--------------');

cronograma.slice(0, 3).forEach((fila) => {
    console.log(
        `${fila.cuota.toString().padStart(4)} | ${fila.fechaVencimiento} | ${fila.dias.toString().padStart(4)} | ${fila.saldoInicial.toFixed(2).padStart(13)} | ${fila.cuota.toFixed(6).padStart(12)} | ${fila.interes.toFixed(6).padStart(12)} | ${fila.capital.toFixed(6).padStart(12)} | ${fila.saldoFinal.toFixed(2).padStart(13)}`
    );
});

console.log('');
console.log('=== ÚLTIMAS 3 CUOTAS (VALORES EXACTOS) ===');
cronograma.slice(-3).forEach((fila) => {
    console.log(
        `${fila.cuota.toString().padStart(4)} | ${fila.fechaVencimiento} | ${fila.dias.toString().padStart(4)} | ${fila.saldoInicial.toFixed(2).padStart(13)} | ${fila.cuota.toFixed(6).padStart(12)} | ${fila.interes.toFixed(6).padStart(12)} | ${fila.capital.toFixed(6).padStart(12)} | ${fila.saldoFinal.toFixed(2).padStart(13)}`
    );
});

console.log('');
console.log('=== RESUMEN EXACTO ===');
const cuotaFija = cronograma[0].cuota;
const totalIntereses = cronograma.reduce((sum, fila) => sum + fila.interes, 0);
const totalCapital = cronograma.reduce((sum, fila) => sum + fila.capital, 0);
const saldoFinal = cronograma[cronograma.length - 1].saldoFinal;

console.log(`Cuota fija exacta: $${cuotaFija.toFixed(6)}`);
console.log(`Total intereses: $${totalIntereses.toFixed(2)}`);
console.log(`Total capital: $${totalCapital.toFixed(2)}`);
console.log(`Saldo final: $${saldoFinal.toFixed(6)}`);
console.log(`Total pagado: $${(totalIntereses + totalCapital).toFixed(2)}`);
console.log(`Diferencia con tu valor: $${(cuotaFija - 294527.067096232).toFixed(6)}`); 