import { BrowserModule } from '@angular/platform-browser';
import { NgModule } from '@angular/core';

import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';
import {LogAnalysisChartModule} from './pages/log-analysis-chart/log-analysis-chart.module';
import {RelationDiagramChartModule} from './pages/relation-diagram-chart/relation-diagram-chart.module';
import {HttpClientModule} from '@angular/common/http';
import {CommonModule, HashLocationStrategy, LocationStrategy} from '@angular/common';
import {NoopAnimationsModule} from '@angular/platform-browser/animations';
import {MAT_DIALOG_DEFAULT_OPTIONS, MAT_SNACK_BAR_DEFAULT_OPTIONS} from '@angular/material';
import {LogAnalysisService} from './service/log-analysis/log-analysis.service';
import 'hammerjs';
@NgModule({
  declarations: [
    AppComponent
  ],
  imports: [
    CommonModule,
    BrowserModule,
    NoopAnimationsModule,
    AppRoutingModule,
    HttpClientModule,
    LogAnalysisChartModule,
    RelationDiagramChartModule,
  ],
  providers: [ LogAnalysisService,
    {provide: LocationStrategy, useClass: HashLocationStrategy}, // 哈希地址策略
    {
      // 提示框配置
      provide: MAT_SNACK_BAR_DEFAULT_OPTIONS,
      useValue: {duration: 3500, verticalPosition: 'top', panelClass: ['snack-custom']}
    },
    {
      provide: MAT_DIALOG_DEFAULT_OPTIONS,
      useValue: {hasBackdrop: true, autoFocus: true}
    }],
  bootstrap: [AppComponent]
})
export class AppModule { }
