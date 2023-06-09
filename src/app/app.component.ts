import { Component, OnInit, ViewChild } from '@angular/core';
import { PoToolbarProfile, PoToolbarAction, PoModalComponent } from '@po-ui/ng-components';
import { ProAppConfigService, ProThreadInfoService, ProUserInfo } from '@totvs/protheus-lib-core';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css']
})
export class AppComponent implements OnInit {
  @ViewChild('userModal') userModal: PoModalComponent;
  isLoading: boolean = true;
  profile: PoToolbarProfile = {
    title: '',
    subtitle: ''
  };
  profileActions: Array<PoToolbarAction> = [
    { action: this.openUserModal.bind(this), label: 'Visualizar detalhes', icon: 'po-icon-eye' },
    { action: () => {}, label: 'Trocar de filial', icon: 'po-icon-company' },
    { action: this.closeApp.bind(this), label: 'Sair', icon: 'po-icon-exit' }
  ];
  user: ProUserInfo;

  constructor(
    private proAppConfigService: ProAppConfigService,
    private proThreadInfoService: ProThreadInfoService
  ) {
    this.proAppConfigService.loadAppConfig();
  }

  ngOnInit(): void {
    this.getUserInfo();
  }

  getUserInfo(): void {
    if (this.proAppConfigService.insideProtheus()) { // Verifico se a aplicação está sendo executada dentro do Protheus
      this.getUserInfoFromProtheus();
    } else { // Se não estiver, não é possível pegar as informações, então atribuo elas na mão
      this.user = {
        id: '000000',
        userName: 'Não encontrado',
        displayName: 'Não encontrado',
        emails: []
      };
      this.profile.title = this.user.displayName!;
      this.profile.subtitle = 'Empresa - Filial';
      this.isLoading = false;
    }
  }

  getUserInfoFromProtheus(): void {
    this.proThreadInfoService.getUserInfoThread().subscribe({
      next: (user: ProUserInfo) => {
        this.user = user;
        this.profile.title = this.user.displayName!;
        this.profile.subtitle = `${JSON.parse(sessionStorage['ProBranch']).CompanyCode} - ${JSON.parse(sessionStorage['ProBranch']).Description}`;
        this.isLoading = false;
      },
      error: () => {
        this.isLoading = false;
        this.user = {
          id: '000000',
          userName: 'Não encontrado',
          displayName: 'Não encontrado',
          emails: []
        };
      }
    });
  }

  openUserModal(): void {
    this.userModal.open();
  }

  closeApp(): void {
    this.proAppConfigService.callAppClose(false);
  }
}
