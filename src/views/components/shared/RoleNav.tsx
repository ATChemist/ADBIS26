import { Link, NavLink } from 'react-router-dom';
import { PATHS } from '../../../routes';
import { cn } from '../../../utils/cn';

const navItems = [
  { to: PATHS.bioDashboard, label: 'Bioanalytiker' },
  { to: PATHS.plannerOverview, label: 'Planlægger' },
  { to: PATHS.requesterCreate, label: 'Rekvirent' },
];

export function RoleNav() {
  return (
    <div className="sticky top-0 z-40 border-b border-slate-200/80 bg-white/85 backdrop-blur">
      <div className="mx-auto flex max-w-7xl flex-wrap items-center justify-between gap-3 px-4 py-3 sm:px-6">
        <Link to={PATHS.home} className="flex items-center gap-2 rounded-xl px-2 py-1 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-400">
          <span className="grid h-9 w-9 place-items-center rounded-xl bg-brand-600 text-white shadow">🧪</span>
          <div>
            <p className="font-display text-lg font-bold tracking-wide text-slate-950">FlowLab</p>
            <p className="text-xs text-slate-500">Lokal prototype (mock data)</p>
          </div>
        </Link>
        <nav className="flex flex-wrap gap-2" aria-label="Roller">
          {navItems.map((item) => (
            <NavLink
              key={item.to}
              to={item.to}
              className={({ isActive }) =>
                cn(
                  'min-h-11 rounded-xl px-4 py-2 text-sm font-semibold focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-400',
                  isActive ? 'bg-brand-600 text-white shadow' : 'bg-slate-100 text-slate-800 hover:bg-slate-200',
                )
              }
            >
              {item.label}
            </NavLink>
          ))}
        </nav>
      </div>
    </div>
  );
}
