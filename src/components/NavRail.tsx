import React from 'react';
import {
  LayoutDashboardIcon,
  FileTextIcon,
  TriangleAlertIcon,
  UsersIcon,
  SettingsIcon } from
'lucide-react';

const items = [
{ id: 'dashboard', label: 'Dashboard', Icon: LayoutDashboardIcon },
{ id: 'reports', label: 'Reports', Icon: FileTextIcon },
{ id: 'incidents', label: 'Incidents', Icon: TriangleAlertIcon },
{ id: 'team', label: 'Team', Icon: UsersIcon },
{ id: 'settings', label: 'Settings', Icon: SettingsIcon }];


export function NavRail() {
  return (
    <nav
      aria-label="Main"
      className="flex w-14 shrink-0 flex-col items-center gap-1 border-r border-line bg-card py-4">
      
      <div className="mb-4 flex h-8 w-8 items-center justify-center rounded-md bg-teal-fill text-label font-semibold text-teal">
        N
      </div>
      {items.map(({ id, label, Icon }) => {
        const active = id === 'reports';
        return (
          <div key={id} className="group relative">
            <button
              type="button"
              aria-label={label}
              aria-current={active ? 'page' : undefined}
              className={[
              'flex h-10 w-10 items-center justify-center rounded-lg outline-none transition-colors duration-150',
              'focus-visible:ring-2 focus-visible:ring-teal',
              active ?
              'bg-raised text-teal' :
              'text-faint hover:bg-raised hover:text-muted'].
              join(' ')}>
              
              <Icon size={18} strokeWidth={1.75} />
            </button>
            <span
              role="tooltip"
              className="pointer-events-none absolute left-12 top-1/2 z-20 -translate-y-1/2 translate-x-1 whitespace-nowrap rounded-md border border-line bg-raised px-2 py-1 text-label text-txt opacity-0 shadow-lg transition-[opacity,transform] duration-150 ease-out group-hover:translate-x-0 group-hover:opacity-100">
              
              {label}
            </span>
          </div>);

      })}
    </nav>);

}