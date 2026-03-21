import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { RideListComponent } from './components/ride-list/ride-list.component';
import { RideDetailComponent } from './components/ride-detail/ride-detail.component';
import { AddRideComponent } from './components/add-ride/add-ride.component';
import { FoodSignupComponent } from './components/food-signup/food-signup.component';
import { HomeComponent } from './components/home/home.component';
import { AboutComponent } from './components/about/about.component';
import { EditRideComponent } from './components/edit-ride/edit-ride.component';

const routes: Routes = [
  { path: '', component: HomeComponent },
  { path: 'rides', component: RideListComponent },
  { path: 'rides/new', component: AddRideComponent },
  { path: 'rides/:id/edit', component: EditRideComponent },
  { path: 'rides/:id', component: RideDetailComponent },
  { path: 'food', component: FoodSignupComponent },
  { path: 'about', component: AboutComponent },
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule { }
