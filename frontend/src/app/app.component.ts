import { Component } from '@angular/core';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss']
})
export class AppComponent {
  title = 'frontend';

  isInfoClosed = false;

  toogleInfo() {
    this.isInfoClosed = !this.isInfoClosed;
  }

}
