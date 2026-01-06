import { Brain, Stethoscope, Users, UserStar, type LucideIcon } from "lucide-react";

interface MenuItem {
  titleKey?: string;
  title: string;
  icon: LucideIcon;
  childrens?: MenuItem[];
  to?: string;
  url?: string;
}

interface MenuConfig {
  [key: string]: MenuItem[];
}

export const menusByRole: MenuConfig = {
  admin: [
    {
      title: "Especialidades",
      titleKey: "menu.specialities",
      icon: Brain,
      to: "/specialities",
    },
    {
      title: "Doctores",
      titleKey: "menu.doctors",
      icon: Stethoscope,
      to: "/doctors",
    },
    {
      title: "Usuarios",
      titleKey: "menu.users",
      icon: Users,
      to: "/users",
    },
    {
      title: "Pacientes",
      titleKey: "menu.patients",
      icon: UserStar,
      to: "/patients",
    },
  ],
};

export const getMenuByRole = (role: string): MenuItem[] => {
  return menusByRole[role] || menusByRole["consultor"]; // Por defecto usar consultor si no se encuentra el rol
};
