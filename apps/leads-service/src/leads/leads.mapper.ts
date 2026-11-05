import type { ActivityDto, LeadDto, NoteDto, TaskDto } from "@app/contracts";
import type {
  Activity as ActivityRow,
  Lead as LeadRow,
  Note as NoteRow,
  Task as TaskRow,
} from "../../generated/client";

export type LeadWithRelations = LeadRow & {
  leadNotes: NoteRow[];
  activities: ActivityRow[];
  tasks: TaskRow[];
};

export const toNoteDto = (row: NoteRow): NoteDto => ({
  id: row.id,
  text: row.text,
  leadId: row.leadId,
  createdAt: row.createdAt.toISOString(),
  updatedAt: row.updatedAt.toISOString(),
});

export const toActivityDto = (row: ActivityRow): ActivityDto => ({
  id: row.id,
  leadId: row.leadId,
  createdAt: row.createdAt.toISOString(),
  type: row.type,
  description: row.description,
  userId: row.userId,
  userName: row.userName,
});

export const toTaskDto = (row: TaskRow): TaskDto => ({
  id: row.id,
  leadId: row.leadId,
  title: row.title,
  description: row.description ?? null,
  status: row.status,
  priority: row.priority,
  dueDate: row.dueDate.toISOString(),
  createdAt: row.createdAt.toISOString(),
  completedAt: row.completedAt?.toISOString() ?? null,
});

export const toLeadDto = (row: LeadWithRelations): LeadDto => ({
  id: row.id,
  name: row.name,
  email: row.email,
  phone: row.phone ?? null,
  company: row.company,
  status: row.status,
  tags: row.tags,
  notes: row.notes ?? null,
  source: row.source ?? null,
  createdAt: row.createdAt.toISOString(),
  statusChangedAt: row.statusChangedAt.toISOString(),
  closedAt: row.closedAt?.toISOString() ?? null,
  closedById: row.closedById,
  assignedToId: row.assignedToId,
  assignedToName: row.assignedToName ?? null,
  leadNotes: row.leadNotes.map(toNoteDto),
  activities: row.activities.map(toActivityDto),
  tasks: row.tasks.map(toTaskDto),
});
