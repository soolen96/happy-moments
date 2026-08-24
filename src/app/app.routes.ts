import { Routes } from '@angular/router';
import { Homepage } from './components/homepage/homepage';
import { AdminComponent } from './components/admin/admin';
import { authGuard } from './guards/auth.guard';

export const routes: Routes = [
  { path: '', component: Homepage },
  { path: 'admin', component: AdminComponent, canActivate: [authGuard] },
  { path: '**', redirectTo: '' }
];

