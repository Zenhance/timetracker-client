import { Component, OnInit, Output, EventEmitter, Input} from '@angular/core';
import { NgbActiveModal } from '@ng-bootstrap/ng-bootstrap';

@Component({
  selector: 'tt-confirmation-modal',
  templateUrl: './confirmation-modal.component.html',
  styleUrls: ['./confirmation-modal.component.css']
})
export class ConfirmationModalComponent implements OnInit {
  @Input() public modalData: any;
  @Output() public delete: EventEmitter<any> = new EventEmitter<any>();

  constructor(public activeModal: NgbActiveModal) {}

  ngOnInit() {}

  removeSlotConfirm(): void {
    this.delete.emit(true);
    this.activeModal.close('Close click');
  }

}
