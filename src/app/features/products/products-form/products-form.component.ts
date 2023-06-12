import { Component, OnInit } from '@angular/core';
import { NgForm } from '@angular/forms';
import { PoDynamicFormField, PoPageAction, PoNotificationService } from '@po-ui/ng-components';
import { ProductsService } from '../shared/services/products.service';
import { Router } from '@angular/router';

@Component({
  selector: 'app-products-form',
  templateUrl: './products-form.component.html',
  styleUrls: ['./products-form.component.css']
})
export class ProductsFormComponent implements OnInit {
  fields: Array<PoDynamicFormField>;
  actions: Array<PoPageAction>;
  productForm: NgForm;

  constructor(
    private productsService: ProductsService,
    private poNotificationService: PoNotificationService,
    private router: Router
  ) { }

  ngOnInit(): void {
    this.actions = this.getActions();
    this.fields = this.getFields();
  }

  getActions(): Array<PoPageAction> {
    return [
      { label: 'Salvar', action: this.saveProduct.bind(this) },
      { label: 'Cancelar', action: () => {} }
    ];
  }

  getFields(): Array<PoDynamicFormField> {
    return [
      { property: 'id', label: 'Código', maxLength: 32, gridColumns: 4 },
      { property: 'description', label: 'Descrição', gridColumns: 8 },
      { property: 'type', label: 'Tipo', maxLength: 2, gridColumns: 2 },
      { property: 'unit', label: 'Unidade', maxLength: 2, gridColumns: 2 },
      { property: 'warehouse', label: 'Armazém', maxLength: 2, gridColumns: 2 }
    ];
  }

  setForm(form: NgForm): void {
    this.productForm = form;
  }

  saveProduct(): void {
    this.actions[0].disabled = true;
    this.productsService.post(this.productForm.value).subscribe({
      next: () => {
        this.actions[0].disabled = false;
        this.poNotificationService.success('Registro incluído com sucesso.');
        this.router.navigate(['']);
      },
      error: (error: any) => {
        this.actions[0].disabled = false;
        this.poNotificationService.error(`Falha ao salvar registro: ${error.error.errorMessage}`);
      }
    })
  }
}
