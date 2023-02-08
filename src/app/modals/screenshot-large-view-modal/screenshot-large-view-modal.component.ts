import { Component, OnInit, Input, Output, EventEmitter, ViewChild } from '@angular/core';
import { NgbActiveModal, NgbTypeahead } from '@ng-bootstrap/ng-bootstrap';
import { ApiConfig } from 'src/app/app.util';
import { Subject, Observable, merge } from 'rxjs';
import { debounceTime, distinctUntilChanged, filter, map } from 'rxjs/operators';
import { environment } from 'src/environments/environment';

@Component({
  selector: 'tt-screenshot-large-view-modal',
  templateUrl: './screenshot-large-view-modal.component.html',
  styleUrls: ['./screenshot-large-view-modal.component.css']
})
export class ScreenshotLargeViewModalComponent implements OnInit {
  public jobTitleTxtValue: string;
  @Input() screenshotData: any;
  @Input() availableTaskTitles: any;
  @Output() public update: EventEmitter<any> = new EventEmitter<any>();

  @ViewChild('instance', { static: false }) instance: NgbTypeahead;
  focus$ = new Subject<string>();
  click$ = new Subject<string>();

  search = (text$: Observable<string>) => {
    const debouncedText$ = text$.pipe(debounceTime(200), distinctUntilChanged());
    const clicksWithClosedPopup$ = this.click$.pipe(filter(() => !this.instance.isPopupOpen()));
    const inputFocus$ = this.focus$;

    return merge(debouncedText$, inputFocus$, clicksWithClosedPopup$).pipe(
      map(term => (term === '' ? this.availableTaskTitles
        : this.availableTaskTitles.filter(v => v.toLowerCase().indexOf(term.toLowerCase()) > -1)).slice(0, 10))
    );
  }

  constructor(public activeModal: NgbActiveModal) { }

  ngOnInit() {
    if (!this.availableTaskTitles) {
      this.availableTaskTitles = [];
    }

    this.jobTitleTxtValue = this.screenshotData.jobTitle;
  }

  showScreenshot(): string {
    // tslint:disable-next-line: max-line-length
    return this.screenshotData.showImage ? environment.apiRootUrl + '/' + this.screenshotData.screenshotUrl : environment.apiRootUrl + '/img/placeholder.jpg';
  }

  closeModal(): void {
    if (this.jobTitleTxtValue !== this.screenshotData.jobTitle) {
      this.screenshotData.jobTitle = this.jobTitleTxtValue;
      this.update.emit(true);
    } else {
      this.update.emit(false);
    }

    this.jobTitleTxtValue = '';
    this.activeModal.close();
  }

}
