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
      id: 'padres',
      title: 'Padres',
      icon: 'pi pi-heart',
      path: '/system/padres'
    },
    {
      id: 'gestion-ninos',
      title: 'Gestión de Niños',
      icon: 'pi pi-users',
      path: '/system/gestion-ninos'
    },
    {
      id: 'grupos',
      title: 'Grupos/Aulas',
      icon: 'pi pi-building',
      path: '/system/grupos'
    },
    {
      id: 'personal',
      title: 'Personal',
      icon: 'pi pi-user-plus',
      path: '/system/personal'
    },
    {
      id: 'mensualidades',
      title: 'Mensualidades',
      icon: 'pi pi-money-bill',
    },
    {
      id: 'reportes',
      title: 'Reportes',
      icon: 'pi pi-chart-bar',
      path: '/system/reportes'
    }
  ];

  const parentMenus = [
    {
      id: 'dashboard',
      title: 'Dashboard',
      icon: 'pi pi-home',
      path: '/system/parent-dashboard'
    },
    {
      id: 'mis-hijos',
      title: 'Mis Hijos',
      icon: 'pi pi-users',
      path: '/system/mis-hijos'
    },
    {
      id: 'pagos',
      title: 'Pagos',
      icon: 'pi pi-money-bill',
      path: '/system/pagos'
    },
  ];

  useEffect(() => {
    const currentPath = location.pathname;
    const allMenus = [...adminMenus, ...parentMenus];
    const currentMenu = allMenus.find(menu => currentPath.includes(menu.id));
    if (currentMenu) {
      setActiveMenu(currentMenu.id);
    }
  }, [location.pathname]);

  const setMenu = useCallback((menuId) => {
    setActiveMenu(menuId);
    const allMenus = [...adminMenus, ...parentMenus];
    const menu = allMenus.find(m => m.id === menuId);
    if (menu) {
      navigate(menu.path);
    }
  }, [navigate]);

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
    parentMenus,
    setMenu,
    toggleMenu,
    closeMenu
  };
};