import { HttpClient } from '@angular/common/http';

export class RoutesProvider {
    private _url = 'https://tecnologica.com.ar';

    constructor(private http: HttpClient) {}

    routes(): Promise<any> {
        return new Promise((resolve, reject) => {
            this.http.get(`${this._url}/version.php`).subscribe(version => {
                const _version = localStorage.getItem('routes-version') ?? 0;
                if (_version < version) {
                    this.http.get(`${this._url}/routes.php`).subscribe(routes => {
                        localStorage.setItem('routes', JSON.stringify(routes));
                        localStorage.setItem('routes-version', version as any);
                        resolve(routes);
                    });
                } else {
                    resolve(JSON.parse(localStorage.getItem('routes') ?? ''));
                }
            });
        });
    }
}