import { NavLink } from 'react-router-dom';

const navItems = [
  { to: '/', label: 'Home', icon: '🏠' },
  { to: '/scan/1', label: 'Scan', icon: '📷' },
  { to: '/dashboard', label: 'Dashboard', icon: '📊' },
];

export default function BottomNav() {
  return (
    <nav className="fixed bottom-0 left-0 right-0 z-20 border-t border-slate-200 bg-white/95 backdrop-blur sm:hidden">
      <div className="mx-auto flex max-w-[430px] items-center justify-between px-4 py-3">
        {navItems.map((item) => (
          <NavLink
            key={item.to}
            to={item.to}
            className={({ isActive }) =>
              `flex min-h-[48px] w-full flex-col items-center justify-center rounded-2xl px-2 text-[11px] font-semibold transition ${
                isActive ? 'text-emerald-700' : 'text-slate-500'
              }`
            }
          >
            <span className="text-xl">{item.icon}</span>
            <span>{item.label}</span>
          </NavLink>
        ))}
      </div>
    </nav>
  );
}
