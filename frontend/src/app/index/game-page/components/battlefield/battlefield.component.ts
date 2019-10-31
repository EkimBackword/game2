import { Component, Input } from '@angular/core';
import { IUnit } from '../../../../share-services';
import { CdkDragDrop, moveItemInArray, transferArrayItem, CdkDrag, CdkDropList } from '@angular/cdk/drag-drop';

@Component({
  selector: 'app-battlefield',
  templateUrl: './battlefield.component.html',
  styleUrls: ['./battlefield.component.scss']
})
export class BattlefieldComponent {
  @Input() units: IUnit[];
  @Input() army: IUnit[];
  @Input() color: string;
  @Input() isUser: boolean;

  drop(event: CdkDragDrop<string[]>) {
    if (event.previousContainer === event.container) {
      moveItemInArray(event.container.data, event.previousIndex, event.currentIndex);
    } else {
      transferArrayItem(event.previousContainer.data,
                        event.container.data,
                        event.previousIndex,
                        event.currentIndex);
    }
  }


  checkUnits(drag?: CdkDrag, drop?: CdkDropList) {
    return drop.data.length < 6;
  }
}
