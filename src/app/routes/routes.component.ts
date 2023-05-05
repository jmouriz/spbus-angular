import { Component, AfterViewInit, OnDestroy, Inject } from '@angular/core';
import { MatSnackBar } from '@angular/material/snack-bar';
import { HttpClient } from '@angular/common/http';
import * as L from 'leaflet';
import { LocationService } from 'src/app/services/location';
import { MarkerIcon, MarkerService } from 'src/app/services/marker';
import { RoutesProvider } from 'src/app/providers/routes';
import { DevicesProvider } from 'src/app/providers/devices';
import { Config } from 'src/app/providers/config';

declare var ready: boolean;
declare var cordova: boolean;

enum Providers {
  ROUTES,
  DEVICES,
};

@Component({
  selector: 'app-routes',
  templateUrl: './routes.component.html',
  styleUrls: ['./routes.component.css']
})
export class RoutesComponent implements AfterViewInit, OnDestroy {
  private map: any;
  private layer: any;
  private interval: any;
  private points: any[] = [];
  private touched: boolean = false;
  private _url = `${Config.url}/positions/list.php`;
  private _debug = false;
  private _verbose: boolean = false;
  private _polylines: any[] = [];
  private _providers: any[];
  private _routes: any[] = [];
  private _devices: any[] = [];
  private _checked: boolean[] = [];
  private _marker: any = undefined;
  private _position: any = undefined;
  public user: boolean = false;
  public popup: boolean = false;

  constructor(private http: HttpClient, private toast: MatSnackBar) {
    this._providers = [
      new RoutesProvider(http),
      new DevicesProvider(http),
    ];
  }

  private initMap(): void {
    this.map = L.map('routes', {
      center: LocationService.center,
      zoom: 17,
      zoomControl: false,
      closePopupOnClick: true
    });

    L.control.zoom({
      position: 'bottomright'
    }).addTo(this.map);

    this.map.on('click', (event: any) => {
      if (this._debug) {
        console.info(`[ ${event.latlng.lat}, ${event.latlng.lng} ],`);
        L.marker(event.latlng).addTo(this.layer);
      }
      this.popup = false;
    });

    this.map.on('zoomstart', (event: any) => {
      if (this.touched) {
        this.user = true;
      }
      this.touched = true;
      this.popup = false;
    });

    this.map.on('dragstart', () => {
      if (this.touched) {
        this.user = true;
      }
      this.touched = true;
      this.popup = false;
    });

    const tiles = L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      //attribution: '&copy; <a href="http://www.openstreetmap.org/copyright">OpenStreetMap</a>'
      attribution: ''
    });

    tiles.addTo(this.map);
    this.layer = L.featureGroup().addTo(this.map);

    this.position();

    this._providers[Providers.ROUTES].routes().then((routes: any) => 
      this._routes = routes
    );

    this._providers[Providers.DEVICES].devices().then((devices: any) => 
      this._devices = devices
    );
  }

  ngOnDestroy(): void {
    clearInterval(this.interval);
  }

  ngAfterViewInit(): void {
    this.initMap();
    this.timer();
    setTimeout(() => {
      this.load();
    }, 1500);
    this.interval = setInterval(() => {
      this.timer();
    }, 6000);
  }

  load(): void {
    if (this._routes.length == 0) {
      setTimeout(() => {
        this.load();
      }, 1500);
      return;
    }
    this._routes.forEach((route: any) => {
      const polyline = L.polyline(route.data, { 
        weight: 10,
        opacity: 0.5,
        color: route.color
      });
      if (this._verbose && this._debug) {
        let i = 0;
        route.data.forEach((point: any) => {
          const marker = L.marker(point).addTo(this.layer);
          marker.bindPopup(`<b>${route.name}: ${i++}</b>`);
        });
      } else {
        polyline.bindPopup(`<b>${route.name}</b>`);
      }
      this._polylines.push(polyline);
      this._checked.push(false);
    });
    this.map.fitBounds(this.layer.getBounds());
  }

  position(): void {
    if (cordova) {
      if (ready) {
        this.location();
      }
    } else {
      this.location();
    }
  }

  location(): void {
    navigator.geolocation.getCurrentPosition((position) => {
      const distance = LocationService.distance({
        lat: position.coords.latitude,
        lng: position.coords.longitude,
      }, LocationService.center);
      const test: boolean = (this._debug || distance > 100);
      this._position = test ? LocationService.test : [ position.coords.latitude, position.coords.longitude ];
      if (this._marker == undefined) {
        if (test) {
          const _distance = distance.toFixed(2).replace('.', ',');
          this.toast.open(`Estás a ${_distance}km de la ciudad. Se te asignará una ubicación ficticia.`, 'Entiendo', {
            duration: 5000
          });
        }
        this._marker = MarkerService.marker(this._position, MarkerIcon.USER);
        this._marker.addTo(this.layer);
        this._marker.bindPopup('Estás aquí');
      } else {
        this._marker.setLatLng(this._position);
      }
      if (!this.touched) {
        this.map.flyTo(this._position);
      }
    }, (error) => {
      console.error('User not allowed', error);
    });
  }

  center(): void {
    this.touched = false;
    this.user = false;
    this.map.fitBounds(this.layer.getBounds());
  }

  toggle(): void {
    this.popup = !this.popup;
  }

  check(index: number): void {
    if (this.checked(index)) {
      this._checked[index] = false;
      this.layer.removeLayer(this._polylines[index]);
    } else {
      this._checked[index] = true;
      this.layer.addLayer(this._polylines[index]);
    }
    this.map.fitBounds(this.layer.getBounds());
  }

  checked(index: number): boolean {
    return this._checked[index];
  }

  timer(): void {
    this.http.get(this._url).subscribe(data => {
      (data as []).map((point: any) => {
        const device = point.device;
        const internal = this._devices[device];
        let distance = undefined;
        if (this._position) {
          distance = LocationService.distance({
            lat: point.latitude,
            lng: point.longitude,
          }, this._position);
        }
        if (device in this.points) {
          this.points[device].setLatLng([ point.latitude, point.longitude ]);
        } else {
          this.points[device] = MarkerService.marker([ point.latitude, point.longitude ], MarkerIcon.BUS);
          this.points[device].addTo(this.layer);
        }
        let message;
        if (distance) {
          let _distance;
          let _unit = 'km';
          if (distance < 1) {
            distance *= 1000;
            _unit = 'm';
          }
          _distance = distance.toFixed(2).replace('.', ',');
          message = `Estás a <b>${_distance}${_unit}</b> del interno `;
        }
        if (internal) {
          message += `<b>${internal}</b>`;
        } else {
          message += `<b style="color:red">(dispositivo ${device} no registrado)</b>`;
        }
        this.points[device].bindPopup(message);
        this.position();
      });
      if (!this.touched) {
        this.map.fitBounds(this.layer.getBounds());
      }
    });
  }

  get routes() {
    return this._routes;
  }
}