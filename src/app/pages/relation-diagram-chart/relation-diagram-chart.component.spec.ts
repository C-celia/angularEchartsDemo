import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { RelationDiagramChartComponent } from './relation-diagram-chart.component';

describe('RelationDiagramChartComponent', () => {
  let component: RelationDiagramChartComponent;
  let fixture: ComponentFixture<RelationDiagramChartComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ RelationDiagramChartComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(RelationDiagramChartComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
