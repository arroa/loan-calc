import { calcularPrestamo } from './loansdebug.js';
import { LIMITS_CONFIG } from './config.js';

console.log('🧪 INICIANDO PRUEBAS REALISTAS DEL ALGORITMO DE PRÉSTAMOS');
console.log('=' .repeat(80));

// Configuración de pruebas REALISTAS (solo lo implementado)
const configuracion = {
    montos: [500000, 1000000, 3000000, 5000000, 10000000],
    tasas: [0.5, 1.0, 1.79, 2.0], // Solo hasta el límite configurado
    cuotas: [12, 24, 36, 48, 60, 84, 120],
    fechasFirma: ['2025-01-01', '2025-06-15', '2025-12-31'],
    fechasVencimiento: ['2025-02-01', '2025-07-15', '2026-01-31'],
    cuotones: [0, 100000, 500000, 1000000, 2000000] // Cuotones realistas
};

let pruebasExitosas = 0;
let pruebasFallidas = 0;
let errores = [];

function generarCombinacionesRealistas() {
    const combinaciones = [];
    
    // Combinaciones básicas (cuota fija)
    for (const monto of configuracion.montos) {
        for (const tasa of configuracion.tasas) {
            for (const cuota of configuracion.cuotas) {
                for (const fechaFirma of configuracion.fechasFirma) {
                    for (const fechaVencimiento of configuracion.fechasVencimiento) {
                        combinaciones.push({
                            monto,
                            tasaMensual: tasa,
                            cuotas: cuota,
                            fechaFirma,
                            primerVencimiento: fechaVencimiento,
                            cuoton: 0,
                            mesesSinPago: [],
                            cuotasEspeciales: []
                        });
                    }
                }
            }
        }
    }
    
    // Combinaciones con cuotón (funcionalidad implementada)
    for (const monto of [1000000, 3000000, 5000000]) {
        for (const tasa of [1.79, 2.0]) {
            for (const cuota of [24, 36, 48]) {
                for (const cuoton of configuracion.cuotones) {
                    if (cuoton > 0 && cuoton < monto) { // Cuotón menor al monto
                        combinaciones.push({
                            monto,
                            tasaMensual: tasa,
                            cuotas: cuota,
                            fechaFirma: '2025-07-18',
                            primerVencimiento: '2025-12-20',
                            cuoton,
                            mesesSinPago: [],
                            cuotasEspeciales: []
                        });
                    }
                }
            }
        }
    }
    
    // Casos edge específicos (dentro de límites realistas)
    const casosEdge = [
        // Monto mínimo configurado
        {
            monto: 500000,
            tasaMensual: 0.5,
            cuotas: 12,
            fechaFirma: '2025-01-01',
            primerVencimiento: '2025-02-01',
            cuoton: 0,
            mesesSinPago: [],
            cuotasEspeciales: []
        },
        // Tasa mínima configurada
        {
            monto: 1000000,
            tasaMensual: 0.5,
            cuotas: 36,
            fechaFirma: '2025-01-01',
            primerVencimiento: '2025-02-01',
            cuoton: 0,
            mesesSinPago: [],
            cuotasEspeciales: []
        },
        // Tasa máxima configurada
        {
            monto: 1000000,
            tasaMensual: 2.0,
            cuotas: 36,
            fechaFirma: '2025-01-01',
            primerVencimiento: '2025-02-01',
            cuoton: 0,
            mesesSinPago: [],
            cuotasEspeciales: []
        },
        // Muchas cuotas
        {
            monto: 3000000,
            tasaMensual: 1.79,
            cuotas: 120,
            fechaFirma: '2025-01-01',
            primerVencimiento: '2025-02-01',
            cuoton: 0,
            mesesSinPago: [],
            cuotasEspeciales: []
        },
        // Fechas muy cercanas
        {
            monto: 1000000,
            tasaMensual: 1.79,
            cuotas: 36,
            fechaFirma: '2025-01-01',
            primerVencimiento: '2025-01-15',
            cuoton: 0,
            mesesSinPago: [],
            cuotasEspeciales: []
        },
        // Fechas muy separadas
        {
            monto: 1000000,
            tasaMensual: 1.79,
            cuotas: 36,
            fechaFirma: '2025-01-01',
            primerVencimiento: '2025-06-01',
            cuoton: 0,
            mesesSinPago: [],
            cuotasEspeciales: []
        },
        // Cuotón grande pero menor al monto
        {
            monto: 1000000,
            tasaMensual: 1.79,
            cuotas: 36,
            fechaFirma: '2025-01-01',
            primerVencimiento: '2025-02-01',
            cuoton: 800000, // 80% del monto
            mesesSinPago: [],
            cuotasEspeciales: []
        }
    ];
    
    combinaciones.push(...casosEdge);
    
    return combinaciones;
}

