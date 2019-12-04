import {Component, Input, OnDestroy, OnInit, ViewChild} from '@angular/core';
import {MatTableDataSource, MatPaginator,  MatDialog } from '@angular/material';
import {OtherParameters} from '../../service/log-analysis/OtherParameters';
import {LogAnalysisService} from '../../service/log-analysis/log-analysis.service';
import {Subject} from 'rxjs/internal/Subject';
import {takeUntil} from 'rxjs/operators';

@Component({
  selector: 'app-detail-template',
  templateUrl: './detail-template.component.html',
  styleUrls: ['./detail-template.component.scss'] ,
})
export class DetailTemplateComponent implements OnInit   , OnDestroy{


  private _unsubscribeAll: Subject<any> = new Subject();
  @ViewChild(MatPaginator, {static: true}) paginator: MatPaginator;
  tableCell: TableCell;

   @Input()
   jobName: string;
    expandedElement: EleEntity | null;
  constructor(
   // private snackBar: MatSnackBar,
    public dialog: MatDialog,
    private logAnalysisService: LogAnalysisService,
  ) { }

  ngOnInit() {
     this.initTablePram();
     this.initTableData();
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

  openDialog(DetailMatDialog , element){
     this.tableCell.jobDetail = element.log_field.replace(/<br>/g,'\n');
    if (!this.dialog.getDialogById('DetailMatDialogs')){
      this.dialog.open( DetailMatDialog, {id: 'DetailMatDialogs',  width: '60%' , height: '70%'});
    }
  }

  initTableData() {
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
    this.logAnalysisService.getTableData(param).pipe(takeUntil(this._unsubscribeAll)).subscribe(res => {

        const errorCode = res['header'].errCode;
        if (errorCode === '0') {
          const data = res['data'];
          const en: EleEntity[] = data;
          for (let i = 0; i < data.length; i++) {
            this.tableCell.selectIDSource[i] = {value: data[i]['id_job'], name: data[i]['id_job']};
          }
          this.tableCell.bussTableSource.data = en;
          this.paginator.length = this.tableCell.bussTableSource.data.length;
          this.tableCell.bussTableSource.paginator = this.paginator;
        } else {
         // this.snackBar.open(res['header'].errMsg, 'X');
        }

      },
      error1 => {
        // this.snackBar.open('获取详情出错' + error1.message, 'X');
      });


  }
  ngOnDestroy(): void {
    this._unsubscribeAll.next();
    this._unsubscribeAll.complete();

  }

}

export class TableCell {
  bussTableSource = new MatTableDataSource;
  bussTableCol: any = [];
  bussTableHer: any = [];
  selectID: any; // 选择分类
  selectIDSource: any  = []; // 选择分类选择框的数据
  jobDetail: any; // 当前详情数据
}

export class EleEntity {
  id_job: string;
  jobname: string;
  enddate: string;
  logdate: string;
  status: string;
  log_field: string;
}

export interface DialogData {
  name: string;
}
