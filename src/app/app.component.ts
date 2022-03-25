import {Component, Injectable} from '@angular/core';
import {HttpClient} from "@angular/common/http";

import { Appwrite, Query } from 'appwrite';
import {AppModule} from "./app.module";
import {Router} from "@angular/router";


@Injectable({
  providedIn: 'root'
})
export class AppwriteService {
  sdk: Appwrite| null = null;

  constructor() {
    // Init your Web SDK
    this.sdk = new Appwrite();
    this.sdk
      .setEndpoint('http://localhost/v1') // Your Appwrite Endpoint
      .setProject('62372bf19aa9017986a3') // Your project ID
    ;
  }
}

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss']
})
export class AppComponent {
  title = 'appwrite-sample';
  email: string = '';
  password: string = '';

  constructor(
    private http: HttpClient,
    private router: Router,
    private appwrite: AppwriteService,
  ) {
    const sessionId = localStorage.getItem('sessionId')
    if (sessionId){
      this.appwrite?.sdk?.account.getSession(sessionId).then((response)=>{
        console.log(response);
          this.router.navigateByUrl('orders');
      })
    }else {
      this.router.navigateByUrl('login')
    }
  }

}

@Component({
  template: `
    <form name="form">
      <div>
        <input type="text" name="email" [(ngModel)]="email" placeholder="Email" [ngModelOptions]="{standalone: true}">
      </div>
      <div>
        <input type="text" name="password" [(ngModel)]="password" placeholder="Password" [ngModelOptions]="{standalone: true}">
      </div>

      <button type="button" name="button" (click)="login()">Submit</button>
    </form>
  `,
  selector: 'app-login'
})
export class AppLoginComponent {
  title = 'appwrite-sample';
  email: string = '';
  password: string = '';

  constructor(
    private http: HttpClient,
    private router: Router,
    private appwrite: AppwriteService,
  ) {
  }

  login(){
    let promise = this.appwrite?.sdk?.account.createSession(this.email, this.password);
    const self = this;
    if (promise){
      promise.then(function (response) {
        localStorage.setItem('sessionId', response.$id);
        localStorage.setItem('sessionData', JSON.stringify(response));
        self.router.navigateByUrl('orders')
      }, function (error) {
        console.log(error); // Failure
      });
    }
  }
}

@Component({
  template: `<div>
    <h1>Orders Details</h1>
    <div *ngFor="let order of orders">
      Order No: {{ order.OrderNo}} userId: {{order.userId}} totalAmount: {{order.totalAmount}}
    </div>

    <h1>
      Menu Items
    </h1>

    <div>
      <div *ngFor="let menu of menus">
       Menu Name {{menu.productName}} Price {{menu.price}} <button  (click)="placeOrder(menu)">Place Order</button>
      </div>
    </div>
    <div>
      <button (click)="logout()">Log out</button>
    </div>
  </div>`,
  selector: 'app-orders'
})
export class AppOrdersComponent {

  orders: any = [];
  menus: any = [];
  userData: any = null;

  constructor(
    private appwrite: AppwriteService,
    private router: Router,
  ) {

    const sessionDataStr = localStorage.getItem('sessionData');
    this.userData = JSON.parse(sessionDataStr as string);

    this.loadOrders();
    this.loadMenus()

  }

  async loadMenus(){
    const productCollection: any = await this.appwrite.sdk?.database.listDocuments('623d44664f9f02a3aa62');
    this.menus = productCollection.documents;
    console.log(this.menus)
  }

  async loadOrders(){
    const sessionDataStr = localStorage.getItem('sessionData');
    if(sessionDataStr){
      const sessionData = JSON.parse(sessionDataStr);
      this.appwrite.sdk?.database.listDocuments('62372ef22bbec4d84e21', [
        Query.equal('userId', sessionData.userId)
      ]).then((orders)=>{
        console.log(orders);
        this.orders = orders.documents;
      })
    }
  }

  async placeOrder(menu: any){
    await this.appwrite.sdk?.database.createDocument('62372ef22bbec4d84e21', "unique()" , {
      orderNo: (1000 * Math.random()).toString(),
      userId: this.userData.userId,
      totalAmount: menu.price
    });
    await this.loadOrders();
  }


  async logout(){
    const sessionId = localStorage.getItem('sessionId')
    const res = await this.appwrite.sdk?.account.deleteSession(sessionId as string);
    localStorage.clear();
    this.router.navigateByUrl('login')
  }
}
