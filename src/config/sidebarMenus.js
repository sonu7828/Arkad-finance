import {
  LayoutDashboard,
  Users,
  CreditCard,
  User,
  DollarSign,
  Sliders,
  PlusCircle,
  ClipboardCheck,
  CalendarDays,
  HandCoins,
  History,
  FileText,
  PieChart,
  UserCheck,
  Map,
  MessageSquare,
} from 'lucide-react';

export const sidebarMenus = {
  ADMIN: {
    nav: [
      { key: 'dashboard', path: '/admin/dashboard', label: 'Dashboard', icon: LayoutDashboard },
      { key: 'crm', path: '/admin/crm', label: 'CRM Intelligence', icon: MessageSquare },
      { key: 'requests', path: '/admin/loans?status=pending', label: 'Incoming Applications', icon: ClipboardCheck },
      { key: 'active-loans', path: '/admin/loans?status=active', label: 'Live Portfolio', icon: CreditCard },
      { key: 'payments', path: '/admin/payments', label: 'Financial Ledger', icon: DollarSign },
      { key: 'users', path: '/admin/borrowers', label: 'Network Control', icon: UserCheck },
      { key: 'commissions', path: '/admin/agents', label: 'Agent Analytics', icon: PieChart },
      { key: 'calendar', path: '/admin/calendar', label: 'Due Calendar', icon: CalendarDays },
      { key: 'settings', path: '/admin/settings', label: 'Configuration', icon: Sliders },
    ],
    branding: {
      sidebarHeader: 'icon',
      titleAccentClass: 'text-indigo-600',
      subtitle: 'Lender Panel',
      profileBadge: 'Admin',
      defaultInitials: 'AD',
      profilePath: '/admin/profile',
    },
    mobileNav: [
      { key: 'dashboard', path: '/admin/dashboard', label: 'Home', icon: LayoutDashboard },
      { key: 'requests', path: '/admin/loans?status=pending', label: 'Requests', icon: ClipboardCheck },
      { key: 'active-loans', path: '/admin/loans?status=active', label: 'Loans', icon: CreditCard },
      { key: 'users', path: '/admin/users', label: 'Network', icon: UserCheck },
    ],
  },

  STAFF: {
    nav: [
      { key: 'dashboard', path: '/staff/dashboard', label: 'Operations hub', icon: LayoutDashboard },
      { key: 'borrower-verification', path: '/staff/borrowers', label: 'Verification Center', icon: UserCheck },
      { key: 'loan-queue', path: '/staff/loans', label: 'Loan Processing', icon: History },
      { key: 'payments', path: '/staff/payments', label: 'Payment Entries', icon: DollarSign },
      { key: 'calendar', path: '/staff/calendar', label: 'Collection tracker', icon: Map },
    ],
    branding: {
      sidebarHeader: 'icon',
      titleAccentClass: 'text-indigo-600',
      subtitle: 'Operations',
      profileBadge: 'Staff',
      defaultInitials: 'ST',
      profilePath: '/staff/profile',
    },
    mobileNav: [
      { key: 'dashboard', path: '/staff/dashboard', label: 'Home', icon: LayoutDashboard },
      { key: 'loan-queue', path: '/staff/loans', label: 'Queue', icon: History },
      { key: 'payments', path: '/staff/payments', label: 'Payments', icon: DollarSign },
      { key: 'calendar', path: '/staff/calendar', label: 'Tracker', icon: Map },
    ],
  },

  BORROWER: {
    nav: [
      { key: 'dashboard', path: '/borrower/dashboard', label: 'Loan Status', icon: LayoutDashboard },
      { key: 'apply', path: '/borrower/apply', label: 'Apply for Funds', icon: PlusCircle },
      { key: 'loans', path: '/borrower/loans', label: 'My Contracts', icon: FileText },
      { key: 'payments', path: '/borrower/payments', label: 'Repayment Hub', icon: DollarSign },
      { key: 'collateral', path: '/borrower/collateral', label: 'Asset Vault', icon: CreditCard },
      { key: 'profile', path: '/borrower/profile', label: 'Profile Settings', icon: User },
    ],
    branding: {
      sidebarHeader: 'icon',
      titleAccentClass: 'text-indigo-600',
      subtitle: 'Borrower',
      profileBadge: 'Borrower',
      defaultInitials: 'BW',
      profilePath: '/borrower/profile',
    },
    mobileNav: [
      { key: 'dashboard', path: '/borrower/dashboard', label: 'Status', icon: LayoutDashboard },
      { key: 'apply', path: '/borrower/apply', label: 'Apply', icon: PlusCircle },
      { key: 'loans', path: '/borrower/loans', label: 'Contracts', icon: FileText },
      { key: 'profile', path: '/borrower/profile', label: 'Profile', icon: User },
    ],
  },

  AGENT: {
    nav: [
      { key: 'dashboard', path: '/agent/dashboard', label: 'Partner Dashboard', icon: LayoutDashboard },
      { key: 'referrals', path: '/agent/clients', label: 'My Network', icon: Users },
      { key: 'earnings', path: '/agent/earnings', label: 'Commission Stats', icon: HandCoins },
      { key: 'payouts', path: '/agent/payments', label: 'Payout History', icon: History },
      { key: 'profile', path: '/agent/profile', label: 'Account', icon: User },
    ],
    branding: {
      sidebarHeader: 'icon', // Changed from logo to icon
      titleAccentClass: 'text-indigo-600',
      subtitle: 'Partner',
      profileBadge: 'Agent',
      defaultInitials: 'AG',
      profilePath: '/agent/profile',
    },
    mobileNav: [
      { key: 'dashboard', path: '/agent/dashboard', label: 'Home', icon: LayoutDashboard },
      { key: 'referrals', path: '/agent/clients', label: 'Network', icon: Users },
      { key: 'earnings', path: '/agent/earnings', label: 'Stats', icon: HandCoins },
      { key: 'profile', path: '/agent/profile', label: 'Profile', icon: User },
    ],
  },
};

const ROLE_ALIASES = {
  admin: 'ADMIN',
  staff: 'STAFF',
  borrower: 'BORROWER',
  agent: 'AGENT',
};

export function getSidebarConfigForRole(role) {
  const key = ROLE_ALIASES[String(role || '').toLowerCase()];
  return key ? sidebarMenus[key] : null;
}
