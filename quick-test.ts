// Datos del crédito
const principal = 13009023;
const monthlyRate = 0.0199; // 1.99%
const term = 48;

// Fórmula de amortización francesa
const factor = Math.pow(1 + monthlyRate, term);
const monthlyPayment = principal * (monthlyRate * factor) / (factor - 1);

console.log('=== CÁLCULO DE CUOTA MENSUAL ===');
console.log(`Principal: $${principal.toLocaleString('es-CL')}`);
console.log(`Tasa mensual: ${(monthlyRate * 100).toFixed(2)}%`);
console.log(`Plazo: ${term} meses`);
console.log(`Factor: ${factor.toFixed(6)}`);
console.log(`Cuota mensual: $${monthlyPayment.toLocaleString('es-CL')}`);
console.log(`Cuota redondeada: $${Math.round(monthlyPayment).toLocaleString('es-CL')}`);

// Verificar el cálculo
let remainingBalance = principal;
let totalInterest = 0;
let totalPrincipal = 0;

for (let i = 1; i <= term; i++) {
  const interest = remainingBalance * monthlyRate;
  const principalPayment = monthlyPayment - interest;
  
  totalInterest += interest;
  totalPrincipal += principalPayment;
  remainingBalance -= principalPayment;
  
  if (i <= 3 || i >= term - 2) {
    console.log(`Cuota ${i}: Principal $${Math.round(principalPayment).toLocaleString('es-CL')}, Interés $${Math.round(interest).toLocaleString('es-CL')}, Saldo $${Math.round(remainingBalance).toLocaleString('es-CL')}`);
  }
}

console.log('\n=== VERIFICACIÓN ===');
console.log(`Total intereses: $${Math.round(totalInterest).toLocaleString('es-CL')}`);
console.log(`Total principal: $${Math.round(totalPrincipal).toLocaleString('es-CL')}`);
console.log(`Saldo final: $${Math.round(remainingBalance).toLocaleString('es-CL')}`);
console.log(`Total pagado: $${Math.round(totalInterest + totalPrincipal).toLocaleString('es-CL')}`); 