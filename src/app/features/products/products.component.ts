import { Products } from './shared/interfaces/products.interface';
import { ProAdapterBaseV2 } from '@totvs/protheus-lib-core';
import { ProductsService } from './shared/services/products.service';
import { Component, OnInit, ViewChild } from '@angular/core';
import { PoPageAction, PoTableColumn, PoNotificationService, PoDisclaimer, PoTableAction, PoModalComponent } from '@po-ui/ng-components';
import { PoPageDynamicSearchFilters } from '@po-ui/ng-templates';

@Component({
  selector: 'app-products',
  templateUrl: './products.component.html',
  styleUrls: ['./products.component.css']
})
export class ProductsComponent implements OnInit {
  @ViewChild('balanceModal') balanceModal: PoModalComponent;
  readonly actions: Array<PoPageAction> = [
    { label: 'Novo', action: () => {} }
  ];
  readonly columns: Array<PoTableColumn> = [
    { property: 'branch', label: 'Filial' },
    { property: 'id', label: 'Código' },
    { property: 'type', label: 'Tipo' },
    { property: 'unit', label: 'Unidade' },
    { property: 'warehouse', label: 'Armazém' },
    { property: 'description', label: 'Descrição' }
  ];
  readonly advancedFilters: Array<PoPageDynamicSearchFilters> = [
    { property: 'branch', label: 'Filial' },
    { property: 'id', label: 'Código' },
    { property: 'type', label: 'Tipo' },
    { property: 'unit', label: 'Unidade' },
    { property: 'warehouse', label: 'Armazém' },
    { property: 'description', label: 'Descrição' }
  ];
  readonly tableActions: Array<PoTableAction> = [
    { label: 'Alterar', action: () => {} },
    { label: 'Excluir', action: () => {} },
    { label: 'Consultar saldo', action: (row: Products) => this.openBalanceModal(row.id) }
  ];
  isLoadingProducts: boolean = true;
  products: ProAdapterBaseV2<Products> = {
    hasNext: false,
    items: [],
    remainingRecords: 0
  };
  page: number = 1;
  filter: string = '';
  balance: number = 0;
  isLoadingBalance: boolean = true;

  constructor(
    private productsService: ProductsService,
    private poNotificationService: PoNotificationService
  ) { }

  ngOnInit(): void {
    this.getProducts(1);
  }

  getProducts(page: number, filter?: string): void {
    this.isLoadingProducts = true;
    this.productsService.get(page, 10, filter).subscribe({
      next: (products: ProAdapterBaseV2<Products>) => this.onGetSuccess(products, page),
      error: () => {
        this.isLoadingProducts = false;
        this.poNotificationService.error('Falha ao carregar produtos')
      }
    });
  }

  showMore(): void {
    this.page += 1;
    this.getProducts(this.page, this.filter);
  }

  onGetSuccess(items: ProAdapterBaseV2<Products>, page: number): void {
    this.isLoadingProducts = false;

    if (items.items.length > 0) {
      this.products.items = page === 1 ? items.items : this.products.items.concat(items.items);
    } else {
      this.products = {
        hasNext: false,
        items: [],
        remainingRecords: 0
      };
    }

    this.products.hasNext = items.hasNext;
  }

  onQuickSearch(value: string): void {
    this.page = 1;
    this.filter = `contains(tolower(id), '${value.toLowerCase()}') or contains(tolower(description), '${value.toLowerCase()}')`;
    this.getProducts(1, this.filter);
  }

  onChangeDisclaimers(values: Array<any>): void {
    if (values.length === 0) {
      this.page = 1;
      this.filter = '';
      this.getProducts(1, this.filter);
    } else {
      this.onAdvancedSearch(this.formatDisclaimerFilters(values));
    }
  }

  onAdvancedSearch(values: any): void {
    this.page = 1;
    this.filter = '';
    Object.keys(values).forEach((field: string, index: number) => {
      if (index === 0) {
        this.filter = `tolower(${field}) eq '${values[field].toLowerCase()}'`;
      } else {
        this.filter += ` and tolower(${field}) eq '${values[field].toLowerCase()}'`;
      }
    });

    this.getProducts(1, this.filter);
  }

  formatDisclaimerFilters(values: Array<PoDisclaimer>): any {
    let filter = {};
  
    values.forEach(
      field => Object.assign(filter, {[field.property!]: field.value})
    );
  
    return filter;
  }

  checkBalance(productId: string): void {
    this.productsService.checkBalance(productId).subscribe({
      next: (balance: number) => { this.balance = balance; this.isLoadingBalance = false; },
      error: () => { this.isLoadingBalance = false; this.poNotificationService.error('Falha ao consultar saldo do produto') }
    });
  }

  openBalanceModal(productId: string): void {
    this.productsService.getParam('MV_TPSALDO');
    this.balanceModal.open();
    this.checkBalance(productId);
  }
}
