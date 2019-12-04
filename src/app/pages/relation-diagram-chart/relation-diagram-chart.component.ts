import {Component, ElementRef, NgZone, OnDestroy, OnInit, ViewChild} from '@angular/core';
import {MatDialog} from '@angular/material';
import {HttpClient} from '@angular/common/http';
import {LogAnalysisService} from '../../service/log-analysis/log-analysis.service';
import {EventManager} from '@angular/platform-browser';
import { Router} from '@angular/router';
import {OtherParameters} from '../../service/log-analysis/OtherParameters';
import {Subject} from 'rxjs/internal/Subject';
import {takeUntil} from 'rxjs/operators';
@Component({
  selector: 'app-relation-diagram-chart',
  templateUrl: './relation-diagram-chart.component.html',
  styleUrls: ['./relation-diagram-chart.component.scss']
})
export class RelationDiagramChartComponent implements OnInit  , OnDestroy{
  private _unsubscribeAll: Subject<any> = new Subject();

  @ViewChild('TaskExecutionTime', {static: true}) TaskExecutionTime: ElementRef; // 任务执行时间
  @ViewChild('TaskCompletionRate', {static: true}) TaskCompletionRate: ElementRef; // 任务完成率
  @ViewChild('TaskTypeProportion', {static: true}) TaskTypeProportion: ElementRef; // 任务类型占比
  @ViewChild('TaskQuantity', {static: true}) TaskQuantity: ElementRef; // 任务数量

  echarts: any; //
  eChartsSource: EChartSource; // 我自己的图表 echarts类集合
  taskExecutionTimeDataS: TaskExecutionTimeDataSource; // 任务时间执行图表数据变量集合
  taskCompletionRateDataS: TaskCompletionRateDataSource; // 任务完成率
  taskTypeProportionDataS: TaskTypeProportionDataSource; // 任务类型占比
  taskQuantityDataS: TaskQuantityDataSource; // 任务完成率
  tableCell: TableCell; // 表格变量
  constructor(
    private zone: NgZone ,
    private http: HttpClient,
    public dialog: MatDialog,
   // private snackBar: MatSnackBar,
    private logAnalysisService: LogAnalysisService,
    private eventManager: EventManager,
    private document: ElementRef,
    private router: Router,
  ) { }

  ngOnInit() {
    this.eventManager.addGlobalEventListener('window', 'keydown.backspace', () => {
      this.router.navigateByUrl('/logChart');
    });
    // 实例化echarts图表数据变量
    this.initECharts();
    // 设置关于echarts
    this.intiAllECharts();
    // 初始化各个变量
    this.initChartEntity();
    this.initAllData();
  }

  // 初始化图表变量
  initChartEntity(){
    this.taskExecutionTimeDataS = new TaskExecutionTimeDataSource();
    this.taskCompletionRateDataS = new TaskCompletionRateDataSource();
    this.taskTypeProportionDataS = new TaskTypeProportionDataSource();
    this.taskQuantityDataS = new TaskQuantityDataSource();
    this.tableCell = new TableCell();
    this.tableCell.MonitorValue = '监控状态';
    this.tableCell.MonitorValueSource = [
      {value: '' , name: '全部'},
      {value: 'start' , name: '开始'},
      {value: 'stop' , name: '终止'},
      {value: 'end' , name: '结束'}
    ];
    this.tableCell.selectType = '请选择分类';
    this.tableCell.selectTypeSource[0] = {value: '全部', name: '全部'};
    this.tableCell.bussTableHer = [
      {id_job: '记录编号', jobgroup: '分类' , jobname: '作业名称' , startdate: '上次执行时间'
        , enddate: '下次执行时间' , successcount: '作业执行成功次数', failcount: '作业执行失败次数', operation: '操作'}  ,
    ];
    this.tableCell.bussTableCol =  ['id_job' , 'jobgroup' , 'jobname' , 'startdate' , 'enddate' , 'successcount' , 'failcount' , 'operation'];
    }


