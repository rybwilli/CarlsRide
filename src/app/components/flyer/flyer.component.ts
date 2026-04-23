import { Component } from '@angular/core';
import { AppEvent, EventService } from '../../services/event.service';
import { Observable } from 'rxjs';

@Component({
  selector: 'app-flyer',
  templateUrl: './flyer.component.html',
  styleUrls: ['./flyer.component.scss'],
})
export class FlyerComponent {
  event$: Observable<AppEvent>;

  constructor(eventService: EventService) {
    this.event$ = eventService.event$;
  }

  print(): void {
    window.print();
  }
}
