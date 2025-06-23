import { useState, useCallback, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';

export const useMenus = () => {
  const [activeMenu, setActiveMenu] = useState('dashboard');
  const [isMenuOpen, setIsMenuOpen] = useState(true);
  const navigate = useNavigate();
  const location = useLocation();

  const adminMenus = [
    {
      id: 'dashboard',
      title: 'Dashboard',
      icon: 'pi pi-home',
      path: '/system/dashboard'
    },
    {
      id: 'gestion-ninos',
      title: 'Gestión de Niños',
      icon: 'pi pi-users',
      path: '/system/gestion-ninos'
    },
    {
      id: 'personal',
      title: 'Personal',
      icon: 'pi pi-user-plus',
      path: '/system/personal'
    },
    {
      id: 'padres',
      title: 'Padres',
      icon: 'pi pi-heart',
      path: '/system/padres'
    },
    {
      id: 'grupos',
      title: 'Grupos/Aulas',
      icon: 'pi pi-building',
      path: '/system/grupos'
    },
    {
      id: 'actividades',
      title: 'Actividades',
      icon: 'pi pi-calendar',
      path: '/system/actividades'
    },
    {
      id: 'reportes',
      title: 'Reportes',
      icon: 'pi pi-chart-bar',
      path: '/system/reportes'
    }
  ];

  // Effect para actualizar el menú activo basado en la ruta actual
  useEffect(() => {
    const currentPath = location.pathname;
    const currentMenu = adminMenus.find(menu => currentPath.includes(menu.id));
    if (currentMenu) {
      setActiveMenu(currentMenu.id);
    }
  }, [location.pathname, adminMenus]);

  const setMenu = useCallback((menuId) => {
    setActiveMenu(menuId);
    const menu = adminMenus.find(m => m.id === menuId);
    if (menu) {
      navigate(menu.path);
    }
  }, [adminMenus, navigate]);

  const toggleMenu = useCallback(() => {
    setIsMenuOpen(prev => !prev);
  }, []);

  const closeMenu = useCallback(() => {
    setIsMenuOpen(false);
  }, []);

  return {
    activeMenu,
    isMenuOpen,
    adminMenus,
    setMenu,
    toggleMenu,
    closeMenu
  };
};