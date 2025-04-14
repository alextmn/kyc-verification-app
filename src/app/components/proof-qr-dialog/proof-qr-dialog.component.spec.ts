import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ProofQrDialogComponent } from './proof-qr-dialog.component';

describe('ProofQrDialogComponent', () => {
  let component: ProofQrDialogComponent;
  let fixture: ComponentFixture<ProofQrDialogComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [ProofQrDialogComponent]
    });
    fixture = TestBed.createComponent(ProofQrDialogComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
