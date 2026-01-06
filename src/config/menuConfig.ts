import {
  Brain,
  CalendarClock,
  CalendarPlus,
  CalendarRange,
  Stethoscope,
  Users,
  UserStar,
  type LucideIcon,
} from "lucide-react";

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
    {
      title: "Agendas",
      titleKey: "menu.schedules",
      icon: CalendarRange,
      to: "/schedules",
      childrens: [
        {
          title: "Crear agenda",
          titleKey: "menu.createSchedule",
          icon: CalendarPlus,
          to: "/schedules/create",
        },
        {
          title: "Agendas programadas",
          titleKey: "menu.scheduledSchedules",
          icon: CalendarClock,
          to: "/schedules",
        },
      ],
    },
  ],
};

export const getMenuByRole = (role: string): MenuItem[] => {
  return menusByRole[role] || menusByRole["consultor"]; // Por defecto usar consultor si no se encuentra el rol
};
