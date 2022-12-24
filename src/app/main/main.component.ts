import { Component, OnInit } from '@angular/core';

declare let device: any;

@Component({
  selector: 'app-main',
  templateUrl: './main.component.html',
  styleUrls: ['./main.component.css']
})
export class MainComponent /* implements OnInit */ {
  opened: boolean = false;
  //bus: boolean = false;
  sube: boolean = false;
  simulated: boolean = false;

  //constructor() {}

  constructor() {
    let that = this;
  	document.addEventListener('deviceready', function() {
      that.simulated = device.isVirtual;
    }, false);
  }

  /*
  ngOnInit(): void {
    let that = this;
  	document.addEventListener('deviceready', function() {
      that.simulated = device.isVirtual;
    }, false);
  }
  */

  toggle(opened: boolean): void {
    this.opened = opened;
  }

  //toggleBus(): void {
  //  this.bus = !this.bus;
  //}

  toggleSube(): void {
    this.sube = !this.sube;
  }
}