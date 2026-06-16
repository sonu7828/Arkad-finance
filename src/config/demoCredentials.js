/**
 * Must match backend `src/config/demoUsers.js` emails + demoPlainPassword per role.
 * Quick Access fills email immediately; API confirms from DB. Password must match DB hash.
 */
export const DEMO_PASSWORD = 'password123';

/** Plain passwords for Quick Access tiles (sync with backend demoPlainPassword). */
export const DEMO_PASSWORD_BY_ROLE = {
  admin: 'password123',
  staff: 'password123',
  agent: '123456',
  borrower: '123456',
};

export function demoPasswordForRole(role) {
  const r = role?.toLowerCase();
  return DEMO_PASSWORD_BY_ROLE[r] ?? DEMO_PASSWORD;
}

export const QUICK_ACCESS_BY_ROLE = {
  admin: { email: 'admin@lendanet.com' },
  staff: { email: 'staff@lendanet.com' },
  agent: { email: 'demoagent@gmail.com' },
  borrower: { email: 'demo@gmail.com' },
};
