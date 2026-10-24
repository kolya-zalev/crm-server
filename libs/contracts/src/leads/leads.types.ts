
import type { Actor } from "../actor";
import type { UserRef } from "../users/users.types";
import type { leadsMessages } from "./messages";
import type { LeadStatus } from "./lead-status.constants";
import type { EmployeeAnalytics, LeadAnalytics } from "./analytics.types";


export type NoteDto = {
  id: string;
  leadId: string;
  text: string;
  createdAt: string;
  updatedAt: string;
};

export type ActivityDto = {
  id: string;
  leadId: string;
  type: string;
  description: string;
  createdAt: string;
  userId: string | null;
  userName: string;
};

export type TaskStatus = "pending" | "completed";
export type TaskPriority = "low" | "medium" | "high";

export type TaskDto = {
  id: string;
  leadId: string;
  title: string;
  description: string | null;
  status: string;
  priority: string;
  dueDate: string;
  createdAt: string;
  completedAt: string | null;
};

export type LeadDto = {
  id: string;
  name: string;
  email: string;
  phone: string | null;
  company: string;
  status: string;
  tags: string[];
  notes: string | null;
  source: string | null;
  createdAt: string;
  statusChangedAt: string;
  closedAt: string | null;
  closedById: string | null;
  assignedToId: string | null;
  assignedToName: string | null;
  leadNotes: NoteDto[];
  activities: ActivityDto[];
  tasks: TaskDto[];
};


export type CreateLeadData = {
  name: string;
  email: string;
  phone?: string;
  company: string;
  status: LeadStatus;
  tags: string[];
  notes?: string;
  source?: string;
};

export type UpdateLeadData = Partial<CreateLeadData> & {
  assignedToId?: string | null;
};

export type CreateTaskData = {
  title: string;
  description?: string;
  priority: TaskPriority;
  dueDate: string;
};

export type UpdateTaskData = Partial<CreateTaskData> & {
  status?: TaskStatus;
  completedAt?: string;
};


export type LeadChanges = {
  assignedChanged: boolean;
  nextAssignee: UserRef | null | undefined;
  statusChanged: boolean;
  closing: boolean;
  newStatus?: string;
};

export type FindLeadPayload = { id: string };
export type CreateLeadPayload = { actor: Actor; data: CreateLeadData };
export type UpdateLeadPayload = {
  actor: Actor;
  id: string;
  data: UpdateLeadData;
  assignee: UserRef | null | undefined;
};
export type UpdateLeadResponse = { lead: LeadDto; changes: LeadChanges };
export type RemoveLeadPayload = { id: string };

export type LeadIdPayload = { leadId: string };
export type CreateNotePayload = { actor: Actor; leadId: string; text: string };
export type RemoveNotePayload = { actor: Actor; leadId: string; noteId: string };

export type CreateTaskPayload = {
  actor: Actor;
  leadId: string;
  data: CreateTaskData;
};
export type UpdateTaskPayload = { taskId: string; data: UpdateTaskData };
export type RemoveTaskPayload = { taskId: string };
// leadName нужен BFF для текста уведомления
export type TaskWithLeadName = { task: TaskDto; leadName: string };

export type AnalyticsLeadsPayload = { users: UserRef[] };
export type AnalyticsEmployeesPayload = {
  from: string;
  to: string;
  users: UserRef[];
};

export type OkResponse = { ok: true };


type Empty = Record<string, never>;

export type LeadsContract = {
  [leadsMessages.leadsFindAll]: { payload: Empty; response: LeadDto[] };
  [leadsMessages.leadsFindOne]: { payload: FindLeadPayload; response: LeadDto };
  [leadsMessages.leadsCreate]: { payload: CreateLeadPayload; response: LeadDto };
  [leadsMessages.leadsUpdate]: {
    payload: UpdateLeadPayload;
    response: UpdateLeadResponse;
  };
  [leadsMessages.leadsRemove]: {
    payload: RemoveLeadPayload;
    response: OkResponse;
  };

  [leadsMessages.notesFindByLead]: {
    payload: LeadIdPayload;
    response: NoteDto[];
  };
  [leadsMessages.notesCreate]: { payload: CreateNotePayload; response: NoteDto };
  [leadsMessages.notesRemove]: {
    payload: RemoveNotePayload;
    response: OkResponse;
  };

  [leadsMessages.tasksFindAll]: { payload: Empty; response: TaskDto[] };
  [leadsMessages.tasksFindByLead]: {
    payload: LeadIdPayload;
    response: TaskDto[];
  };
  [leadsMessages.tasksCreate]: {
    payload: CreateTaskPayload;
    response: TaskWithLeadName;
  };
  [leadsMessages.tasksUpdate]: { payload: UpdateTaskPayload; response: TaskDto };
  [leadsMessages.tasksRemove]: {
    payload: RemoveTaskPayload;
    response: TaskWithLeadName;
  };

  [leadsMessages.activitiesFindByLead]: {
    payload: LeadIdPayload;
    response: ActivityDto[];
  };

  [leadsMessages.analyticsLeads]: {
    payload: AnalyticsLeadsPayload;
    response: LeadAnalytics;
  };
  [leadsMessages.analyticsEmployees]: {
    payload: AnalyticsEmployeesPayload;
    response: EmployeeAnalytics;
  };
};
