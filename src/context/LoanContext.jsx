import React, { createContext, useContext, useState, useEffect } from 'react';

const STORAGE_KEY = 'loanApplications';

// Fallback demo data - used only if localStorage is completely empty
const DEMO_LOANS = [
  { id: 'LN-8801', user: { name: 'Verified Capital User' }, principalAmount: 5000, duration: 12, status: 'Pending', createdAt: '2024-10-14', interestRate: 10, method: 'CASH', disbursementDate: null, payments: [] },
  { id: 'LN-8802', user: { name: 'Sarah Williams' }, principalAmount: 8500, duration: 6, status: 'Pending', createdAt: '2024-10-13', interestRate: 10, method: 'BANK_TRANSFER', disbursementDate: null, payments: [] },
  { id: 'LN-8803', user: { name: 'David Brown' }, principalAmount: 3200, duration: 9, status: 'Active', createdAt: '2024-10-12', interestRate: 12, method: 'CASH', disbursementDate: '2024-10-12', payments: [] },
  { id: 'LN-8804', user: { name: 'Emma Thompson' }, principalAmount: 12000, duration: 18, status: 'Active', createdAt: '2024-10-10', interestRate: 10, method: 'BANK_TRANSFER', disbursementDate: '2024-10-10', payments: [] },
];

const LoanContext = createContext(null);

export function LoanProvider({ children }) {
  const [loans, setLoans] = useState(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length > 0) {
          return parsed;
        }
      }
    } catch (e) {
      console.error('Failed to parse loan applications from localStorage', e);
    }
    // Seed localStorage if empty or invalid
    localStorage.setItem(STORAGE_KEY, JSON.stringify(DEMO_LOANS));
    return DEMO_LOANS;
  });

  // Sync state when localStorage changes in another tab
  useEffect(() => {
    const handleStorageChange = (e) => {
      if (e.key === STORAGE_KEY && e.newValue) {
        setLoans(JSON.parse(e.newValue));
      }
    };
    window.addEventListener('storage', handleStorageChange);
    return () => window.removeEventListener('storage', handleStorageChange);
  }, []);

  // Update localStorage whenever state changes
  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(loans));
  }, [loans]);

  const addLoan = (loanData) => {
    const newLoan = {
      ...loanData,
      id: `APP-${Date.now()}`,
      status: 'Pending',
      createdAt: new Date().toISOString().split('T')[0],
      payments: []
    };
    // Prepend so newly submitted loans appear FIRST
    setLoans(prev => [newLoan, ...prev]);
    return newLoan;
  };

  const updateLoan = (id, updates) => {
    setLoans(prev => prev.map(l => l.id === id ? { ...l, ...updates } : l));
  };

  const deleteLoan = (id) => {
    setLoans(prev => prev.filter(l => l.id !== id));
  };

  const recordPayment = (loanId, amountCollected, amountDue, interestDue) => {
    setLoans(prev => prev.map(loan => {
      if (loan.id !== loanId) return loan;

      const pCollected = parseFloat(amountCollected) || 0;
      const pDue = parseFloat(amountDue) || 0;
      const pInterest = parseFloat(interestDue) || pDue; // Assume all is interest if not specified

      const newPayment = {
        id: `PAY-${Date.now()}`,
        date: new Date().toISOString().split('T')[0],
        amount: pCollected,
        type: pCollected === pDue ? 'EXACT' : (pCollected < pDue ? 'PARTIAL' : 'OVERPAYMENT')
      };

      let newRemainingPrincipal = loan.remainingPrincipal !== undefined ? loan.remainingPrincipal : loan.principalAmount;
      let newCarriedForward = loan.carriedForwardDue || 0;

      if (pCollected < pDue) {
        // Partial Payment: Subtracts paid amount, carries remainder to next month
        newCarriedForward += (pDue - pCollected);
      } else if (pCollected > pDue) {
        // Overpayment: Subtracts interest, applies the rest to reduce the Principal Balance
        const principalReduction = pCollected - pInterest;
        if (principalReduction > 0) {
          newRemainingPrincipal = Math.max(0, newRemainingPrincipal - principalReduction);
        }
        newCarriedForward = 0;
      } else {
        // Exact Payment: Marks month as paid
        newCarriedForward = 0;
      }

      return {
        ...loan,
        remainingPrincipal: newRemainingPrincipal,
        carriedForwardDue: newCarriedForward,
        payments: [...(loan.payments || []), newPayment],
        status: newRemainingPrincipal <= 0 ? 'COMPLETED' : loan.status
      };
    }));
  };

  const triggerAutoReminders = () => {
    const today = new Date().toISOString().split('T')[0];
    setLoans(prev => prev.map(l => {
      if (l.status === 'Active' || l.status === 'active' || l.status === 'terms_set') {
        return { ...l, lastReminderSent: today };
      }
      return l;
    }));
  };

  return (
    <LoanContext.Provider value={{ loans, addLoan, updateLoan, deleteLoan, recordPayment, triggerAutoReminders }}>
      {children}
    </LoanContext.Provider>
  );
}

export const useLoans = () => useContext(LoanContext);
