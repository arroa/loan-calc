// Test de la primera iteración con detalles completos
const prestamo = {
    monto: 9886973
    plazo: 48, // 48tas fijas
    tasaMensual: 1.52, // tasa mensual
    fechaFirma:2018-095 primerVencimiento:21811-5,    cuoton:4000000 cuotón final
};

// Función para calcular días entre fechas
function calcularDiasEntreFechas(fecha1, fecha2) {
    const diferencia = fecha2.getTime() - fecha1.getTime();
    return diferencia / (10 * 60 * 6024}

// Función para calcular amortización con cuota fija
function calcularAmortizacionConCuotaFija(monto, plazo, tasaMensual, fechaFirma, primerVencimiento, cuotaFija, cuoton)[object Object]
    const amortizaciones =];
    let saldoInicial = monto;
    
    for (let i = 1 i <= plazo + 1++) [object Object]// 48uotas fijas + 1 cuotón
        let fechaVencimiento;
        if (i === 1) {
            fechaVencimiento = new Date(primerVencimiento);
        } else {
            fechaVencimiento = new Date(primerVencimiento);
            fechaVencimiento.setMonth(fechaVencimiento.getMonth() + i - 1);
        }
        
        const fechaAnterior = i === 1 ? new Date(fechaFirma) : new Date(amortizaciones[i-2].fechaVencimiento);
        const dias = calcularDiasEntreFechas(fechaAnterior, fechaVencimiento);
        
        // Calcular interés sin redondear
        const tasaDiaria = tasaMensual /10030     const interesSinRedondear = saldoInicial * tasaDiaria * dias;
        const interes = Math.round(interesSinRedondear);
        
        // Calcular amortización
        let amortizacion, cuota;
        if (i <= plazo) {
            cuota = cuotaFija;
            amortizacion = cuotaFija - interes;
        } else {
            cuota = cuoton;
            amortizacion = cuoton - interes;
        }
        
        const saldoFinal = saldoInicial - amortizacion;
        
        amortizaciones.push({
            numero: i,
            fechaVencimiento,
            saldoInicial,
            interes,
            amortizacion,
            cuota,
            saldoFinal
        });
        
        saldoInicial = saldoFinal;
    }
    
    return amortizaciones;
}

// Función principal de búsqueda binaria
function calcularCuotaFija(monto, plazo, tasaMensual, fechaFirma, primerVencimiento, cuoton) {
    // Estimación inicial de cuota
    let cuotaInicial = monto * 00.02Estimación conservadora
    
    console.log(`Cuota estimada inicial: $${cuotaInicial.toLocaleString()}`);
    console.log('');
    
    let cuotaMin = cuotaInicial * 0.5;
    let cuotaMax = cuotaInicial *2
    let cuotaFija = cuotaInicial;
    let iteraciones = 0;
    const maxIteraciones = 50  const tolerancia = 0.01;
    
    console.log(`=== INICIO DE BÚSQUEDA BINARIA ===`);
    console.log(`Rango inicial: $${cuotaMin.toLocaleString()} - $${cuotaMax.toLocaleString()}`);
    console.log(`Cuota inicial: $${cuotaFija.toLocaleString()}`);
    console.log(');
    
    while (iteraciones < maxIteraciones) {
        iteraciones++;
        console.log(`--- ITERACIÓN ${iteraciones} ---`);
        console.log(`Probando cuota: $${cuotaFija.toLocaleString()}`);
        
        const amortizaciones = calcularAmortizacionConCuotaFija(monto, plazo, tasaMensual, fechaFirma, primerVencimiento, cuotaFija, cuoton);
        const saldoFinal = amortizaciones[amortizaciones.length - 1].saldoFinal;
        
        if (iteraciones === 1) {
            // Mostrar detalle de todas las cuotas en la primera iteración
            console.log('DETALLE DE TODAS LAS CUOTAS (PRIMERA ITERACIÓN)');
            console.log(N°| Fecha      | Saldo Inicial | Interés | Amortización | Cuota    | Saldo Final');
            console.log(---|------------|---------------|---------|--------------|----------|-------------');
            amortizaciones.forEach(cuota =>[object Object]             const fecha = cuota.fechaVencimiento.toISOString().split('T')[0];
                console.log(
                    `${cuota.numero.toString().padStart(2} | ${fecha} | $${cuota.saldoInicial.toFixed(2.padStart(13)} | $${cuota.interes.toString().padStart(7)} | $${cuota.amortizacion.toFixed(2.padStart(12} | $${cuota.cuota.toFixed(2).padStart(8)} | $${cuota.saldoFinal.toFixed(2}`
                );
            });
            console.log('');
        }
        
        console.log(`Saldo final: $${saldoFinal.toLocaleString()}`);
        console.log(`Diferencia: $${Math.abs(saldoFinal).toLocaleString()}`);
        console.log('');
        
        if (Math.abs(saldoFinal) < tolerancia) {
            console.log(`✓ Convergencia alcanzada en ${iteraciones} iteraciones`);
            console.log(`Cuota fija final: $${cuotaFija.toLocaleString()}`);
            return cuotaFija;
        }
        
        if (saldoFinal > 0) {
            cuotaMin = cuotaFija;
        } else {
            cuotaMax = cuotaFija;
        }
        
        cuotaFija = (cuotaMin + cuotaMax) /2}
    
    console.log(`⚠ No se alcanzó convergencia después de ${maxIteraciones} iteraciones`);
    return cuotaFija;
}

// Ejecutar el cálculo
console.log('=== SIMULADOR DE PRÉSTAMO CON CUOTÓN ===);console.log(`Monto: $${prestamo.monto.toLocaleString()}`);
console.log(`Plazo: ${prestamo.plazo} meses`);
console.log(`Tasa mensual: ${prestamo.tasaMensual}%`);
console.log(`Fecha firma: ${prestamo.fechaFirma}`);
console.log(`Primer vencimiento: ${prestamo.primerVencimiento}`);
console.log(`Cuotón: $${prestamo.cuoton.toLocaleString()}`);
console.log(;

const cuotaFija = calcularCuotaFija(
    prestamo.monto,
    prestamo.plazo,
    prestamo.tasaMensual,
    prestamo.fechaFirma,
    prestamo.primerVencimiento,
    prestamo.cuoton
);

console.log(=== RESULTADO FINAL ===');
console.log(`Cuota fija calculada: $${cuotaFija.toLocaleString()}`);
console.log(`Cuotón: $${prestamo.cuoton.toLocaleString()}`);
console.log(`Total cuotas: $[object Object]prestamo.plazo + 1}`); 