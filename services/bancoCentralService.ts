import { FinancialData } from '../types';

// Proxy interno (nuestro servidor Express)
const PROXY_API_BASE = 'http://localhost:3001/api';

export const fetchFinancialData = async (): Promise<FinancialData> => {
  try {
    console.log('🌐 Frontend: Fetching financial data from proxy server...');
    console.log('🌐 Frontend: URL:', `${PROXY_API_BASE}/financial-data`);
    
    const response = await fetch(`${PROXY_API_BASE}/financial-data`);
    
    console.log('🌐 Frontend: Response status:', response.status);
    console.log('🌐 Frontend: Response ok:', response.ok);
    
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    
    const data: FinancialData = await response.json();
    console.log('✅ Frontend: Successfully fetched from proxy:', data);
    
    return data;
  } catch (error) {
    console.error('❌ Frontend: Error fetching from proxy server, using fallback data:', error);
    
    // Datos de fallback actualizados (valores aproximados actuales)
    const fallbackData = {
      ufValue: 39300, // Valor actualizado de UF (cerca de 39300)
      tmcRate: 35.5   // TMC aproximada
    };
    
    console.log('🔄 Frontend: Using fallback data:', fallbackData);
    return fallbackData;
  }
}; 