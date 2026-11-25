import { Routes } from '@angular/router';
import { authGuard, guestGuard, roleGuard } from './core/auth/auth.guards';

export const routes: Routes = [
  {
    path: '',
    pathMatch: 'full',
    title: 'TECNIHUB — Servicios técnicos y refacciones',
    loadComponent: () => import('./features/home/home.component').then((m) => m.HomeComponent),
  },
  {
    path: 'iniciar-sesion',
    title: 'Iniciar sesión — TECNIHUB',
    canActivate: [guestGuard],
    loadComponent: () =>
      import('./features/auth/login/login.component').then((m) => m.LoginComponent),
  },
  {
    path: 'registro',
    title: 'Crear cuenta — TECNIHUB',
    canActivate: [guestGuard],
    loadComponent: () =>
      import('./features/auth/register-role/register-role.component').then(
        (m) => m.RegisterRoleComponent,
      ),
  },
  {
    path: 'registro/cliente',
    title: 'Registro de cliente — TECNIHUB',
    canActivate: [guestGuard],
    loadComponent: () =>
      import('./features/auth/register-client/register-client.component').then(
        (m) => m.RegisterClientComponent,
      ),
  },
  {
    path: 'registro/tecnico',
    title: 'Registro de técnico — TECNIHUB',
    canActivate: [guestGuard],
    loadComponent: () =>
      import('./features/auth/register-technician/register-technician.component').then(
        (m) => m.RegisterTechnicianComponent,
      ),
  },
  {
    path: 'verificar-correo',
    title: 'Verificar correo — TECNIHUB',
    loadComponent: () =>
      import('./features/auth/verify-email/verify-email.component').then(
        (m) => m.VerifyEmailComponent,
      ),
  },
  {
    path: 'recuperar-contrasena',
    title: 'Recuperar contraseña — TECNIHUB',
    canActivate: [guestGuard],
    loadComponent: () =>
      import('./features/auth/forgot-password/forgot-password.component').then(
        (m) => m.ForgotPasswordComponent,
      ),
  },
  {
    path: 'perfil',
    title: 'Mi perfil — TECNIHUB',
    canActivate: [authGuard],
    loadComponent: () =>
      import('./features/profile/profile-view.component').then((m) => m.ProfileViewComponent),
  },
  {
    path: 'perfil/editar',
    title: 'Editar perfil — TECNIHUB',
    canActivate: [authGuard],
    loadComponent: () =>
      import('./features/profile/profile-edit.component').then((m) => m.ProfileEditComponent),
  },
  {
    path: 'mensajes',
    title: 'Mensajes — TECNIHUB',
    canActivate: [authGuard],
    loadComponent: () =>
      import('./features/chat/chat-inbox.component').then((m) => m.ChatInboxComponent),
  },
  {
    path: 'mensajes/:id',
    title: 'Conversación — TECNIHUB',
    canActivate: [authGuard],
    loadComponent: () =>
      import('./features/chat/chat-inbox.component').then((m) => m.ChatInboxComponent),
  },
  {
    path: 'cliente',
    title: 'Mis solicitudes — TECNIHUB',
    canActivate: [roleGuard('Client')],
    loadComponent: () =>
      import('./features/client/client-dashboard.component').then(
        (m) => m.ClientDashboardComponent,
      ),
  },
  {
    path: 'cliente/nueva-solicitud',
    title: 'Publicar reparación — TECNIHUB',
    canActivate: [roleGuard('Client')],
    loadComponent: () =>
      import('./features/client/repair-create.component').then((m) => m.RepairCreateComponent),
  },
  {
    path: 'cliente/solicitudes/:id',
    title: 'Detalle de solicitud — TECNIHUB',
    canActivate: [roleGuard('Client')],
    loadComponent: () =>
      import('./features/client/client-repair-detail.component').then(
        (m) => m.ClientRepairDetailComponent,
      ),
  },
  {
    path: 'tecnico',
    title: 'Tablón de servicios — TECNIHUB',
    canActivate: [roleGuard('Technician')],
    loadComponent: () =>
      import('./features/technician/technician-dashboard.component').then(
        (m) => m.TechnicianDashboardComponent,
      ),
  },
  {
    path: 'tecnico/servicios/:id',
    title: 'Detalle de servicio — TECNIHUB',
    canActivate: [roleGuard('Technician')],
    loadComponent: () =>
      import('./features/technician/technician-repair-detail.component').then(
        (m) => m.TechnicianRepairDetailComponent,
      ),
  },
  {
    path: 'tecnico/itinerario',
    title: 'Mi itinerario — TECNIHUB',
    canActivate: [roleGuard('Technician')],
    loadComponent: () =>
      import('./features/technician/technician-itinerary.component').then(
        (m) => m.TechnicianItineraryComponent,
      ),
  },
  {
    path: 'tecnico/refacciones',
    title: 'Refacciones — TECNIHUB',
    canActivate: [roleGuard('Technician')],
    loadComponent: () =>
      import('./features/technician/spare-parts-board.component').then(
        (m) => m.SparePartsBoardComponent,
      ),
  },
  {
    path: 'tecnico/refacciones/nueva',
    title: 'Publicar refacción — TECNIHUB',
    canActivate: [roleGuard('Technician')],
    loadComponent: () =>
      import('./features/technician/spare-part-form.component').then(
        (m) => m.SparePartFormComponent,
      ),
  },
  {
    path: 'tecnico/refacciones/:id/editar',
    title: 'Editar refacción — TECNIHUB',
    canActivate: [roleGuard('Technician')],
    loadComponent: () =>
      import('./features/technician/spare-part-form.component').then(
        (m) => m.SparePartFormComponent,
      ),
  },
  {
    path: 'tecnico/refacciones/:id',
    title: 'Detalle de refacción — TECNIHUB',
    canActivate: [roleGuard('Technician')],
    loadComponent: () =>
      import('./features/technician/spare-part-detail.component').then(
        (m) => m.SparePartDetailComponent,
      ),
  },
  { path: '**', redirectTo: '' },
];
