import { Component, Input } from '@angular/core';
import { IUnit, IEffect } from '../../../../share-services';

@Component({
  selector: 'app-game-unit',
  templateUrl: './game-unit.component.html',
  styleUrls: ['./game-unit.component.scss']
})
export class GameUnitComponent {

  @Input() unit: IUnit;
  @Input() userColor: string;
  @Input() effect: IEffect;

  public GameUnitType = {
    Archer: 'Лучник',
    Swordsman: 'Мечник',
    Rider: 'Всадник',
  };

}
