import { Routes } from '@angular/router';
import { authGuard } from './core/auth/auth.guard';
import { roleGuard } from './core/auth/role.guard';

export const routes: Routes = [
  {
    path: 'login',
    loadComponent: () =>
      import('./features/auth/login/login.component').then((m) => m.LoginComponent),
  },
  {
    path: '',
    canActivate: [authGuard],
    loadComponent: () => import('./layout/app-shell.component').then((m) => m.AppShellComponent),
    children: [
      {
        path: '',
        pathMatch: 'full',
        loadComponent: () =>
          import('./layout/default-redirect.component').then((m) => m.DefaultRedirectComponent),
      },
      {
        path: 'dashboard',
        canActivate: [roleGuard(['owner', 'manager'])],
        loadComponent: () =>
          import('./features/dashboard/dashboard-page.component').then((m) => m.DashboardPageComponent),
      },
      {
        path: 'accountant-desk',
        canActivate: [roleGuard(['accountant'])],
        loadComponent: () =>
          import('./features/accountant-desk/accountant-desk-page.component').then(
            (m) => m.AccountantDeskPageComponent,
          ),
      },
      {
        path: 'my-desk',
        canActivate: [roleGuard(['barber'])],
        loadComponent: () =>
          import('./features/my-desk/my-desk-page.component').then((m) => m.MyDeskPageComponent),
      },
      {
        path: 'staff',
        canActivate: [roleGuard(['owner'])],
        loadComponent: () => import('./features/staff/staff-page.component').then((m) => m.StaffPageComponent),
      },
      {
        path: 'branches',
        canActivate: [roleGuard(['owner'])],
        loadComponent: () =>
          import('./features/branches/branches-page.component').then((m) => m.BranchesPageComponent),
      },
      {
        path: 'barbers',
        canActivate: [roleGuard(['owner', 'manager'])],
        loadComponent: () =>
          import('./features/barbers/barbers-page.component').then((m) => m.BarbersPageComponent),
      },
      {
        path: 'services',
        canActivate: [roleGuard(['owner'])],
        loadComponent: () =>
          import('./features/services/services-page.component').then((m) => m.ServicesPageComponent),
      },
      {
        path: 'customers',
        canActivate: [roleGuard(['owner'])],
        loadComponent: () =>
          import('./features/customers/customers-page.component').then((m) => m.CustomersPageComponent),
      },
      {
        path: 'transactions',
        loadComponent: () =>
          import('./features/transactions/transactions-page.component').then(
            (m) => m.TransactionsPageComponent,
          ),
      },
      {
        path: 'operations',
        canActivate: [roleGuard(['owner', 'manager', 'accountant'])],
        loadComponent: () =>
          import('./features/operations/operations-page.component').then((m) => m.OperationsPageComponent),
      },
      {
        path: 'settings',
        loadComponent: () =>
          import('./features/settings/settings-page.component').then((m) => m.SettingsPageComponent),
      },
    ],
  },
  { path: '**', redirectTo: '' },
];
