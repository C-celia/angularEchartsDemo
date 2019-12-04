import { TestBed } from '@angular/core/testing';

import { LogAnalysisService } from './log-analysis.service';

describe('LogAnalysisService', () => {
  beforeEach(() => TestBed.configureTestingModule({}));

  it('should be created', () => {
    const service: LogAnalysisService = TestBed.get(LogAnalysisService);
    expect(service).toBeTruthy();
  });
});
