import { useState, useCallback } from 'react';

export const useMenus = () => {
  const [activeMenu, setActiveMenu] = useState('dashboard');
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  const parentMenus = [
    {
      id: 'dashboard',
      title: 'Panel Principal',
      icon: 'pi pi-home',
      path: '/system/parent'
    },
    {
      id: 'children',
      title: 'Mis Hijos',
      icon: 'pi pi-users',
      path: '/system/parent/children'
    },
    {
      id: 'messages',
      title: 'Mensajes',
      icon: 'pi pi-comments',
      path: '/system/parent/messages'
    },
    {
      id: 'payments',
      title: 'Pagos',
      icon: 'pi pi-credit-card',
      path: '/system/parent/payments'
    },
    {
      id: 'events',
      title: 'Eventos',
      icon: 'pi pi-calendar',
      path: '/system/parent/events'
    }
  ];

  const staffMenus = [
    {
      id: 'dashboard',
      title: 'Panel Principal',
      icon: 'pi pi-home',
      path: '/system/dashboard'
    },
    {
      id: 'children',
      title: 'Niños',
      icon: 'pi pi-users',
      path: '/system/children'
    },
    {
      id: 'parents',
      title: 'Padres',
      icon: 'pi pi-users',
      path: '/system/parents'
    },
    {
      id: 'staff',
      title: 'Personal',
      icon: 'pi pi-id-card',
      path: '/system/staff'
    },
    {
      id: 'activities',
      title: 'Actividades',
      icon: 'pi pi-palette',
      path: '/system/activities'
    },
    {
      id: 'reports',
      title: 'Reportes',
      icon: 'pi pi-chart-bar',
      path: '/system/reports'
    }
  ];

  const adminMenus = [
    ...staffMenus,
    {
      id: 'admin',
      title: 'Administración',
      icon: 'pi pi-cog',
      path: '/system/admin'
    },
    {
      id: 'users',
      title: 'Usuarios',
      icon: 'pi pi-user',
      path: '/system/admin/users'
    },
    {
      id: 'roles',
      title: 'Roles',
      icon: 'pi pi-shield',
      path: '/system/admin/roles'
    }
  ];

  const setMenu = useCallback((menuId) => {
    setActiveMenu(menuId);
  }, []);

  const toggleMenu = useCallback(() => {
    setIsMenuOpen(prev => !prev);
  }, []);

  const closeMenu = useCallback(() => {
    setIsMenuOpen(false);
  }, []);

  return {
    activeMenu,
    isMenuOpen,
    parentMenus,
    staffMenus,
    adminMenus,
    setMenu,
    toggleMenu,
    closeMenu
  };
};