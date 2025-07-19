
import React, { useState, useEffect } from 'react';
import { LoanParams, FinancialData } from '../types';
import { Button } from './ui/Button';
import { Input } from './ui/Input';
import { Label } from './ui/Label';
import { Icon } from './ui/Icon';

interface LoanFormProps {
  onCalculate: (params: LoanParams) => void;
  isLoading: boolean;
  financialData: FinancialData | null;
}

const today = new Date().toISOString().split('T')[0];

const LoanForm: React.FC<LoanFormProps> = ({ onCalculate, isLoading, financialData }) => {
  const [amount, setAmount] = useState('3000000');
  const [term, setTerm] = useState('36');
  const [balloonPayment, setBalloonPayment] = useState('0');
  const [paymentDay, setPaymentDay] = useState('5');
  
  // Calcular límites del slider basados en TMC
  const minRate = 0.9;
  const maxRate = financialData ? Math.min(2.0, (financialData.tmcRate * 0.95) / 12) : 2.0; // Valor por defecto más conservador
  
  const [interestRate, setInterestRate] = useState('1.50');
  
  // Función para actualizar el color del slider
  const updateSliderColor = (sliderId: string, value: string, min: number, max: number) => {
    const slider = document.getElementById(sliderId) as HTMLInputElement;
    if (slider) {
      const percentage = ((parseFloat(value) - min) / (max - min)) * 100;
      slider.style.background = `linear-gradient(to right, #3b82f6 0%, #3b82f6 ${percentage}%, #e5e7eb ${percentage}%, #e5e7eb 100%)`;
    }
  };

  // Actualizar colores de sliders cuando cambien los valores
  useEffect(() => {
    updateSliderColor('amount-slider', amount, 500000, 50000000);
    updateSliderColor('term-slider', term, 6, 84);
    updateSliderColor('rate-slider', interestRate, minRate, maxRate);
    updateBalloonSliderColor(balloonPayment, Math.floor((parseFloat(amount) || 50000000) * 0.6));
    updateSliderColor('payment-day-slider', paymentDay, 1, 28);
  }, [amount, term, interestRate, minRate, maxRate, balloonPayment, paymentDay]);

  // Actualizar tasa por defecto cuando cambien los datos financieros (solo una vez)
  useEffect(() => {
    if (financialData && parseFloat(interestRate) === 1.80) { // Solo actualizar si es el valor por defecto
      // Calcular tasa por defecto basada en TMC (85% de la TMC para estar seguro)
      const defaultRate = Math.max(0.9, (financialData.tmcRate * 0.85) / 12);
      const maxAllowedRate = (financialData.tmcRate * 0.95) / 12;
      
      // Usar el valor por defecto calculado
      setInterestRate(defaultRate.toFixed(2));
    }
  }, [financialData]); // Removido interestRate de las dependencias para evitar loops

  // Validar que la tasa no exceda el máximo cuando cambie maxRate
  useEffect(() => {
    const currentRate = parseFloat(interestRate);
    if (currentRate > maxRate) {
      setInterestRate(maxRate.toFixed(1));
    }
  }, [maxRate, interestRate]);

  // Función para manejar cambios del slider de tasa
  const handleRateChange = (value: string) => {
    const numValue = parseFloat(value);
    if (!isNaN(numValue) && numValue >= minRate && numValue <= maxRate) {
      setInterestRate(numValue.toFixed(2));
    }
  };

  const [rateType, setRateType] = useState<'monthly' | 'annual'>('monthly');
  // Fecha actual por defecto - YA NO NECESARIA
  // const [startDate, setStartDate] = useState(new Date().toISOString().split('T')[0]);
  
  // Mes del primer pago (por defecto según algoritmo: si hoy > 15, mes subsiguiente; else, mes siguiente)
  const [firstPaymentMonth, setFirstPaymentMonth] = useState(() => {
    const today = new Date();
    const currentDay = today.getDate();
    const d = new Date(today);
    
    if (currentDay > 15) {
      // Si hoy > 15, mes subsiguiente al actual (2 meses adelante)
      d.setMonth(d.getMonth() + 2);
    } else {
      // Si hoy <= 15, mes siguiente al actual (1 mes adelante)
    d.setMonth(d.getMonth() + 1);
    }
    
    return d.toISOString().split('T')[0].substring(0, 7); // YYYY-MM
  });
  
  const [graceMonths, setGraceMonths] = useState('0');
  
  // Función para actualizar el color del slider del cuotón
  const updateBalloonSliderColor = (value: string, max: number) => {
    const slider = document.getElementById('balloon-slider') as HTMLInputElement;
    if (slider) {
      const percentage = (parseFloat(value) / max) * 100;
      slider.style.background = `linear-gradient(to right, #3b82f6 0%, #3b82f6 ${percentage}%, #e5e7eb ${percentage}%, #e5e7eb 100%)`;
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    // Calcular la fecha de primer vencimiento basada en la selección del usuario
    const [selectedYear, selectedMonth] = firstPaymentMonth.split('-');
    const firstPaymentDate = `${selectedYear}-${selectedMonth}-${paymentDay.padStart(2, '0')}`;
    
    // Fecha de firma (siempre hoy) - usando fecha local
    const today = new Date();
    const startDate = `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, '0')}-${String(today.getDate()).padStart(2, '0')}`;
    
    console.log('🔍 Fechas calculadas:');
    console.log('🔍 Fecha de firma:', startDate);
    console.log('🔍 Primer vencimiento:', firstPaymentDate);
    console.log('🔍 Mes seleccionado:', firstPaymentMonth);
    console.log('🔍 Día seleccionado:', paymentDay);
    
    const params: LoanParams = {
      amount: parseFloat(amount) || 0,
      term: parseInt(term) || 0,
      interestRate: parseFloat(interestRate) || 0,
      rateType: 'monthly' as const,
      startDate: startDate,
      firstPaymentDate,
      graceMonths: parseInt(graceMonths) || 0,
      balloonPayment: parseFloat(balloonPayment) || 0,
    };
    console.log('📤 Parámetros enviados:', params);
    onCalculate(params);
  };

  const effectiveAnnualRate = (parseFloat(interestRate) || 0) * 12;

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {/* Fila 1: Monto del préstamo y Cuotón final */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
      <div>
        <Label htmlFor="amount">Monto del Préstamo (CLP)</Label>
          <div className="space-y-3">
            {/* Slider para monto */}
            <div className="relative">
              <input
                id="amount-slider"
                type="range"
                min="500000"
                max="50000000"
                step="500000"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer slider"
              />
              <div className="flex justify-between text-xs text-gray-500 mt-1">
                <span>$500K</span>
                <span>$5M</span>
                <span>$15M</span>
                <span>$30M</span>
                <span>$50M</span>
              </div>
            </div>
            
            {/* Valor actual */}
            <div className="text-center bg-green-50 p-3 rounded-lg">
              <div className="text-2xl font-bold text-green-600">
                ${parseInt(amount).toLocaleString('es-CL')}
              </div>
              <div className="text-sm text-gray-600">pesos chilenos</div>
            </div>
          </div>
        </div>

        <div>
          <Label htmlFor="balloonPayment">Cuotón Final (CLP)</Label>
          <div className="space-y-3">
            {/* Slider para cuotón */}
            <div className="relative">
              <input
                id="balloon-slider"
                type="range"
                min="0"
                max={Math.floor((parseInt(amount) || 50000000) * 0.6)}
                step="100000"
                value={balloonPayment}
                onChange={(e) => setBalloonPayment(e.target.value)}
                className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer slider"
              />
              <div className="flex justify-between text-xs text-gray-500 mt-1">
                <span>0%</span>
                <span>20%</span>
                <span>40%</span>
                <span>60%</span>
              </div>
            </div>
            
            {/* Valor actual */}
            <div className="text-center bg-orange-50 p-3 rounded-lg">
              <div className="text-2xl font-bold text-orange-600">
                ${parseInt(balloonPayment).toLocaleString('es-CL')}
              </div>
              <div className="text-sm text-gray-600">pesos chilenos</div>
            </div>
          </div>
        </div>
      </div>

      {/* Fila 2: Plazo y Tasa de interés */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
      <div>
        <Label htmlFor="term">Plazo (meses)</Label>
          <div className="space-y-3">
            {/* Slider para plazo */}
            <div className="relative">
              <input
                id="term-slider"
                type="range"
                min="6"
                max="84"
                step="6"
                value={term}
                onChange={(e) => setTerm(e.target.value)}
                className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer slider"
              />
              <div className="flex justify-between text-xs text-gray-500 mt-1">
                <span>6m</span>
                <span>24m</span>
                <span>48m</span>
                <span>60m</span>
                <span>84m</span>
              </div>
            </div>
            
            {/* Valor actual */}
            <div className="text-center bg-purple-50 p-3 rounded-lg">
              <div className="text-2xl font-bold text-purple-600">
                {term} meses
              </div>
              <div className="text-sm text-gray-600">
                ({Math.floor(parseInt(term) / 12)} años, {parseInt(term) % 12} meses)
              </div>
            </div>
          </div>
      </div>
      
      <div>
          <Label htmlFor="interestRate">Tasa de Interés Mensual</Label>
          <div className="space-y-3">
            {/* Slider */}
            <div className="relative">
              <input
                id="rate-slider"
                type="range"
                min={minRate}
                max={maxRate}
                step="0.01"
                value={interestRate}
                onChange={(e) => handleRateChange(e.target.value)}
                className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer slider"
              />
              <div className="flex justify-between text-xs text-gray-500 mt-1">
                <span>{minRate}%</span>
                <span>{((minRate + maxRate) / 3).toFixed(1)}%</span>
                <span>{((minRate + maxRate) * 2 / 3).toFixed(1)}%</span>
                <span>{maxRate.toFixed(1)}%</span>
              </div>
            </div>
            
            {/* Valor actual y conversión */}
            <div className="flex items-center justify-between bg-blue-50 p-3 rounded-lg">
              <div className="text-center">
                <div className="text-2xl font-bold text-blue-600">{interestRate}%</div>
                <div className="text-sm text-gray-600">mensual</div>
              </div>
              <div className="text-gray-400 text-2xl">=</div>
              <div className="text-center">
                <div className="text-2xl font-bold text-green-600">{(parseFloat(interestRate) * 12).toFixed(1)}%</div>
                <div className="text-sm text-gray-600">anual</div>
              </div>
            </div>
            

        </div>
          
        {financialData && effectiveAnnualRate > financialData.tmcRate && (
              <p className="text-xs text-yellow-600 mt-2 flex items-center">
                <Icon name="warning" className="h-4 w-4 mr-1"/>
                Atención: La tasa ingresada es superior a la Tasa Máxima Convencional ({financialData.tmcRate.toFixed(2)}%).
            </p>
        )}
      </div>
      </div>

      {/* Fila 3: Día de pago y primer mes */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
      <div>
          <Label htmlFor="paymentDay">¿Qué día le acomoda pagar?</Label>
          <div className="space-y-3">
            <div className="relative">
              <input
                id="payment-day-slider"
                type="range"
                min="1"
                max="28"
                step="1"
                value={paymentDay}
                onChange={(e) => setPaymentDay(e.target.value)}
                className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer slider"
              />
              <div className="flex justify-between text-xs text-gray-500 mt-1">
                <span>1</span>
                <span>5</span>
                <span>10</span>
                <span>15</span>
                <span>20</span>
                <span>28</span>
              </div>
      </div>

            <div className="text-center bg-indigo-50 p-3 rounded-lg">
              <div className="text-2xl font-bold text-indigo-600">
                Día {paymentDay}
              </div>
              <div className="text-sm text-gray-600">de cada mes</div>
            </div>
          </div>
      </div>

      <div>
          <Label htmlFor="firstPaymentMonth">¿Cuándo pagará la primera cuota?</Label>
          <div className="grid grid-cols-2 gap-2 mt-4">
            {(() => {
              const buttons = [];
              const today = new Date();
              for (let i = 1; i <= 6; i++) {
                const date = new Date(today.getFullYear(), today.getMonth() + i, 1);
                const monthShort = date.toLocaleDateString('es-CL', { month: 'short' });
                const year = date.getFullYear().toString().slice(-2);
                const displayText = `${monthShort.charAt(0).toUpperCase() + monthShort.slice(1)}-${year}`;
                const value = date.toISOString().split('T')[0].substring(0, 7);
                const isSelected = firstPaymentMonth === value;
                
                buttons.push(
                  <button
                    key={value}
                    type="button"
                    onClick={() => setFirstPaymentMonth(value)}
                    className={`px-3 py-2 text-sm font-medium rounded-lg border transition-colors ${
                      isSelected 
                        ? 'bg-gray-700 text-white border-gray-700 shadow-sm' 
                        : 'bg-white text-gray-700 border-gray-300 hover:bg-gray-50 hover:border-gray-400'
                    }`}
                  >
                    {displayText}
                  </button>
                );
              }
              return buttons;
            })()}
          </div>
        </div>
      </div>
      
      <Button type="submit" disabled={isLoading} className="w-full">
        {isLoading ? (
            <>
                <Icon name="loader" className="animate-spin h-5 w-5 mr-3"/>
                Calculando...
            </>
        ) : (
             <>
                <Icon name="calculator" className="h-5 w-5 mr-2" />
                Calcular Préstamo
            </>
        )}
      </Button>
    </form>
  );
};

export default LoanForm;
