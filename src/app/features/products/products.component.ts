import { Products } from './shared/interfaces/products.interface';
import { ProAdapterBaseV2, ProJsToAdvplService } from '@totvs/protheus-lib-core';
import { ProductsService } from './shared/services/products.service';
import { Component, OnInit, ViewChild } from '@angular/core';
import { PoPageAction, PoTableColumn, PoNotificationService, PoDisclaimer, PoTableAction, PoModalComponent, PoDialogService } from '@po-ui/ng-components';
import { PoPageDynamicSearchFilters } from '@po-ui/ng-templates';
import { Router } from '@angular/router';

@Component({
  selector: 'app-products',
  templateUrl: './products.component.html',
  styleUrls: ['./products.component.css']
})
export class ProductsComponent implements OnInit {
  @ViewChild('balanceModal') balanceModal: PoModalComponent;
  actions: Array<PoPageAction>;
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
    { label: 'Excluir', action: (row: Products) => this.confirmDelete(row.id) },
    { label: 'Consultar saldo', action: (row: Products) => this.alertCheckBalance(row.id) }
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
  isLoadingBalance: boolean = false;

  constructor(
    private productsService: ProductsService,
    private poNotificationService: PoNotificationService,
    private poDialogService: PoDialogService,
    private proJsToAdvplService: ProJsToAdvplService,
    private router: Router
  ) { }

  ngOnInit(): void {
    this.actions = this.getActions();
    this.getProducts(1);
  }

  getActions(): Array<PoPageAction> {
    return [
      { label: 'Novo', action: () => this.router.navigate(['new']) }
    ];
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
    this.isLoadingBalance = true;
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

  alertCheckBalance(productId: string): void {
    if (this.proJsToAdvplService.protheusConnected()) {
      this.openBalanceModal(productId);
    } else {
      this.poDialogService.alert({
        title: 'Atenção',
        message: 'Não é possível consultar o saldo do produto, pois o aplicativo não está sendo executado pelo Protheus. Para prosseguir, abra o aplicativo pelo Protheus.'
      });
    };
  }

  confirmDelete(productId: string): void {
    this.poDialogService.confirm({
      title: 'Confirmar',
      message: 'Tem certeza que deseja excluir o produto? Essa ação não poderá ser desfeita.',
      confirm: () => this.delete(productId) 
    });
  }

  delete(productId: string): void {
    this.isLoadingProducts = true;
    this.productsService.delete(productId).subscribe({
      next: () => {
        this.isLoadingProducts = false;
        this.page = 1;
        this.poNotificationService.success('Registro escluído com sucesso.');
        this.getProducts(1, this.filter);
      },
      error: (error: any) => {
        this.isLoadingProducts = false;
        this.poNotificationService.error(`Falha ao excluir produto: ${error.error.message}`);
      }
    })
  }
}
