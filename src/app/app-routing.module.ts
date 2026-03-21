import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { RideListComponent } from './components/ride-list/ride-list.component';
import { RideDetailComponent } from './components/ride-detail/ride-detail.component';
import { AddRideComponent } from './components/add-ride/add-ride.component';
import { FoodSignupComponent } from './components/food-signup/food-signup.component';

const routes: Routes = [
  { path: '', redirectTo: '/rides', pathMatch: 'full' },
  { path: 'rides', component: RideListComponent },
  { path: 'rides/new', component: AddRideComponent },
  { path: 'rides/:id', component: RideDetailComponent },
  { path: 'food', component: FoodSignupComponent },
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule { }
