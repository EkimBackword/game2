import { Component, OnInit } from '@angular/core';
import { PromptUpdateService } from './share-services/prompt-update.service';

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
  ) {}

  ngOnInit() {
    this.promptUpdate.checkForUpdate();
    this.promptUpdate.pollingCheck();
  }

}