function validarResultado(resultado, params, numeroPrueba) {
    const errores = [];
    
    // Validar estructura básica
    if (!resultado || typeof resultado !== 'object') {
        errores.push('Resultado no es un objeto válido');
        return errores;
    }
    
    if (!resultado.success) {
        errores.push(`Error en cálculo: ${resultado.error || 'Error desconocido'}`);
        return errores;
    }
    
    // Validar resumen
    if (!resultado.resumen) {
        errores.push('Falta resumen en el resultado');
        return errores;
    }
    
    // Validar cronograma
    if (!resultado.cronograma || !Array.isArray(resultado.cronograma)) {
        errores.push('Cronograma no es un array válido');
        return errores;
    }
    
    const cuotasEsperadas = params.cuotas + (params.cuoton > 0 ? 1 : 0);
    if (resultado.cronograma.length !== cuotasEsperadas) {
        errores.push(`Cantidad de cuotas incorrecta: esperado ${cuotasEsperadas}, obtenido ${resultado.cronograma.length}`);
    }
    
    // Validar cuota fija
    if (typeof resultado.resumen.cuotaFija !== 'number' || resultado.resumen.cuotaFija <= 0) {
        errores.push(`Cuota fija inválida: ${resultado.resumen.cuotaFija}`);
    }
    
    // Validar cada fila del cronograma
    let capitalAnterior = params.monto;
    
    for (let i = 0; i < resultado.cronograma.length; i++) {
        const fila = resultado.cronograma[i];
        
        // Validar estructura de fila
        if (!fila.numeroCuota || !fila.fechaVencimiento || 
            typeof fila.capitalInicial !== 'number' || 
            typeof fila.valorCuota !== 'number' || 
            typeof fila.interes !== 'number' || 
            typeof fila.capital !== 'number' || 
            typeof fila.capitalResidual !== 'number') {
            errores.push(`Fila ${i + 1}: Estructura de datos inválida`);
            continue;
        }
        
        // Validar número de cuota
        if (fila.numeroCuota !== i + 1) {
            errores.push(`Fila ${i + 1}: Número de cuota incorrecto: esperado ${i + 1}, obtenido ${fila.numeroCuota}`);
        }
        
        // Validar capital inicial
        if (Math.abs(fila.capitalInicial - capitalAnterior) > 1) {
            errores.push(`Fila ${i + 1}: Capital inicial incorrecto: esperado ${capitalAnterior}, obtenido ${fila.capitalInicial}`);
        }
        
        // Validar que los valores sean positivos (excepto capital que puede ser negativo en casos especiales)
        if (fila.valorCuota <= 0) {
            errores.push(`Fila ${i + 1}: Valor cuota debe ser positivo: ${fila.valorCuota}`);
        }
        
        if (fila.interes < 0) {
            errores.push(`Fila ${i + 1}: Interés no puede ser negativo: ${fila.interes}`);
        }
        
        if (fila.capitalResidual < 0) {
            errores.push(`Fila ${i + 1}: Capital residual no puede ser negativo: ${fila.capitalResidual}`);
        }
        
        // Validar consistencia matemática
        const capitalCalculado = fila.valorCuota - fila.interes;
        if (Math.abs(fila.capital - capitalCalculado) > 1) {
            errores.push(`Fila ${i + 1}: Capital inconsistente: ${fila.capital} vs ${capitalCalculado}`);
        }
        
        const residualCalculado = fila.capitalInicial - fila.capital;
        if (Math.abs(fila.capitalResidual - residualCalculado) > 1) {
            errores.push(`Fila ${i + 1}: Capital residual inconsistente: ${fila.capitalResidual} vs ${residualCalculado}`);
        }
        
        capitalAnterior = fila.capitalResidual;
    }
    
    // Validar que el último residual sea 0 (o muy cercano)
    const ultimaFila = resultado.cronograma[resultado.cronograma.length - 1];
    if (ultimaFila && Math.abs(ultimaFila.capitalResidual) > 1) {
        errores.push(`Último capital residual debe ser 0: ${ultimaFila.capitalResidual}`);
    }
    
    return errores;
}

