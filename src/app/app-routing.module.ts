import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import {AppComponent, AppLoginComponent, AppOrdersComponent} from "./app.component";

const routes: Routes = [
  {
    path: '',
    component: AppComponent
  },
  {
    path: 'orders',
    component: AppOrdersComponent
  },
  {
    path: 'login',
    component: AppLoginComponent
  }
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule { }
