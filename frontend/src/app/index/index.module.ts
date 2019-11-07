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
import { DragDropModule } from '@angular/cdk/drag-drop';
import { TileComponent } from './game-page/components/tile/tile.component';
import { UserInfoComponent } from './game-page/components/user-info/user-info.component';
import { GameUnitComponent } from './game-page/components/game-unit/game-unit.component';
import { DialogCaptureComponent } from './game-page/components/dialog-capture/dialog-capture.component';
import { DialogAttackCastleComponent } from './game-page/components/dialog-attack-castle/dialog-attack-castle.component';
import { BattlefieldComponent } from './game-page/components/battlefield/battlefield.component';
import { DialogAttackUserComponent } from './game-page/components/dialog-attack-user/dialog-attack-user.component';
import { DialogDefenseComponent } from './game-page/components/dialog-defense/dialog-defense.component';
import { MapEffectComponent } from './game-page/components/map-effect/map-effect.component';
import { DialogCastleUnitsChangeComponent } from './game-page/components/dialog-castle-units-change/dialog-castle-units-change.component';
import { DialogBattleResultComponent } from './game-page/components/dialog-battle-result/dialog-battle-result.component';
import { OfflineGamePageComponent } from './offline-game-page/offline-game-page.component';



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
    UserInfoComponent,
    GameUnitComponent,
    DialogCaptureComponent,
    DialogAttackCastleComponent,
    BattlefieldComponent,
    DialogAttackUserComponent,
    DialogDefenseComponent,
    MapEffectComponent,
    DialogCastleUnitsChangeComponent,
    DialogBattleResultComponent,
    OfflineGamePageComponent,
  ],
  imports: [
    CommonModule,
    IndexRoutingModule,
    FormsModule,
    ReactiveFormsModule,
    NgSelectModule,
    MatDialogModule,
    DragDropModule
  ],
  entryComponents: [
    DialogCaptureComponent,
    DialogAttackCastleComponent,
    DialogAttackUserComponent,
    DialogDefenseComponent,
    DialogCastleUnitsChangeComponent,
    DialogBattleResultComponent
  ]
})
export class IndexModule { }
