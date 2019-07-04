import {CUSTOM_ELEMENTS_SCHEMA} from '@angular/core';
import {async, ComponentFixture, TestBed} from '@angular/core/testing';
import {HttpClient} from '@angular/common/http';
import {HttpClientTestingModule} from '@angular/common/http/testing';
import {MAT_DIALOG_DATA, MatDialogRef} from '@angular/material/dialog';
import {By} from '@angular/platform-browser';

import {TranslateLoader, TranslateModule} from '@ngx-translate/core';

import {TranslateHttpLoaderFactory} from '../app.module';
import {ConfirmationDialogComponent} from './confirmation-dialog.component';

class MatDialogRefMock {
  // noinspection JSUnusedGlobalSymbols
  close() {
  }
}

describe('ConfirmationDialogComponent', () => {
  let component: ConfirmationDialogComponent;
  let fixture: ComponentFixture<ConfirmationDialogComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      imports: [
        HttpClientTestingModule,
        TranslateModule.forRoot({
          loader: {
            provide: TranslateLoader,
            useFactory: TranslateHttpLoaderFactory,
            deps: [HttpClient]
          }
        })
      ],
      declarations: [ConfirmationDialogComponent],
      schemas: [CUSTOM_ELEMENTS_SCHEMA],
      providers: [
        {provide: MatDialogRef, useClass: MatDialogRefMock},
        {provide: MAT_DIALOG_DATA, useValue: []}
      ]
    }).compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(ConfirmationDialogComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should return true when "Yes" button was clicked', () => {
    const matDialogRef = fixture.debugElement.injector.get(MatDialogRef);
    spyOn(matDialogRef, 'close');
    const yesButton = fixture.debugElement.query(By.css('#yes_button'));
    fixture.whenStable().then(() => {
      yesButton.nativeElement.click();
      fixture.detectChanges();
      expect(matDialogRef.close).toHaveBeenCalledWith(true);
    });
  });

  it('should return false when "No" button was clicked', () => {
    const matDialogRef = fixture.debugElement.injector.get(MatDialogRef);
    spyOn(matDialogRef, 'close');
    const noButton = fixture.debugElement.query(By.css('#no_button'));
    fixture.whenStable().then(() => {
      noButton.nativeElement.click();
      fixture.detectChanges();
      expect(matDialogRef.close).toHaveBeenCalledWith(false);
    });
  });
});
