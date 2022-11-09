import { Component, AfterViewInit, OnDestroy } from '@angular/core';
import { MatSnackBar } from '@angular/material/snack-bar';
import { HttpClient } from '@angular/common/http';
import * as L from 'leaflet';
import { LocationService } from 'src/app/services/location';
import { MarkerIcon, MarkerService } from 'src/app/services/marker';

@Component({
  selector: 'app-routes',
  templateUrl: './routes.component.html',
  styleUrls: ['./routes.component.css']
})
export class RoutesComponent implements AfterViewInit, OnDestroy {
  private map: any;
  private layer: any;
  private interval: any;
  private _routes: any;
  private _polylines: any[] = [];
  private _selected = 0;
  private _debug: boolean = false;
  private _verbose: boolean = false;
  private _url = 'https://tecnologica.ar';
  private touched: boolean = false;
  private _marker: any = undefined;
  public user: boolean = false;
  public popup: boolean = false;

  constructor(private http: HttpClient, private toast: MatSnackBar) {}

  private initMap(): void {
    this.map = L.map('routes', {
      center: LocationService.center,
      zoom: 17,
      zoomControl: false
    });

    L.control.zoom({
      position: 'bottomright'
    }).addTo(this.map);

    this.map.on('click', (event: any) => {
      if (this._debug) {
        console.log(`[ ${event.latlng.lat}, ${event.latlng.lng} ],`);
        L.marker(event.latlng).addTo(this.layer);
      }
      this.popup = false;
    });

    this.map.on('zoomstart', (event: any) => {
      if (this.touched) {
        this.user = true;
      }
      this.touched = true;
    });

    this.map.on('dragstart', () => {
      if (this.touched) {
        this.user = true;
      }
      this.touched = true;
    });

    const tiles = L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      attribution: '&copy; <a href="http://www.openstreetmap.org/copyright">OpenStreetMap</a>'
    });

    tiles.addTo(this.map);
    this.layer = L.featureGroup().addTo(this.map);

    //this.position();
  }

  ngOnDestroy(): void {
    clearInterval(this.interval);
  }

  ngAfterViewInit(): void {
    this.initMap();

    this.position();
    this.interval = setInterval(() => {
      this.position();
    }, 6000);

    this.http.get(`${this._url}/version.php`).subscribe(version => {
      const _version = localStorage.getItem('routes-version') ?? 0;
      if (_version < version) {
        this.http.get(`${this._url}/routes.php`).subscribe(routes => {
          localStorage.setItem('routes', JSON.stringify(routes));
          localStorage.setItem('routes-version', version as any);
          this._routes = routes;
          this.load();
        });
      } else {
        this._routes = JSON.parse(localStorage.getItem('routes') ?? '');
        this.load();
      }
    });
  }

  load(): void {
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
    });
    this.layer.addLayer(this._polylines[this._selected]);
    this.map.fitBounds(this.layer.getBounds());
  }

  position(): void {
    if (typeof (window as any)['ready'] === 'undefined') {
      return;
    }
    navigator.geolocation.getCurrentPosition((position) => {
      const point = position.coords;
      const distance = LocationService.distance({
        lat: point.latitude,
        lng: point.longitude,
      }, LocationService.center);
      const test: boolean = (this._debug || distance > 100);
      const coordinates = test ? LocationService.test : [ point.latitude, point.longitude ];
      if (this._marker == undefined) {
        if (test) {
          const _distance = distance.toFixed(2).replace('.', ',');
          this.toast.open(`Estás a ${_distance}km de la ciudad. Se te asignará una ubicación ficticia.`, 'Entiendo', {
            duration: 5000
          });
        }
        this._marker = MarkerService.marker(coordinates, MarkerIcon.USER);
        this._marker.addTo(this.layer);
        this._marker.bindPopup('Estás aquí');
      } else {
        this._marker.setLatLng(coordinates);
      }
      //this.map.fitBounds(this.layer.getBounds());
    }, (error) => {
      console.log('User not allowed', error);
    });
  }

  center(): void {
    console.log('center');
    this.touched = false;
    this.user = false;
    this.map.fitBounds(this.layer.getBounds());
  }

  toggle(): void {
    this.popup = !this.popup;
  }

  select(index: number): void {
    this.layer.removeLayer(this._polylines[this._selected]);
    this.layer.addLayer(this._polylines[index]);
    this.map.fitBounds(this.layer.getBounds());
    this._selected = index;
    this.popup = false;
  }

  get routes() {
    return this._routes;
  }

  get selected() {
    return this._selected;
  }
}
