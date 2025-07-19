// Test préstamo CON cuotón
// Capital: 15.000.000
// Fecha Otorgamiento: 2025-07-16
// Cuotas: 36
// Fecha primer vencimiento: 2025-09-05
// Tasa Interés mensual: 1.48%
// Cuotón: 5.000.000

function calcularDiasEntreFechas(fechaInicio, fechaFin) {
    const inicio = new Date(fechaInicio);
    const fin = new Date(fechaFin);
    const diffTime = fin - inicio;
    const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));
    return diffDays;
}

function calcularAmortizacionConCuoton(monto, tasaMensual, cuotas, fechaFirma, primerVencimiento, cuotaFija, cuoton) {
    let saldo = monto;
    const cronograma = [];
    const fechaBase = new Date(primerVencimiento);
    
    for (let i = 0; i < cuotas; i++) {
        // Calcular la fecha de vencimiento como en Excel: FECHA(AÑO(fecha);MES(fecha)+i;DIA(fecha))
        const año = fechaBase.getFullYear();
        const mes = fechaBase.getMonth() + i;
        const dia = fechaBase.getDate();
        let fechaVencimiento = new Date(año, mes, dia);
        let dias;
        if (i === 0) {
            dias = calcularDiasEntreFechas(fechaFirma, fechaVencimiento);
        } else {
            const fechaAnterior = new Date(cronograma[i-1].fechaVencimiento);
            dias = calcularDiasEntreFechas(fechaAnterior, fechaVencimiento);
        }
        
        // Calcular interés usando la fórmula exacta de Excel
        // =Redondear(Días * Tasa /30/ 100 * Capital Inicial; 0)
        const interes = Math.round(dias * tasaMensual / 30 / 100 * saldo);
        
        let capital;
        if (i === cuotas - 1) {
            // Última cuota: capital = saldo + cuotón
            capital = saldo + cuoton;
        } else {
            capital = cuotaFija - interes;
        }
        
        cronograma.push({
            cuota: i + 1,
            fechaVencimiento: fechaVencimiento.toISOString().split('T')[0],
            dias: dias,
            saldoInicial: saldo,
            cuota: cuotaFija + (i === cuotas -1 ? 0 : 0), // This line seems to be a bug, should be cuotaFija
            interes: interes,
            capital: capital,
            saldoFinal: saldo - capital
        });
        saldo = saldo - capital;
    }
    
    return { cronograma, saldoFinal: saldo };
}

function buscarCuotaFijaConCuoton(monto, tasaMensual, cuotas, fechaFirma, primerVencimiento, cuoton) {
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
    console.log('');
    
    console.log('=== LOGS DETALLADOS DE CADA ITERACIÓN ===');
    console.log('Iter | Cuota Min | Cuota Max | Cuota Prueba | Saldo Final | Acción');
    console.log('-----|-----------|-----------|--------------|-------------|--------');
    
    while (iteraciones < maxIteraciones) {
        const cuotaPrueba = Math.round((cuotaMin + cuotaMax) / 2);
        const resultado = calcularAmortizacionConCuoton(monto, tasaMensual, cuotas, fechaFirma, primerVencimiento, cuotaPrueba, cuoton);
        const saldoFinal = resultado.saldoFinal;
        
        if (iteraciones === 0) {
            // Mostrar detalle completo de todas las cuotas en la primera iteración
            console.log('');
            console.log('=== DETALLE COMPLETO DE TODAS LAS CUOTAS (PRIMERA ITERACIÓN) ===');
            console.log('Cuota | Fecha      | Días | Saldo Inicial | Cuota    | Interés  | Capital  | Saldo Final');
            console.log('------|------------|------|---------------|----------|----------|----------|------------');
            
            resultado.cronograma.forEach((fila) => {
                console.log(
                    `${fila.cuota.toString().padStart(4)} | ${fila.fechaVencimiento} | ${fila.dias.toString().padStart(4)} | ${fila.saldoInicial.toFixed(0).padStart(13)} | ${fila.cuota.toFixed(0).padStart(8)} | ${fila.interes.toFixed(0).padStart(8)} | ${fila.capital.toFixed(0).padStart(8)} | ${fila.saldoFinal.toFixed(0)}`
                );
            });
            console.log('');
        }
        
        console.log(`${(iteraciones + 1).toString().padStart(4)} | ${cuotaMin.toFixed(0).padStart(9)} | ${cuotaMax.toFixed(0).padStart(9)} | ${cuotaPrueba.toFixed(0).padStart(12)} | ${saldoFinal.toFixed(0).padStart(11)} | ${saldoFinal > 0 ? 'BAJAR' : 'SUBIR'}`);
        
        if (Math.abs(saldoFinal) <= tolerancia) {
            console.log('');
            console.log(`✅ CONVERGENCIA ALCANZADA en iteración ${iteraciones + 1}`);
            console.log(`Cuota final: $${cuotaPrueba.toFixed(6)}`);
            console.log(`Saldo final: $${saldoFinal.toFixed(6)}`);
            
            // Redondear la cuota final a entero y recalcular el cronograma
            const cuotaFinal = Math.round(cuotaPrueba);
            const resultadoFinal = calcularAmortizacionConCuoton(monto, tasaMensual, cuotas, fechaFirma, primerVencimiento, cuotaFinal, cuoton);
            const saldoFinalRedondeado = resultadoFinal.saldoFinal;
            if (Math.abs(saldoFinalRedondeado) > 20) {
                throw new Error(`ERROR: El saldo final tras redondear la cuota es mayor a 20: $${saldoFinalRedondeado}`);
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

// Datos del ejemplo CON cuotón
const monto = 15000000;
const tasaMensual = 1.48;
const cuotas = 36;
const fechaFirma = '2025-07-16';
const primerVencimiento = '2025-09-05';
const cuoton = 5000000;

console.log('=== TEST PRÉSTAMO CON CUOTÓN ===');
console.log('');

const cronograma = buscarCuotaFijaConCuoton(monto, tasaMensual, cuotas, fechaFirma, primerVencimiento, cuoton);

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
    console.log('=== ÚLTIMA CUOTA ===');
    const ultimaFila = cronograma[cronograma.length - 1];
    console.log(
        `${ultimaFila.cuota.toString().padStart(4)} | ${ultimaFila.fechaVencimiento} | ${ultimaFila.dias.toString().padStart(4)} | ${ultimaFila.saldoInicial.toFixed(0).padStart(13)} | ${ultimaFila.cuota.toFixed(0).padStart(8)} | ${ultimaFila.interes.toFixed(0).padStart(8)} | ${ultimaFila.capital.toFixed(0).padStart(8)} | ${ultimaFila.saldoFinal.toFixed(0).padStart(11)}`
    );
    
    console.log('');
    console.log('=== RESUMEN FINAL ===');
    const cuotaFija = cronograma[0].cuota;
    const totalIntereses = cronograma.reduce((sum, fila) => sum + fila.interes, 0);
    const totalCapital = cronograma.reduce((sum, fila) => sum + fila.capital, 0);
    const saldoFinal = cronograma[cronograma.length - 1].saldoFinal;
    
    console.log(`Cuota fija: $${cuotaFija.toFixed(6)}`);
    console.log(`Total intereses: $${totalIntereses.toFixed(0)}`);
    console.log(`Total capital: $${totalCapital.toFixed(0)}`);
    console.log(`Saldo final: $${saldoFinal.toFixed(6)}`);
    console.log(`Total pagado: $${(totalIntereses + totalCapital).toFixed(0)}`);
    console.log(`Cuotas totales: ${cronograma.length}`);
} 