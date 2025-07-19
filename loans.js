// ========================================
// ALGORITMO DE PRÉSTAMOS - VERSIÓN CORREGIDA
// ========================================
// Implementación del algoritmo de amortización francesa
// con soporte para cuotón, casos especiales y validaciones robustas
// Preparado para exposición como API a terceros

import { LIMITS_CONFIG } from './config.js';

// ========================================
// VALIDACIONES ROBUSTAS PARA API
// ========================================

function validarParametrosEntrada(params) {
    const errores = [];
    const warnings = [];

    // Validaciones obligatorias
    if (!params.monto || params.monto <= 0) {
        errores.push('El monto del préstamo es obligatorio y debe ser mayor a 0');
    } else if (params.monto < LIMITS_CONFIG.MIN_LOAN_AMOUNT) {
        errores.push(`El monto mínimo es $${LIMITS_CONFIG.MIN_LOAN_AMOUNT.toLocaleString()}`);
    } else if (params.monto > LIMITS_CONFIG.MAX_LOAN_AMOUNT) {
        errores.push(`El monto máximo es $${LIMITS_CONFIG.MAX_LOAN_AMOUNT.toLocaleString()}`);
    }

    if (!params.tasaMensual || params.tasaMensual <= 0) {
        errores.push('La tasa mensual es obligatoria y debe ser mayor a 0');
    } else if (params.tasaMensual < LIMITS_CONFIG.MIN_MONTHLY_RATE) {
        errores.push(`La tasa mínima es ${LIMITS_CONFIG.MIN_MONTHLY_RATE}% mensual`);
    } else if (params.tasaMensual > LIMITS_CONFIG.MAX_MONTHLY_RATE) {
        errores.push(`La tasa máxima es ${LIMITS_CONFIG.MAX_MONTHLY_RATE}% mensual`);
    }

    if (!params.cuotas || params.cuotas <= 0) {
        errores.push('El número de cuotas es obligatorio y debe ser mayor a 0');
    } else if (params.cuotas < LIMITS_CONFIG.MIN_TERM) {
        errores.push(`El plazo mínimo es ${LIMITS_CONFIG.MIN_TERM} meses`);
    } else if (params.cuotas > LIMITS_CONFIG.MAX_TERM) {
        errores.push(`El plazo máximo es ${LIMITS_CONFIG.MAX_TERM} meses`);
    }

    if (!params.fechaFirma) {
        errores.push('La fecha de firma es obligatoria');
    } else if (!esFechaValida(params.fechaFirma)) {
        errores.push('La fecha de firma no es válida');
    }

    if (!params.primerVencimiento) {
        errores.push('La fecha de primer vencimiento es obligatoria');
    } else if (!esFechaValida(params.primerVencimiento)) {
        errores.push('La fecha de primer vencimiento no es válida');
    }

    // Validaciones de fechas
    if (params.fechaFirma && params.primerVencimiento) {
        const fechaFirma = new Date(params.fechaFirma);
        const primerVenc = new Date(params.primerVencimiento);
        
        if (primerVenc <= fechaFirma) {
            errores.push('La fecha de primer vencimiento debe ser posterior a la fecha de firma');
        }
    }

    // Validaciones de cuotón
    if (params.cuoton !== undefined && params.cuoton !== null) {
        if (params.cuoton < 0) {
            errores.push('El cuotón no puede ser negativo');
        } else if (params.cuoton >= params.monto) {
            errores.push('El cuotón debe ser menor al monto del préstamo');
        }
    }

    // Validaciones de casos especiales
    if (params.mesesSinPago && Array.isArray(params.mesesSinPago)) {
        params.mesesSinPago.forEach(mes => {
            if (mes < 1 || mes > 12) {
                errores.push(`Mes sin pago inválido: ${mes}. Debe estar entre 1 y 12`);
            }
        });
    }

    if (params.cuotasEspeciales && Array.isArray(params.cuotasEspeciales)) {
        params.cuotasEspeciales.forEach(cuota => {
            if (!cuota.mes || cuota.mes < 1 || cuota.mes > 12) {
                errores.push(`Mes de cuota especial inválido: ${cuota.mes}`);
            }
            if (!cuota.valor || cuota.valor <= 0) {
                errores.push(`Valor de cuota especial inválido: ${cuota.valor}`);
            }
        });
    }

    // Validaciones de complejidad
    if (params.monto && params.tasaMensual && params.cuotas) {
        const tasaAnual = params.tasaMensual * 12;
        const factorComplejidad = (tasaAnual / 100) * params.cuotas;
        
        if (factorComplejidad > 50) {
            warnings.push(`Combinación de tasa (${tasaAnual.toFixed(1)}% anual) y plazo (${params.cuotas} meses) muy alta. Puede causar problemas de convergencia.`);
        }
    }

    return { errores, warnings };
}

