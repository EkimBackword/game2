import { Component, OnInit } from '@angular/core';
import { FormGroup, FormControl, Validators } from '@angular/forms';
import { UserService } from '../../share-services';

@Component({
  selector: 'app-sign-in-page',
  templateUrl: './sign-in-page.component.html',
  styleUrls: ['./sign-in-page.component.scss']
})
export class SignInPageComponent implements OnInit {

  public isBusy = false;
  public form: FormGroup;

  constructor(
    private userService: UserService
  ) {
    this.initForm();
  }

  ngOnInit() {
  }

  async submit() {
    try {
      this.isBusy = true;
      await this.userService.create(this.form.controls.name.value);
    } finally {
      this.isBusy = false;
    }
  }

  private initForm() {
    const controls: any = {
      name: new FormControl('', [
        Validators.minLength(4),
        Validators.maxLength(512),
      ]),
    };
    this.form = new FormGroup(controls);
  }

}
