import express from 'express';
import cors from 'cors';
import fetch from 'node-fetch';
import { calcularPrestamo } from './loans.js';
import { calcularPrestamo as calcularPrestamoDebug } from './loansdebug.js';
import { SERVER_CONFIG, API_CONFIG, LIMITS_CONFIG, SECURITY_CONFIG, initializeConfig } from './config.js';

// Inicializar configuración
initializeConfig();

const app = express();
const PORT = SERVER_CONFIG.PORT;

// Middleware
app.use(cors({
  origin: SECURITY_CONFIG.ALLOWED_ORIGINS,
  credentials: true
}));
app.use(express.json());

// Algoritmo validado para cálculo de préstamos - MOVIDO A loans.js

// Códigos de serie del Banco Central (probando diferentes códigos)
const SERIES = {
  UF: 'F073.UF.PRE.Z.D', // Unidad de Fomento - Valor diario
  TMC: 'F022.TMC.TIN.D001.NO.Z.D' // Tasa Máxima Convencional - Créditos de consumo
};

// Códigos alternativos para probar
const ALTERNATIVE_SERIES = {
  UF: 'F073.UF.PRE.Z.D',
  TMC: 'F022.TMC.TIN.D001.NO.Z.D'
};

// Función para probar diferentes códigos de serie
const testSeriesCode = async (seriesCode, date) => {
  const url = `${API_CONFIG.BC_API_BASE}?user=${API_CONFIG.BC_USER}&pass=${API_CONFIG.BC_PASS}&function=GetSeries&timeseries=${seriesCode}&firstdate=${date}&lastdate=${date}`;
  console.log(`🧪 Testing series code: ${seriesCode}`);
  
  try {
    const response = await fetch(url);
    const data = await response.json();
    console.log(`📊 Response for ${seriesCode}:`, data);
    
    if (data.Codigo === 0 && data.Series && data.Series.Obs && data.Series.Obs.length > 0) {
      return data;
    }
    return null;
  } catch (error) {
    console.log(`❌ Error testing ${seriesCode}:`, error.message);
    return null;
  }
};

// Endpoint para obtener datos financieros
app.get('/api/financial-data', async (req, res) => {
  // Headers para evitar caché
  res.setHeader('Cache-Control', 'no-cache, no-store, must-revalidate');
  res.setHeader('Pragma', 'no-cache');
  res.setHeader('Expires', '0');
  
  console.log('🚀 /api/financial-data endpoint called!');
  
  try {
    // Usar la API de CMF que es más confiable
    console.log('📅 Fetching financial data from CMF API...');
    
    const CMF_API_BASE = 'https://api.cmfchile.cl/api-sbifv3/recursos_api';
    const API_KEY = API_CONFIG.CMF_API_KEY || '2620a13c379e4f57bcb9e99c85388301dbc2d2fa';
    
    const today = new Date();
    const year = today.getFullYear();
    const month = String(today.getMonth() + 1).padStart(2, '0');
    
    // Obtener UF de la CMF (día actual)
    const ufUrl = `${CMF_API_BASE}/uf?apikey=${API_KEY}&formato=json`;
    console.log('🌐 CMF: Fetching UF from:', ufUrl);
    
    const ufResponse = await fetch(ufUrl);
    if (!ufResponse.ok) {
      throw new Error(`UF API error: ${ufResponse.status}`);
    }
    
    const ufData = await ufResponse.json();
    console.log('📊 CMF UF Response:', ufData);
    
    // Extraer valor de UF
    const ufValue = parseFloat(ufData.UFs[0].Valor.replace(',', '.'));
    
    // Obtener TMC de la CMF (mes actual)
    const tmcUrl = `${CMF_API_BASE}/tmc/${year}/${month}?apikey=${API_KEY}&formato=json`;
    console.log('🌐 CMF: Fetching TMC from:', tmcUrl);
    
    const tmcResponse = await fetch(tmcUrl);
    if (!tmcResponse.ok) {
      throw new Error(`TMC API error: ${tmcResponse.status}`);
    }
    
    const tmcData = await tmcResponse.json();
    console.log('📊 CMF TMC Response:', tmcData);
    
    // Buscar TMC para créditos de consumo (Tipo 35)
    const tmcEntries = tmcData.TMCs;
    const tmcEntry = tmcEntries.find((entry) => entry.Tipo === '35');
    
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

    console.log('✅ Successfully extracted financial data:', financialData);
    console.log('📤 Sending response to frontend...');
    res.json(financialData);

  } catch (error) {
    console.error('❌ Error fetching from CMF API:', error);
    
    // Datos de fallback actualizados
    const fallbackData = {
      ufValue: 39300,
      tmcRate: 35.5
    };
    
    console.log('🔄 Using fallback data:', fallbackData);
    console.log('📤 Sending fallback response to frontend...');
    res.json(fallbackData);
  }
});

// Health check
app.get('/api/health', (req, res) => {
  res.json({ status: 'OK', message: 'Proxy server running' });
});

