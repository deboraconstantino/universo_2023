import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { ProductsComponent } from './features/products/products.component';
import { ProductsFormComponent } from './features/products/products-form/products-form.component';

const routes: Routes = [
  { path: '', redirectTo: 'index.html', pathMatch: 'full' },
  { path: 'index.html', redirectTo: '', pathMatch: 'full' },
  { path: '', component: ProductsComponent },
  { path: 'new', component: ProductsFormComponent },
  { path: 'edit/:id', component: ProductsFormComponent }
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule { }
