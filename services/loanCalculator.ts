
import { LoanParams, Installment, FinancialData } from '../types';
import { LATE_FEE_RULES, PENALTY_INTEREST_SURCHARGE } from '../constants';

export const calculateAmortization = async (params: LoanParams, financialData: FinancialData): Promise<Installment[]> => {
  // Mapear los parámetros a los nombres esperados por el backend
  const payload = {
    monto: params.amount,
    tasaMensual: params.interestRate,
    cuotas: params.term,
    fechaFirma: params.startDate,
    primerVencimiento: params.firstPaymentDate,
    cuoton: params.balloonPayment || 0
  };

  console.log('📤 Enviando petición al backend:', payload);
  
  const response = await fetch('http://localhost:3001/api/loan/calculate', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload)
  });

  console.log('📥 Respuesta del backend - Status:', response.status);

  if (!response.ok) {
    const errorText = await response.text();
    console.error('❌ Error del backend:', errorText);
    throw new Error('Error al calcular el préstamo');
  }

  const data = await response.json();
  console.log('📥 Datos recibidos del backend:', {
    success: data.success,
    cuotaFija: data.resumen?.cuotaFija,
    cantidadCuotas: data.cronograma?.length,
    resumen: data.resumen
  });
  
  // Mapear la respuesta del backend al formato Installment[] si es necesario
  const mappedSchedule = data.cronograma.map((fila: any, idx: number) => ({
    installmentNumber: fila.numeroCuota || 0,
    paymentDate: fila.fechaVencimiento || '',
    principal: fila.capital || 0,
    interest: fila.interes || 0,
    totalPayment: fila.valorCuota || 0, // Usar el valor de cuota de cada fila
    remainingBalance: fila.capitalResidual || 0, // Corregido: usar capitalResidual en lugar de saldoFinal
    notes: `Período de ${fila.dias || 0} días`,
  }));
  
  console.log('✅ Cronograma mapeado exitosamente:', {
    cantidadCuotas: mappedSchedule.length,
    primeraCuota: mappedSchedule[0],
    ultimaCuota: mappedSchedule[mappedSchedule.length - 1]
  });
  
  return mappedSchedule;
};

// SIMULATION FUNCTIONS

export const applyLateFees = (
  currentSchedule: Installment[], 
  installmentNumber: number, 
  daysLate: number, 
  financialData: FinancialData
): Installment[] => {
  return currentSchedule.map(inst => {
    if (inst.installmentNumber === installmentNumber) {
      const debtInUf = inst.totalPayment / financialData.ufValue;
      const rule = LATE_FEE_RULES.find(r => debtInUf <= r.maxDebtUF);
      const lateFee = rule ? inst.totalPayment * rule.percentage : 0;
      
      const dailyRate = (financialData.tmcRate / 100) / 365;
      const penaltyInterest = inst.totalPayment * dailyRate * PENALTY_INTEREST_SURCHARGE * daysLate;

      return {
        ...inst,
        lateFee,
        penaltyInterest,
        notes: `Simulación de atraso de ${daysLate} días.`
      };
    }
    return inst;
  });
};

export const postponeInstallment = (
  currentSchedule: Installment[],
  installmentNumber: number
): Installment[] => {
    const scheduleCopy = JSON.parse(JSON.stringify(currentSchedule)) as Installment[];
    const index = scheduleCopy.findIndex(inst => inst.installmentNumber === installmentNumber);
    if (index === -1) return currentSchedule;

    const postponedInst = scheduleCopy[index];
    
    // Mark the original installment as postponed
    scheduleCopy[index] = {
        ...postponedInst,
        principal: 0,
        interest: 0,
        totalPayment: 0,
        notes: `Cuota postergada al final del crédito.`
    };

    // Add a new installment at the end
    const lastInstallment = scheduleCopy[scheduleCopy.length - 1];
    const newPaymentDate = new Date(lastInstallment.paymentDate);
    newPaymentDate.setMonth(newPaymentDate.getMonth() + 1);
    
    scheduleCopy.push({
        ...postponedInst,
        installmentNumber: lastInstallment.installmentNumber + 1,
        paymentDate: newPaymentDate.toISOString().split('T')[0],
        remainingBalance: 0, // Simplified for simulation
        notes: `Pago de cuota #${installmentNumber} postergada.`
    });

    return scheduleCopy;
};

