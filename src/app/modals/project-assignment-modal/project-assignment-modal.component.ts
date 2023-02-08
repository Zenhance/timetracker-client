import { Component, OnInit, Input, Output, EventEmitter, ViewChild } from '@angular/core';
import { NgbActiveModal } from '@ng-bootstrap/ng-bootstrap';
import * as _ from 'lodash';

@Component({
  selector: 'tt-project-assignment-modal',
  templateUrl: './project-assignment-modal.component.html',
  styleUrls: ['./project-assignment-modal.component.css']
})
export class ProjectAssignmentModalComponent implements OnInit {
  @Input() public projectAssignmentModel: any;
  @Output() public assign: EventEmitter<any> = new EventEmitter<any>();

  constructor(public activeModal: NgbActiveModal) { }

  ngOnInit() {
    if (!this.projectAssignmentModel.availableTaskTitles) {
      this.projectAssignmentModel.availableTaskTitles = [];
    }
  }

  assignProjects(): void {
    this.assign.emit(true);
    this.activeModal.close();
  }

}
