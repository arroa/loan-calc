// Test del primer ejemplo sin cuotón - JavaScript puro
const principal = 9886973;
const monthlyRate = 0.0152; // 1.52%
const term = 48;
const startDate = new Date('2018-09-25');
const firstPaymentDate = new Date('2018-11-05');

// Función para calcular días entre fechas
function daysBetween(date1, date2) {
  const oneDay = 24 * 60 * 60 * 1000;
  return Math.round(Math.abs((date2.getTime() - date1.getTime()) / oneDay));
}

// Algoritmo iterativo con días exactos
function calculateFixedPaymentIterative() {
  let lowPayment = principal / term * 0.5;
  let highPayment = principal / term * 2;
  let tolerance = 0.01;
  let iterations = 0;
  
  while (iterations < 100) {
    const testPayment = (lowPayment + highPayment) / 2;
    
    // Calcular todas las cuotas con este pago
    let balance = principal;
    const schedule = [];
    
    for (let i = 0; i < term; i++) {
      // Calcular fecha de la cuota
      const paymentDate = new Date(firstPaymentDate);
      paymentDate.setMonth(paymentDate.getMonth() + i);
      
      // Calcular días del período
      let periodDays;
      if (i === 0) {
        periodDays = daysBetween(startDate, paymentDate);
      } else {
        const prevPaymentDate = new Date(firstPaymentDate);
        prevPaymentDate.setMonth(prevPaymentDate.getMonth() + i - 1);
        periodDays = daysBetween(prevPaymentDate, paymentDate);
      }
      
      // Calcular tasa del período
      const dailyRate = monthlyRate / 30;
      const periodRate = dailyRate * periodDays;
      
      // Calcular interés y capital
      const interest = balance * periodRate;
      const capital = testPayment - interest;
      
      balance = balance - capital;
      
      schedule.push({
        cuota: i + 1,
        fecha: paymentDate.toISOString().split('T')[0],
        dias: periodDays,
        tasaPeriodo: periodRate * 100,
        interes: interest,
        capital: capital,
        saldo: balance,
        cuotaTotal: testPayment
      });
    }
    
    if (Math.abs(balance) < tolerance) {
      console.log(`\nConvergencia en iteración ${iterations + 1}`);
      return { payment: testPayment, schedule: schedule };
    }
    
    if (balance > 0) {
      lowPayment = testPayment;
    } else {
      highPayment = testPayment;
    }
    
    iterations++;
  }
  
  return { payment: (lowPayment + highPayment) / 2, schedule: [] };
}

console.log('=== EJEMPLO 1: SIN CUOTÓN ===');
console.log(`Principal: $${principal.toLocaleString('es-CL')}`);
console.log(`Tasa mensual: ${(monthlyRate * 100).toFixed(2)}%`);
console.log(`Plazo: ${term} meses`);
console.log(`Fecha inicio: ${startDate.toISOString().split('T')[0]}`);
console.log(`Primer pago: ${firstPaymentDate.toISOString().split('T')[0]}`);

const result = calculateFixedPaymentIterative();

console.log('\n=== RESULTADOS ===');
console.log(`Cuota calculada: $${Math.round(result.payment).toLocaleString('es-CL')}`);
console.log(`Saldo final: $${Math.round(result.schedule[result.schedule.length - 1].saldo).toLocaleString('es-CL')}`);

console.log('\n=== PRIMERAS CUOTAS ===');
for (let i = 0; i < 3; i++) {
  const cuota = result.schedule[i];
  console.log(`Cuota ${cuota.cuota}: ${cuota.fecha} | ${cuota.dias} días | ${cuota.tasaPeriodo.toFixed(4)}% | Capital $${Math.round(cuota.capital).toLocaleString('es-CL')} | Interés $${Math.round(cuota.interes).toLocaleString('es-CL')} | Saldo $${Math.round(cuota.saldo).toLocaleString('es-CL')}`);
}

console.log('\n=== ÚLTIMAS CUOTAS ===');
for (let i = term - 3; i < term; i++) {
  const cuota = result.schedule[i];
  console.log(`Cuota ${cuota.cuota}: ${cuota.fecha} | ${cuota.dias} días | ${cuota.tasaPeriodo.toFixed(4)}% | Capital $${Math.round(cuota.capital).toLocaleString('es-CL')} | Interés $${Math.round(cuota.interes).toLocaleString('es-CL')} | Saldo $${Math.round(cuota.saldo).toLocaleString('es-CL')}`);
}

// Verificar totales
const totalInterest = result.schedule.reduce((sum, inst) => sum + inst.interes, 0);
const totalPrincipal = result.schedule.reduce((sum, inst) => sum + inst.capital, 0);

console.log('\n=== TOTALES ===');
console.log(`Total intereses: $${Math.round(totalInterest).toLocaleString('es-CL')}`);
console.log(`Total principal: $${Math.round(totalPrincipal).toLocaleString('es-CL')}`);
console.log(`Total pagado: $${Math.round(totalInterest + totalPrincipal).toLocaleString('es-CL')}`);

// Verificar que el saldo final sea cero
const finalBalance = result.schedule[result.schedule.length - 1].saldo;
console.log(`\nVerificación saldo final: $${Math.round(finalBalance).toLocaleString('es-CL')} ${Math.abs(finalBalance) < 1 ? '✅' : '❌'}`); 