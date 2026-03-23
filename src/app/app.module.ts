import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { FormsModule } from '@angular/forms';

import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';
import { RideListComponent } from './components/ride-list/ride-list.component';
import { RideDetailComponent } from './components/ride-detail/ride-detail.component';
import { AddRideComponent } from './components/add-ride/add-ride.component';
import { FoodSignupComponent } from './components/food-signup/food-signup.component';
import { HomeComponent } from './components/home/home.component';
import { AboutComponent } from './components/about/about.component';
import { EditRideComponent } from './components/edit-ride/edit-ride.component';
import { GearSaleComponent } from './components/gear-sale/gear-sale.component';
import { GearAddComponent } from './components/gear-add/gear-add.component';
import { GearEditComponent } from './components/gear-edit/gear-edit.component';
import { GearDetailComponent } from './components/gear-detail/gear-detail.component';

@NgModule({
  declarations: [
    AppComponent,
    RideListComponent,
    RideDetailComponent,
    AddRideComponent,
    FoodSignupComponent,
    HomeComponent,
    AboutComponent,
    EditRideComponent,
    GearSaleComponent,
    GearAddComponent,
    GearEditComponent,
    GearDetailComponent,
  ],
  imports: [
    BrowserModule,
    FormsModule,
    AppRoutingModule,
  ],
  providers: [],
  bootstrap: [AppComponent]
})
export class AppModule { }
