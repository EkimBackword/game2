// Angular
import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

// App components
import { IndexComponent } from './index.component';

// App services
import { AuthGuard } from '../share-services/auth';

// PageComponents
import { GamePageComponent } from './game-page/game-page.component';
import { HelpPageComponent } from './help-page/help-page.component';
import { MenuPageComponent } from './menu-page/menu-page.component';


export const myRoutes: Routes = [
  {
    path: '',
    component: IndexComponent,
    canActivate: [ AuthGuard ],
    children: [
      { path: 'games', component: MenuPageComponent },
      { path: 'games/:gameId', component: GamePageComponent },
      { path: 'help', component: HelpPageComponent },
      { path: '**', redirectTo: 'games'},
    ]
  }
];

@NgModule({
  imports: [RouterModule.forChild(myRoutes)],
  exports: [RouterModule],
  providers: []
})
export class IndexRoutingModule { }