function ejecutarPrueba(params, numeroPrueba) {
    try {
        console.log(`\n🔍 Prueba ${numeroPrueba}:`);
        console.log(`   Monto: $${params.monto.toLocaleString('es-CL')}`);
        console.log(`   Tasa: ${params.tasaMensual}%`);
        console.log(`   Cuotas: ${params.cuotas}`);
        console.log(`   Firma: ${params.fechaFirma} → Vencimiento: ${params.primerVencimiento}`);
        
        if (params.cuoton > 0) {
            console.log(`   Cuotón: $${params.cuoton.toLocaleString('es-CL')}`);
        }
        
        const resultado = calcularPrestamo(params, false);
        const erroresValidacion = validarResultado(resultado, params, numeroPrueba);
        
        if (erroresValidacion.length === 0) {
            console.log(`   ✅ ÉXITO - Cuota: $${resultado.resumen.cuotaFija.toLocaleString('es-CL')}`);
            pruebasExitosas++;
        } else {
            console.log(`   ❌ FALLA:`);
            erroresValidacion.forEach(error => console.log(`      - ${error}`));
            pruebasFallidas++;
            errores.push({
                numeroPrueba,
                params,
                errores: erroresValidacion,
                resultado
            });
        }
        
    } catch (error) {
        console.log(`   💥 ERROR CRÍTICO: ${error.message}`);
        pruebasFallidas++;
        errores.push({
            numeroPrueba,
            params,
            errores: [error.message],
            resultado: null
        });
    }
}

// Ejecutar pruebas
const combinaciones = generarCombinacionesRealistas();
console.log(`📊 Total de combinaciones a probar: ${combinaciones.length}`);
console.log(`📋 Límites configurados:`);
console.log(`   - Monto: $${LIMITS_CONFIG.MIN_LOAN_AMOUNT.toLocaleString()} - $${LIMITS_CONFIG.MAX_LOAN_AMOUNT.toLocaleString()}`);
console.log(`   - Tasa: ${LIMITS_CONFIG.MIN_MONTHLY_RATE}% - ${LIMITS_CONFIG.MAX_MONTHLY_RATE}%`);
console.log(`   - Cuotas: ${LIMITS_CONFIG.MIN_TERM} - ${LIMITS_CONFIG.MAX_TERM}`);

const inicio = Date.now();

for (let i = 0; i < combinaciones.length; i++) {
    ejecutarPrueba(combinaciones[i], i + 1);
    
    // Mostrar progreso cada 20 pruebas
    if ((i + 1) % 20 === 0) {
        console.log(`\n📈 Progreso: ${i + 1}/${combinaciones.length} (${Math.round((i + 1) / combinaciones.length * 100)}%)`);
    }
}

const fin = Date.now();
const tiempoTotal = (fin - inicio) / 1000;

// Resumen final
console.log('\n' + '='.repeat(80));
console.log('📊 RESUMEN FINAL DE PRUEBAS REALISTAS');
console.log('='.repeat(80));
console.log(`⏱️  Tiempo total: ${tiempoTotal.toFixed(2)} segundos`);
console.log(`📈 Total de pruebas: ${combinaciones.length}`);
console.log(`✅ Pruebas exitosas: ${pruebasExitosas}`);
console.log(`❌ Pruebas fallidas: ${pruebasFallidas}`);
console.log(`📊 Tasa de éxito: ${((pruebasExitosas / combinaciones.length) * 100).toFixed(2)}%`);

if (errores.length > 0) {
    console.log('\n🚨 ERRORES ENCONTRADOS:');
    console.log('='.repeat(80));
    errores.forEach((error, index) => {
        console.log(`\n❌ Error ${index + 1} (Prueba ${error.numeroPrueba}):`);
        console.log(`   Parámetros:`, error.params);
        console.log(`   Errores:`, error.errores);
    });
} else {
    console.log('\n🎉 ¡TODAS LAS PRUEBAS PASARON EXITOSAMENTE!');
    console.log('✅ El algoritmo es robusto para las funcionalidades implementadas.');
}

console.log('\n' + '='.repeat(80)); 