import { FinancialData } from '../types';
import { API_CONFIG } from '../config.js';

// API de la CMF (Comisión para el Mercado Financiero) - Formato correcto según documentación
const CMF_API_BASE = 'https://api.cmfchile.cl/api-sbifv3/recursos_api';
const API_KEY = API_CONFIG.CMF_API_KEY || '2620a13c379e4f57bcb9e99c85388301dbc2d2fa'; // Fallback si no está configurada

interface CMFUFResponse {
  UFs: Array<{
    Valor: string;
    Fecha: string;
  }>;
}

interface CMFTMCResponse {
  TMCs: Array<{
    Titulo: string;
    SubTitulo: string;
    Fecha: string;
    Valor: string;
    Tipo: string;
  }>;
}

const fetchFromCMF = async (endpoint: string): Promise<any> => {
  const url = `${CMF_API_BASE}${endpoint}?apikey=${API_KEY}&formato=json`;
  
  try {
    console.log(`🌐 CMF: Fetching from ${url}`);
    console.log(`🔑 CMF: Using API key: ${API_KEY ? 'Configured' : 'Fallback'}`);
    
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 10000); // 10 segundos timeout
    
    const response = await fetch(url, {
      method: 'GET',
      headers: {
        'Accept': 'application/json',
        'Content-Type': 'application/json'
      },
      signal: controller.signal
    });
    
    clearTimeout(timeoutId);
    
    console.log(`📡 CMF: Response status: ${response.status}`);
    
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    
    const data = await response.json();
    console.log(`📊 CMF Response for ${endpoint}:`, data);
    
    return data;
  } catch (error) {
    console.error(`❌ CMF Error fetching ${endpoint}:`, error);
    throw error;
  }
};

export const fetchFinancialData = async (): Promise<FinancialData> => {
  try {
    console.log('🚀 CMF: Fetching financial data...');
    
    const today = new Date();
    const year = today.getFullYear();
    const month = String(today.getMonth() + 1).padStart(2, '0');
    
    // Obtener UF de la CMF (día actual)
    const ufData = await fetchFromCMF('/uf');
    
    // Extraer valor de UF
    const ufValue = parseFloat(ufData.UFs[0].Valor.replace(',', '.'));
    
    // Obtener TMC de la CMF (mes actual)
    const tmcData = await fetchFromCMF(`/tmc/${year}/${month}`);
    
    // Buscar TMC para créditos de consumo (Tipo 35 según documentación)
    // "Operaciones no reajustables en moneda nacional 90 días o más - Inferiores o iguales al equivalente de 5.000 unidades de fomento y superiores al equivalente de 200 unidades de fomento"
    const tmcEntries = tmcData.TMCs;
    const tmcEntry = tmcEntries.find((entry: any) => entry.Tipo === '35');
    
    let tmcRate = 35.5; // Valor por defecto
    
    if (tmcEntry) {
      tmcRate = parseFloat(tmcEntry.Valor);
      console.log('✅ CMF: Found TMC Tipo 35:', tmcRate);
    } else {
      console.log('⚠️ CMF: TMC Tipo 35 not found, using default value');
    }
    
    const financialData = {
      ufValue,
      tmcRate
    };
    
    console.log('✅ CMF: Successfully fetched financial data:', financialData);
    return financialData;
    
  } catch (error) {
    console.error('❌ CMF: Error fetching financial data, using fallback:', error);
    
    // Datos de fallback actualizados
    const fallbackData = {
      ufValue: 39300, // Valor aproximado de UF
      tmcRate: 35.5   // TMC aproximada
    };
    
    console.log('🔄 CMF: Using fallback data:', fallbackData);
    return fallbackData;
  }
}; 