// ============================================================
// ARKAD FINANCE – Central Theme & Config
// Clean white professional theme
// ============================================================

export const THEME = {
  brand: {
    primary:        '#2563eb',
    primaryHover:   '#1d4ed8',
    primaryLight:   '#eff6ff',
    primaryDark:    '#1e40af',
    secondary:      '#0ea5e9',
    accent:         '#6366f1',
  },
  status: {
    active:           { bg: '#dcfce7', text: '#166534', dot: '#22c55e' },
    pending:          { bg: '#fff7ed', text: '#c2410c', dot: '#f97316' },
    approved:         { bg: '#dcfce7', text: '#166534', dot: '#22c55e' },
    rejected:         { bg: '#fee2e2', text: '#991b1b', dot: '#ef4444' },
    paid:             { bg: '#dcfce7', text: '#166534', dot: '#22c55e' },
    verified:         { bg: '#dcfce7', text: '#166534', dot: '#22c55e' },
    defaulted:        { bg: '#fee2e2', text: '#991b1b', dot: '#ef4444' },
    late:             { bg: '#fef3c7', text: '#92400e', dot: '#f59e0b' },
    overdue:          { bg: '#fef3c7', text: '#92400e', dot: '#f59e0b' },
    completed:        { bg: '#e0f2fe', text: '#075985', dot: '#0ea5e9' },
    suspended:        { bg: '#f3f4f6', text: '#374151', dot: '#9ca3af' },
    terms_set:        { bg: '#faf5ff', text: '#6b21a8', dot: '#a855f7' },
    terms_accepted:   { bg: '#f0fdf4', text: '#15803d', dot: '#4ade80' },
    funds_confirmed:  { bg: '#eff6ff', text: '#1d4ed8', dot: '#60a5fa' },
    upcoming:         { bg: '#eff6ff', text: '#1d4ed8', dot: '#60a5fa' },
    'due-today':      { bg: '#fef3c7', text: '#b45309', dot: '#f59e0b' },
  },
  risk: {
    GREEN: {
      bg:      '#f0fdf4',
      border:  '#bbf7d0',
      text:    '#166534',
      badge:   '#dcfce7',
      dot:     '#22c55e',
      label:   'Low Risk',
    },
    AMBER: {
      bg:      '#fffbeb',
      border:  '#fde68a',
      text:    '#92400e',
      badge:   '#fef3c7',
      dot:     '#f59e0b',
      label:   'Medium Risk',
    },
    RED: {
      bg:      '#fef2f2',
      border:  '#fecaca',
      text:    '#991b1b',
      badge:   '#fee2e2',
      dot:     '#ef4444',
      label:   'High Risk',
    },
  },
  role: {
    admin: {
      gradient: 'linear-gradient(135deg, #2563eb 0%, #1d4ed8 100%)',
      accent: '#2563eb',
    },
    staff: {
      gradient: 'linear-gradient(135deg, #4f46e5 0%, #3730a3 100%)',
      accent: '#4f46e5',
    },
    borrower: {
      gradient: 'linear-gradient(135deg, #0ea5e9 0%, #2563eb 100%)',
      accent: '#0ea5e9',
    },
    agent: {
      gradient: 'linear-gradient(135deg, #10b981 0%, #059669 100%)',
      accent: '#10b981',
    },
  },
};
