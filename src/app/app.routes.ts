import { Routes } from '@angular/router';
import { LandingPageComponent } from './pages/landing-page/landing-page';
import { LoginComponent } from './pages/auth/login/login';
import { RegisterComponent } from './pages/auth/register/register';
import { HomeComponent } from './pages/home/home';
import { MainLayoutComponent } from './layout/main-layout/main-layout';
import { GroupComponent } from './pages/group/group';
import { UserComponent } from './pages/user/user';

export const routes: Routes = [
  { path: '', component: LandingPageComponent },
  { path: 'login', component: LoginComponent },
  { path: 'register', component: RegisterComponent },
  {
    path: '',
    component: MainLayoutComponent,
    children: [
      { path: 'home', component: HomeComponent },
      { path: 'group', component: GroupComponent }, // Nueva ruta
      { path: 'user', component: UserComponent }    // Nueva ruta
    ]
  },
  { path: '**', redirectTo: '' }
];