// Test del nuevo algoritmo implementado
const { calculateAmortization } = require('./services/loanCalculator.ts');

// Datos del crédito real
const testParams = {
  amount: 13009023,
  term: 48,
  interestRate: 1.99,
  rateType: 'monthly',
  startDate: '2024-02-09',
  firstPaymentDate: '2024-04-05',
  graceMonths: 0,
  balloonPayment: 0
};

const testFinancialData = {
  ufValue: 30000,
  tmcRate: 25.23
};

console.log('=== TEST DEL NUEVO ALGORITMO ===');
console.log(`Principal: $${testParams.amount.toLocaleString('es-CL')}`);
console.log(`Tasa mensual: ${testParams.interestRate}%`);
console.log(`Plazo: ${testParams.term} meses`);
console.log(`Fecha inicio: ${testParams.startDate}`);
console.log(`Primer pago: ${testParams.firstPaymentDate}`);

try {
  const schedule = calculateAmortization(testParams, testFinancialData);
  
  console.log('\n=== RESULTADOS ===');
  console.log(`Cuota calculada: $${Math.round(schedule[0].totalPayment).toLocaleString('es-CL')}`);
  console.log(`Saldo final: $${Math.round(schedule[schedule.length - 1].remainingBalance).toLocaleString('es-CL')}`);
  
  console.log('\n=== PRIMERAS CUOTAS ===');
  for (let i = 0; i < 3; i++) {
    const cuota = schedule[i];
    console.log(`Cuota ${cuota.installmentNumber}: ${cuota.paymentDate} | Capital $${Math.round(cuota.principal).toLocaleString('es-CL')} | Interés $${Math.round(cuota.interest).toLocaleString('es-CL')} | Saldo $${Math.round(cuota.remainingBalance).toLocaleString('es-CL')} | ${cuota.notes}`);
  }
  
  console.log('\n=== ÚLTIMAS CUOTAS ===');
  for (let i = schedule.length - 3; i < schedule.length; i++) {
    const cuota = schedule[i];
    console.log(`Cuota ${cuota.installmentNumber}: ${cuota.paymentDate} | Capital $${Math.round(cuota.principal).toLocaleString('es-CL')} | Interés $${Math.round(cuota.interest).toLocaleString('es-CL')} | Saldo $${Math.round(cuota.remainingBalance).toLocaleString('es-CL')} | ${cuota.notes}`);
  }
  
  // Verificar totales
  const totalInterest = schedule.reduce((sum, inst) => sum + inst.interest, 0);
  const totalPrincipal = schedule.reduce((sum, inst) => sum + inst.principal, 0);
  
  console.log('\n=== TOTALES ===');
  console.log(`Total intereses: $${Math.round(totalInterest).toLocaleString('es-CL')}`);
  console.log(`Total principal: $${Math.round(totalPrincipal).toLocaleString('es-CL')}`);
  console.log(`Total pagado: $${Math.round(totalInterest + totalPrincipal).toLocaleString('es-CL')}`);
  
} catch (error) {
  console.error('Error:', error.message);
} 