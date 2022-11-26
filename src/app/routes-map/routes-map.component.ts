import { Component, AfterViewInit, OnDestroy } from '@angular/core';
import { MatSnackBar } from '@angular/material/snack-bar';
import { HttpClient } from '@angular/common/http';
import * as L from 'leaflet';
import { LocationService } from 'src/app/services/location';
import { MarkerIcon, MarkerService } from 'src/app/services/marker';
import { LocalizedString } from '@angular/compiler';

@Component({
  selector: 'app-routes-map',
  templateUrl: './routes-map.component.html',
  styleUrls: ['./routes-map.component.css']
})
export class RoutesMapComponent implements AfterViewInit, OnDestroy {
  private map: any;
  private layer: any;
  private interval: any;
  private _url = 'https://tecnologica.com.ar/position.php';
  private _debug = false;
  private points: any[] = [];
  private touched: boolean = false;
  private _marker: any = undefined;
  public user: boolean = false;

  constructor(private http: HttpClient, private toast: MatSnackBar) {}

  private initMap(): void {
    this.map = L.map('routes-map', {
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

    this.position();
  }

  ngOnDestroy(): void {
    clearInterval(this.interval);
  }

  ngAfterViewInit(): void {
    this.initMap();
    this.timer();
    this.interval = setInterval(() => {
      this.timer();
    }, 6000);
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

  timer(): void {
    this.http.get(this._url).subscribe(data => {
      (data as []).map((point: any) => {
        const device = point.device;
        if (device in this.points) {
          this.points[device].setLatLng([ point.latitude, point.longitude ]);
        } else {
          this.points[device] = MarkerService.marker([ point.latitude, point.longitude ], MarkerIcon.BUS);
          this.points[device].bindPopup(`Dispositivo <b>${device}</b>`);
          this.points[device].addTo(this.layer);
        }
        this.position();
      });
      if (!this.touched) {
        console.log('auto-center');
        this.map.fitBounds(this.layer.getBounds());
      }
    });
  }
}