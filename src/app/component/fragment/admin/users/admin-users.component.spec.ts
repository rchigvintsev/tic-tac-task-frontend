import {ComponentFixture, getTestBed, TestBed} from '@angular/core/testing';

import {of} from 'rxjs';

import {TestSupport} from '../../../../test/test-support';
import {AdminUsersComponent} from './admin-users.component';
import {User} from '../../../../model/user';
import {UserService} from '../../../../service/user.service';
import {ConfigService} from '../../../../service/config.service';
import {HTTP_RESPONSE_HANDLER} from '../../../../handler/http-response.handler';
import {DefaultHttpResponseHandler} from '../../../../handler/default-http-response.handler';

describe('AdminAreaComponent', () => {
  let users: User[];
  let component: AdminUsersComponent;
  let fixture: ComponentFixture<AdminUsersComponent>;
  let userService: UserService;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: TestSupport.IMPORTS,
      declarations: TestSupport.DECLARATIONS,
      providers: [
        {provide: ConfigService, useValue: {apiBaseUrl: 'https://backend.com'}},
        {provide: HTTP_RESPONSE_HANDLER, useClass: DefaultHttpResponseHandler}
      ]
    }).compileComponents();
  });

  beforeEach(() => {
    const injector = getTestBed();

    users = [];
    users[0] = new User().deserialize({id: 1, email: 'alice@mail.com', enabled: true, admin: true});
    users[1] = new User().deserialize({id: 2, email: 'bob@mail.com', enabled: false, admin: false});

    userService = injector.inject(UserService);
    spyOn(userService, 'getUserCount').and.returnValue(of(users.length));
    spyOn(userService, 'getUsers').and.returnValue(of(users))
    spyOn(userService, 'updateUser').and.callFake(u => of(u));

    fixture = TestBed.createComponent(AdminUsersComponent);
    component = fixture.componentInstance;
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should block user on block user button click', () => {
    const updatedUser = users[0].clone();
    updatedUser.enabled = false;

    component.onBlockUserButtonClick(users[0]);
    expect(userService.updateUser).toHaveBeenCalledWith(updatedUser);
  });

  it('should unblock user on unblock user button click', () => {
    const updatedUser = users[1].clone();
    updatedUser.enabled = true;

    component.onUnblockUserButtonClick(users[1]);
    expect(userService.updateUser).toHaveBeenCalledWith(updatedUser);
  });
});
