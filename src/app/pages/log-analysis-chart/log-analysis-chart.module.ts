import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import {LogAnalysisChartComponent} from './log-analysis-chart.component';
import {RouterModule, Routes} from '@angular/router';
import {
  MatButtonModule,
  MatDialogModule, MatFormFieldModule,
  MatIconModule,
  MatInputModule, MatPaginatorModule,
  MatSelectModule,
  MatTableModule, MatTooltipModule
} from '@angular/material';
import {DetailTemplateModule} from '../detail-template/detail-template.module';

const routes: Routes = [
    {
        path: 'logChart',
        component: LogAnalysisChartComponent,
    }
];


@NgModule({
  declarations: [LogAnalysisChartComponent],
/*
  entryComponents: [DetailTemplateComponent],
*/
  imports: [
      RouterModule.forChild(routes),
      CommonModule,
    MatIconModule,
    MatButtonModule,
    MatSelectModule,
    MatFormFieldModule,
    MatInputModule,
    MatIconModule,
    MatButtonModule,
    MatDialogModule,
    MatTableModule,
    MatPaginatorModule,
    MatTooltipModule,
    DetailTemplateModule,
  ]
})
export class LogAnalysisChartModule { }
