import { Routes } from '@angular/router';
import { authGuard, groupGuard, permissionGuard } from './guards/auth.guard';

export const routes: Routes = [
  { path: '', redirectTo: 'login', pathMatch: 'full' },
  {
    path: 'login',
    loadComponent: () => import('./pages/auth/login/login').then(m => m.LoginComponent)
  },
  {
    path: 'register',
    loadComponent: () => import('./pages/auth/register/register').then(m => m.RegisterComponent)
  },
  {
    path: 'groups',
    canActivate: [authGuard],
    loadComponent: () => import('./pages/groups/groups').then(m => m.GroupsComponent)
  },
  {
    path: '',
    loadComponent: () => import('./layout/main-layout/main-layout').then(m => m.MainLayoutComponent),
    canActivate: [authGuard],
    children: [
      {
        path: 'dashboard',
        canActivate: [groupGuard],
        loadComponent: () => import('./pages/dashboard/dashboard').then(m => m.DashboardComponent),
        children: [
          {
            path: '', // Lista por defecto
            loadComponent: () => import('./pages/ticket-list/ticket-list').then(m => m.TicketListComponent)
          },
          {
            path: 'kanban',
            canActivate: [permissionGuard], // ✅ Protección de ruta añadida
            data: { permission: 'ticket:view' },
            loadComponent: () => import('./pages/kanban/kanban').then(m => m.KanbanComponent)
          }
        ]
      },
      {
        path: 'tickets/new',
        canActivate: [groupGuard, permissionGuard],
        loadComponent: () => import('./pages/ticket-create/ticket-create').then(m => m.TicketCreateComponent),
        data: { permission: 'ticket:add' }
      },
      {
        path: 'tickets/:id',
        canActivate: [groupGuard, permissionGuard],
        loadComponent: () => import('./pages/ticket-detail/ticket-detail').then(m => m.TicketDetailComponent),
        data: { permission: 'ticket:view' }
      },
      {
        path: 'profile',
        loadComponent: () => import('./pages/user-profile/user-profile').then(m => m.UserProfileComponent)
      },
      {
        path: 'group-management',
        canActivate: [groupGuard, permissionGuard],
        loadComponent: () => import('./pages/group-management/group-management').then(m => m.GroupManagementComponent),
        data: { permission: 'group:add' }
      },
      {
        path: 'user-management',
        canActivate: [groupGuard, permissionGuard],
        loadComponent: () => import('./pages/user-management/user-management').then(m => m.UserManagementComponent),
        data: { permission: 'superAdmin' }
      },
      { path: '', redirectTo: 'dashboard', pathMatch: 'full' }
    ]
  },
  { path: '**', redirectTo: 'login' }
];