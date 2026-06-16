import { useMemo } from 'react';
import { useAuth, normalizeRole } from '../context/AuthContext';
import { getSidebarConfigForRole } from '../config/sidebarMenus';

/**
 * Same role resolution as RoleSidebarNav — for mobile nav + header chrome.
 */
export function useSidebarRoleConfig(routeRole) {
  const { user } = useAuth();

  const effectiveRole = useMemo(() => {
    return (
      normalizeRole(user?.role) ||
      normalizeRole(localStorage.getItem('role')) ||
      normalizeRole(routeRole)
    );
  }, [user?.role, routeRole]);

  const config = useMemo(() => {
    return (
      getSidebarConfigForRole(effectiveRole) ||
      getSidebarConfigForRole(routeRole)
    );
  }, [effectiveRole, routeRole]);

  return {
    effectiveRole,
    mobileNav: config?.mobileNav || [],
    branding: config?.branding || {},
  };
}