function esFechaValida(fecha) {
    const date = new Date(fecha);
    return date instanceof Date && !isNaN(date);
}

// ========================================
// FUNCIONES DE FECHAS
// ========================================

function calcularDiasEntreFechas(fechaInicio, fechaFin) {
    const inicio = new Date(fechaInicio);
    const fin = new Date(fechaFin);
    const diffTime = fin - inicio;
    const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));
    return diffDays;
}

function generarFechasVencimiento(fechaPrimerVencimiento, cantidadCuotas) {
    const fechas = [];
    const [año, mes, dia] = fechaPrimerVencimiento.split('-').map(Number);
    
    for (let i = 0; i < cantidadCuotas; i++) {
        let nuevoMes = mes + i;
        let nuevoAño = año;
        
        // Ajustar año si pasamos de diciembre
        while (nuevoMes > 12) {
            nuevoMes -= 12;
            nuevoAño += 1;
        }
        
        // Crear fecha con el día original
        let nuevaFecha = new Date(nuevoAño, nuevoMes - 1, dia);
        
        // Caso especial: si el día no existe en el mes, usar último día
        if (nuevaFecha.getDate() !== dia) {
            nuevaFecha = new Date(nuevoAño, nuevoMes, 0); // Último día del mes
        }
        
        fechas.push(nuevaFecha.toISOString().split('T')[0]);
    }
    
    return fechas;
}

// ========================================
// ALGORITMO PRINCIPAL
// ========================================

function generarTablaAmortizacion(params, cuotaVariable) {
    const {
        monto,
        tasaMensual,
        cuotas,
        fechaFirma,
        primerVencimiento,
        cuoton = 0,
        mesesSinPago = [],
        cuotasEspeciales = []
    } = params;

    const tabla = [];
    let capitalInicial = monto;
    const fechasVencimiento = generarFechasVencimiento(primerVencimiento, cuotas + (cuoton > 0 ? 1 : 0));
    
    // Procesar cada cuota
    for (let i = 0; i < cuotas; i++) {
        const numeroCuota = i + 1;
        const fechaVencimiento = fechasVencimiento[i];
        
        // Calcular días del período
        let dias;
        if (i === 0) {
            dias = calcularDiasEntreFechas(fechaFirma, fechaVencimiento);
        } else {
            const fechaAnterior = tabla[i - 1].fechaVencimiento;
            dias = calcularDiasEntreFechas(fechaAnterior, fechaVencimiento);
        }
        
        // Calcular tasa del período
        const tasaPeriodo = (tasaMensual / 30 / 100) * dias;
        
        // Determinar valor de cuota
        let valorCuota = cuotaVariable;
        
        // Verificar si es cuota especial
        const cuotaEspecial = cuotasEspeciales.find(c => c.mes === numeroCuota);
        if (cuotaEspecial) {
            valorCuota = cuotaEspecial.valor;
        }
        
        // Verificar si es mes sin pago
        const esMesSinPago = mesesSinPago.includes(numeroCuota);
        if (esMesSinPago) {
            valorCuota = 0;
        }
        
        // Calcular interés y capital
        const interes = Math.round(capitalInicial * tasaPeriodo);
        const capital = valorCuota - interes;
        const capitalResidual = capitalInicial - capital;
        
        tabla.push({
            numeroCuota,
            fechaVencimiento,
            dias,
            tasaPeriodo,
            capitalInicial,
            valorCuota,
            interes,
            capital,
            capitalResidual
        });
        
        capitalInicial = capitalResidual;
    }
    
    // Agregar cuotón si existe
    if (cuoton > 0) {
        const numeroCuota = cuotas + 1;
        const fechaVencimiento = fechasVencimiento[cuotas];
        const fechaAnterior = tabla[cuotas - 1].fechaVencimiento;
        const dias = calcularDiasEntreFechas(fechaAnterior, fechaVencimiento);
        const tasaPeriodo = (tasaMensual / 30 / 100) * dias;
        const interes = Math.round(capitalInicial * tasaPeriodo);
        const capital = cuoton - interes;
        const capitalResidual = capitalInicial - capital;
        
        tabla.push({
            numeroCuota,
            fechaVencimiento,
            dias,
            tasaPeriodo,
            capitalInicial,
            valorCuota: cuoton,
            interes,
            capital,
            capitalResidual
        });
    }
    
    return tabla;
}

function buscarCuotaFija(params) {
    const { monto, cuotas, cuoton = 0 } = params;
    
    // Parámetros de iteración
    const tolerancia = 20; // pesos
    const toleranciaVariacion = 1; // pesos - Reducida para mayor precisión
    const maxIteraciones = 100;
    
    // Inicialización
    let cuotaInicial = Math.round(monto / 4); // 1/4 del capital
    let cuotaMin = 0;
    let cuotaMax = monto;
    let iteraciones = 0;
    let cuotaAnterior = 0;
    
    while (iteraciones < maxIteraciones) {
        const cuotaPrueba = Math.round((cuotaMin + cuotaMax) / 2);
        
        // Generar tabla con la cuota actual
        const tabla = generarTablaAmortizacion(params, cuotaPrueba);
        const capitalResidualFinal = tabla[tabla.length - 1].capitalResidual;
        
        // Verificar convergencia por variación de cuota
        if (iteraciones > 0 && Math.abs(cuotaPrueba - cuotaAnterior) <= toleranciaVariacion) {
            // Ajustar residual final
            if (Math.abs(capitalResidualFinal) > 0) {
                tabla[tabla.length - 1].capital += capitalResidualFinal;
                tabla[tabla.length - 1].valorCuota += capitalResidualFinal;
                tabla[tabla.length - 1].capitalResidual = 0;
            }
            
            return tabla;
        }
        
        // Verificar convergencia por tolerancia
        if (Math.abs(capitalResidualFinal) <= tolerancia) {
            // Ajustar residual final
            if (Math.abs(capitalResidualFinal) > 0) {
                tabla[tabla.length - 1].capital += capitalResidualFinal;
                tabla[tabla.length - 1].valorCuota += capitalResidualFinal;
                tabla[tabla.length - 1].capitalResidual = 0;
            }
            
            return tabla;
        }
        
        // Ajustar rango de búsqueda
        if (capitalResidualFinal > 0) {
            cuotaMin = cuotaPrueba;
        } else {
            cuotaMax = cuotaPrueba;
        }
        
        cuotaAnterior = cuotaPrueba;
        iteraciones++;
    }
    
    // No se alcanzó convergencia
    throw new Error(`No se alcanzó convergencia después de ${maxIteraciones} iteraciones`);
}

// ========================================
// FUNCIÓN PRINCIPAL EXPORTADA (COMPATIBILIDAD)
// ========================================

function calcularPrestamo(monto, tasaMensual, cuotas, fechaFirma, primerVencimiento, cuoton = 0) {
    try {
        // Preparar parámetros en formato del nuevo algoritmo
        const params = {
            monto,
            tasaMensual,
            cuotas,
            fechaFirma,
            primerVencimiento,
            cuoton
        };
        
        // Validar parámetros de entrada
        const validacion = validarParametrosEntrada(params);
        
        if (validacion.errores.length > 0) {
            return {
                success: false,
                error: 'Parámetros inválidos',
                detalles: validacion.errores,
                warnings: validacion.warnings
            };
        }
        
        if (validacion.warnings.length > 0) {
            console.warn('⚠️ Advertencias:', validacion.warnings);
        }
        
        // Ejecutar algoritmo
        const tabla = buscarCuotaFija(params);
        
        // Calcular resumen
        const cuotaFija = tabla[0].valorCuota;
        const totalIntereses = tabla.reduce((sum, fila) => sum + fila.interes, 0);
        const totalCapital = tabla.reduce((sum, fila) => sum + fila.capital, 0);
        const saldoFinal = tabla[tabla.length - 1].capitalResidual;
        const ultimaCuota = tabla[tabla.length - 1];
        
        const resumen = {
            cuotaFija: cuotaFija,
            totalIntereses: totalIntereses,
            totalCapital: totalCapital,
            saldoFinal: saldoFinal,
            totalPagado: totalIntereses + totalCapital,
            cantidadCuotas: tabla.length,
            ultimaCuota: {
                numero: ultimaCuota.numeroCuota,
                valorOriginal: cuotaFija,
                valorAjustado: ultimaCuota.valorCuota,
                ajuste: ultimaCuota.valorCuota - cuotaFija
            }
        };
        
        return {
            success: true,
            cronograma: tabla,
            resumen: resumen
        };
        
    } catch (error) {
        console.error('❌ Error en cálculo:', error.message);
        return {
            success: false,
            error: error.message
        };
    }
}

// ========================================
// EXPORTACIONES
// ========================================

export { 
    calcularPrestamo, 
    validarParametrosEntrada,
    generarTablaAmortizacion,
    buscarCuotaFija
}; 