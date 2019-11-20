import { Component, OnInit } from '@angular/core';
import { PushService } from '../share-services/push.service';

@Component({
  selector: 'app-index',
  templateUrl: './index.component.html',
  styleUrls: ['./index.component.scss']
})
export class IndexComponent implements OnInit {

  constructor(
    private pushApi: PushService,
  ) { }

  ngOnInit() {
    this.pushApi.subscribeToNotifications();
  }

}
