'use client';

import { useAuth } from '@/components/auth/AuthProvider';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Calendar, Users, Settings, BookOpen } from 'lucide-react';

export default function Sidebar() {
  const { userData } = useAuth();
  const pathname = usePathname();

  const isActiveLink = (path: string) => pathname.startsWith(path);

  const superAdminMenu = [
    {
      label: 'Gestion des Admins',
      href: '/dashboard/admins',
      icon: Users,
    },
    {
      label: 'Paramètres',
      href: '/dashboard/settings',
      icon: Settings,
    },
  ];

  const adminMenu = [
    {
      label: 'Rendez-vous',
      href: `/dashboard/business/${userData?.businessId}/appointments`,
      icon: Calendar,
    },
    {
      label: 'Services',
      href: `/dashboard/business/${userData?.businessId}/services`,
      icon: BookOpen,
    },
    {
      label: 'Clients',
      href: `/dashboard/business/${userData?.businessId}/clients`,
      icon: Users,
    },
    {
      label: 'Paramètres',
      href: `/dashboard/business/${userData?.businessId}/settings`,
      icon: Settings,
    },
  ];

  const menuItems = userData?.role === 'super_admin' ? superAdminMenu : adminMenu;

  return (
    <div className="w-[15vw] bg-white h-full p-6">
      <nav className="space-y-2">
        {menuItems.map((item) => (
          <Link
            key={item.href}
            href={item.href}
            className={`flex items-center px-4 py-2 rounded-[10px] transition-colors ${
              isActiveLink(item.href)
                ? 'border border-black text-black'
                : 'text-black hover:border hover:border-black'
            }`}
          >
            <item.icon className="w-5 h-5 mr-3 text-black" />
            {item.label}
          </Link>
        ))}
      </nav>
    </div>
  );
}