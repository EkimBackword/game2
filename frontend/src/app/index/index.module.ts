import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { IndexRoutingModule } from './index-routing.module';

import { IndexComponent } from '../index/index.component';
import { GamePageComponent } from './game-page/game-page.component';
import { HelpPageComponent } from './help-page/help-page.component';
import { MenuPageComponent } from './menu-page/menu-page.component';
import { CreateGameComponent } from './menu-page/components/create-game/create-game.component';
import { FindGameComponent } from './menu-page/components/find-game/find-game.component';
import { MainMenuComponent } from './menu-page/components/main-menu/main-menu.component';
import { ReactiveFormsModule, FormsModule } from '@angular/forms';
import { NgSelectModule } from '@ng-select/ng-select';
import { MatDialogModule } from '@angular/material';
import { TileComponent } from './game-page/components/tile/tile.component';



@NgModule({
  declarations: [
    IndexComponent,
    GamePageComponent,
    HelpPageComponent,
    MenuPageComponent,
    CreateGameComponent,
    FindGameComponent,
    MainMenuComponent,
    TileComponent,
  ],
  imports: [
    CommonModule,
    IndexRoutingModule,
    FormsModule,
    ReactiveFormsModule,
    NgSelectModule,
    MatDialogModule
  ],
  entryComponents: [
  ]
})
export class IndexModule { }
