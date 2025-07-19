
// Gastos de Cobranza en Chile (según Ley 21.234)
// Los porcentajes se aplican sobre el monto de la obligación vencida.
export const LATE_FEE_RULES = [
  { maxDebtUF: 10, percentage: 0.09 },
  { maxDebtUF: 50, percentage: 0.06 },
  { maxDebtUF: Infinity, percentage: 0.03 },
];

export const PENALTY_INTEREST_SURCHARGE = 1.5; // Interés penal = interés corriente * 1.5