  // 初始化图表数据
  initAllData(){
    this.http.get('assets/url.json').subscribe( data => {
      const baseUrl = data['baseUrl'];
    //  console.log('当前环境baseUrl:' + baseUrl);
      sessionStorage.setItem('baseUrl', baseUrl);
      this.initTaskExecutionTimeData(); // 获取任务时间执行图表数据
      this.initTaskCompletionRateData(); // 获取任务完成率图表数据
      this.initTaskTypeProportionData();  // 获取任务类型占比 // 获取任务数量数据
      this.initTableDataSource(); // 获取下面表单的数据
    });
  }

  // 获取任务时间执行图表数据
  initTaskExecutionTimeData(){
    const p_v = { 'method' : OtherParameters.JobExcuteTime};
     this.logAnalysisService.getSuccessAndFailNum(p_v).pipe(takeUntil(this._unsubscribeAll)).subscribe( res => {
          const errorCode = res['header'].errCode;
          if (errorCode === '0'){
            const data = res['data'];
            for (let i = 0 ; i < data.length ; i++ ){
              this.taskExecutionTimeDataS.valueX[i] = data[i].enddate;
              this.taskExecutionTimeDataS.valueY[i] = data[i].excutetime ;
            }
            this.taskExecutionTimeDataS.allData = JSON.stringify(res);
            this.SetTaskExecutionTimeChart();
          } else {
            // this.snackBar.open(res['header'].errMsg, 'X');
          }

     },
       error1 => { // this.snackBar.open('任务时间执行图表数据出错' + error1.message, 'X');
     });
  }

  // 获取任务完成率图表数据
  initTaskCompletionRateData(){
    const p_v = { 'method' : OtherParameters.SuccessAndFailNum};
    this.logAnalysisService.getSuccessAndFailNum(p_v).pipe(takeUntil(this._unsubscribeAll)).subscribe( res => {
        const errorCode = res['header'].errCode;
        if (errorCode === '0'){
          const data = res['data'];
          for (let i = 0 ; i < data.length ; i++ ){
            if (data[i].status === '成功') {
              this.taskCompletionRateDataS.Success = data[i].value;
            } else {
              this.taskCompletionRateDataS.Fail = data[i].value;
            }
          }
          this.taskCompletionRateDataS.value = [{value: Number(this.taskCompletionRateDataS.Success) , name: '完成'} ,
            {value: Number(this.taskCompletionRateDataS.Fail) , name: '未完成', label: { normal: {show: false}}}];
          this.SetTaskCompletionRateChart();
          this.taskCompletionRateDataS.allNum = Number(Number(this.taskCompletionRateDataS.Success) + Number(this.taskCompletionRateDataS.Fail) );
        } else {
          // this.snackBar.open(res['header'].errMsg, 'X');
        }

    },
      error1 => {
      // this.snackBar.open('获取成功与失败次数出错' + error1.message, 'X');
    });


  }

  // 获取任务类型占比数据 // 获取任务数量数据
  initTaskTypeProportionData(){
    const p_v = { 'method' : OtherParameters.JobTypeAndNum};
    this.logAnalysisService.getSuccessAndFailNum(p_v).pipe(takeUntil(this._unsubscribeAll)).subscribe( res1 => {
        const errorCode = res1['header'].errCode;
        if (errorCode === '0'){
          const data = res1['data'];
          for ( let i = 0 ; i < data.length; i ++ ){
            this.taskTypeProportionDataS.value[i] =  {value: data[i].num, name: data[i].jobgroup};
            this.taskQuantityDataS.title[i] = data[i].jobgroup;
            this.taskQuantityDataS.value[i] = data[i].num;
            this.tableCell.selectTypeSource [ i + 1 ] = {value: data[i].jobgroup , name: data[i].jobgroup};
          }
          this.SetTaskTypeProportionChart();
          this.TaskQuantityChart();
        } else {
          // this.snackBar.open(res1['header'].errMsg, 'X');
        }


      },
      error1 => {
     // this.snackBar.open('获取任务类型占比数据出错' + error1.message, 'X');
    });
  }

