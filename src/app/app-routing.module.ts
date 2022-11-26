import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { MapComponent } from './map/map.component';
import { RoutesComponent } from './routes/routes.component';
import { RoutesMapComponent } from './routes-map/routes-map.component';

const routes: Routes = [
  { path: 'map', component: MapComponent },
  { path: 'routes', component: RoutesComponent },
  { path: 'routes-map', component: RoutesMapComponent },
  { path: '', redirectTo: '/routes-map', pathMatch: 'full' }
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule {}