// Endpoint para cálculo de préstamos
app.post('/api/loan/calculate', (req, res) => {
  console.log('🚀 Endpoint /api/loan/calculate llamado');
  
  try {
    const { monto, tasaMensual, cuotas, fechaFirma, primerVencimiento, cuoton = 0 } = req.body;
    console.log('🧮 Calculando préstamo con parámetros:', {
      monto, tasaMensual, cuotas, fechaFirma, primerVencimiento, cuoton
    });
    
    // Validar que todos los parámetros estén presentes
    if (!monto || !tasaMensual || !cuotas || !fechaFirma || !primerVencimiento) {
      throw new Error('Faltan parámetros requeridos');
    }
    
    console.log('📞 Llamando a calcularPrestamo...');
    
    // Usar el algoritmo correcto
    const resultado = calcularPrestamo(monto, tasaMensual, cuotas, fechaFirma, primerVencimiento, cuoton);
    
    console.log('📥 Resultado recibido:', {
      success: resultado.success,
      hasError: !!resultado.error,
      hasCronograma: !!resultado.cronograma
    });
    
    if (!resultado.success) {
      throw new Error(resultado.error);
    }
    
    console.log('✅ Préstamo calculado exitosamente:', {
      cuotaFija: resultado.resumen?.cuotaFija,
      cantidadCuotas: resultado.cronograma.length,
      resumen: resultado.resumen
    });
    
    console.log('📤 Enviando respuesta al frontend...');
    res.json(resultado);
    console.log('✅ Respuesta enviada exitosamente');
    
  } catch (error) {
    console.error('❌ Error en cálculo de préstamo:', error);
    console.error('❌ Stack trace:', error.stack);
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

// Endpoint para debugging de préstamos
app.post('/api/loan/debug', (req, res) => {
  console.log('🚀 Endpoint /api/loan/debug llamado');
  
  try {
    const { 
      monto, 
      tasaMensual, 
      cuotas, 
      fechaFirma, 
      primerVencimiento, 
      cuoton = 0, 
      debug = false,
      mesesSinPago = [],
      cuotasEspeciales = []
    } = req.body;
    
    console.log('🧮 Debugging préstamo con parámetros:', {
      monto, tasaMensual, cuotas, fechaFirma, primerVencimiento, cuoton, debug,
      mesesSinPago, cuotasEspeciales
    });
    
    // Preparar parámetros para el nuevo algoritmo
    const params = {
      monto,
      tasaMensual,
      cuotas,
      fechaFirma,
      primerVencimiento,
      cuoton,
      mesesSinPago,
      cuotasEspeciales
    };
    
    console.log('📞 Llamando a calcularPrestamo (nuevo algoritmo)...');
    
    // Usar el nuevo algoritmo de debugging
    const resultado = calcularPrestamoDebug(params, debug);
    
    console.log('📥 Resultado debug recibido:', {
      success: resultado.success,
      hasError: !!resultado.error,
      hasCronograma: !!resultado.cronograma,
      hasDebugData: !!resultado.debugData,
      detalles: resultado.detalles
    });
    
    if (!resultado.success) {
      throw new Error(resultado.error);
    }
    
    console.log('✅ Debug completado exitosamente');
    
    console.log('📤 Enviando respuesta debug al frontend...');
    res.json(resultado);
    console.log('✅ Respuesta debug enviada exitosamente');
    
  } catch (error) {
    console.error('❌ Error en debugging de préstamo:', error);
    console.error('❌ Stack trace:', error.stack);
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

// Test CMF API endpoint
app.get('/api/test-cmf', async (req, res) => {
  try {
    console.log('🧪 Testing CMF API with correct format...');
    
    // Según la documentación, el formato correcto es:
    const apiKey = API_CONFIG.CMF_API_KEY;
    const today = new Date();
    const year = today.getFullYear();
    const month = String(today.getMonth() + 1).padStart(2, '0');
    const day = String(today.getDate()).padStart(2, '0');
    
    // Probar diferentes endpoints según la documentación
    const endpoints = [
      `https://api.cmfchile.cl/api-sbifv3/recursos_api/uf?apikey=${apiKey}&formato=json`,
      `https://api.cmfchile.cl/api-sbifv3/recursos_api/uf/${year}?apikey=${apiKey}&formato=json`,
      `https://api.cmfchile.cl/api-sbifv3/recursos_api/uf/${year}/${month}?apikey=${apiKey}&formato=json`,
      `https://api.cmfchile.cl/api-sbifv3/recursos_api/uf/${year}/${month}/dias/${day}?apikey=${apiKey}&formato=json`,
      `https://api.cmfchile.cl/api-sbifv3/recursos_api/tmc/${year}/${month}?apikey=${apiKey}&formato=json`
    ];
    
    for (let i = 0; i < endpoints.length; i++) {
      const endpoint = endpoints[i];
      console.log(`🧪 Testing endpoint ${i+1}/${endpoints.length}:`);
      console.log(`   URL: ${endpoint}`);
      
      try {
        const response = await fetch(endpoint);
        console.log(`   Status: ${response.status}`);
        
        const text = await response.text();
        console.log(`   Response (first 500 chars): ${text.substring(0, 500)}`);
        
        if (response.status === 200) {
          try {
            const data = JSON.parse(text);
            console.log(`   ✅ SUCCESS! JSON data:`, data);
            return res.json({ success: true, endpoint, data });
          } catch (parseError) {
            console.log(`   ❌ JSON parse failed:`, parseError.message);
            // Si es XML, también es válido
            if (text.includes('<IndicadoresFinancieros>')) {
              console.log(`   ✅ SUCCESS! XML data received`);
              return res.json({ success: true, endpoint, format: 'xml', data: text.substring(0, 500) });
            }
          }
        }
      } catch (fetchError) {
        console.log(`   ❌ Fetch failed:`, fetchError.message);
      }
    }
    
    res.json({ success: false, error: 'No working endpoint found' });
  } catch (error) {
    console.error('❌ CMF Test Error:', error);
    res.json({ success: false, error: error.message });
  }
});

app.listen(PORT, () => {
  console.log(`🚀 Proxy server running on http://localhost:${PORT}`);
  console.log(`📊 Financial data endpoint: http://localhost:${PORT}/api/financial-data`);
}); 