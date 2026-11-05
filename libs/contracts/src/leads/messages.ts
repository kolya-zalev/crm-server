
export const leadsMessages = {
  leadsFindAll: "leads.findAll",
  leadsFindOne: "leads.findOne",
  leadsCreate: "leads.create",
  leadsUpdate: "leads.update",
  leadsRemove: "leads.remove",

  notesFindByLead: "notes.findByLead",
  notesCreate: "notes.create",
  notesRemove: "notes.remove",

  tasksFindAll: "tasks.findAll",
  tasksFindByLead: "tasks.findByLead",
  tasksCreate: "tasks.create",
  tasksUpdate: "tasks.update",
  tasksRemove: "tasks.remove",

  activitiesFindByLead: "activities.findByLead",

  analyticsLeads: "analytics.leads",
  analyticsEmployees: "analytics.employees",
} as const;

export type LeadsMessage = (typeof leadsMessages)[keyof typeof leadsMessages];
