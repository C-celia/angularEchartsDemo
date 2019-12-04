import {HttpClient} from '@angular/common/http';
import {environment} from '../../../environments/environment.hmr';
import {Injectable} from '@angular/core';
import {Observable} from 'rxjs/internal/Observable';

@Injectable()
export class LogAnalysisService {

  constructor(
    private http: HttpClient
  ) { }


  // 获取时间标题
  getSuccessAndFailNum(p_v): Observable<any>{
   return this.http.post(sessionStorage.getItem('baseUrl') + environment.getServersLastMonth , p_v  );
  /*  return this.http.get(sessionStorage.getItem('baseUrl1') + 'backend/api/get-servers-last-month'
      , { responseType: 'json' , observe: 'response'});  , { responseType: 'json' , observe: 'response'} */

  }

  getTableData(p_v): Observable<any>{
     const json_p = JSON.parse(p_v);
    return this.http.post(sessionStorage.getItem('baseUrl') + environment.getServersLastMonth , json_p    );
    /*  return this.http.get(sessionStorage.getItem('baseUrl1') + 'backend/api/get-servers-last-month'
        , { responseType: 'json' , observe: 'response'}); , { responseType: 'json' , observe: 'response'}*/

  }


}
