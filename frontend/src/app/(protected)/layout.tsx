'use client';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import clsx from 'clsx';
import { useAuth } from '@/hooks/useAuth';
import { Button } from '@/components/ui/Button';

const navLinks = [
  { href: '/dashboard', label: 'Dashboard' },
  { href: '/vendors', label: 'Vendors' },
  { href: '/payments/new', label: 'New Payment' },
  { href: '/transactions', label: 'Transactions' },
];

export default function ProtectedLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const { user, logout } = useAuth();
  const router = useRouter();

  const handleLogout = () => {
    logout();
    router.push('/login');
  };

  return (
    <div className="min-h-screen flex flex-col">
      <header className="bg-white border-b border-gray-200 px-6 py-3 flex items-center justify-between">
        <div className="flex items-center gap-8">
          <span className="font-bold text-blue-600 text-lg">Company P</span>
          <nav className="flex gap-4">
            {navLinks.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className={clsx(
                  'text-sm font-medium transition-colors',
                  pathname.startsWith(link.href.replace('/new', ''))
                    ? 'text-blue-600'
                    : 'text-gray-600 hover:text-gray-900',
                )}
              >
                {link.label}
              </Link>
            ))}
          </nav>
        </div>
        <div className="flex items-center gap-3">
          <span className="text-sm text-gray-500">{user?.companyName}</span>
          <Button variant="secondary" onClick={handleLogout} className="text-xs px-3 py-1.5">
            Sign out
          </Button>
        </div>
      </header>
      <main className="flex-1 px-6 py-8 max-w-5xl mx-auto w-full">{children}</main>
    </div>
  );
}
