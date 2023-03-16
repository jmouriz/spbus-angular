import { HttpClient } from '@angular/common/http';
import { Config } from 'src/app/providers/config';

export class RoutesProvider {
    private _url = `${Config.url}/routes`;

    constructor(private http: HttpClient) {}

    routes(): Promise<any> {
        return new Promise((resolve, reject) => {
            this.http.get(`${this._url}/version.php`).subscribe(version => {
                const _version = localStorage.getItem('routes-version') ?? 0;
                if (_version < version) {
                    this.http.get(`${this._url}/list.php`).subscribe(routes => {
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