const CONFIG_KEY   = 'loan_management_settings';
const LOANS_KEY    = 'loan_management_records';
const PIPELINE_KEY = 'pipeline_applications';

const DEFAULT_SETTINGS = {
  interestRate: 10,
  graceDays: 3,
  agentCommission: 5,
  delinquentInterestRate: 15,
  initiationFee: 500,
  minLoanDuration: 1,
  minLoanAmount: 500,
};

export const getLoanSettings = () => {
  const saved = localStorage.getItem(CONFIG_KEY);
  if (!saved) return DEFAULT_SETTINGS;
  try { return { ...DEFAULT_SETTINGS, ...JSON.parse(saved) }; }
  catch (e) { return DEFAULT_SETTINGS; }
};

export const saveLoanSettings = (settings) => {
  localStorage.setItem(CONFIG_KEY, JSON.stringify(settings));
};

export const getLoans = (fallbackData = []) => {
  const saved = localStorage.getItem(LOANS_KEY);
  if (!saved) return fallbackData;
  try { return JSON.parse(saved); }
  catch (e) { return fallbackData; }
};

export const saveLoans = (loans) => {
  localStorage.setItem(LOANS_KEY, JSON.stringify(loans));
};

// ── Pipeline: Borrower-submitted applications ──

export const getPipelineLoans = () => {
  try { return JSON.parse(localStorage.getItem(PIPELINE_KEY) || '[]'); }
  catch (e) { return []; }
};

export const savePipelineLoans = (loans) => {
  localStorage.setItem(PIPELINE_KEY, JSON.stringify(loans));
};

export const addPipelineLoan = (formData, borrowerName = 'Borrower') => {
  const settings = getLoanSettings();
  const existing = getPipelineLoans();
  const newLoan = {
    id: `APP-${Date.now()}`,
    user: { name: borrowerName },
    principalAmount: parseFloat(formData.amount),
    duration: Number(formData.duration),
    disbursementMethod: formData.method,
    bankName: formData.bankName || '',
    accountNumber: formData.accountNumber || '',
    accountName: formData.accountName || '',
    description: formData.description || '',
    status: 'PENDING',
    createdAt: new Date().toISOString().split('T')[0],
    interestRate: settings.interestRate,
    agent: null,
    dueDay: 5,
    disbursementDate: null,
    payments: [],
    fees: [],
    remainingPrincipal: parseFloat(formData.amount),
    unpaidInterest: 0,
    unpaidFees: 0,
    source: 'borrower_portal',
  };
  savePipelineLoans([...existing, newLoan]);
  return newLoan;
};

export const updatePipelineLoan = (id, updates) => {
  const loans = getPipelineLoans();
  const updated = loans.map(l => l.id === id ? { ...l, ...updates } : l);
  savePipelineLoans(updated);
  return updated;
};