  // 获取表格数据
  initTableDataSource(){

    let  MonitorValue = '';
    let  selectType = '';
    if (this.tableCell.MonitorValue === '监控状态'){
          MonitorValue = '';
    } else {
          MonitorValue = this.tableCell.MonitorValue;
    }
    if (this.tableCell.selectType === '请选择分类' || this.tableCell.selectType === '全部'){
          selectType = '';
    } else {
          selectType = this.tableCell.selectType;
    }
    let ic =  this.document.nativeElement.querySelector('#inputCla').value;
    if ( ic === '' &&  ic !== undefined){
          ic = '';
    }
    const param = '{\n' +
      '"method": "' + OtherParameters.JobRecord + '",\n' +
      '"data":{\n' +
      '"status":"' + MonitorValue + '",\n' +
      '"jobgroup":"' + selectType + '",\n' +
      '"jobname":"' + ic + '" \n' +
      '}\n' +
      '}';
     this.logAnalysisService.getTableData(param).pipe(takeUntil(this._unsubscribeAll)).subscribe( res => {
         const errorCode = res['header'].errCode;
         if (errorCode === '0'){
           const data = res['data'];
           this.tableCell.bussTableSource = data;
           this.tableCell.bfTableSource =  this.tableCell.bussTableSource ;
         } else {
           // this.snackBar.open(res['header'].errMsg, 'X');
         }
      },
      error1 => {
       // this.snackBar.open('获取表格数据出错' + error1.message, 'X');
        });


  }

  onSearch(){
   const ic =  this.document.nativeElement.querySelector('#inputCla').value;
   const laS = [];
   if ( ic !== '' &&  ic !== undefined){
     for (let i = 0 ; i < this.tableCell.bussTableSource.length ; i++){
       if (this.tableCell.bussTableSource[i].JobName.includes(ic)){
         laS.push(this.tableCell.bussTableSource[i]);
       }
     }
     this.tableCell.bussTableSource = laS;
   } else {
     this.tableCell.bussTableSource = this.tableCell.bfTableSource;
   }


  }