export const recalculateOnSkip = (
  currentSchedule: Installment[],
  installmentNumber: number,
  params: LoanParams,
  financialData: FinancialData
): Installment[] => {
    const skipIndex = currentSchedule.findIndex(inst => inst.installmentNumber === installmentNumber);
    if (skipIndex === -1) return currentSchedule;

    const monthlyRate = params.rateType === 'annual' ? params.interestRate / 100 / 12 : params.interestRate / 100;

    // Get the balance just before the skipped payment
    const balanceBeforeSkip = skipIndex > 0 ? currentSchedule[skipIndex-1].remainingBalance : params.amount;
    
    // Interest for the skipped month is capitalized
    const interestOfSkippedMonth = balanceBeforeSkip * monthlyRate;
    const newPrincipal = balanceBeforeSkip + interestOfSkippedMonth;

    const remainingTerm = params.term - installmentNumber;

    if (remainingTerm <= 0) { // Cannot recalculate if it's the last payment
        const modified = [...currentSchedule];
        modified[skipIndex] = {
            ...modified[skipIndex],
            notes: "No se puede recalcular al saltar la última cuota. El saldo queda pendiente.",
            principal: 0,
            interest: 0,
            totalPayment: 0
        };
        return modified;
    }

    // New fixed payment for the rest of the term using the correct algorithm
    // El cuotón se maneja como cuota adicional
    const newTotalTerm = params.balloonPayment > 0 ? remainingTerm + 1 : remainingTerm;
    const newFixedPayment = (balanceBeforeSkip + interestOfSkippedMonth) / newTotalTerm; // Simplified fixed payment calculation

    const newSchedule = [...currentSchedule.slice(0, skipIndex)];
    newSchedule.push({
        ...currentSchedule[skipIndex],
        principal: 0,
        interest: interestOfSkippedMonth,
        totalPayment: 0,
        remainingBalance: newPrincipal,
        notes: `Cuota omitida. Interés capitalizado. El resto del plan se recalcula.`
    });

    let currentBalance = newPrincipal;

    for (let i = 0; i < newTotalTerm; i++) {
        const instNum = installmentNumber + 1 + i;
        const interest = currentBalance * monthlyRate;
        let principal: number;
        let totalPayment: number;
        
        // Si es la última cuota y hay cuotón, la cuota está fijada
        if (i === newTotalTerm - 1 && params.balloonPayment > 0) {
            totalPayment = params.balloonPayment; // Cuota fijada
            principal = totalPayment - interest; // Capital = Cuota fija - Interés
            currentBalance = 0;
        } else if (i === newTotalTerm - 1) {
            // Última cuota normal, ajustar para saldar
            principal = currentBalance;
            totalPayment = principal + interest;
            currentBalance = 0;
        } else {
            // Cuota normal
            totalPayment = newFixedPayment;
            principal = totalPayment - interest;
        currentBalance -= principal;
        }

        const paymentDate = new Date(currentSchedule[skipIndex].paymentDate);
        paymentDate.setMonth(paymentDate.getMonth() + 1 + i);
        
        newSchedule.push({
            installmentNumber: instNum,
            paymentDate: paymentDate.toISOString().split('T')[0],
            principal,
            interest,
            totalPayment,
            remainingBalance: (i === newTotalTerm - 1) ? 0 : currentBalance,
            notes: i === newTotalTerm - 1 && params.balloonPayment > 0 ? `Cuotón final` : `Cuota recalculada`,
        });
    }

    return newSchedule;
};
