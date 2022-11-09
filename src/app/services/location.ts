export class LocationService {
    private static _center: number[] = [ -26.780583978500232, -60.444966586795495 ];
    private static _test: number[] = [ -26.781092846086914, -60.4354476928711 ];

    private static _point(point: number[]): any {
        return {
            lat: point[0],
            lng: point[1],
        };
    }

    private static _degress2radians(degress: number): number {
        return degress * (Math.PI / 180);
    }
    
    static distance(from: any, to: any): number {
        var radius = 6371; // radius of the earth in km
        var dLat = this._degress2radians(to.lat - from.lat);
        var dLon = this._degress2radians(to.lng - from.lng); 
        var a = // angle 
            Math.sin(dLat / 2) * Math.sin(dLat / 2) +
            Math.cos(this._degress2radians(from.lat)) *
            Math.cos(this._degress2radians(to.lat)) * 
            Math.sin(dLon / 2) * Math.sin(dLon / 2); 
        var c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a)); 
        var distance = radius * c; // distance in km
        return distance;
    }

    static get center(): any {
        return this._point(this._center);
    }

    static get test(): any {
        return this._point(this._test);
    }
}