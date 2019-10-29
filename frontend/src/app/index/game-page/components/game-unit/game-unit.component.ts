import { Component, Input } from '@angular/core';
import { IUnit } from '../../../../share-services/models/game-unit.model';

@Component({
  selector: 'app-game-unit',
  templateUrl: './game-unit.component.html',
  styleUrls: ['./game-unit.component.scss']
})
export class GameUnitComponent {

  @Input() unit: IUnit;
  @Input() userColor: string;

  public GameUnitType = {
    Archer: 'Лучник',
    Swordsman: 'Мечник',
    Rider: 'Всадник',
  };

}
