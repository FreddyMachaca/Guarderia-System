import { useState, useCallback, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useApi } from './useApi';

export const useMenus = () => {
  const [activeMenu, setActiveMenu] = useState('dashboard');
  const [isMenuOpen, setIsMenuOpen] = useState(true);
  const navigate = useNavigate();
  const location = useLocation();
  const { getCurrentUser } = useApi();

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
      path: '/system/mensualidades'
    },
    {
      id: 'reportes',
      title: 'Reportes',
      icon: 'pi pi-chart-bar',
      path: '/system/reportes'
    },
    {
      id: 'perfil',
      title: 'Mi Perfil',
      icon: 'pi pi-user',
      path: '/system/perfil'
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
    {
      id: 'perfil',
      title: 'Mi Perfil',
      icon: 'pi pi-user',
      path: '/system/perfil'
    }
  ];

  useEffect(() => {
    const currentPath = location.pathname;
    
    if (currentPath.includes('/perfil')) {
      setActiveMenu('perfil');
      return;
    }
    
    const allMenus = [...adminMenus, ...parentMenus];
    const currentMenu = allMenus.find(menu => currentPath.includes(menu.id));
    if (currentMenu) {
      setActiveMenu(currentMenu.id);
    }
  }, [location.pathname]);

  const setMenu = useCallback((menuId) => {
    setActiveMenu(menuId);
    
    if (menuId === 'perfil') {
      navigate('/system/perfil');
      return;
    }
    
    // Handle dashboard routing based on user type
    if (menuId === 'dashboard') {
      const user = getCurrentUser();
      const userType = user?.type || user?.usr_tipo;
      
      if (userType === 'parent' || userType === 'Tutor') {
        navigate('/system/parent-dashboard');
      } else {
        navigate('/system/dashboard');
      }
      return;
    }
    
    const allMenus = [...adminMenus, ...parentMenus];
    const menu = allMenus.find(m => m.id === menuId);
    if (menu) {
      navigate(menu.path);
    }
  }, [navigate, adminMenus, parentMenus, getCurrentUser]);

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