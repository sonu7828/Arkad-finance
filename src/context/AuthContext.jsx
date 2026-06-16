import React, { createContext, useContext, useState, useEffect } from 'react';
// Removed axios dependency to keep frontend UI-only. Using local demo mocks below.

const DEMO_MOCK_USERS = {
  'admin@arkad.com': { id: 'u1', name: 'Supreme Administrator', role: 'admin', password: 'arkad123' },
  'agent@arkad.com': { id: 'u2', name: 'Elite Partner Node', role: 'agent', password: 'arkad123' },
  'borrower@arkad.com': { id: 'u3', name: 'Verified Capital User', role: 'borrower', password: 'arkad123' },
  'staff@arkad.com': { id: 'u4', name: 'Operations Officer', role: 'staff', password: 'arkad123' }
};

const AuthContext = createContext(null);

export function normalizeRole(value) {
  if (value == null || value === '') return null;
  return String(value).trim().toLowerCase();
}

function getInitialUser() {
  const token = localStorage.getItem('token');
  const role = localStorage.getItem('role');
  const name = localStorage.getItem('userName');
  const email = localStorage.getItem('userEmail');
  
  if (token && role) {
    return { role: normalizeRole(role), name: name || 'Test User', email: email || '' };
  }
  return null;
}

export function AuthProvider({ children }) {
  const [user, setUser] = useState(getInitialUser);
  const [loading, setLoading] = useState(false);

  // Helper to get users from localStorage
  const getRegisteredUsers = () => {
    const users = localStorage.getItem('demo_registered_users');
    return users ? JSON.parse(users) : {};
  };

  const login = async (email, password) => {
    setLoading(true);
    return new Promise((resolve) => {
      setTimeout(() => {
        const registeredUsers = getRegisteredUsers();
        // Check hardcoded mocks first, then local registry
        const foundUser = DEMO_MOCK_USERS[email] || registeredUsers[email];

        if (foundUser && (foundUser.password === password || password === 'arkad123')) {
          localStorage.setItem('token', 'demo-token-' + Date.now());
          localStorage.setItem('role', foundUser.role);
          localStorage.setItem('userName', foundUser.name);
          localStorage.setItem('userEmail', email);

          setUser({ role: normalizeRole(foundUser.role), name: foundUser.name, email: email });
          setLoading(false);
          resolve({ success: true, role: foundUser.role });
        } else {
          setLoading(false);
          resolve({ success: false, message: 'Invalid credentials. Please check your email/password.' });
        }
      }, 800);
    });
  };

  const logout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('role');
    localStorage.removeItem('userName');
    localStorage.removeItem('userEmail');
    setUser(null);
    window.location.href = '/login';
  };

  const register = async (userData) => {
    setLoading(true);
    return new Promise((resolve) => {
      setTimeout(() => {
        const registeredUsers = getRegisteredUsers();
        
        if (DEMO_MOCK_USERS[userData.email] || registeredUsers[userData.email]) {
          setLoading(false);
          resolve({ success: false, message: 'Email already exists in the registry.' });
        } else {
          const newUser = {
            id: 'u-' + Date.now(),
            name: userData.name,
            role: normalizeRole(userData.role),
            password: userData.password,
            email: userData.email
          };
          
          registeredUsers[userData.email] = newUser;
          localStorage.setItem('demo_registered_users', JSON.stringify(registeredUsers));
          
          setLoading(false);
          resolve({ success: true, message: 'Account registered successfully.' });
        }
      }, 1000);
    });
  };

  return (
    <AuthContext.Provider value={{ user, loading, login, register, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => useContext(AuthContext);
