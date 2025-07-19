// Test préstamo con cuotón
// Fecha firma: 250918Primer vencimiento: 5-2018
// Tasa mensual: 1.52%
// Monto: 9,886,973/ Cuotas: 48
// Cuotón: 4,000,000

function calcularDiasEntreFechas(fechaInicio, fechaFin) {
    const inicio = new Date(fechaInicio);
    const fin = new Date(fechaFin);
    const diffTime = fin - inicio;
    const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24)); // CORREGIDO
    return diffDays;
}

function calcularAmortizacionConCuota(monto, tasaMensual, cuotas, fechaFirma, primerVencimiento, cuotaFija, cuoton = 0) {
    const tasaDiaria = tasaMensual / 100 / 30;
    let saldo = monto;
    const cronograma = [];
    const fechaBase = new Date(primerVencimiento);
    
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
        
        // Calcular interés usando la fórmula exacta de Excel
        // =Redondear(Días * Tasa / 30/ 100 * Capital Inicial; 0)
        const interes = Math.round(dias * tasaMensual / 30 / 100 * saldo);
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
    
    if (cuoton > 0) {
        const ultimaFecha = new Date(cronograma[cronograma.length - 1].fechaVencimiento);
        const fechaCuoton = new Date(ultimaFecha);
        fechaCuoton.setMonth(fechaCuoton.getMonth() + 1);
        const diasCuoton = calcularDiasEntreFechas(ultimaFecha, fechaCuoton);
        // Calcular interés del cuotón usando la fórmula exacta de Excel
        const interesCuoton = Math.round(diasCuoton * tasaMensual / 30 / 100 * saldo);
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

function buscarCuotaConCuoton(monto, tasaMensual, cuotas, fechaFirma, primerVencimiento, cuoton = 0) {
    const tolerancia = 0.01;
    let cuotaMin = 0;
    let cuotaMax = monto / 2;
    let iteraciones = 0;
    const maxIteraciones = 100;
    
    console.log('=== DATOS DE ENTRADA ===');
    console.log(`Monto: $${monto.toLocaleString()}`);
    console.log(`Tasa mensual: ${tasaMensual}%`);
    console.log(`Cuotas: ${cuotas}`);
    console.log(`Fecha firma: ${fechaFirma}`);
    console.log(`Primer vencimiento: ${primerVencimiento}`);
    console.log(`Cuotón: $${cuoton.toLocaleString()}`);
    console.log(`Tolerancia: $${tolerancia}`);
    console.log(`CuotaMax inicial: $${cuotaMax.toFixed(0)}`);
    console.log('');
    
    console.log('=== LOGS DETALLADOS DE CADA ITERACIÓN ===');
    console.log('Iter | Cuota Min | Cuota Max | Cuota Prueba | Saldo Final | Acción');
    console.log('-----|-----------|-----------|--------------|-------------|--------');
    
    while (iteraciones < maxIteraciones) {
        const cuotaPrueba = Math.round((cuotaMin + cuotaMax) / 2);
        const resultado = calcularAmortizacionConCuota(monto, tasaMensual, cuotas, fechaFirma, primerVencimiento, cuotaPrueba, cuoton);
        const saldoFinal = resultado.saldoFinal;
        
        if (iteraciones === 0) {
            // Mostrar detalle completo de todas las cuotas en la primera iteración
            console.log('');
            console.log('=== DETALLE COMPLETO DE TODAS LAS CUOTAS (PRIMERA ITERACIÓN) ===');
            console.log('Cuota | Fecha      | Días | Saldo Inicial | Cuota    | Interés  | Capital  | Saldo Final');
            console.log('------|------------|------|---------------|----------|----------|----------|------------');
            
            resultado.cronograma.forEach((fila) => {
                console.log(
                    `${fila.cuota.toString().padStart(4)} | ${fila.fechaVencimiento} | ${fila.dias.toString().padStart(4)} | ${fila.saldoInicial.toFixed(0).padStart(13)} | ${fila.cuota.toFixed(0).padStart(8)} | ${fila.interes.toFixed(0).padStart(8)} | ${fila.capital.toFixed(0).padStart(8)} | ${fila.saldoFinal.toFixed(0).padStart(11)}`
                );
            });
            console.log('');
        }
        
        console.log(`${(iteraciones + 1).toString().padStart(4)} | ${cuotaMin.toFixed(0).padStart(9)} | ${cuotaMax.toFixed(0).padStart(9)} | ${cuotaPrueba.toFixed(0).padStart(12)} | ${saldoFinal.toFixed(0).padStart(11)} | ${saldoFinal > 0 ? 'SUBIR' : 'BAJAR'}`);
        
        if (Math.abs(saldoFinal) <= tolerancia) {
            console.log('');
            console.log(`✅ CONVERGENCIA ALCANZADA en iteración ${iteraciones + 1}`);
            console.log(`Cuota final: $${cuotaPrueba.toFixed(6)}`);
            console.log(`Saldo final: $${saldoFinal.toFixed(6)}`);
            
            if (Math.abs(saldoFinal) > 0) {
                resultado.cronograma[resultado.cronograma.length - 1].cuota += saldoFinal;
                resultado.cronograma[resultado.cronograma.length - 1].capital += saldoFinal;
                resultado.cronograma[resultado.cronograma.length - 1].saldoFinal = 0;
                console.log(`💰 Residuo de $${saldoFinal.toFixed(6)} agregado a la última cuota`);
            }
            // Redondear la cuota final a entero y recalcular el cronograma
            const cuotaFinal = Math.round(cuotaPrueba);
            const resultadoFinal = calcularAmortizacionConCuota(monto, tasaMensual, cuotas, fechaFirma, primerVencimiento, cuotaFinal, cuoton);
            const saldoFinalRedondeado = resultadoFinal.saldoFinal;
            if (Math.abs(saldoFinalRedondeado) > 20) {
                throw new Error(`ERROR: El saldo final tras redondear la cuota es mayor a 20 pesos: $${saldoFinalRedondeado}`);
            }
            if (Math.abs(saldoFinalRedondeado) > 0) {
                const ultima = resultadoFinal.cronograma[resultadoFinal.cronograma.length - 1];
                ultima.cuota += saldoFinalRedondeado;
                ultima.capital += saldoFinalRedondeado;
                ultima.saldoFinal = 0;
                console.log(`💰 Residuo de $${saldoFinalRedondeado} agregado a la última cuota`);
            }
            return resultadoFinal.cronograma;
        }
        
        if (saldoFinal > 0) {
            cuotaMin = cuotaPrueba;
        } else {
            cuotaMax = cuotaPrueba;
        }
        
        iteraciones++;
    }
    
    console.log('');
    console.log(`⚠️ NO SE ALCANZÓ CONVERGENCIA después de ${maxIteraciones} iteraciones`);
    console.log(`Última cuota probada: $${((cuotaMin + cuotaMax) / 2).toFixed(6)}`);
    return null;
}

// Datos del ejemplo con cuotón
const monto = 9886973;
const tasaMensual = 1.52;
const cuotas = 48;
const fechaFirma = '2018-09-25';
const primerVencimiento = '2018-11-05';
const cuoton = 4000000; // Cuotón de $4,000,000

console.log('=== TEST PRÉSTAMO CON CUOTÓN ===');
console.log('');

const cronograma = buscarCuotaConCuoton(monto, tasaMensual, cuotas, fechaFirma, primerVencimiento, cuoton);

if (cronograma) {
    console.log('');
    console.log('=== PRIMERAS 3 CUOTAS DEL RESULTADO FINAL ===');
    console.log('Cuota | Fecha      | Días | Saldo Inicial | Cuota    | Interés  | Capital  | Saldo Final');
    console.log('------|------------|------|---------------|----------|----------|----------|------------');
    
    cronograma.slice(0, 3).forEach((fila) => {
        console.log(
            `${fila.cuota.toString().padStart(4)} | ${fila.fechaVencimiento} | ${fila.dias.toString().padStart(4)} | ${fila.saldoInicial.toFixed(0).padStart(13)} | ${fila.cuota.toFixed(0).padStart(8)} | ${fila.interes.toFixed(0).padStart(8)} | ${fila.capital.toFixed(0).padStart(8)} | ${fila.saldoFinal.toFixed(0).padStart(11)}`
        );
    });
    
    console.log('');
    console.log('=== CUOTA FINAL (CUOTÓN) ===');
    const cuotonFila = cronograma[cronograma.length - 1];
    console.log(
        `${cuotonFila.cuota.toString().padStart(4)} | ${cuotonFila.fechaVencimiento} | ${cuotonFila.dias.toString().padStart(4)} | ${cuotonFila.saldoInicial.toFixed(0).padStart(13)} | ${cuotonFila.cuota.toFixed(0).padStart(8)} | ${cuotonFila.interes.toFixed(0).padStart(8)} | ${cuotonFila.capital.toFixed(0).padStart(8)} | ${cuotonFila.saldoFinal.toFixed(0).padStart(11)}`
    );
    
    console.log('');
    console.log('=== RESUMEN FINAL ===');
    const cuotaFija = cronograma[0].cuota;
    const totalIntereses = cronograma.reduce((sum, fila) => sum + fila.interes, 0);
    const totalCapital = cronograma.reduce((sum, fila) => sum + fila.capital, 0);
    const saldoFinal = cronograma[cronograma.length - 1].saldoFinal;
    
    console.log(`Cuota fija: $${cuotaFija.toFixed(6)}`);
    console.log(`Cuotón: $${cuoton.toLocaleString()}`);
    console.log(`Total intereses: $${totalIntereses.toFixed(0)}`);
    console.log(`Total capital: $${totalCapital.toFixed(0)}`);
    console.log(`Saldo final: $${saldoFinal.toFixed(6)}`);
    console.log(`Total pagado: $${(totalIntereses + totalCapital).toFixed(0)}`);
    console.log(`Cuotas totales: ${cronograma.length}`);
}