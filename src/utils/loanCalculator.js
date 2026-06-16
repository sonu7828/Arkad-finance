import { getLoanSettings } from './loanConfig';

/**
 * Rounds a number to 2 decimal places
 */
const round = (num) => Math.round((num + Number.EPSILON) * 100) / 100;

/**
 * Centralized loan calculation engine
 */
export const calculateLoanDetails = ({
  principal,
  remainingPrincipal, // Current principal balance
  duration,
  interestRate, // Optional: override global
  daysLate = 0,
  isPaid = false,
  agentCommissionRate, // Optional override
  hasAgent = false, // Should be true if an agent is assigned
  initiationFee, // Optional: override global
  carriedForwardDue = 0 // Carry forward unpaid amounts from previous periods
}) => {
  const settings = getLoanSettings();
  
  // 1. Inputs with safety defaults
  const p = parseFloat(principal) || 0;
  const currP = remainingPrincipal !== undefined ? parseFloat(remainingPrincipal) : p;
  const d = parseInt(duration) || 1;
  const iRate = interestRate !== undefined ? parseFloat(interestRate) : settings.interestRate;
  const carriedDue = parseFloat(carriedForwardDue) || 0;
  
  // 2. Base Interest (Monthly Simple Interest) - Dynamically calculated on OUTSTANDING principal
  const monthlyInterest = round(currP * (iRate / 100));
  const totalInterest = round(p * (iRate / 100) * d); // Estimated total upfront based on original principal
  // 3. Interest-Only Rule: Monthly Payment = (Outstanding Principal × Monthly Interest Rate) + Any Previous Shortfalls
  const monthlyPaymentCurrent = round(monthlyInterest + carriedDue);

  // 4. Initiation Fee (Deducted from disbursement) - Now a % of Principal
  const initiationFeeParam = initiationFee !== undefined ? parseFloat(initiationFee) : parseFloat(settings.initiationFee || 3);
  const initiationFeeAmount = round(p * (initiationFeeParam / 100));

  // 5. Disbursement Amount (Net to borrower)
  const disbursementAmount = round(p - initiationFeeAmount);

  // 6. Agent Commission (Only if agent is assigned) - 10% of Interest Collected
  let agentCommission = 0;
  if (hasAgent) {
    const commRate = agentCommissionRate !== undefined ? parseFloat(agentCommissionRate) : (settings.agentCommission || 10);
    agentCommission = round(totalInterest * (commRate / 100));
  }

  // 7. Delinquent Interest (Penalty)
  let delinquentPenalty = 0;
  if (!isPaid && daysLate > 0) {
    const annualPenaltyRate = parseFloat(settings.delinquentInterestRate) || 12; // e.g. 12% annual
    // Formula: (Outstanding Balance × Delinquent Rate % × Days Overdue) / 30
    delinquentPenalty = round((currP * (annualPenaltyRate / 100) * daysLate) / 30);
  }

  // 8. Total Owed (Principal + Total Interest + Penalties)
  const totalPayable = round(p + totalInterest + delinquentPenalty);
  
  // 9. Monthly Installment (Principal + Interest)
  const monthlyInstallment = monthlyPaymentCurrent;

  return {
    principal: p,
    remainingPrincipal: currP,
    duration: d,
    interestRate: iRate,
    monthlyInterest,
    monthlyPaymentCurrent, // The new required field
    totalInterest,
    initiationFee: initiationFeeAmount,
    disbursementAmount,
    agentCommission,
    delinquentPenalty,
    totalPayable,
    monthlyInstallment,
    graceDays: settings.graceDays,
    daysLate
  };
};

/**
 * Calculates dynamic status for a loan record
 */
export const calculateLoanStatus = (loan) => {
  if (!loan) return 'PENDING';
  
  const statusLower = String(loan.status || '').toLowerCase();

  // 1. Check if rejected
  if (statusLower === 'rejected') {
    return 'Rejected';
  }

  // 2. Check if terms are set / offer sent
  if (statusLower === 'terms_set') {
    return 'terms_set';
  }

  // Check if accepted/approved by client but not yet disbursed
  if (statusLower === 'approved' || statusLower === 'pending_disbursement') {
    return 'pending_disbursement';
  }

  // 3. Check if fully repaid
  if (statusLower === 'completed' || statusLower === 'closed' || (loan.remainingPrincipal !== undefined && loan.remainingPrincipal <= 0)) {
    return 'Closed';
  }

  // 4. Initial state if not yet disbursed or newly approved
  if (statusLower === 'pending') return 'PENDING';

  // 3. Time-based status logic
  const today = new Date();
  const dueDate = loan.dueDate ? new Date(loan.dueDate) : null;
  
  if (!dueDate || isNaN(dueDate.getTime())) return 'Active';

  const settings = getLoanSettings();
  const graceDate = new Date(dueDate);
  graceDate.setDate(dueDate.getDate() + settings.graceDays);

  // If there are unpaid interest or fees
  const hasUnpaidDues = (loan.unpaidInterest > 0) || (loan.unpaidFees > 0) || (loan.upcomingPaymentAmount > 0);

  if (hasUnpaidDues) {
    if (today > graceDate) return 'Delinquent';
    if (today > dueDate) return 'Grace Period';
  }

  return 'Current';
};
