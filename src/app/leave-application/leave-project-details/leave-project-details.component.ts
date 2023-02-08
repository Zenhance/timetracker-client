import {Component, EventEmitter, Input, OnInit, Output} from '@angular/core';
import {FormArray, FormBuilder} from '@angular/forms';
import * as _ from 'lodash';
import {WorkdiaryService} from '../../services/workdiary.service';
import {LeaveApplicationService} from '../../services/leave-application.service';

export interface ValidationModel {
  valid: boolean;
  message: string;
}

@Component({
  selector: 'tt-leave-project-details',
  templateUrl: './leave-project-details.component.html',
  styleUrls: ['./leave-project-details.component.css']
})
export class LeaveProjectDetailsComponent implements OnInit {
  projectDetailsForm: any;
  userList = [];
  @Input() userName: string;
  @Input() editable: boolean;
  @Input() projectList;
  @Input() projectDetailsData;
  // tslint:disable-next-line:no-output-native
  @Output()
  component: EventEmitter<LeaveProjectDetailsComponent> = new EventEmitter<LeaveProjectDetailsComponent>();
  assignedProjects: any;

  constructor(private fb: FormBuilder,
              private leaveApplicationService: LeaveApplicationService,
              private workDiaryService: WorkdiaryService) { }

  ngOnInit() {
    this.createProjectDetailsFormArray();
    if (this.editable === false) {
      this.loadProjectDetailsFormArray();
    }
    this.loadAssignedProjects();
    this.loadUserList();
    this.component.emit(this);
  }

  private createProjectDetailsFormArray() {
    this.projectDetailsForm = this.fb.group({
      projectDetails: this.fb.array([this.createForm()])
    });
  }

  private loadProjectDetailsFormArray() {
    const formArray = new FormArray([]);
    this.projectDetailsData.forEach(data => {
      formArray.push(this.fb.group({
        id: data.id,
        project: data.project,
        responsibility: data.responsibility,
        substitute: data.substitute,
        substituteName: data.substituteName,
        substituteApproval: data.substituteApproval,
        projectManager: data.projectManager,
        projectManagerApproval: data.projectManagerApproval,
        projectManagerName: data.projectManagerName
      }));
    });
    this.projectDetailsForm.setControl('projectDetails', formArray);
  }

  private createForm() {
    return this.fb.group({
      project: [''],
      responsibility: [''],
      substitute: [''],
      substituteApproval: [false],
      projectManager: [''],
      projectManagerApproval: [false]
    });
  }
  get formArray() {
    return this.projectDetailsForm.get('projectDetails') as FormArray;
  }

  onAddRow() {
    this.formArray.push(this.createForm());
  }

  onDeleteRow(index) {
    this.formArray.removeAt(index);
  }
  getProjectDetailsForm() {
    return this.projectDetailsForm.value;
  }

  getValidation() {
    const validation: ValidationModel = {valid: true, message: ''};
    if (this.getProjectDetailsForm().projectDetails.length === 0) {
      validation.valid = false;
      validation.message = 'Please enter at least one project';
      return validation;
    } else {
      this.getProjectDetailsForm().projectDetails.forEach(item => {
        if (item.project === '') {
          validation.valid = false;
          validation.message = 'Please Select Project Name';
        } else if ( item.responsibility.trim().length === 0 ) {
          validation.valid = false;
          validation.message = 'Please fill up responsibility field';
        } else if (item.substitute === '') {
          validation.valid = false;
          validation.message = 'Please select an substitute';
        } else if (item.projectManager === '') {
          validation.valid = false;
          validation.message = 'No project manager selected';
        } else {
          validation.valid = true;
        }
        if (!validation.valid) {
          return validation;
        }
      });
      return validation;
    }

  }

  private loadAssignedProjects() {
    this.workDiaryService.getAssignedProjects().subscribe(projectList => {
      this.assignedProjects = _.cloneDeep(projectList);
    });
  }

  private loadUserList() {
    this.leaveApplicationService.getAllUsers().subscribe(res => {
      this.userList = res;
      // Is this filtering correct in application logic sense.
      this.userList = this.userList.filter(u => u.userName.toLowerCase() !== this.userName.toLowerCase());
      this.userList.sort((a, b) => (a.name.toLowerCase() > b.name.toLowerCase()) ? 1 : -1);
    });
  }

  getResubmittedDetails() {
    return this.getProjectDetailsForm().projectDetails;
  }

  getProjectName(projectId: any) {
    const projects = this.projectList.filter(p => p.projectId.toString() === projectId);
    return projects[0].name;
  }
}
