import * as L from 'leaflet';

export enum MarkerIcon {
    USER,
    BUS
}

export class MarkerService {
    //const _icon = '<svg viewBox="0 0 24 24" width="36" height="36"><path d="M19 2H5c-1.11 0-2 .9-2 2v14c0 1.1.89 2 2 2h4l3 3 3-3h4c1.1 0 2-.9 2-2V4c0-1.1-.9-2-2-2zm-7 3.3c1.49 0 2.7 1.21 2.7 2.7 0 1.49-1.21 2.7-2.7 2.7-1.49 0-2.7-1.21-2.7-2.7 0-1.49 1.21-2.7 2.7-2.7zM18 16H6v-.9c0-2 4-3.1 6-3.1s6 1.1 6 3.1v.9z" fill="red"></path></svg>';
    //const _icon = '<svg viewBox="0 0 24 24" width="24" height="24"><path d="M12 2C8.14 2 5 5.14 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.86-3.14-7-7-7zm0 2c1.1 0 2 .9 2 2 0 1.11-.9 2-2 2s-2-.89-2-2c0-1.1.9-2 2-2zm0 10c-1.67 0-3.14-.85-4-2.15.02-1.32 2.67-2.05 4-2.05s3.98.73 4 2.05c-.86 1.3-2.33 2.15-4 2.15z"></path></svg>';
    //const _icon = '<svg viewBox="0 0 24 24" width="24" height="24"><path d="M19 2H5c-1.11 0-2 .9-2 2v14c0 1.1.89 2 2 2h4l3 3 3-3h4c1.1 0 2-.9 2-2V4c0-1.1-.9-2-2-2zm-7 3.3c1.49 0 2.7 1.21 2.7 2.7 0 1.49-1.21 2.7-2.7 2.7-1.49 0-2.7-1.21-2.7-2.7 0-1.49 1.21-2.7 2.7-2.7zM18 16H6v-.9c0-2 4-3.1 6-3.1s6 1.1 6 3.1v.9z"></path></svg>';
    private static _user = '<svg width="36" height="36" viewBox="0 0 24 24"><rect x="7.784874" y="3.9030704" width="8.2689085" height="10.214577" fill="white"/><path d="M12 2C8.14 2 5 5.14 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.86-3.14-7-7-7zm0 2c1.1 0 2 .9 2 2 0 1.11-.9 2-2 2s-2-.89-2-2c0-1.1.9-2 2-2zm0 10c-1.67 0-3.14-.85-4-2.15.02-1.32 2.67-2.05 4-2.05s3.98.73 4 2.05c-.86 1.3-2.33 2.15-4 2.15z" fill="red"></path></svg>';
    private static _bus = '<svg width="24" height="24" viewBox="0 0 630 630"><circle cx="315" cy="315" fill="#090" r="300" /><path d="m 166.90658,221.87997 17.7839,-69.13788 39.33293,-39.71177 196.04689,0.74927 31.18936,38.58702 22.17764,74.80419 3.20356,195.35313 -309.52785,-10.59694 z" fill="#009900" /><path d="m 187.01059,519.26396 c -4.54488,-1.96555 -9.62767,-6.88221 -12.31042,-11.90806 -1.90188,-3.56297 -2.1764,-5.96662 -2.51262,-22 -0.25357,-12.09183 -0.75485,-18.24115 -1.52721,-18.73469 -0.63236,-0.40408 -7.3505,-0.74158 -14.92918,-0.75 l -13.77944,-0.0153 0.29738,-93.75 0.29737,-93.75 8.69151,-65 c 4.78033,-35.75001 9.37868,-67.28334 10.21855,-70.07407 2.25055,-7.47814 8.63872,-16.66911 15.24062,-21.92743 6.75946,-5.38382 24.31493,-14.1405 35.81344,-17.86378 10.61231,-3.43632 29.86631,-8.008911 46.50001,-11.043194 45.11731,-8.230199 81.96607,-7.80855 129.62178,1.48322 54.4943,10.625144 81.69396,25.334034 89.34099,48.313364 1.3805,4.14841 4.87787,27.882 10.5511,71.60116 l 8.48613,65.39588 v 93.30742 93.30743 l -13.25,0.0153 c -7.2875,0.008 -13.76667,0.34592 -14.39815,0.75 -0.76535,0.48974 -1.28495,6.56925 -1.55849,18.23469 -0.47552,20.27986 -1.45174,23.76885 -8.3493,29.84033 -13.26898,11.67982 -36.52527,6.18278 -41.30263,-9.76261 -0.64974,-2.16866 -1.14143,-10.72891 -1.14143,-19.87231 0,-13.26899 -0.2733,-16.33585 -1.57143,-17.63398 -1.40625,-1.40625 -11.43723,-1.57143 -95.42857,-1.57143 -83.99135,0 -94.02233,0.16518 -95.42858,1.57143 -1.30209,1.30209 -1.5731,4.43007 -1.5812,18.25 -0.009,15.43083 -0.18616,17.05262 -2.36765,21.67857 -2.8098,5.95831 -5.57483,8.67418 -11.62258,11.41597 -5.51068,2.4983 -16.77831,2.75033 -22,0.49209 z M 206.1008,407.48478 c 9.46556,-3.3835 16.05265,-12.77879 16.05265,-22.89619 0,-14.07038 -10.50652,-24.73269 -24.37132,-24.73269 -6.89098,0 -11.05605,1.55488 -16.15318,6.03022 -5.82118,5.11107 -8.05896,10.23968 -8.05896,18.46978 0,7.77399 2.06736,12.92595 7.09902,17.69105 6.44911,6.10747 17.15464,8.39653 25.43179,5.43783 z m 246.97362,-1.37888 c 18.07464,-9.16658 18.07464,-34.33342 0,-43.5 -12.80683,-6.495 -28.32271,-0.8778 -33.83708,12.25 -2.24224,5.33798 -1.89907,14.9797 0.72617,20.40272 5.89274,12.17277 20.84111,17.06992 33.11091,10.84728 z m 1.99765,-109.26166 c 2.93394,-0.55641 6.34473,-1.96077 7.57953,-3.1208 2.47924,-2.32913 4.39428,-9.7056 3.73001,-14.36754 -0.2351,-1.65 -3.53427,-25.34567 -7.33148,-52.65704 -7.10962,-51.13572 -7.87962,-54.67775 -12.86692,-59.18805 -5.14662,-4.65437 -2.70061,-4.56449 -125.47979,-4.61102 -83.07339,-0.0315 -117.07878,0.27629 -120.30587,1.08888 -5.88911,1.4829 -10.00374,5.7153 -11.84718,12.18629 -2.47548,8.68959 -15.69156,106.35495 -14.93656,110.37947 1.00263,5.34447 5.20014,9.48278 10.48554,10.33765 7.16885,1.15951 264.84628,1.11402 270.97272,-0.0478 z M 395.5106,140.88139 c 4.61537,-1.06937 7.17314,-3.76628 8.06113,-8.49963 0.79272,-4.22557 -1.74678,-9.83379 -5.15637,-11.38731 -1.80066,-0.82043 -23.93049,-1.13234 -79.20181,-1.11632 -71.16498,0.0206 -76.85695,0.14698 -78.83591,1.75 -4.70832,3.81389 -5.63952,9.62854 -2.39432,14.95093 1.17041,1.91958 3.09,3.47161 4.74626,3.83747 1.52956,0.33787 3.23102,0.76442 3.78102,0.94789 2.44849,0.81677 145.39008,0.35338 149,-0.48303 z" style="fill:#ffffff" /></svg>';

    private static _icon(icon: string, size: number): L.DivIcon {
        const _size = L.point(size, size); // 24|36|32
        return L.divIcon({
            html: icon,
            iconSize: _size
        });
    }

    private static _marker(position: number[], icon: string, size: number): L.Marker<any> {
        const _icon = this._icon(icon, size);
        return L.marker(position as any, { icon: _icon });
    }

    static marker(position: number[], icon: MarkerIcon): L.Marker<any> {
        if (icon == MarkerIcon.USER) {
            return this._marker(position, this._user, 32); // 36
        }
        if (icon == MarkerIcon.BUS) {
            return this._marker(position, this._bus, 24);
        }
        return L.marker(position as any);
    }
}