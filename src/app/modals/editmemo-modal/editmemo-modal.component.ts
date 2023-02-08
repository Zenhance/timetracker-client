import { Component, OnInit, Input, Output, EventEmitter, ViewChild } from '@angular/core';
import { NgbActiveModal, NgbTypeahead } from '@ng-bootstrap/ng-bootstrap';
import { Subject, Observable, merge } from 'rxjs';
import { debounceTime, distinctUntilChanged, filter, map } from 'rxjs/operators';

@Component({
  selector: 'tt-editmemo-modal',
  templateUrl: './editmemo-modal.component.html',
  styleUrls: ['./editmemo-modal.component.css']
})
export class EditmemoModalComponent implements OnInit {
  @Input() public editMemoModel: any;
  @Output() public update: EventEmitter<any> = new EventEmitter<any>();

  @ViewChild('instance', {static: true}) instance: NgbTypeahead;
  focus$ = new Subject<string>();
  click$ = new Subject<string>();

  search = (text$: Observable<string>) => {
    const debouncedText$ = text$.pipe(debounceTime(200), distinctUntilChanged());
    const clicksWithClosedPopup$ = this.click$.pipe(filter(() => !this.instance.isPopupOpen()));
    const inputFocus$ = this.focus$;

    return merge(debouncedText$, inputFocus$, clicksWithClosedPopup$).pipe(
      map(term => (term === '' ? this.editMemoModel.availableTaskTitles
        : this.editMemoModel.availableTaskTitles.filter(v => v.toLowerCase().indexOf(term.toLowerCase()) > -1)).slice(0, 10))
    );
  }

  constructor(public activeModal: NgbActiveModal) { }

  ngOnInit() {
    if (!this.editMemoModel.availableTaskTitles) {
      this.editMemoModel.availableTaskTitles = [];
    }
  }

  updateTitle(): void {
    this.update.emit(true);
    this.activeModal.close();
  }

}
