import { Component, input, output } from '@angular/core';
import { MbButtonComponent } from './mb-button.component';
import { MbModalComponent } from './mb-modal.component';

@Component({
  selector: 'mb-confirm-dialog',
  standalone: true,
  imports: [MbModalComponent, MbButtonComponent],
  template: `
    <mb-modal
      [open]="open()"
      [title]="title()"
      [description]="message()"
      size="md"
      [footer]="true"
      (backdropClose)="cancel.emit()"
      (closeClick)="cancel.emit()"
    >
      <p class="text-sm font-normal leading-relaxed text-mb-text-secondary">{{ detail() }}</p>
      <div class="mb-modal-footer-actions flex flex-wrap justify-end gap-3 pt-1">
        <mb-btn variant="ghost" type="button" (click)="cancel.emit()">{{ cancelLabel() }}</mb-btn>
        <mb-btn [variant]="danger() ? 'danger' : 'primary'" type="button" (click)="confirm.emit()">
          {{ confirmLabel() }}
        </mb-btn>
      </div>
    </mb-modal>
  `,
})
export class MbConfirmDialogComponent {
  readonly open = input(false);
  readonly title = input('Confirm');
  readonly message = input('');
  readonly detail = input('');
  readonly confirmLabel = input('Confirm');
  readonly cancelLabel = input('Cancel');
  readonly danger = input(false);

  readonly confirm = output<void>();
  readonly cancel = output<void>();
}
