// Simular exactamente lo que hace el servidor
import { calcularPrestamo } from './loans.js';

console.log('=== PRUEBA DEL SERVIDOR ===');

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

try {
  // Llamar al algoritmo exactamente como lo hace el servidor
  const resultado = calcularPrestamo(
    params.monto, 
    params.tasaMensual, 
    params.cuotas, 
    params.fechaFirma, 
    params.primerVencimiento, 
    params.cuoton
  );
  
  console.log('📤 Resultado:', resultado);
  
  if (resultado.success) {
    console.log('✅ Éxito!');
  } else {
    console.log('❌ Error:', resultado.error);
  }
} catch (error) {
  console.log('❌ Excepción:', error.message);
} 