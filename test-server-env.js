// Simular exactamente el entorno del servidor
import { calcularPrestamo } from './loans.js';

console.log('=== PRUEBA ENTORNO SERVIDOR ===');

// Parámetros exactos que envía el frontend
const params = {
  monto: 15000000,
  tasaMensual: 1.48,
  cuotas: 36,
  fechaFirma: "2025-07-17",
  primerVencimiento: "2025-09-05",
  cuoton: 0
};

console.log('📥 Parámetros recibidos:', params);

// Simular exactamente lo que hace el servidor
try {
  console.log('📞 Llamando a calcularPrestamo...');
  
  // Llamar al algoritmo exactamente como lo hace el servidor
  const resultado = calcularPrestamo(
    params.monto, 
    params.tasaMensual, 
    params.cuotas, 
    params.fechaFirma, 
    params.primerVencimiento, 
    params.cuoton
  );
  
  console.log('📥 Resultado recibido:', {
    success: resultado.success,
    hasError: !!resultado.error,
    hasCronograma: !!resultado.cronograma
  });
  
  if (!resultado.success) {
    console.log('❌ Error:', resultado.error);
  } else {
    console.log('✅ Éxito!');
    console.log('📊 Resumen:', resultado.resumen);
  }
} catch (error) {
  console.log('❌ Excepción:', error.message);
  console.log('❌ Stack trace:', error.stack);
} 