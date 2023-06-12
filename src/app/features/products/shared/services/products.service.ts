import { Products } from './../interfaces/products.interface';
import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { ProAdapterBaseV2, ProAdapterBaseV2Service, ProJsToAdvplService } from '@totvs/protheus-lib-core';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class ProductsService {
  private readonly api: string = '/api/universototvs/v1/products';

  constructor(
    private httpClient: HttpClient,
    private proAdapterBaseV2Service: ProAdapterBaseV2Service,
    private proJsToAdvplService: ProJsToAdvplService
  ) { }

  get(page: number, pageSize: number, filter?: string, fields?: string, order?: string): Observable<ProAdapterBaseV2<Products>> {
    const parameters: HttpParams = this.proAdapterBaseV2Service.getHttpParams(page, pageSize, filter, fields, order);
    return this.httpClient.get<ProAdapterBaseV2<Products>>(this.api, { params: parameters });
  }

  post(body: Products): Observable<Products> {
    return this.httpClient.post<Products>(this.api, body);
  }

  delete(id: string): Observable<any> {
    return this.httpClient.delete<any>(`${this.api}/${id}`);
  }

  checkBalance(productId: string): Observable<number> {
    return this.proJsToAdvplService.buildObservable<number>(
      ({protheusResponse, subscriber}: any) => {
        subscriber.next(protheusResponse);
        subscriber.complete();
      },
      {
        autoDestruct: true,
        receiveId: 'checkBalance',
        sendInfo: {
          type: 'checkBalance',
          content: productId
        }
      }
    );
  }

  getParam(param: string): void {
    this.proJsToAdvplService.jsToAdvpl('getParam', param);
  }
}