  TypeChange(){
      console.log(this.tableCell.selectType  , '---this.tableCell.selectType');
      console.log(this.tableCell.MonitorValue  , '---this.tableCell.MonitorValue');

      if (this.tableCell.selectType === '客流') {
         this.tableCell.bussTableSource = [
          {RecordNumber: '0', type: '客流' , JobName: 'ods_mall_count' ,
            LastExecutionTime: '1900/1/1 7:00:00', NextExecutionTime: '2019/11/22 14:39:45' , SuccessTimes: '0', FailTimes: '0', operation: 'operationC'} ,
        ] ;
      }
      if (this.tableCell.selectType === '销售相关') {
        this.tableCell.bussTableSource = [
          {RecordNumber: '7', type: '销售相关' , JobName: 'ods_mall_sales' ,
            LastExecutionTime: '2019/11/22 18:07:02', NextExecutionTime: '2019/11/22 18:17:49' , SuccessTimes: '1', FailTimes: '0', operation: 'operationC'} ,
        ] ;
      }
      if (this.tableCell.selectType === '会员销售/积分') {
        this.tableCell.bussTableSource = [
          {RecordNumber: '4', type: '会员销售/积分' , JobName: 'ods_crm_2ledger_pool' ,
            LastExecutionTime: '2019/11/22 15:27:11', NextExecutionTime: '2019/11/22 16:17:31' , SuccessTimes: '1', FailTimes: '0', operation: 'operationC'} ,
        ] ;
      }
      if (this.tableCell.selectType === '会员主档资料') {
        this.tableCell.bussTableSource = [
          {RecordNumber: '5', type: '会员主档资料' , JobName: 'ods_crm_store' ,
            LastExecutionTime: '2019/11/22 16:17:31', NextExecutionTime: '2019/11/22 16:40:36' , SuccessTimes: '2', FailTimes: '1', operation: 'operationC'} ,
          {RecordNumber: '6', type: '会员主档资料' , JobName: 'ods_crm_vipinfo' ,
            LastExecutionTime: '2019/11/22 14:58:57', NextExecutionTime: '2019/11/22 18:07:02' , SuccessTimes: '2', FailTimes: '0', operation: 'operationC'} ,
        ] ;
     }
    if (this.tableCell.selectType === '合同主档信息') {
      this.tableCell.bussTableSource = [
        {RecordNumber: '1', type: '合同主档信息' , JobName: 'ods_mall_contractinfo' ,
          LastExecutionTime: '1900/1/1 7:00:00', NextExecutionTime: '2019/11/22 14:45:13' , SuccessTimes: '0', FailTimes: '1', operation: 'operationC'} ,
      ] ;
    }
    if (this.tableCell.selectType === '全部'){
      this.tableCell.bussTableSource = [
        {RecordNumber: '0', type: '客流' , JobName: 'ods_mall_count' ,
          LastExecutionTime: '1900/1/1 7:00:00', NextExecutionTime: '2019/11/22 14:39:45' , SuccessTimes: '0', FailTimes: '0', operation: 'operationC'} ,
        {RecordNumber: '1', type: '合同主档信息' , JobName: 'ods_mall_contractinfo' ,
          LastExecutionTime: '1900/1/1 7:00:00', NextExecutionTime: '2019/11/22 14:45:13' , SuccessTimes: '0', FailTimes: '1', operation: 'operationC'} ,
        {RecordNumber: '4', type: '会员销售/积分' , JobName: 'ods_crm_2ledger_pool' ,
          LastExecutionTime: '2019/11/22 15:27:11', NextExecutionTime: '2019/11/22 16:17:31' , SuccessTimes: '1', FailTimes: '0', operation: 'operationC'} ,
        {RecordNumber: '5', type: '会员主档资料' , JobName: 'ods_crm_store' ,
          LastExecutionTime: '2019/11/22 16:17:31', NextExecutionTime: '2019/11/22 16:40:36' , SuccessTimes: '2', FailTimes: '1', operation: 'operationC'} ,
        {RecordNumber: '6', type: '会员主档资料' , JobName: 'ods_crm_vipinfo' ,
          LastExecutionTime: '2019/11/22 14:58:57', NextExecutionTime: '2019/11/22 18:07:02' , SuccessTimes: '2', FailTimes: '0', operation: 'operationC'} ,
        {RecordNumber: '7', type: '销售相关' , JobName: 'ods_mall_sales' ,
          LastExecutionTime: '2019/11/22 18:07:02', NextExecutionTime: '2019/11/22 18:17:49' , SuccessTimes: '1', FailTimes: '0', operation: 'operationC'} ,
      ];
    }
  }

  // 打开详情弹框
  openDetailTemplate(DetailTemplate , element){
      this.tableCell.JobName = element.jobname;
     if (!this.dialog.getDialogById('tempDetails')){
       this.dialog.open( DetailTemplate, {id: 'tempDetails',  width: '80%' , height: '80%'});
     }
  }


