import { Routes } from '@angular/router';
import { HomeComponent } from './pages/home/home.component';
import { AlbumDetailComponent } from './pages/album-detail/album-detail.component';

export const routes: Routes = [
  {
    path: '',
    component: HomeComponent
  },
  {
    path: 'album/:id',
    component: AlbumDetailComponent
  },
  {
    path: 'portfolio/:id',
    component: AlbumDetailComponent
  },
  {
    path: 'admin',
    component: HomeComponent
  },
  {
    path: 'login',
    component: HomeComponent
  },
  {
    path: '**',
    redirectTo: ''
  }
];
