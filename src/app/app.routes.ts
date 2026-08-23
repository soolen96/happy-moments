import { Routes } from '@angular/router';
import { Homepage } from './components/homepage/homepage';
import { AdminComponent } from './components/admin/admin';

export const routes: Routes = [
  { path: '', component: Homepage },
  { path: 'admin', component: AdminComponent },
  { path: '**', redirectTo: '' }
];

