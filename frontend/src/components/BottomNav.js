import { NavLink } from 'react-router-dom';

const navItems = [
  { to: '/dashboard', label: 'Home', icon: '🏠' },
  { to: '/patients', label: 'Patients', icon: '👥' },
  { to: '/visioncare', label: 'Scan', icon: '📷' },
  { to: '/schedule', label: 'Schedule', icon: '📅' },
  { to: '/settings', label: 'More', icon: '⚙️' },
];

export default function BottomNav() {
  return (
    <nav className="fixed bottom-0 left-0 right-0 z-30 border-t border-slate-200 bg-white/95 backdrop-blur sm:hidden">
      <div className="mx-auto flex max-w-[430px] items-center justify-between px-2 py-2">
        {navItems.map((item) => (
          <NavLink
            key={item.to}
            to={item.to}
            className={({ isActive }) =>
              `flex min-h-[56px] w-full flex-col items-center justify-center rounded-xl px-1 text-[10px] font-bold transition-all duration-200 ${
                isActive ? 'text-teal-700 bg-teal-50/50 scale-105' : 'text-slate-400'
              }`
            }
          >
            <span className="text-xl mb-1">{item.icon}</span>
            <span>{item.label}</span>
          </NavLink>
        ))}
      </div>
    </nav>
  );
}
