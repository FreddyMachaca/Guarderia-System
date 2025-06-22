import { useState, useCallback } from 'react';

export const useMenus = () => {
  const [activeMenu, setActiveMenu] = useState('dashboard');
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  const parentMenus = [
    {
      id: 'dashboard',
      title: 'Panel Principal',
      icon: '🏠',
      path: '/system/parent'
    },
    {
      id: 'children',
      title: 'Mis Hijos',
      icon: '👶',
      path: '/system/parent/children'
    },
    {
      id: 'messages',
      title: 'Mensajes',
      icon: '💬',
      path: '/system/parent/messages'
    },
    {
      id: 'payments',
      title: 'Pagos',
      icon: '💳',
      path: '/system/parent/payments'
    },
    {
      id: 'events',
      title: 'Eventos',
      icon: '📅',
      path: '/system/parent/events'
    }
  ];

  const staffMenus = [
    {
      id: 'dashboard',
      title: 'Panel Principal',
      icon: '🏠',
      path: '/system/dashboard'
    },
    {
      id: 'children',
      title: 'Niños',
      icon: '👶',
      path: '/system/children'
    },
    {
      id: 'parents',
      title: 'Padres',
      icon: '👥',
      path: '/system/parents'
    },
    {
      id: 'staff',
      title: 'Personal',
      icon: '👨‍🏫',
      path: '/system/staff'
    },
    {
      id: 'activities',
      title: 'Actividades',
      icon: '🎨',
      path: '/system/activities'
    },
    {
      id: 'reports',
      title: 'Reportes',
      icon: '📊',
      path: '/system/reports'
    }
  ];

  const adminMenus = [
    ...staffMenus,
    {
      id: 'admin',
      title: 'Administración',
      icon: '⚙️',
      path: '/system/admin'
    },
    {
      id: 'users',
      title: 'Usuarios',
      icon: '👤',
      path: '/system/admin/users'
    },
    {
      id: 'roles',
      title: 'Roles',
      icon: '🔐',
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