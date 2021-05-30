import {ComponentFixture, getTestBed, TestBed} from '@angular/core/testing';

import {AccountComponent} from './account.component';
import {TestSupport} from '../../test/test-support';
import {AuthenticationService} from '../../service/authentication.service';
import {User} from '../../model/user';

describe('AccountComponent', () => {
  let component: AccountComponent;
  let fixture: ComponentFixture<AccountComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: TestSupport.IMPORTS,
      declarations: TestSupport.DECLARATIONS,
    }).compileComponents();
  });

  beforeEach(() => {
    const injector = getTestBed();

    const user = new User();
    user.id = 1;
    user.email = 'john.doe@mail.com';
    user.fullName = 'John Doe';
    user.profilePictureUrl = 'https://example.com/avatar.png';
    user.validUntilSeconds = Math.round(Date.now() / 1000) + 60 * 60;

    const authenticationService = injector.inject(AuthenticationService);
    authenticationService.setPrincipal(user);

    fixture = TestBed.createComponent(AccountComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
