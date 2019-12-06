import {
  Component,
  ElementRef,
  NgZone,
  OnDestroy,
  OnInit,
  TemplateRef,
  ViewChild,
} from '@angular/core';
import {EventManager} from '@angular/platform-browser';
import {Params, Router} from '@angular/router';
import {OtherParameters} from '../../service/log-analysis/OtherParameters';
import {HttpClient} from '@angular/common/http';
import {MatDialog, MatPaginator,  MatTableDataSource} from '@angular/material';
import {LogAnalysisService} from '../../service/log-analysis/log-analysis.service';
import {Subject} from 'rxjs/internal/Subject';
import {EleEntity} from '../detail-template/detail-template.component';
import {takeUntil} from 'rxjs/operators';

@Component({
  selector: 'app-log-analysis-chart',
  templateUrl: './log-analysis-chart.component.html',
  styleUrls: ['./log-analysis-chart.component.scss']
})
export class LogAnalysisChartComponent implements OnInit  , OnDestroy{
     private _unsubscribeAll: Subject<any> = new Subject();
    @ViewChild('LogA', {static: true}) LogA: ElementRef;
    @ViewChild('DetailTemplate', {static: false}) DetailTemplate: TemplateRef<any>;
    @ViewChild(MatPaginator, {static: true}) paginator: MatPaginator;
    echarts: any;
    logRelationship: any;
    jobName: any;
    tableCell: TableCell;
    constructor(
      private eventManager: EventManager,
      private router: Router,
      private zone: NgZone ,
      private http: HttpClient,
      private document: ElementRef,
     // private snackBar: MatSnackBar,
      public dialog: MatDialog,
      private logAnalysisService: LogAnalysisService,
    ) { }

  ngOnInit() {
      this.initTablePram();
      this.aboutECharts();
      this.initData();
      this.document.nativeElement.querySelector('#dialog-div').style.display = 'none';
  }

  initData(){
    this.http.get('assets/url.json').subscribe( data => {
           const baseUrl = data['baseUrl'];
           //  console.log('当前环境baseUrl:' + baseUrl);
           sessionStorage.setItem('baseUrl', baseUrl);
          this.getLogRelationshipData();
    });

  }

  initTablePram(){
    this.tableCell = new TableCell();
    this.tableCell.bussTableHer = [
      {id_job: '记录编号', jobname: '作业名称' , enddate: '执行开始时间' , logdate: '执行结束时间'  , status: '运行状态' , log_field: '查看详情'}  ,
    ];
    this.tableCell.bussTableCol =  ['id_job' , 'jobname' , 'enddate' , 'logdate' , 'status' , 'log_field'];
    this.tableCell.selectID = 'id_job';
    this.tableCell.jobDetail = '';
    this.tableCell.selectIDSource = [
      /* {value: '1' , name: '1'},
       {value: '2' , name: '2'},
       {value: '3' , name: '3'},*/
    ];
  }

  initTableData(p){
    let jobID = '';
    if (this.tableCell.selectID === 'id_job') {
      jobID = '';
    } else {
      jobID = this.tableCell.selectID;
    }
    const param = '{\n' +
      '    "method": "' + OtherParameters.JobRecordDetail + '",\n' +
      '    "data":{\n' +
      '        "jobname": "' + this.jobName + '",\n' +
      '        "jobid": "' + jobID + '"\n' +
      '    }\n' +
      '}\n';
    this.logAnalysisService.getTableData(param).pipe(takeUntil(this._unsubscribeAll)).subscribe( res => {
        const errorCode = res['header'].errCode;
        if (errorCode === '0'){
          const data = res['data'];
          const en: EleEntity[] = data;
          for (let i = 0 ; i < data.length ; i++){
            this.tableCell.selectIDSource[i] = {value: data[i]['id_job'] , name:  data[i]['id_job']};
          }
          this.tableCell.bussTableSource = new MatTableDataSource<EleEntity>(en);
          // this.paginator.length = this.tableCell.bussTableSource.data.length;
          this.tableCell.bussTableSource.paginator =  this.paginator;
        } else {
         // this.snackBar.open(res['header'].errMsg, 'X');
        }
      },
      error1 => { // this.snackBar.open('获取详情出错' + error1.message, 'X');
      });

   /* const errorCode = JSON.parse(res)['header'].errCode;
    if (errorCode === '0'){
      const data =  JSON.parse(res)['data'];
      const en: EleEntity[] = data;
      for (let i = 0 ; i < data.length ; i++){
        this.tableCell.selectIDSource[i] = {value: data[i]['id_job'] , name:  data[i]['id_job']};
      }
      this.tableCell.bussTableSource = new MatTableDataSource<EleEntity>(en);
      // this.paginator.length = this.tableCell.bussTableSource.data.length;
      this.tableCell.bussTableSource.paginator =  this.paginator;
    } else {
      this.snackBar.open(res['header'].errMsg, 'X');
    }*/


    if (p === 'dep'){
      this.document.nativeElement.querySelector('#dialog-div').style.display = 'flex';
      this.document.nativeElement.querySelector('#btuSearch').click();
      setTimeout( () => {
        this.document.nativeElement.querySelector('#btuSearch').addEventListener('click' , () => {
        //  console.log('我被点了一次');
        });
      }, 200);
    }
  }



