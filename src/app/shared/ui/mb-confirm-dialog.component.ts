import { Component, computed, inject, input, output } from '@angular/core';
import { I18nService } from '../../core/locale/i18n.service';
import { MbButtonComponent } from './mb-button.component';
import { MbModalComponent } from './mb-modal.component';

@Component({
  selector: 'mb-confirm-dialog',
  standalone: true,
  imports: [MbModalComponent, MbButtonComponent],
  template: `
    <mb-modal
      [open]="open()"
      [title]="resolvedTitle()"
      [description]="message()"
      size="md"
      [footer]="true"
      (backdropClose)="cancel.emit()"
      (closeClick)="cancel.emit()"
    >
      <p class="text-sm font-normal leading-relaxed text-mb-text-secondary">{{ detail() }}</p>
      <div class="mb-modal-footer-actions flex flex-wrap justify-end gap-3 pt-1">
        <mb-btn variant="ghost" type="button" (click)="cancel.emit()">{{ resolvedCancel() }}</mb-btn>
        <mb-btn [variant]="danger() ? 'danger' : 'primary'" type="button" (click)="confirm.emit()">
          {{ resolvedConfirm() }}
        </mb-btn>
      </div>
    </mb-modal>
  `,
})
export class MbConfirmDialogComponent {
  private readonly i18n = inject(I18nService);

  readonly open = input(false);
  readonly title = input('');
  readonly message = input('');
  readonly detail = input('');
  readonly confirmLabel = input('');
  readonly cancelLabel = input('');
  readonly danger = input(false);

  readonly resolvedTitle = computed(() => this.title().trim() || this.i18n.t('common.confirm'));
  readonly resolvedConfirm = computed(() => this.confirmLabel().trim() || this.i18n.t('common.confirm'));
  readonly resolvedCancel = computed(() => this.cancelLabel().trim() || this.i18n.t('common.cancel'));

  readonly confirm = output<void>();
  readonly cancel = output<void>();
}
