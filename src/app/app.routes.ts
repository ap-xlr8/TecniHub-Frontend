import { Routes } from '@angular/router';
import { guestGuard, roleGuard } from './core/auth/auth.guards';
import { ForgotPasswordComponent } from './features/auth/forgot-password/forgot-password.component';
import { LoginComponent } from './features/auth/login/login.component';
import { RegisterClientComponent } from './features/auth/register-client/register-client.component';
import { RegisterRoleComponent } from './features/auth/register-role/register-role.component';
import { RegisterTechnicianComponent } from './features/auth/register-technician/register-technician.component';
import { VerifyEmailComponent } from './features/auth/verify-email/verify-email.component';
import { ClientDashboardComponent } from './features/client/client-dashboard.component';
import { HomeComponent } from './features/home/home.component';
import { TechnicianDashboardComponent } from './features/technician/technician-dashboard.component';

export const routes: Routes = [
  {
    path: '',
    pathMatch: 'full',
    title: 'TECNIHUB — Servicios técnicos y refacciones',
    component: HomeComponent,
  },
  {
    path: 'iniciar-sesion',
    title: 'Iniciar sesión — TECNIHUB',
    canActivate: [guestGuard],
    component: LoginComponent,
  },
  {
    path: 'registro',
    title: 'Crear cuenta — TECNIHUB',
    canActivate: [guestGuard],
    component: RegisterRoleComponent,
  },
  {
    path: 'registro/cliente',
    title: 'Registro de cliente — TECNIHUB',
    canActivate: [guestGuard],
    component: RegisterClientComponent,
  },
  {
    path: 'registro/tecnico',
    title: 'Registro de técnico — TECNIHUB',
    canActivate: [guestGuard],
    component: RegisterTechnicianComponent,
  },
  {
    path: 'verificar-correo',
    title: 'Verificar correo — TECNIHUB',
    component: VerifyEmailComponent,
  },
  {
    path: 'recuperar-contrasena',
    title: 'Recuperar contraseña — TECNIHUB',
    canActivate: [guestGuard],
    component: ForgotPasswordComponent,
  },
  {
    path: 'cliente',
    title: 'Panel de cliente — TECNIHUB',
    canActivate: [roleGuard('Client')],
    component: ClientDashboardComponent,
  },
  {
    path: 'tecnico',
    title: 'Panel de técnico — TECNIHUB',
    canActivate: [roleGuard('Technician')],
    component: TechnicianDashboardComponent,
  },
  { path: '**', redirectTo: '' },
];