  getLogRelationshipData(){
    const p_v = { 'method' : OtherParameters.SuccessAndFailNum};
    /* this.logAnalysisService.getSuccessAndFailNum(p_v).pipe(takeUntil(this._unsubscribeAll)).subscribe( res => {
        console.log(res);
      },
      error1 => { this.snackBar.open('获取血缘关系图数据出错' + error1.message, 'X'); });
 */
    this.setECharts();
  }

  aboutECharts(){
    this.echarts = require('echarts');
    window.addEventListener('resize', () => {
      if (this.logRelationship && !this.logRelationship.isDisposed()   ) {
        this.logRelationship.resize();
      }
    });
  }

  setECharts(){
       const categories = [];
       for (let i = 0; i < 2; i++) {
           categories[i] = {
               name: '类目' + i
           };
       }
    this.zone.runOutsideAngular(() => {
      this.logRelationship =    this.echarts.init(this.LogA.nativeElement);
    });
       const   option = {
           // 提示框的配置
           tooltip: {
              enterable: true,
              confine: true,
              textStyle: {
                fontSize: 12,
             },
               formatter: function (x) {
                return '';
               }
           },

        /* xAxis : [{
           type : 'value',
           splitLine: {
             show: false
           },
           axisTick: {
             show: false
           },
           axisLabel: {
             show: false,
             interval: 0,
             textStyle: {
               color: 'white',
               fontSize: 14,
             },
             rotate: 45
           },
           axisLine: {
             show: false
           }
         }, ],
         yAxis : [{
           type : 'value',
           splitLine: {
             show: false
           },
           axisTick: {
             show: false
           },
           axisLabel: {
             show: false,
             textStyle: {
               color: 'white',
               fontSize: 14
             }
           },
           axisLine: {
             show: false
           },
         }],*/
         series: [
           {
            force: {
               // initLayout: 'circular', // 初始布局
                repulsion: 1200, // 斥力大小
                gravity: 0.2,
                edgeLength: 111
            },
          label: {
            normal: {
              show: true,
              position: 'inside',
              color: '#ffffff'
            }
          },
           lineStyle: {
             color: {
               type: 'linear',
               x: 0,
               y: 0.1,
               x2:  0,
               y2:  1,
               colorStops: [{
                 offset: 0, color: 'rgba(255,255,255,0)' // 0% 处的颜色
               }, {
                 offset: 1, color: 'rgba(255,255,255,0.3)' // 100% 处的颜色
               }],
               global: false
             },
             curveness: 0.1,
           },
            animation: false,
            type: 'graph', // 关 系图类型
            layout: 'none', // 引力布局
            roam: false, // 可以拖动
            useWorker: false,
            minRadius: 15,
            maxRadius: 25,
            gravity: 1.1,
            scaling: 1.1,

          nodes: [
            { 'id': 0, 'category':  0, 'name': 'MALL62\r\n业务系统',  x: -220, y: 400 ,
              'symbolSize': 100, edgeSymbol: ['arrow', 'none'], itemStyle: {color: '#FE6D00' , borderColor: 'rgba(254,109,0,0.4)' , borderWidth: 22},
              label: { show: true,  position: 'inside', color: '#ffffff' , fontSize: 18 , fontWeight: 300}},

            { 'id': 1, 'category': 1, 'name': '销售相关',  x: -390, y: 190 ,
              'symbolSize': 80,  itemStyle: {color: '#00B5E2' , borderColor: 'rgba(0,181,226,0.4)' , borderWidth: 22},
              label: {
                show: true,
                position: 'inside',
                color: '#ffffff',
                lineHeight: 25,
                formatter: function(p){
                  return '\r\n ' + p.name;
                },
              // backgroundColor: 'red',
                backgroundColor: {
                  image: 'assets\\images\\sales2.png',
                },
              }
            },

            { 'id': 2, 'category': 1, 'name': '客流信息',  x:  -390, y: 550 ,
              'symbolSize': 80, itemStyle: {color: '#00B5E2', borderColor: 'rgba(0,181,226,0.4)' , borderWidth: 22},
              label: {
                show: true,
                position: 'inside',
                color: '#ffffff',
                lineHeight: 23,
                formatter: function(p){
                  return '\r\n ' + p.name;
                },
                // backgroundColor: 'red'
                backgroundColor: {
                  image: 'assets\\images\\passengerFlow2.png',
                },
              }
            },

            { 'id': 3, 'category': 1, 'name': '天气',   x: -80 , y: 540 ,
              'symbolSize': 80,  itemStyle: {color: '#00B5E2', borderColor: 'rgba(0,181,226,0.4)' , borderWidth: 22},
              label: {
                show: true,
                position: 'inside',
                color: '#ffffff',
                lineHeight: 25,
                // align: 'center',
                // verticalAlign: 'center',
                // offset: [ 0, 0],
                width: 100,
                height: 100,
                formatter: function(p){
                  return '\r\n     ' + p.name + '     ' ;
                },
                 // backgroundColor: 'red'
                backgroundColor: {
                  image: 'assets\\images\\weather1.png',
                },
              }
            },

            { 'id': 4, 'category': 1, 'name': '合同主档信息',  x: -60, y: 240 ,
              'symbolSize': 80,   itemStyle: {color: '#00B5E2', borderColor: 'rgba(0,181,226,0.4)' , borderWidth: 22},
              label: {
                show: true,
                position: 'inside',
                color: '#ffffff',
                lineHeight: 28,
                // align: 'center',
                // verticalAlign: 'center',
                // offset: [ 0, 0],
                formatter: function(p){
                  return '\r\n' + p.name  ;
                },
               // backgroundColor: 'red',
                backgroundColor: {
                  image: 'assets\\images\\mainInfo2.png',
                },
              }},


            { 'id': 5, 'category': 1, 'name': 'CRM系统',   x: 450, y: 400 ,  'symbolSize': 100,
              itemStyle: {color: '#FE6D00', borderColor: 'rgba(254,109,0,0.4)' , borderWidth: 22},
              label: { show: true,  position: 'inside', color: '#ffffff' , fontSize: 18 , fontWeight: 300  }},

            { 'id': 6, 'category': 2, 'name': '会员主档资料 ', x: 450, y: 150 ,
              'symbolSize': 80,  itemStyle: {color: '#00B5E2', borderColor: 'rgba(0,181,226,0.4)' , borderWidth: 22},
              label: {
                show: true,
                position: 'inside',
                color: '#ffffff',
                lineHeight: 30,
                // align: 'center',
                // verticalAlign: 'center',
                // offset: [ 0, 0],
                width: '100%',
                height: '100%',
                formatter: function(p){
                  return '\r\n   ' + p.name + '  ' ;
                },
                // backgroundColor: '#F91507',
                backgroundColor: {
                  image: 'assets\\images\\perInfo1.png',
                },
              }},

            { 'id': 7, 'category': 2, 'name': '会员销售/积分',  x: 450, y: 600 ,
              'symbolSize': 80, itemStyle: {color: '#00B5E2', borderColor: 'rgba(0,181,226,0.4)' , borderWidth: 22},
              label: {
                show: true,
                position: 'inside',
                color: '#ffffff',
                lineHeight: 28,
                // align: 'center',
                // verticalAlign: 'center',
                // offset: [ 0, 0],
                formatter: function(p){
                  return '\r\n  ' + p.name + '  ' ;
                },
              //  backgroundColor: '#F91507',
                backgroundColor: {
                  image: 'assets\\images\\point1.png',
                },
              }},

            { 'id': 8, 'category': 3, 'name': 'ODS_CRM_XF_VIPCARDLIST_1M',  x: 450, y: 20 ,  value: 'needDialog',
              'symbolSize': 8,  itemStyle: {color: '#ffffff' , borderColor: 'rgba(255,255,255,0)' , borderWidth: 22},
              label: { show: true,  position: [ 24 , 8], color: '#ffffff' },
             },

            { 'id': 9, 'category': 3, 'name': 'ODS_CRM_XF_VIPMEDIALIST_1M', x: 510, y: 50 ,  value: 'needDialog',
              'symbolSize': 8,    itemStyle: {color: '#ffffff' ,  borderColor: 'rgba(255,255,255,0)' , borderWidth: 22},
              label: { show: true,   position: [ 24 , 8] , color: '#ffffff' } ,
            },

            { 'id': 10, 'category': 3, 'name': 'ODS_CRM_EB_STORE_1M', x: 547, y: 90 ,  value: 'needDialog',
              'symbolSize': 8,  itemStyle: {color: '#ffffff' ,   borderColor: 'rgba(255,255,255,0)' , borderWidth: 22},
              label: {show: true,  position: [ 24 , 8] , color: '#ffffff' } ,
               },

            { 'id': 11, 'category': 3, 'name': 'ODS_CRM_XF_VIPGRADE_1M', x: 562, y: 136 ,  value: 'needDialog',
              'symbolSize': 8,  itemStyle: {color: 'rgba(255,255,255,1)' }, label: { show: true,  position: 'right', color: 'rgba(255,255,255,1)' }},

            { 'id': 12, 'category': 3, 'name': 'ODS_CRM_XF_VIP_1M', x: 560, y: 185 ,  value: 'needDialog',
              'symbolSize': 8,  itemStyle: {color: 'rgba(255,255,255,1)' }, label: { show: true,  position: 'right', color: 'rgba(255,255,255,1)' }},

            { 'id': 13, 'category': 3, 'name': 'ODS_CRM_XF_BONUSP0OL_1M', x: 540, y: 228 ,  value: 'needDialog',
              'symbolSize': 8,  itemStyle: {color: 'rgba(255,255,255,1)'}, label: {show: true,  position: 'right', color: 'rgba(255,255,255,1)' }},

            { 'id': 14, 'category': 3, 'name': 'ODS_CRM_XF_TICKET_1M',  x: 510, y: 263 ,  value: 'needDialog',
              'symbolSize': 8, itemStyle: {color: 'rgba(255,255,255,1)'}, label: {show: true,  position: 'right', color: 'rgba(255,255,255,1)'}},

            { 'id': 15, 'category': 3, 'name': 'ODS_MALL_XF_TRANSSALESTOTAL_5S', x: -480, y: 70 ,  value: 'needDialog',
              'symbolSize': 8,  itemStyle: {color: 'rgba(255,255,255,1)'}, label: { show: true,  position: [-200 , -20], color:  'rgba(255,255,255,1)' }},

            { 'id': 16, 'category': 3, 'name': 'ODS_MALL_XF_TRANSSALESTENDER_5S', x: -390, y: 30 ,  value: 'needDialog',
              'symbolSize': 8,  itemStyle: {color: '#ffffff' ,  borderColor: 'rgba(255,255,255,0)' , borderWidth: 22},
              label: {show: true,  position: [ -90 , -10], color: '#ffffff' } ,
               },

            { 'id': 17, 'category': 3, 'name': 'ODS_MALL_XF_TRANSSALESTITEM_5S',  x: -280, y: 70 ,  value: 'needDialog',
              'symbolSize': 8, itemStyle: {color:  'rgba(255,255,255,1)'}, label: {show: true,  position: [-50, -15], color:  'rgba(255,255,255,1)' }},

            { 'id': 18, 'category': 3, 'name': 'ODS_MALL_XF_MDCONTRACTH_1M', x: -60 , y: 110 ,  value: 'needDialog',
              'symbolSize': 8,  itemStyle: {color: '#ffffff' ,  borderColor: 'rgba(255,255,255,0)' , borderWidth: 22},
              label: { show: true,  position: [10 , -10], color: '#ffffff' } , // position: [-30 , -20]
               },

            { 'id': 19, 'category': 3, 'name': 'CDS_MALL_XF_MDMAL_LID_1M', x: 0, y: 120 ,  value: 'needDialog',
              'symbolSize': 8,  itemStyle: {color:  'rgba(255,255,255,1)'}, label: {show: true,  position: 'right', color:  'rgba(255,255,255,1)' }},

            { 'id': 20, 'category': 3, 'name': 'ODS_MALL_XF_MDTENANT_1M',  x: 50, y: 150 ,  value: 'needDialog',
              'symbolSize': 8, itemStyle: {color:  'rgba(255,255,255,1)'}, label: {show: true,  position: 'right', color:  'rgba(255,255,255,1)' }},

            { 'id': 21, 'category': 3, 'name': 'ODS_MALL_XF_MDTOTAlCOUNTSTD_1M', x:  -300, y: 680 ,  value: 'needDialog',
              'symbolSize': 8,  itemStyle: {color: 'rgba(255,255,255,1)'}, label: { show: true,  position: [-30 , 20], color: 'rgba(255,255,255,1)' }},

            { 'id': 22, 'category': 3, 'name': 'ODS_MALL_XF_MDTOTAlCOUNT_1M',  x:  -390, y: 730 ,  value: 'needDialog',
              'symbolSize': 8,  itemStyle: {color: '#ffffff' ,  borderColor: 'rgba(255,255,255,0)' , borderWidth: 22},
              label: {show: true,  position: [ -90 , 30] , color: '#ffffff' } , // bottom
               },

            { 'id': 23, 'category': 3, 'name': 'ODS_MALL XF_MDTOTALCOUNTSTORE_1M',   x:  -490, y: 680 ,  value: 'needDialog',
              'symbolSize': 8, itemStyle: {color: 'rgba(255,255,255,1)'}, label: {show: true,  position: [-240 , 20], color: 'rgba(255,255,255,1)' }},

            { 'id': 24, 'category': 3, 'name': 'ODS_MALL_XF_CITY_WEATHER_1H', x: 0 , y: 690 ,  value: 'needDialog',
              'symbolSize': 8,  itemStyle: {color: '#ffffff' ,  borderColor: 'rgba(255,255,255,0)' , borderWidth: 22},
              label: { show: true,  position: [ 20 , 20], color: '#ffffff' } ,
               },

            { 'id': 25, 'category': 3, 'name': 'XF_BONUSLEDGER_1M', x: 550, y: 680 ,  value: 'needDialog',
              'symbolSize': 8,  itemStyle: {color: 'rgba(255,255,255,1)'}, label: {show: true,  position: 'right', color: 'rgba(255,255,255,1)' }},

            { 'id': 26, 'category': 3, 'name': 'XF_TICKTLEDGER_1M', x: 520, y: 720 ,  value: 'needDialog',
              'symbolSize': 8, 'ignore': true, 'flag': true , itemStyle: {color: '#ffffff' , borderColor: 'rgba(255,255,255,0)' , borderWidth: 22},
              label: {show: true,  position: [ 22 , 15], color: '#ffffff'  } ,
              },

            { 'id': 27, 'category': 3, 'name': 'ODS_MALL_XF_MDBRAND_1M', x: 70, y: 175 ,  value: 'needDialog',
              'symbolSize': 8,  itemStyle: {color: 'rgba(255,255,255,1)'}, label: { show: true,  position: 'right', color:  'rgba(255,255,255,1)' }},
            { 'id': 28, 'category': 3, 'name': 'ODS_MALL_XF_MDOPERRELAT_1M', x: 80, y: 198 ,  value: 'needDialog',
              'symbolSize': 8,  itemStyle: {color:  'rgba(255,255,255,1)'}, label: { show: true,  position: 'right', color: 'rgba(255,255,255,1)' }},
            { 'id': 29, 'category': 3, 'name': 'ODS_MALL_XF_MDORGANIZATION_1M', x: 82, y: 220 ,  value: 'needDialog',
              'symbolSize': 8,  itemStyle: {color: 'rgba(255,255,255,1)'}, label: { show: true,  position: 'right', color:  'rgba(255,255,255,1)' }},
            { 'id': 30, 'category': 3, 'name': 'ODS_MALL_XF_MDFLOOR_1M', x: 82, y: 240 ,  value: 'needDialog',
              'symbolSize': 8,  itemStyle: {color:  'rgba(255,255,255,1)'}, label: { show: true,  position: 'right', color:  'rgba(255,255,255,1)' }},
            { 'id': 31, 'category': 3, 'name': 'ODS_MALL_XF_MDCONTRACTTERMINAL_1M', x: -10, y: 370 ,  value: 'needDialog',
              'symbolSize': 8,  itemStyle: {color: 'rgba(255,255,255,1)'}, label: { show: true,  position: 'right', color:  'rgba(255,255,255,1)' }},
            { 'id': 32, 'category': 3, 'name': 'ODS_MALL_XF_MDOPERRELAT_1M', x: -60, y: 380 ,  value: 'needDialog',
              'symbolSize': 8,  itemStyle: {color:  '#ffffff'}, label: { show: true,  position: [0 , 15], color:  '#ffffff' }},

            { 'id': 33, 'category': 3, 'name': 'ODS_MALL_XF_MDOPERATIONTYPEN_1M', x: 78, y: 265 ,  value: 'needDialog',
              'symbolSize': 8,  itemStyle: {color: 'rgba(255,255,255,1)'}, label: { show: true,  position: 'right', color:  'rgba(255,255,255,1)' }},
            { 'id': 34, 'category': 3, 'name': 'ODS_MALL_XF_MDCONTRACTSETTLETYPE_1M', x: 65, y: 295 ,  value: 'needDialog',
              'symbolSize': 8,  itemStyle: {color:  'rgba(255,255,255,1)'}, label: { show: true,  position: 'right', color:  'rgba(255,255,255,1)' }},
            { 'id': 35, 'category': 3, 'name': 'ODS_MALL_XF_MDOPERATIONTYPE_1M', x: 52, y: 322 ,  value: 'needDialog',
              'symbolSize': 8,  itemStyle: {color: 'rgba(255,255,255,1)'}, label: { show: true,  position: 'right', color:  'rgba(255,255,255,1)' }},
            { 'id': 36, 'category': 3, 'name': 'ODS_MALL_XF_MDCONTRACTTYPE_1M', x: 32, y: 350 ,  value: 'needDialog',
              'symbolSize': 8,  itemStyle: {color:  '#ffffff'}, label: { show: true,  position: 'right', color:  '#ffffff' }},

          ], // 数据内容
          // 接收格式均为json对象数组
          links: [
            { 'source': 1, 'target': 0,  edgeSymbol: ['circle', 'none'], edgeSymbolSize: 5, lineStyle: {  color: '#ffffff', curveness: 0.3 },
              'name': 'EnglishName' },
            { 'source': 2, 'target': 0, edgeSymbol: ['circle', 'none'], edgeSymbolSize: 5, lineStyle: {  color: '#ffffff', curveness: 0.3 },
              'name': 'equipment' },
            { 'source': 3, 'target': 0, edgeSymbol: ['circle', 'none'], edgeSymbolSize: 5, lineStyle: {  color: '#ffffff', curveness: 0.3 },
              'name': 'equipment' },
            { 'source': 4, 'target': 0, edgeSymbol: ['circle', 'none'], edgeSymbolSize: 5, lineStyle: {  color: '#ffffff', curveness: -0.3 },
              'name': 'superClass' },
            { 'source': 6, 'target': 5, edgeSymbol: ['circle', 'none'], edgeSymbolSize: 5, lineStyle: {  color: '#ffffff', curveness: -0.2 },
              'name': 'superClass' },
            { 'source': 7, 'target': 5, edgeSymbol: ['circle', 'none'], edgeSymbolSize: 5, lineStyle: {  color: '#ffffff', curveness: -0.2 },
              'name': 'superClass' },
            { 'source': 8, 'target': 6, edgeSymbol: ['none', 'none'], lineStyle: {  color: '#ffffff', curveness: 0 },
              'name': 'superClass' },
            { 'source': 9, 'target': 6, edgeSymbol: ['none', 'none'], lineStyle: {  color: '#ffffff', curveness: 0},
              'name': 'superClass' },
            { 'source': 10, 'target': 6, edgeSymbol: ['none', 'none'], lineStyle: {  color: '#ffffff', curveness: 0 },
              'name': 'superClass' },
            { 'source': 11, 'target': 6, edgeSymbol: ['none', 'none'], lineStyle: {  color: '#ffffff', curveness: 0 },
              'name': 'superClass' },
            { 'source': 12, 'target': 6, edgeSymbol: ['none', 'none'], lineStyle: {  color: '#ffffff', curveness: 0 },
              'name': 'superClass' },
            { 'source': 13, 'target': 6, edgeSymbol: ['none', 'none'], lineStyle: {  color: '#ffffff', curveness: 0 },
              'name': 'superClass' },
            { 'source': 14, 'target': 6, edgeSymbol: ['none', 'none'], lineStyle: {  color: '#ffffff', curveness: 0},
              'name': 'superClass' },
            { 'source': 15, 'target': 1, edgeSymbol: ['none', 'none'], lineStyle: {  color: '#ffffff', curveness: 0.1 },
              'name': 'superClass' },
            { 'source': 16, 'target': 1,  edgeSymbol: ['none', 'none'], lineStyle: {  color: '#ffffff', curveness: 0 },
              'name': 'superClass' },
            { 'source': 17, 'target': 1, edgeSymbol: ['none', 'none'], lineStyle: {  color: '#ffffff', curveness: -0.1},
              'name': 'superClass' },
            { 'source': 18, 'target': 4, edgeSymbol: ['none', 'none'], lineStyle: {  color: '#ffffff', curveness: 0},
              'name': 'superClass' },
            { 'source': 19, 'target': 4, edgeSymbol: ['none', 'none'], lineStyle: {  color: '#ffffff', curveness: 0 },
              'name': 'superClass' },
            { 'source': 20, 'target': 4, edgeSymbol: ['none', 'none'], lineStyle: {  color: '#ffffff', curveness: 0},
              'name': 'superClass' },
            { 'source': 21, 'target': 2, edgeSymbol: ['none', 'none'], lineStyle: {  color: '#ffffff', curveness: 0.1 },
              'name': 'superClass' },
            { 'source': 22, 'target': 2, edgeSymbol: ['none', 'none'], lineStyle: {  color: '#ffffff', curveness: 0 },
              'name': 'superClass' },
            { 'source': 23, 'target': 2, edgeSymbol: ['none', 'none'], lineStyle: {  color: '#ffffff', curveness: -0.1},
              'name': 'superClass' },
            { 'source': 24, 'target': 3, edgeSymbol: ['none', 'none'], lineStyle: {  color: '#ffffff', curveness: 0 },
              'name': 'superClass' },
            { 'source': 25, 'target': 7, edgeSymbol: ['none', 'none'], lineStyle: {  color: '#ffffff', curveness: 0 },
              'name': 'superClass' },
            { 'source': 26, 'target': 7, edgeSymbol: ['none', 'none'], lineStyle: {  color: '#ffffff', curveness: 0},
              'name': 'superClass' },
            { 'source': 27, 'target': 4, edgeSymbol: ['none', 'none'], lineStyle: {  color: '#ffffff', curveness: 0 },
              'name': 'superClass' },
            { 'source': 28, 'target': 4, edgeSymbol: ['none', 'none'], lineStyle: {  color: '#ffffff', curveness: 0 },
              'name': 'superClass' },
            { 'source': 29, 'target': 4, edgeSymbol: ['none', 'none'], lineStyle: {  color: '#ffffff', curveness: 0 },
              'name': 'superClass' },
            { 'source': 30, 'target': 4, edgeSymbol: ['none', 'none'], lineStyle: {  color: '#ffffff', curveness: 0 },
              'name': 'superClass' },
            { 'source': 31, 'target': 4, edgeSymbol: ['none', 'none'], lineStyle: {  color: '#ffffff', curveness: 0 },
              'name': 'superClass' },
            { 'source': 32, 'target': 4, edgeSymbol: ['none', 'none'], lineStyle: {  color: '#ffffff',  curveness: 0 },
              'name': 'superClass' },
            { 'source': 33, 'target': 4, edgeSymbol: ['none', 'none'], lineStyle: {  color: '#ffffff', curveness: 0 },
              'name': 'superClass' },
            { 'source': 34, 'target': 4, edgeSymbol: ['none', 'none'], lineStyle: {  color: '#ffffff', curveness: 0 },
              'name': 'superClass' },
            { 'source': 35, 'target': 4, edgeSymbol: ['none', 'none'], lineStyle: {  color: '#ffffff', curveness: 0 },
              'name': 'superClass' },
            { 'source': 36, 'target': 4, edgeSymbol: ['none', 'none'], lineStyle: {  color: '#ffffff',  curveness: 0 },
              'name': 'superClass' },
          ], // 关系对应
    },
         /*  {
             type: 'effectScatter',
             data: [
               {value: [-220, 400 ] ,
                 label: { formatter: function(p){
                     // '业务系统'
                     return 0; } },  symbolSize: 0},
               {value: [-350, 600  ] ,
                 label: { formatter: function(p){
                     // '销售相关'
                     return 1; }  },   symbolSize: 0},
               {value: [-390, 190 ] ,
                 label: { formatter: function(p){
                     // '客流信息'
                     return 2; } },  symbolSize: 0},
               {value: [-80, 540  ] ,
                 label: { formatter: function(p){
                     // '天气'
                     return 3; }  },  symbolSize: 0},
               {value: [-60, 240  ] ,
                 label: { formatter: function(p){
                     // '合同主档信息'
                     return 4; }  },  symbolSize: 0},
               {value: [450, 400 ] ,
                 label: { formatter: function(p){
                     // 'CRM系统'
                     return 5; }  }, symbolSize: 0},
               {value: [450, 150 ] ,
                 label: { formatter: function(p){
                     // '会员主档资料'
                     return 6; }  }, symbolSize: 0},
               {value: [450, 600  ] ,
                 label: { formatter: function(p){
                     // '会员销售/积分'
                     return 7; } },  symbolSize: 0},
               {value: [343, 782  , '' , 'ODS_CRM_XF_VIPCARDLIST_1M'] ,
                 label: { formatter: function(p){
                     // 'ODS_CRM_XF_VIPCARDLIST_1M'
                     return ''; }  },  symbolSize: 8},
               {value: [392, 748  , '' , 'ODS_CRM_XF_VIPMEDIALIST_1M' ] ,
                 label: { formatter: function(p){
                     // 'ODS_CRM_XF_VIPMEDIALIST_1M'
                     return ''; }   },   symbolSize: 8},
               {value: [424, 705 , '' , 'ODS_CRM_EB_STORE_1M' ] ,
                 label: { formatter: function(p){
                     // 'ODS_CRM_EB_STORE_1M'
                     return ''; }  },   symbolSize: 8},
               {value: [436, 656 , '' , 'ODS_CRM_XF_VIPGRADE_1M' ] ,
                 label: { formatter: function(p){
                     // 'ODS_CRM_XF_VIPGRADE_1M'
                     return ''; }  },   symbolSize: 8},
               {value: [435, 604 , '' , 'ODS_CRM_XF_VIP_1M'] ,
                 label: { formatter: function(p){
                     // 'ODS_CRM_XF_VIP_1M'
                     return ''; } },   symbolSize: 8},
               {value: [418, 557 , '' , 'ODS_CRM_XF_BONUSP0OL_1M' ] ,
                 label: { formatter: function(p){
                     // 'ODS_CRM_XF_BONUSP0OL_1M'
                     return ''; } },   symbolSize: 8},
               {value: [393, 520 , '' , 'ODS_CRM_XF_TICKET_1M' ] ,
                 label: { formatter: function(p){
                     // 'ODS_CRM_XF_TICKET_1M'
                     return ''; }  },   symbolSize: 8},
               {value: [-428, 726 , '' , 'ODS_MALL_XF_TRANSSALESTOTAL_5S'] ,
                 label: { formatter: function(p){
                     // 'ODS_MALL_XF_TRANSSALESTOTAL_5S'
                     return ''; }  }, symbolSize: 8},
               {value: [-354, 771 , '' , 'ODS_MALL_XF_TRANSSALESTENDER_5S' ] ,
                 label: { formatter: function(p){
                     // 'ODS_MALL_XF_TRANSSALESTENDER_5S'
                     return ''; }  },  symbolSize: 8},
               {value: [-262, 728 , '' , 'ODS_MALL_XF_TRANSSALESTITEM_5S'] ,
                 label: { formatter: function(p){
                     // 'ODS_MALL_XF_TRANSSALESTITEM_5S'
                     return ''; } },   symbolSize: 8},
               {value: [-80, 684 , '' , 'ODS_MALL_XF_MDCONTRACTH_1M'] ,
                 label: { formatter: function(p){
                     // 'ODS_MALL_XF_MDCONTRACTH_1M'
                     return ''; }  },   symbolSize: 8},
               {value: [-30, 674 , '' , 'CDS_MALL_XF_MDMAL_LID_1M' ] ,
                 label: { formatter: function(p){
                     // 'CDS_MALL_XF_MDMAL_LID_1M'
                     return ''; } },  symbolSize: 8},
               {value: [12, 642 , '' , 'ODS_MALL_XF_MDTENANT_1M'] ,
                 label: { formatter: function(p){
                     // 'ODS_MALL_XF_MDTENANT_1M'
                     return ''; } },   symbolSize: 8},
               {value: [-279, 72 , '' , 'ODS_MALL_XF_MDTOTAlCOUNTSTD_1M'] ,
                 label: { formatter: function(p){
                     // 'ODS_MALL_XF_MDTOTAlCOUNTSTD_1M'
                     return ''; }  },   symbolSize: 8},
               {value: [-353, 20 , '' , 'ODS_MALL_XF_MDTOTAlCOUNT_1M'] ,
                 label: { formatter: function(p){
                     // 'ODS_MALL_XF_MDTOTAlCOUNT_1M'
                     return ''; }  },  symbolSize: 8},
               {value: [-437, 73 , '' , 'ODS_MALLXF_MDTOTALCOUNTSTORE_1M'] ,
                 label: { formatter: function(p){
                     // 'ODS_MALLXF_MDTOTALCOUNTSTORE_1M'
                     return ''; }  }, symbolSize: 8},
               {value: [-30, 62 , '' , 'ODS_MALL_XF_CITY_WEATHER_1H'] ,
                 label: { formatter: function(p){
                     // 'ODS_MALL_XF_CITY_WEATHER_1H'
                     return ''; }  },  symbolSize: 8},
               {value: [426, 74 , '' , 'XF_BONUSLEDGER_1M'] ,
                 label: { formatter: function(p){
                     // 'XF_BONUSLEDGER_1M'
                     return ''; }  },   symbolSize: 8},
               {value: [402, 29 , '' , 'XF_TICKTLEDGER_1M'] ,
                 label: { formatter: function(p){
                     // 'XF_TICKTLEDGER_1M'
                     return ''; }  },   symbolSize: 8},
               {value: [28, 614 , '' , 'ODS_MALL_XF_MDBRAND_1M'] ,
                 label: { formatter: function(p){
                     // 'ODS_MALL_XF_MDBRAND_1M'
                     return ''; } },  symbolSize: 8},
               {value: [37, 590 , '' , 'ODS_MALL_XF_MDOPERRELAT_1M'] ,
                 label: { formatter: function(p){
                     // 'ODS_MALL_XF_MDOPERRELAT_1M'
                     return ''; }  },  symbolSize: 8},

               {value: [39, 567 , '' , 'ODS_MALL_XF_MDORGANIZATION_1M'] ,
                 label: { formatter: function(p){
                     // 'ODS_MALL_XF_MDORGANIZATION_1M'
                     return ''; }  },    symbolSize: 8},

               {value: [38, 545 , '' , 'ODS_MALL_XF_MDFLOOR_1M'] ,
                 label: { formatter: function(p){
                     // 'ODS_MALL_XF_MDFLOOR_1M'
                     return ''; }   },   symbolSize: 8},

               {value: [35, 518 , '' , 'ODS_MALL_XF_MDOPERATIONTYPE_1M'] ,
                 label: { formatter: function(p){
                     // 'ODS_MALL_XF_MDOPERATIONTYPE_1M'
                     return ''; } },  symbolSize: 8},
               {value: [25, 486 , '' , 'ODS_MALL_XF_MDCONTRACTSETTLETYPE_1M'] ,
                 label: { formatter: function(p){
                     // 'ODS_MALL_XF_MDCONTRACTSETTLETYPE_1M'
                     return ''; }  },   symbolSize: 8},
               {value: [13, 457 , '' , 'ODS_MALL_XF_MDOPERATIONTYPEN_1M'] ,
                 label: { formatter: function(p){
                     // 'ODS_MALL_XF_MDOPERATIONTYPEN_1M'
                     return ''; }  },   symbolSize: 8},
               {value: [-3, 427 , '' , 'ODS_MALL_XF_MDCONTRACTTYPE_1M' ] ,
                 label: { formatter: function(p){
                     // 'ODS_MALL_XF_MDCONTRACTTYPE_1M'
                     return ''; } },   symbolSize: 8},
               {value: [-38, 406 , '' , 'ODS_MALL_XF_MDCONTRACTTERMINAL_1M'] ,
                 label: { formatter: function(p){
                     // 'ODS_MALL_XF_MDCONTRACTTERMINAL_1M'
                     return ''; }  },  symbolSize: 8},
               {value: [-79, 394 , '' , 'ODS_MALL_XF_MDOPERRELAT_1M'] ,
                 label: { formatter: function(p){
                     // 'ODS_MALL_XF_MDOPERRELAT_1M'
                     return ''; } },   symbolSize: 8},

             ],
             symbolSize: 8,
             showEffectOn: 'render',
             rippleEffect: {
               brushType: 'stroke'
             },
             label: {
               normal: {
                 formatter: function(p){
                   return p.value[3];
                 },
                 show: true
               }
             },
             itemStyle: {
               normal: {
                 color: '#ffffff',
                 shadowBlur: 4,
                 shadowColor: '#ffffff'
               }
             },
             zlevel: 12,
             z: 12
           }*/
         ]
       };
       this.logRelationship.setOption(option);
       this.logRelationship.on('click',  (params) => {

      /*  if (params.componentSubType === 'effectScatter') {
           if (params.value.length > 2){
             this.jobName = params.value[3];
             /!*setTimeout( res => {
               this.initTableData('dep');
             });*!/
            this.router.navigateByUrl('Relation/' + this.jobName );
           }
         }*/
        if (params.value === 'needDialog'){
          this.jobName = params.name;
          this.router.navigate(['Relation/' + this.jobName]).finally( () => {
            // 因为当前环境相当于是echart环境。
            // 不属于angular环境。所以跳转页面，没有加载component。
            // 所以需要在跳转完成后刷新一下页面。太扯了
            location.reload();
          });
        }
    });
   }

  closeDiv(){
      this.tableCell.selectID = 'id_job';
      this.tableCell.selectIDSource = [];
      this.tableCell.bussTableSource = null;
      if (this.document.nativeElement.querySelector('#dialog-div').style.display !== 'none'){
        this.document.nativeElement.querySelector('#dialog-div').style.display = 'none';
      }
  }

  openDialog(DetailMatDialog , element){
    this.tableCell.jobDetail = element.log_field.replace(/<br>/g,'\n');
    if (!this.dialog.getDialogById('DetailMatDialogs')){
      this.dialog.open( DetailMatDialog, {id: 'DetailMatDialogs',  width: '60%' , height: '70%'});
    }
  }

  ngOnDestroy(): void {
    if (this.logRelationship){
      this.logRelationship.dispose();
    }
    this._unsubscribeAll.next();
    this._unsubscribeAll.complete();

  }



}


export class TableCell {
  bussTableSource: MatTableDataSource<EleEntity>;
  bussTableCol: any = [];
  bussTableHer: any = [];
  selectID: any; // 选择分类
  selectIDSource: any  = []; // 选择分类选择框的数据
  jobDetail: any; // 当前详情数据
}