  // 任务执行时间图表
  SetTaskExecutionTimeChart(){
    this.zone.runOutsideAngular(() => {
      this.eChartsSource.TaskExecutionTimeChart = this.echarts.init(this.TaskExecutionTime.nativeElement);
    });
    const Option = {
      color: ['#00D4F9'],
      // backgroundColor: 'rgba(255,255,255,0.3)',
      title: {
        text: '{b|[}{a|  任务执行时间  }{b|]}',
        textStyle: {
          color: '#00D9F9',
          fontSize: 24,
          fontWeight: 400,
          rich: {
            a: {
              color: '#ffffff',
              lineHeight: 10,
              fontSize: 12,
            },
          }
        },
        left: 25,
        padding: [ 15 , 0, 10, 0],
      },
      tooltip: {
        show: true,
        trigger: 'axis',
        axisPointer: {
          type: 'cross',
          label: {
            backgroundColor: 'rgba(255,255,255,0)',
          }
        },
        position: ['50%', '20%'],
        formatter: function(p){
          const data = JSON.parse(p[0].seriesName)['data'];
          for ( let i = 0; i < data.length ; i++ ){
            if (p[0].axisValue === data[i].enddate) {
                return  '作业名称：' + data[i].jobname
                     + '</br>' + '作业开始时间：' +  data[i].enddate + '</br>'
                     + '作业执行耗时：' +  data[i].excutetime ;
            }
          }
        },
      },
      legend: {
        show: false
      },
      grid: {
        left: '15px',
        right: '15px',
        bottom: '25px',
        top: '55px',
        height: '65%',
        containLabel: false
      },
      xAxis: [
        {
          type: 'category',
          data: this.taskExecutionTimeDataS.valueX,
          axisLabel: {
            show: false,
            color: '#ffffff',
            fontSize: 14
          },
          axisTick: {
            show: false,
          },
          axisLine: {
            lineStyle: {
              color: '#2cdaff',
            }
          }
        }
      ],
      yAxis: [
        {
          type: 'value',
          splitLine: {
            show: false
          },
          axisLabel: {
            show: false,
            color: '#ffffff',
            fontSize: 14
          },
          axisTick: {
            show: false,
          },
          axisLine: {
            lineStyle: {
              color: '#2cdaff',
            }
          }
        }
      ],
      series: [
        {
          name: this.taskExecutionTimeDataS.allData,
          type: 'line',
          stack: 'total',
          areaStyle: {
            normal: {
              color: '#00D4F9',
              opacity: 0.1
            }
          },
          lineStyle: {
            normal: {
              opacity: 0.5,
              show: true
            }
          },
          markPoint: {
          /*  symbolSize: 35,
            data: [
              {type: 'max', name: ''}
            ],
            label: {
              fontStyle: {
                fontSize: 10,
              }
            },*/
          },
          symbol: 'circle',
          symbolSize: 6,
          data: this.taskExecutionTimeDataS.valueY
        }
      ]
    };
    this.zone.runOutsideAngular(() => {
      this.eChartsSource.TaskExecutionTimeChart.setOption(Option);
    });
  }

  // 任务完成率图表
  SetTaskCompletionRateChart(){
    this.zone.runOutsideAngular(() => {
      this.eChartsSource.TaskCompletionRateChart = this.echarts.init(this.TaskCompletionRate.nativeElement);
    });
    const option = {
      color: [ '#FF7500' , 'rgba(255,255,255,0)'],
      title: {
        text: '{b|[}{a|   任务完成率   }{b|]}',
        textStyle: {
          color: '#00D9F9',
          fontSize: 24,
          fontWeight: 400,
          rich: {
            a: {
              color: '#ffffff',
              fontSize: 12,
            },
          }
        },
        left: 25,
        padding: [ 15 , 0, 10, 0],
      },
      tooltip: {
        trigger: 'item',
        backgroundColor: '#333333',
        padding: [1, 2, 1, 2], // 设置框框的上下左右边距
        // position: ['40%', '55%'],
        formatter: function(params) {
          if (params.name === '完成'){
            return params.seriesName + '</br>' + params.name + '：' + params.value + ' (' + params.percent + '%)';
          }else {
            return params.seriesName + '</br>' + params.name  + '：' + params.value + '(' + params.percent + '%)';
          }
        }
      },
      series: [
        {
          name: '任务完成率',
          type: 'pie',
          hoverOffset: 2,
          center: ['50%', '59%'],
          radius: ['42%', '55%'],
          avoidLabelOverlap: false,
          label: {
            normal: {
              formatter: function(p){
                return   '{a|完成率}' +  '\r\r\n' + p.percent + '%' ;
              },
              show: true,
              position: 'center',
              color: '#FFFFFF',
              fontSize: 18,
              rich: {
                a: {
                  color: '#ffffff',
                  fontSize: 12,
                },
              }
            },
            emphasis: {
              show: true,
              textStyle: {
                fontSize: '12',
                fontWeight: 'bold'
              }
            }
          },
          labelLine: {
            normal: {
              lineStyle: {
                color: 'rgba(255, 255, 255, 0.3)',
              },
              smooth: 0.2,
              length: -80,
              length2: 10
            }
          },
          data: this.taskCompletionRateDataS.value
        }
      ]
    };
    this.zone.runOutsideAngular(() => {
      this.eChartsSource.TaskCompletionRateChart.setOption(option);
    });

  }

