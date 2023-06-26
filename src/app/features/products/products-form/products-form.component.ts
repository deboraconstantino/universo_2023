import { Component, OnInit } from '@angular/core';
import { NgForm } from '@angular/forms';
import { PoDynamicFormField, PoPageAction, PoNotificationService, PoBreadcrumb, PoDialogService } from '@po-ui/ng-components';
import { ProductsService } from '../shared/services/products.service';
import { ActivatedRoute, Router } from '@angular/router';
import { Products } from '../shared/interfaces/products.interface';

@Component({
  selector: 'app-products-form',
  templateUrl: './products-form.component.html',
  styleUrls: ['./products-form.component.css']
})
export class ProductsFormComponent implements OnInit {
  fields: Array<PoDynamicFormField>;
  actions: Array<PoPageAction>;
  productForm: NgForm;
  breadcrumb: PoBreadcrumb;
  title: string;
  value: Products = {
    description: '',
    unit: '',
    type: '',
    branch: '',
    warehouse: '',
    id: '',
  };
  isUpdate: boolean;
  isLoading: boolean;

  constructor(
    private productsService: ProductsService,
    private poNotificationService: PoNotificationService,
    private router: Router,
    private poDialogService: PoDialogService,
    private activatedRoute: ActivatedRoute
  ) { }

  ngOnInit(): void {
    this.isUpdate = this.activatedRoute.snapshot.params['id'] !== undefined;
    this.title = this.getTitle();
    this.actions = this.getActions();
    this.fields = this.getFields();
    this.breadcrumb = this.getBreadcrumb();
    this.getValue(this.activatedRoute.snapshot.params['id']);
  }

  getTitle(): string {
    return this.isUpdate ? 'Alterar produto' : 'Incluir produto';
  }

  getActions(): Array<PoPageAction> {
    return [
      { label: 'Salvar', action: this.saveProduct.bind(this) },
      { label: 'Cancelar', action: this.confirmCancel.bind(this) }
    ];
  }

  getBreadcrumb(): PoBreadcrumb {
    return { items: [
      { label: 'Home', link: '/' },
      { label: this.title }
    ] }
  }

  getFields(): Array<PoDynamicFormField> {
    return [
      { property: 'id', label: 'Código', maxLength: 32, gridColumns: 6 },
      { property: 'description', label: 'Descrição', gridColumns: 6 },
      { property: 'type', label: 'Tipo', maxLength: 2, gridColumns: 2 },
      { property: 'unit', label: 'Unidade', maxLength: 2, gridColumns: 2 },
      { property: 'warehouse', label: 'Armazém', maxLength: 2, gridColumns: 2 }
    ];
  }

  setForm(form: NgForm): void {
    this.productForm = form;
  }

  getValue(productId: string): void {
    if (productId) {
      this.isLoading = true;
      this.productsService.getById(productId).subscribe({
        next: (product: Products) => { this.isLoading = false; this.value = product },
        error: (error: any) => { this.isLoading = false; this.poNotificationService.error(error.error.errorMessage) }
      });
    }
  }

  saveProduct(): void {
    this.actions[0].disabled = true;
    this.isUpdate ? this.putProduct(this.productForm.value) : this.postProduct(this.productForm.value);
  }

  postProduct(product: Products): void {
    this.productsService.post(product).subscribe({
      next: () => {
        this.actions[0].disabled = false;
        this.poNotificationService.success('Registro incluído com sucesso.');
        this.router.navigate(['']);
      },
      error: (error: any) => {
        this.actions[0].disabled = false;
        this.poNotificationService.error(`Falha ao salvar registro: ${error.error.errorMessage}`);
      }
    });
  }

  putProduct(product: Products): void {
    this.productsService.put(product.id, product).subscribe({
      next: () => {
        this.actions[0].disabled = false;
        this.poNotificationService.success('Registro alterado com sucesso.');
        this.router.navigate(['']);
      },
      error: (error: any) => {
        this.actions[0].disabled = false;
        this.poNotificationService.error(`Falha ao salvar registro: ${error.error.errorMessage}`);
      }
    });
  }

  confirmCancel(): void {
    this.poDialogService.confirm({
      title: 'Confirmação',
      message: 'Tem certeza que deseja cancelar a operação? As informações preenchidas serão perdidas.',
      confirm: this.goToProductsList.bind(this)
    });
  }

  goToProductsList(): void {
    this.router.navigate(['']);
  }
}
