import { Injectable } from '@angular/core';
import { SwUpdate } from '@angular/service-worker';

@Injectable({
  providedIn: 'root'
})
export class PromptUpdateService {

  constructor(updates: SwUpdate) {
    updates.available.subscribe(event => {
      if (this.promptUser(event)) {
        updates.activateUpdate().then(() => document.location.reload());
      }
    });
  }

  private promptUser(event): boolean {
    return confirm(`Ваша версия ${event.previous}, новая версия ${event.current}. Обновить?`);
  }
}
