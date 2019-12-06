import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import {RelationDiagramChartComponent} from './relation-diagram-chart.component';
import {RouterModule} from '@angular/router';
import {
  MatSelectModule, MatFormFieldModule, MatSnackBarModule,
  MatInputModule, MatIconModule, MatButtonModule, MatTableModule, MatDialogModule, MatTooltipModule
} from '@angular/material';
import {DetailTemplateModule} from '../detail-template/detail-template.module';


@NgModule({
  declarations: [RelationDiagramChartComponent],
  imports: [
    CommonModule,
    MatSelectModule,
    MatFormFieldModule,
    MatInputModule,
    MatIconModule,
    MatButtonModule,
    MatTableModule,
    MatDialogModule,
    MatSnackBarModule,
    MatTooltipModule,
    DetailTemplateModule,
    RouterModule.forChild([{path: 'Relation/:id', component: RelationDiagramChartComponent}]),
  ],
})
export class RelationDiagramChartModule { }
