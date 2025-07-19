// Algoritmo de la fuente
const principal = 13009023;
const monthlyRate = 0.0199; // 1.99%
const term = 48;
const startDate = new Date('2024-02-09');
const firstPaymentDate = new Date('2024-04-05');

// Función para calcular días entre fechas
function daysBetween(date1, date2) {
  const oneDay = 24 * 60 * 60 * 1000; // horas*minutos*segundos*milisegundos
  return Math.round(Math.abs((date2 - date1) / oneDay));
}

// Función para calcular cuota con algoritmo iterativo
function calculatePaymentWithIteration() {
  let lowPayment = 400000;
  let highPayment = 500000;
  let tolerance = 0.01;
  let iterations = 0;
  let finalBalance = 0;
  
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
        saldo: balance
      });
    }
    
    finalBalance = balance;
    
    console.log(`Iteración ${iterations + 1}: Cuota $${Math.round(testPayment).toLocaleString('es-CL')}, Saldo final: $${Math.round(finalBalance).toLocaleString('es-CL')}`);
    
    if (Math.abs(finalBalance) < tolerance) {
      console.log('\n=== RESULTADO FINAL ===');
      console.log(`Cuota encontrada: $${Math.round(testPayment).toLocaleString('es-CL')}`);
      console.log(`Saldo final: $${Math.round(finalBalance).toLocaleString('es-CL')}`);
      console.log(`Iteraciones: ${iterations + 1}`);
      
      // Mostrar primeras cuotas
      console.log('\n=== PRIMERAS CUOTAS ===');
      for (let i = 0; i < 3; i++) {
        const cuota = schedule[i];
        console.log(`Cuota ${cuota.cuota}: ${cuota.fecha} | ${cuota.dias} días | ${cuota.tasaPeriodo.toFixed(4)}% | Capital $${Math.round(cuota.capital).toLocaleString('es-CL')} | Interés $${Math.round(cuota.interes).toLocaleString('es-CL')} | Saldo $${Math.round(cuota.saldo).toLocaleString('es-CL')}`);
      }
      
      // Mostrar últimas cuotas
      console.log('\n=== ÚLTIMAS CUOTAS ===');
      for (let i = term - 3; i < term; i++) {
        const cuota = schedule[i];
        console.log(`Cuota ${cuota.cuota}: ${cuota.fecha} | ${cuota.dias} días | ${cuota.tasaPeriodo.toFixed(4)}% | Capital $${Math.round(cuota.capital).toLocaleString('es-CL')} | Interés $${Math.round(cuota.interes).toLocaleString('es-CL')} | Saldo $${Math.round(cuota.saldo).toLocaleString('es-CL')}`);
      }
      
      return testPayment;
    }
    
    if (finalBalance > 0) {
      lowPayment = testPayment;
    } else {
      highPayment = testPayment;
    }
    
    iterations++;
  }
  
  console.log('No se encontró convergencia');
  return null;
}

console.log('=== ALGORITMO DE LA FUENTE ===');
console.log(`Principal: $${principal.toLocaleString('es-CL')}`);
console.log(`Tasa mensual: ${(monthlyRate * 100).toFixed(2)}%`);
console.log(`Plazo: ${term} meses`);
console.log(`Fecha inicio: ${startDate.toISOString().split('T')[0]}`);
console.log(`Primer pago: ${firstPaymentDate.toISOString().split('T')[0]}`);

const result = calculatePaymentWithIteration(); 