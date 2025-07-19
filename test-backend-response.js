// ========================================
// TEST DE RESPUESTA DEL BACKEND
// ========================================
// Verificar que el backend devuelve la estructura correcta

const testBackendResponse = async () => {
    console.log('🧪 TEST DE RESPUESTA DEL BACKEND');
    console.log('================================');
    
    const payload = {
        monto: 3000000,
        tasaMensual: 1.79,
        cuotas: 36,
        fechaFirma: '2025-07-18',
        primerVencimiento: '2025-09-05',
        cuoton: 0
    };
    
    try {
        console.log('📤 Enviando petición:', payload);
        
        const response = await fetch('http://localhost:3001/api/loan/calculate', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(payload)
        });
        
        console.log('📥 Status:', response.status);
        
        if (!response.ok) {
            const errorText = await response.text();
            console.error('❌ Error:', errorText);
            return;
        }
        
        const data = await response.json();
        console.log('📥 Respuesta completa:', JSON.stringify(data, null, 2));
        
        // Verificar estructura
        console.log('\n🔍 VERIFICACIÓN DE ESTRUCTURA:');
        console.log('✅ success:', data.success);
        console.log('✅ resumen.cuotaFija:', data.resumen?.cuotaFija);
        console.log('✅ cronograma.length:', data.cronograma?.length);
        
        if (data.cronograma && data.cronograma.length > 0) {
            const primeraFila = data.cronograma[0];
            console.log('\n🔍 PRIMERA FILA DEL CRONOGRAMA:');
            console.log('✅ numeroCuota:', primeraFila.numeroCuota);
            console.log('✅ fechaVencimiento:', primeraFila.fechaVencimiento);
            console.log('✅ capital:', primeraFila.capital);
            console.log('✅ interes:', primeraFila.interes);
            console.log('✅ valorCuota:', primeraFila.valorCuota);
            console.log('✅ capitalResidual:', primeraFila.capitalResidual);
            console.log('✅ dias:', primeraFila.dias);
        }
        
        console.log('\n✅ Test completado');
        
    } catch (error) {
        console.error('❌ Error en test:', error);
    }
};

// Ejecutar test
testBackendResponse(); 