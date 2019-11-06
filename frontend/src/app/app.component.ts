import { Component, OnInit } from '@angular/core';
import { CheckForUpdateService } from './share-services/check-for-update.service';
import { PromptUpdateService } from './share-services/prompt-update.service';
import { LogUpdateService } from './share-services/log-update.service';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss']
})
export class AppComponent implements OnInit {
  title = 'frontend';

  isInfoClosed = false;

  toogleInfo() {
    this.isInfoClosed = !this.isInfoClosed;
  }

  constructor(
    private promptUpdate: PromptUpdateService,
    private checkForUpdate: CheckForUpdateService,
    private logUpdate: LogUpdateService,
  ) {}

  ngOnInit() {
    this.promptUpdate.checkForUpdate();
  }

}
