import { Component, AfterViewInit, OnDestroy } from '@angular/core';
import { MatSnackBar } from '@angular/material/snack-bar';
import { HttpClient } from '@angular/common/http';
import * as L from 'leaflet';
import { LocationService } from 'src/app/services/location';
import { MarkerIcon, MarkerService } from 'src/app/services/marker';
import { RoutesProvider } from 'src/app/providers/routes';

@Component({
  selector: 'app-routes',
  templateUrl: './routes.component.html',
  styleUrls: ['./routes.component.css']
})
export class RoutesComponent implements AfterViewInit, OnDestroy {
  private map: any;
  private layer: any;
  private interval: any;
  private _url = 'https://tecnologica.com.ar/position.php';
  private _debug = false;
  private _verbose: boolean = false;
  private _polylines: any[] = [];
  private _provider: RoutesProvider;
  private _routes: any[] = []; //
  private _checked: boolean[] = [];
  private points: any[] = [];
  private touched: boolean = false;
  private _marker: any = undefined;
  public user: boolean = false;
  public popup: boolean = false;

  constructor(private http: HttpClient, private toast: MatSnackBar) {
    this._provider = new RoutesProvider(http);
  }

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
      attribution: '&copy; <a href="http://www.openstreetmap.org/copyright">OpenStreetMap</a>'
    });

    tiles.addTo(this.map);
    this.layer = L.featureGroup().addTo(this.map);

    this.position();

    this._provider.routes().then((routes: any) => {
      this._routes = routes;
    });
  }

  ngOnDestroy(): void {
    clearInterval(this.interval);
  }

  ngAfterViewInit(): void {
    this.initMap();
    this.timer();
    this.interval = setTimeout(() => {
      this.load();
    }, 1500);
    this.interval = setInterval(() => {
      this.timer();
    }, 6000);
    this._provider.routes().then((routes: any) => {
      this._routes = routes;
      this.load();
    });
  }

  /*
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
      this.layer.addLayer(polyline);
    });
    //this.map.fitBounds(this.layer.getBounds());
  }
  */

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
    this.map.fitBounds(this.layer.getBounds());
  }

  position(): void {
    //if (typeof (window as any)['ready'] === 'undefined') {
    //  return;
    //}
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
      if (!this.touched) {
        this.map.flyTo(coordinates);
      }
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

  check(index: number): void {
    if (this._checked[index]) {
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

  get routes() {
    return this._routes;
  }
}