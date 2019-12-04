import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import {DetailTemplateComponent} from './detail-template.component';
import {
  MatButtonModule,
  MatFormFieldModule,
  MatIconModule,
  MatInputModule,
  MatSelectModule,
  MatTableModule,
  MatPaginatorModule,
  MatPaginatorIntl, MatDialogModule, MatTooltipModule
} from '@angular/material';
import {getDutchPaginatorIntl} from '../../service/util/my-paginator';



@NgModule({
  declarations: [DetailTemplateComponent],
  exports: [DetailTemplateComponent],
  imports: [
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
  ],
  providers: [
    { provide: MatPaginatorIntl, useValue: getDutchPaginatorIntl() }
  ]
})
export class DetailTemplateModule { }
