import { HttpClient } from '@angular/common/http';

export class DevicesProvider {
    private _url = 'https://tecnologica.com.ar';

    constructor(private http: HttpClient) {}

    devices(): Promise<any> {
        return new Promise((resolve, reject) => {
            this.http.get(`${this._url}/devices-version.php`).subscribe(version => {
                const _version = localStorage.getItem('devices-version') ?? 0;
                if (_version < version) {
                    this.http.get(`${this._url}/devices.php`).subscribe(routes => {
                        localStorage.setItem('devices', JSON.stringify(routes));
                        localStorage.setItem('devices-version', version as any);
                        resolve(routes);
                    });
                } else {
                    resolve(JSON.parse(localStorage.getItem('devices') ?? ''));
                }
            });
        });
    }
}