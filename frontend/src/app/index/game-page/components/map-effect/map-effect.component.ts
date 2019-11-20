import { Component, Input, OnInit } from '@angular/core';
import { IEffect, IPeriodEffects } from '../../../../share-services';

@Component({
  selector: 'app-map-effect',
  templateUrl: './map-effect.component.html',
  styleUrls: ['./map-effect.component.scss']
})
export class MapEffectComponent implements OnInit {

  @Input() effect: IEffect;
  @Input() deckPeriodEffects: IPeriodEffects[];
  @Input() deckOldEffects: IPeriodEffects[];
  @Input() currentPeriodEffects: IPeriodEffects;

  public typeRus = {
    Archer: 'Лучники',
    Swordsman: 'Мечники',
    Rider: 'Всадники',
  };

  ngOnInit() {
  }

}
