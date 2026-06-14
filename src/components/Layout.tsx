import { NavLink, useNavigate } from 'react-router-dom';
import { Home, FileText, BarChart3, CarFront, Plus, Ticket } from 'lucide-react';
import { cn } from '@/lib/utils';

const navItems = [
  { to: '/', label: '首页', icon: Home },
  { to: '/records', label: '记录', icon: FileText },
  { to: '/coupons', label: '优惠券', icon: Ticket },
  { to: '/statistics', label: '统计', icon: BarChart3 },
  { to: '/parking-spot', label: '车位', icon: CarFront },
];

export default function Layout({ children }: { children: React.ReactNode }) {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen flex flex-col bg-neutral-100">
      <header className="sticky top-0 z-40 bg-white/80 backdrop-blur-lg border-b border-neutral-200">
        <div className="container flex items-center justify-between h-16">
          <div className="flex items-center gap-2">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-primary-700 to-primary-900 flex items-center justify-center shadow-card">
              <CarFront className="w-5 h-5 text-white" />
            </div>
            <div>
              <h1 className="text-lg font-bold text-primary-900 leading-tight">停车管家</h1>
              <p className="text-[10px] text-neutral-500 leading-tight">Parking Manager</p>
            </div>
          </div>

          <nav className="hidden md:flex items-center gap-1">
            {navItems.map((item) => (
              <NavLink
                key={item.to}
                to={item.to}
                end={item.to === '/'}
                className={({ isActive }) =>
                  cn(
                    'flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200',
                    isActive
                      ? 'bg-primary-50 text-primary-800'
                      : 'text-neutral-600 hover:bg-neutral-100 hover:text-neutral-900'
                  )
                }
              >
                <item.icon className="w-4 h-4" />
                {item.label}
              </NavLink>
            ))}
          </nav>

          <button
            onClick={() => navigate('/records/new')}
            className="hidden sm:flex items-center gap-2 bg-gradient-to-r from-primary-700 to-primary-900 text-white px-4 py-2 rounded-xl text-sm font-medium hover:shadow-card-hover transition-all duration-200 active:scale-95"
          >
            <Plus className="w-4 h-4" />
            新增记录
          </button>
        </div>
      </header>

      <main className="flex-1 container py-6 pb-28 md:pb-6">
        {children}
      </main>

      <nav className="md:hidden fixed bottom-0 left-0 right-0 z-40 bg-white/95 backdrop-blur-lg border-t border-neutral-200 pb-[env(safe-area-inset-bottom)]">
        <div className="flex items-center justify-around h-16 px-2">
          {navItems.map((item) => (
            <NavLink
              key={item.to}
              to={item.to}
              end={item.to === '/'}
              className={({ isActive }) =>
                cn(
                  'flex flex-col items-center justify-center gap-1 flex-1 h-full text-[11px] font-medium transition-colors',
                  isActive ? 'text-primary-700' : 'text-neutral-500'
                )
              }
            >
              <item.icon className="w-5 h-5" />
              {item.label}
            </NavLink>
          ))}
        </div>
      </nav>
    </div>
  );
}