  // 任务类型占比图表
  SetTaskTypeProportionChart(){
    this.zone.runOutsideAngular(() => {
      this.eChartsSource.TaskTypeProportionChart = this.echarts.init(this.TaskTypeProportion.nativeElement);
    });

    const option = {
      color: [  '#4a90e2' , '#e04957' , '#91c7ae' , '#f5a623' , '#65d3ff' , '#ffe08b'],
      title: {
        text: '{b|[}{a|  任务类型占比  }{b|]}',
        textStyle: {
          color: '#00D9F9',
          fontSize: 24,
          fontWeight: 400,
          rich: {
            a: {
              color: '#ffffff',
              fontSize: 12,
            },
          }
        },
        left: 25,
        padding: [ 15 , 0, 10, 0],
      },
      tooltip: {
        trigger: 'item',
        backgroundColor: '#333333',
        formatter: '{a} <br/>{b}: {c} ',
        padding: [1, 2, 1, 2], // 设置框框的上下左右边距
        position: ['37%', '35%'],
      },
      series: [
        {
          name: '任务类型占比',
          type: 'pie',
          hoverOffset: 2,
          center: ['50%', '59%'],
          radius: ['42%', '55%'],
          avoidLabelOverlap: false,
          label: {
            normal: {
              show: true,
             // position: 'inside',
              // formatter: '{b}:{d}%',
              formatter: function(p){
                return   p.name  +  '\r\n' + p.percent + '%' ;
              },
              align: 'outside',
              fontSize: 12,
              verticalAlign: 'top',
              color: '#ffffff'
            },
            emphasis: {
              show: true,
              textStyle: {
                fontSize: '12',
                fontWeight: 'bold'
              }
            }
          },
          labelLine: {
            normal: {
              lineStyle: {
                color: 'rgba(255, 255, 255, 1)',
              },
               smooth: true,
               length: 10,
               length2: 10
            }
          },
          data: this.taskTypeProportionDataS.value
        }
      ]
    };
    this.zone.runOutsideAngular(() => {
      this.eChartsSource.TaskTypeProportionChart.setOption(option);
    });

  }

  // 任务数量图表
  TaskQuantityChart(){
    this.zone.runOutsideAngular(() => {
      this.eChartsSource.TaskQuantityChart = this.echarts.init(this.TaskQuantity.nativeElement);
    });
    const option = {
      color: ['#00D4F9'],
      title: {
        text: '{b|[}{a|    任务数量    }{b|]}',
        textStyle: {
          color: '#00D9F9',
          fontSize: 24,
          fontWeight: 400,
          rich: {
            a: {
              color: '#ffffff',
              lineHeight: 10,
              fontSize: 12,
            },
          }
        },
        left: 25,
        padding: [ 15 , 0, 10, 0],
      },
      tooltip: {
        trigger: 'item',
        backgroundColor: '#333333',
        formatter: '{b}<br />{a}: {c}',
        textStyle: {
          fontWeight : 500,
        }
      },

      grid: {
        left: '15px',
        right: '15px',
        bottom: '25px',
        top: '55px',
        height: '65%',
        containLabel: false
      },
      xAxis: [
        {
          type: 'category',
          data: this.taskQuantityDataS.title,
          show: false,
        }
      ],
      yAxis: [
        {
          type: 'value',
          show: false,
        }
      ],
      series: [
        {
          name: '任务数量',
          type: 'bar',
          emphasis: {
            itemStyle: {
              //   color : 'rgba(51 , 152 , 219, 0.6)'
              //   color : 'rgba(224 , 73 , 87, 1)'
              color: '#7DCEFF'
            }
          },
          label: {
            normal: {
              show: true,
              color: '#ffffff',
              position: 'insideTop',
              rotate: 90,
              fontSize: 10,
              formatter: function(params){
              //  console.log(params);
               /* if ( params.dataIndex % 2 === 0 ){
                  return '';
                }else  if (params.dataIndex % 9 === 0) {
                  return '';
                } else {
                  return params.value;
                }*/
                return params.name;
              },
            }
          },
          data: this.taskQuantityDataS.value
        }
      ]
    };

    this.zone.runOutsideAngular(() => {
      this.eChartsSource.TaskQuantityChart.setOption(option);
    });
  }


