import { Injectable } from '@angular/core';
import { SwUpdate, UpdateAvailableEvent } from '@angular/service-worker';

@Injectable({
  providedIn: 'root'
})
export class PromptUpdateService {

  constructor(private updates: SwUpdate) { }

  checkForUpdate() {
    console.log('checkForUpdate');
    if (this.updates.isEnabled) {
      console.log('isEnabled');
      this.updates.available.subscribe(event => {
        if (this.promptUser(event)) {
          this.updates.activateUpdate().then(() => document.location.reload());
        }
      });
    } else {
      console.log('Not isEnabled');
    }
  }

  private promptUser(event: UpdateAvailableEvent): boolean {
    return confirm(`Ваша версия ${event.current.hash}, новая версия ${event.available.hash}. Обновить?`);
  }

}
