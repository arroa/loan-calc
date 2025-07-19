import { calculateAmortization } from './services/loanCalculator';
import { LoanParams, FinancialData } from './types';

// Datos del documento real
const realDocumentData = {
  amount: 9501696, // Monto a financiar
  taxAmount: 385277, // Impuesto verde
  totalAmount: 9886973, // Monto total a amortizar
  term: 48,
  fixedPayment: 294527,
  firstPaymentDate: '2018-11-05',
  startDate: '2018-09-27'
};

// Crear parámetros para nuestro simulador
const testParams: LoanParams = {
  amount: realDocumentData.amount + realDocumentData.taxAmount, // Incluir impuesto verde
  term: realDocumentData.term,
  interestRate: 0, // Vamos a calcular la tasa que necesitamos
  rateType: 'monthly' as const,
  startDate: realDocumentData.startDate,
  firstPaymentDate: realDocumentData.firstPaymentDate,
  graceMonths: 0,
  balloonPayment: 0
};

// Datos financieros simulados (no afectan el cálculo de amortización)
const testFinancialData: FinancialData = {
  ufValue: 30000,
  tmcRate: 25.23
};

// Función para encontrar la tasa que produce la cuota fija deseada
function findRateForFixedPayment(principal: number, term: number, targetPayment: number): number {
  let lowRate = 0.001; // 0.1% mensual
  let highRate = 0.05; // 5% mensual
  let midRate = 0;
  let tolerance = 0.01; // $1 de tolerancia
  
  for (let i = 0; i < 100; i++) { // Máximo 100 iteraciones
    midRate = (lowRate + highRate) / 2;
    
    // Calcular cuota con tasa media
    const factor = Math.pow(1 + midRate, term);
    const calculatedPayment = principal * (midRate * factor) / (factor - 1);
    
    if (Math.abs(calculatedPayment - targetPayment) < tolerance) {
      return midRate;
    }
    
    if (calculatedPayment > targetPayment) {
      highRate = midRate;
    } else {
      lowRate = midRate;
    }
  }
  
  return midRate;
}

// Calcular la tasa necesaria
const requiredRate = findRateForFixedPayment(
  realDocumentData.totalAmount, 
  realDocumentData.term, 
  realDocumentData.fixedPayment
);

console.log('=== VALIDACIÓN CONTRA DOCUMENTO REAL ===');
console.log(`Monto a financiar: $${realDocumentData.amount.toLocaleString('es-CL')}`);
console.log(`Impuesto verde: $${realDocumentData.taxAmount.toLocaleString('es-CL')}`);
console.log(`Monto total a amortizar: $${realDocumentData.totalAmount.toLocaleString('es-CL')}`);
console.log(`Plazo: ${realDocumentData.term} meses`);
console.log(`Cuota fija real: $${realDocumentData.fixedPayment.toLocaleString('es-CL')}`);
console.log(`Tasa mensual calculada: ${(requiredRate * 100).toFixed(4)}%`);
console.log(`Tasa anual equivalente: ${(requiredRate * 12 * 100).toFixed(2)}%`);

// Actualizar parámetros con la tasa calculada
testParams.interestRate = requiredRate * 100;

// Calcular con nuestro algoritmo
const calculatedSchedule = calculateAmortization(testParams, testFinancialData);

// Validar primeras cuotas
console.log('\n=== COMPARACIÓN DE PRIMERAS CUOTAS ===');
console.log('Cuota | Fecha Real | Cuota Real | Cuota Calculada | Diferencia');
console.log('------|------------|------------|-----------------|-----------');

for (let i = 0; i < Math.min(5, calculatedSchedule.length); i++) {
  const real = calculatedSchedule[i];
  const difference = real.totalPayment - realDocumentData.fixedPayment;
  
  console.log(
    `${real.installmentNumber.toString().padStart(4)} | ` +
    `${real.paymentDate} | ` +
    `$${realDocumentData.fixedPayment.toLocaleString('es-CL')} | ` +
    `$${real.totalPayment.toLocaleString('es-CL')} | ` +
    `$${difference.toLocaleString('es-CL')}`
  );
}

// Validar última cuota
const lastReal = calculatedSchedule[calculatedSchedule.length - 1];
console.log('\n=== ÚLTIMA CUOTA ===');
console.log(`Cuota ${lastReal.installmentNumber}: $${lastReal.totalPayment.toLocaleString('es-CL')}`);
console.log(`Saldo final: $${lastReal.remainingBalance.toLocaleString('es-CL')}`);

// Validar totales
const totalInterest = calculatedSchedule.reduce((sum, inst) => sum + inst.interest, 0);
const totalPrincipal = calculatedSchedule.reduce((sum, inst) => sum + inst.principal, 0);

console.log('\n=== TOTALES ===');
console.log(`Total intereses real: $${(realDocumentData.fixedPayment * realDocumentData.term - realDocumentData.totalAmount).toLocaleString('es-CL')}`);
console.log(`Total intereses calculado: $${totalInterest.toLocaleString('es-CL')}`);
console.log(`Total principal: $${totalPrincipal.toLocaleString('es-CL')}`);
console.log(`Total pagado: $${(totalPrincipal + totalInterest).toLocaleString('es-CL')}`);

export { testParams, testFinancialData, realDocumentData }; 