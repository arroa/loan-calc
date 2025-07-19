
import React from 'react';
import { Installment } from '../types';

interface AmortizationTableProps {
  schedule: Installment[];
}

const formatCurrency = (value: number | undefined) => {
  if (value === undefined || value === null) return '0';
  return value.toLocaleString('es-CL');
};


const AmortizationTable: React.FC<AmortizationTableProps> = ({ schedule }) => {
  return (
    <div className="h-full flex flex-col">
      <div className="overflow-x-auto overflow-y-auto flex-1">
        <table className="w-full text-sm text-left text-gray-600">
                  <thead className="text-xs text-gray-700 uppercase bg-gray-50 sticky top-0 z-10">
          <tr>
            <th scope="col" className="px-3 py-2 text-center bg-gray-50 w-16">Cuota</th>
            <th scope="col" className="px-3 py-2 text-center bg-gray-50 w-1/4">Vencimiento</th>
            <th scope="col" className="px-3 py-2 text-center bg-gray-50 w-1/4">Cuota</th>
            <th scope="col" className="px-3 py-2 text-center bg-gray-50 italic text-xs w-1/4">Intereses</th>
            <th scope="col" className="px-3 py-2 text-center bg-gray-50 w-1/4">Deuda Residual</th>
          </tr>
        </thead>
          <tbody>
            {schedule.map((inst) => {
              const paymentDate = new Date(inst.paymentDate);
              const isDecember = paymentDate.getMonth() === 11; // Diciembre es mes 11 (0-indexed)
              
              return (
                <tr key={inst.installmentNumber} className={`border-b ${
                  inst.isGracePeriod ? 'bg-blue-50/50' : 
                  isDecember ? 'bg-blue-100 hover:bg-blue-200' : 
                  'bg-white hover:bg-gray-50'
                } ${inst.notes?.includes('postergada') && 'opacity-50'}`}>
                  <td className="px-3 py-2 font-medium text-gray-900 text-center">{inst.installmentNumber > 0 ? inst.installmentNumber : 'Gracia'}</td>
                  <td className="px-3 py-2 text-center">{paymentDate.toLocaleDateString('es-CL')}</td>
                  <td className="px-3 py-2 text-center font-mono font-semibold text-gray-800">{formatCurrency(inst.totalPayment)}</td>
                  <td className="px-3 py-2 text-center font-mono italic text-xs">{formatCurrency(inst.interest)}</td>
                  <td className="px-3 py-2 text-center font-mono">{formatCurrency(inst.remainingBalance)}</td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default AmortizationTable;
