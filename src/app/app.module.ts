import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { FormsModule } from '@angular/forms';

import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';
import { RideListComponent } from './components/ride-list/ride-list.component';
import { RideDetailComponent } from './components/ride-detail/ride-detail.component';
import { AddRideComponent } from './components/add-ride/add-ride.component';
import { FoodSignupComponent } from './components/food-signup/food-signup.component';

@NgModule({
  declarations: [
    AppComponent,
    RideListComponent,
    RideDetailComponent,
    AddRideComponent,
    FoodSignupComponent
  ],
  imports: [
    BrowserModule,
    FormsModule,
    AppRoutingModule
  ],
  providers: [],
  bootstrap: [AppComponent]
})
export class AppModule { }
