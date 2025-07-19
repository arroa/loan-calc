
export interface LoanParams {
  amount: number;
  term: number; // in months
  interestRate: number; // annual rate
  rateType: 'annual' | 'monthly';
  startDate: string;
  firstPaymentDate: string;
  graceMonths: number; // at the beginning
  balloonPayment: number;
}

export interface Installment {
  installmentNumber: number;
  paymentDate: string;
  principal: number;
  interest: number;
  totalPayment: number;
  remainingBalance: number;
  isGracePeriod?: boolean;
  notes?: string;
  lateFee?: number;
  penaltyInterest?: number;
}

export interface FinancialData {
  ufValue: number;
  tmcRate: number; // annual percentage
}