  MonitorChange(){
     console.log(this.tableCell.MonitorValue);
  }


  intiAllECharts(){
    this.zone.runOutsideAngular(() => {
      this.echarts = require('echarts');
    });

    window.addEventListener('resize', () => {
      if (this.eChartsSource.TaskExecutionTimeChart && !this.eChartsSource.TaskExecutionTimeChart.isDisposed()   ) {
        this.eChartsSource.TaskExecutionTimeChart.resize();
      }
      if (this.eChartsSource.TaskCompletionRateChart && !this.eChartsSource.TaskCompletionRateChart.isDisposed()   ) {
        this.eChartsSource.TaskCompletionRateChart.resize();
      }
      if (this.eChartsSource.TaskTypeProportionChart && !this.eChartsSource.TaskTypeProportionChart.isDisposed()   ) {
        this.eChartsSource.TaskTypeProportionChart.resize();
      }
      if (this.eChartsSource.TaskQuantityChart && !this.eChartsSource.TaskQuantityChart.isDisposed()   ) {
        this.eChartsSource.TaskQuantityChart.resize();
      }
    });
  }

  initECharts(){
    this.eChartsSource = new EChartSource();
  }



  ngOnDestroy(): void {
    if (this.eChartsSource.TaskExecutionTimeChart ){
      this.eChartsSource.TaskExecutionTimeChart .dispose();
    }
    if (this.eChartsSource.TaskCompletionRateChart ){
      this.eChartsSource.TaskCompletionRateChart .dispose();
    }
    if (this.eChartsSource.TaskTypeProportionChart ){
      this.eChartsSource.TaskTypeProportionChart .dispose();
    }
    if (this.eChartsSource.TaskQuantityChart ){
      this.eChartsSource.TaskQuantityChart .dispose();
    }
    this._unsubscribeAll.next();
    this._unsubscribeAll.complete();

  }

}

export class EChartSource {
  TaskExecutionTimeChart: any; // 任务完成时间
  TaskCompletionRateChart: any; // 任务完成率
  TaskTypeProportionChart: any; // 任务类型占比
  TaskQuantityChart: any; // 任务数量
}

// 任务完成时间
export class TaskExecutionTimeDataSource {
      valueX: any = [];
      valueY: any = [];
      allData: any = [];
}
// 任务完成率
export class TaskCompletionRateDataSource {
       value: any;
       allNum: number;
       Success: number;
       Fail: number;

}
// 任务类型占比
export class TaskTypeProportionDataSource {
       value: any = [];
}
// 任务数量
export class TaskQuantityDataSource {
   title: any = [];
   value: any = [];
}

// 表格相关
export class TableCell {
  MonitorValue: string; // 监控状态
  MonitorValueSource: any; // 监控状态选择框的数据
  selectType: any; // 选择分类
  selectTypeSource: any  = []; // 选择分类选择框的数据
  inputData: any = ''; // 输入作业名称
  bussTableSource: any;
  bfTableSource: any = [];
  bussTableCol: any;
  bussTableHer: any;
  JobName: string;
}


