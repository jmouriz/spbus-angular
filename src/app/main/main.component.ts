import { Component } from '@angular/core';

@Component({
  selector: 'app-main',
  templateUrl: './main.component.html',
  styleUrls: ['./main.component.css']
})
export class MainComponent {
  opened: boolean = false;
  bus: boolean = false;
  sube: boolean = false;

  constructor() {}

  toggle(opened: boolean): void {
    this.opened = opened;
  }

  toggleBus(): void {
    this.bus = !this.bus;
  }

  toggleSube(): void {
    this.sube = !this.sube;
  }
}