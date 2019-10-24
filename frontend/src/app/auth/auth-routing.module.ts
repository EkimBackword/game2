// Angular
import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

// App components
import { AuthComponent } from './auth.component';

// App services
import { NoAuthGuard } from '../share-services/auth';

// PageComponents
import { SignInPageComponent } from './sign-in-page/sign-in-page.component';

export const myRoutes: Routes = [
  {
    path: '',
    component: AuthComponent,
    canActivate: [ NoAuthGuard ],
    children: [
      { path: 'sign-in', component: SignInPageComponent },
      { path: '**', redirectTo: 'sign-in'},
    ]
  }
];

@NgModule({
  imports: [RouterModule.forChild(myRoutes)],
  exports: [RouterModule],
  providers: []
})
export class AuthRoutingModule { }
