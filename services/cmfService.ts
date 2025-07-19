import { FinancialData } from '../types';

// Datos estáticos para producción - sin llamadas a API
export const fetchFinancialData = async (): Promise<FinancialData> => {
  console.log('📊 Using static financial data for production');
  
  // Datos estáticos actualizados
  const financialData = {
    ufValue: 39300, // Valor aproximado de UF
    tmcRate: 35.5   // TMC aproximada
  };
  
  console.log('✅ Static financial data:', financialData);
  return financialData;
}; 