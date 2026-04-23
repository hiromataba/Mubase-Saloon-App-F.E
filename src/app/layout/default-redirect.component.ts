import { Component, inject, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { AuthService } from '../core/auth/auth.service';

@Component({
  standalone: true,
  template: '',
})
export class DefaultRedirectComponent implements OnInit {
  private readonly auth = inject(AuthService);
  private readonly router = inject(Router);

  ngOnInit(): void {
    void this.router.navigateByUrl(this.auth.homePath(), { replaceUrl: true });
  }
}
