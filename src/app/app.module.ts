import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { ProtheusLibCoreModule } from '@totvs/protheus-lib-core';
import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';
import { PoModule } from '@po-ui/ng-components';
import { RouterModule } from '@angular/router';
import { ProductsComponent } from './features/products/products.component';
import { PoTemplatesModule } from '@po-ui/ng-templates';
import { ProductsFormComponent } from './features/products/products-form/products-form.component';

@NgModule({
  declarations: [
    AppComponent,
    ProductsComponent,
    ProductsFormComponent
  ],
  imports: [
    BrowserModule,
    AppRoutingModule,
    PoModule,
    RouterModule.forRoot([]),
    PoTemplatesModule,
    ProtheusLibCoreModule
  ],
  providers: [],
  bootstrap: [AppComponent]
})
export class AppModule { }
