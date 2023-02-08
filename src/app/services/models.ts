export class ProjectAssignment {
  public date?: string;
  public assignments?: AssignmentModel[];
}

export class AssignmentModel {
  public projectId?: string;
  public userId?: string;
  public taskDescription?: string;
}
