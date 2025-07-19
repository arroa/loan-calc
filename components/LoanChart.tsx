
import React from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { Installment } from '../types';

interface LoanChartProps {
  data: Installment[];
}

const formatCurrencyForAxis = (value: number) => {
    return value.toString();
};

const CustomTooltip: React.FC<any> = ({ active, payload, label }) => {
  if (active && payload && payload.length) {
    return (
      <div className="bg-white p-3 border border-gray-200 rounded-lg shadow-sm">
        <p className="font-bold text-gray-800">{`Cuota #${label}`}</p>
        <p className="text-sm text-blue-600">{`Capital: ${payload[0].value}`}</p>
        <p className="text-sm text-teal-600">{`Interés: ${payload[1].value}`}</p>
        <p className="text-sm text-gray-700 mt-1 border-t pt-1">{`Total: ${payload[0].value + payload[1].value}`}</p>
      </div>
    );
  }
  return null;
};


const LoanChart: React.FC<LoanChartProps> = ({ data }) => {
  const chartData = data.filter(d => !d.isGracePeriod && d.totalPayment > 0);

  return (
    <div style={{ width: '100%', height: 450 }} className="mt-4">
      <ResponsiveContainer>
        <BarChart
          data={chartData}
          margin={{
            top: 20,
            right: 30,
            left: 20,
            bottom: 5,
          }}
        >
          <CartesianGrid strokeDasharray="3 3" vertical={false} />
          <XAxis dataKey="installmentNumber" stroke="#6b7280" fontSize={12} tickLine={false} axisLine={false}/>
          <YAxis stroke="#6b7280" fontSize={12} tickLine={false} axisLine={false} tickFormatter={formatCurrencyForAxis} />
          <Tooltip content={<CustomTooltip />} cursor={{ fill: 'rgba(243, 244, 246, 0.5)' }} />
          <Legend wrapperStyle={{fontSize: "14px"}}/>
          <Bar dataKey="principal" stackId="a" fill="#3b82f6" name="Capital" />
          <Bar dataKey="interest" stackId="a" fill="#14b8a6" name="Interés" radius={[4, 4, 0, 0]} />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
};

export default LoanChart;
