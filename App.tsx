
import React, { useState, useCallback } from 'react';
import { LoanParams, Installment, FinancialData } from './types';
import { calculateAmortization, recalculateOnSkip, postponeInstallment, applyLateFees } from './services/loanCalculator';
import LoanForm from './components/LoanForm';
import AmortizationTable from './components/AmortizationTable';
import PDFPrinter from './components/PDFPrinter';
import { Icon, IconName } from './components/ui/Icon';

export default function App() {
  const [loanParams, setLoanParams] = useState<LoanParams | null>(null);
  const [schedule, setSchedule] = useState<Installment[]>([]);
  const [originalSchedule, setOriginalSchedule] = useState<Installment[]>([]);
  const [loading, setLoading] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<'cuota'>('cuota');

  // Datos financieros estáticos para producción
  const financialData: FinancialData = {
    ufValue: 39300,
    tmcRate: 35.5
  };

  const handleCalculate = useCallback(async (params: LoanParams) => {
    setLoading('Calculando cronograma de pagos...');
    try {
      setError(null);
      setLoanParams(params);
      const newSchedule = await calculateAmortization(params, financialData);
      setSchedule(newSchedule);
      setOriginalSchedule(newSchedule); // Save a pristine copy
    } catch (err: any) {
      setError(err.message);
      setSchedule([]);
      setOriginalSchedule([]);
    } finally {
      setLoading(null);
    }
  }, []);
  
  const handleReset = useCallback(() => {
    setSchedule(originalSchedule);
  }, [originalSchedule]);

  const handleSkipPayment = useCallback((installmentNumber: number) => {
    if (!loanParams) return;
    const newSchedule = recalculateOnSkip(schedule, installmentNumber, loanParams, financialData);
    setSchedule(newSchedule);
  }, [schedule, loanParams]);

  const handlePostponePayment = useCallback((installmentNumber: number) => {
    const newSchedule = postponeInstallment(schedule, installmentNumber);
    setSchedule(newSchedule);
  }, [schedule]);

  const handleLatePayment = useCallback((installmentNumber: number, daysLate: number) => {
    const newSchedule = applyLateFees(schedule, installmentNumber, daysLate, financialData);
    setSchedule(newSchedule);
  }, [schedule]);


  return (
    <div className="min-h-screen bg-gray-100/50 text-gray-800 font-sans p-4 sm:p-6 lg:p-8">
      <div className="max-w-7xl mx-auto">
        <header className="mb-8 text-center">
          <h1 className="text-4xl md:text-5xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-teal-500">
            Simulador de Crédito
          </h1>
          <p className="mt-2 text-lg text-gray-600">Entiende tu préstamo de forma clara y sencilla en Chile.</p>
        </header>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          <aside className="lg:col-span-6 xl:col-span-6">
             <div className="bg-white p-6 rounded-2xl shadow-lg h-[900px] flex flex-col">
              <h2 className="text-2xl font-bold mb-4 text-gray-700 flex-shrink-0">Parámetros del Préstamo</h2>
              <div className="flex flex-col flex-1">
                <div className="flex-1">
                  <LoanForm onCalculate={handleCalculate} isLoading={!!loading} financialData={financialData} />
                </div>

              </div>
            </div>
          </aside>

          <main className="lg:col-span-6 xl:col-span-6">
            <div className="bg-white p-4 sm:p-6 rounded-2xl shadow-lg h-[900px] flex flex-col">
              {loading && (
                 <div className="flex items-center justify-center h-64">
                  <Icon name="loader" className="animate-spin h-10 w-10 text-blue-600" />
                   <span className="ml-4 text-xl text-gray-600">{loading}</span>
                 </div>
              )}
              {error && (
                <div className="flex flex-col items-center justify-center h-64 text-center bg-red-50 p-6 rounded-lg">
                   <Icon name="error" className="h-12 w-12 text-red-500 mb-4" />
                   <h3 className="text-xl font-semibold text-red-700">Ocurrió un Error</h3>
                  <p className="text-red-600 mt-2 max-w-md">{error}</p>
                </div>
              )}
              {!loading && !error && schedule.length === 0 && (
                <div className="flex flex-col items-center justify-center h-64 text-center">
                   <Icon name="calculator" className="h-16 w-16 text-gray-300 mb-4" />
                   <h3 className="text-2xl font-semibold text-gray-700">Listo para Calcular</h3>
                  <p className="text-gray-500 mt-2 max-w-sm">Ingresa los datos de tu préstamo en el formulario de la izquierda para generar el plan de pagos.</p>
                </div>
              )}
              {!loading && !error && schedule.length > 0 && (
                <div className="flex flex-col h-full">
                   <div className="flex justify-between items-center mb-4 flex-shrink-0">
                    <div className="flex justify-center mb-4 flex-shrink-0">
                        <div className="flex items-center justify-between bg-gradient-to-r from-green-50 to-blue-50 border border-green-200 rounded-xl py-1 px-6 shadow-sm w-full max-w-4xl">
                            <div className="flex items-center">
                                <div className="text-right mr-4">
                                    <div className="text-sm font-medium text-green-600 italic leading-tight">Valor</div>
                                    <div className="text-sm font-medium text-green-600 italic leading-tight">Cuota</div>
                                </div>
                                <div className="text-3xl font-bold text-green-700">
                                    ${schedule.length > 0 ? schedule[0].totalPayment.toLocaleString('es-CL') : '0'}
                                </div>
                            </div>
                            <PDFPrinter 
                                schedule={schedule}
                                loanParams={loanParams}
                            />
                        </div>
                    </div>
                    {JSON.stringify(schedule) !== JSON.stringify(originalSchedule) && (
                        <button onClick={handleReset} className="flex items-center px-3 py-1.5 text-sm font-semibold text-blue-600 hover:bg-blue-50 rounded-lg transition-colors">
                            <Icon name="reset" className="h-4 w-4 mr-1.5" />
                            Resetear Simulación
                        </button>
                    )}
                  </div>

                  <div className="flex-1 min-h-0 overflow-hidden">
                    <div className="h-full border border-gray-200 rounded-lg overflow-hidden">
                      <AmortizationTable 
                        schedule={schedule}
                      />
                    </div>
                  </div>
                  
                  <p className="text-xs text-gray-400 mt-4 text-center flex-shrink-0">
                      * Este es un simulador. Los cálculos son referenciales y pueden variar con las condiciones finales ofrecidas por su institución financiera. No constituye una oferta de crédito.
                  </p>
                </div>
              )}
            </div>
          </main>
        </div>
      </div>
    </div>
  );
}
