export const PRIORITY_META = {
  ok: {
    label: "OK",
    tone: "success"
  },
  warn: {
    label: "Advarsel",
    tone: "warning"
  },
  crit: {
    label: "Kritisk",
    tone: "danger"
  }
};

export const EMPLOYEE_STATUS_META = {
  available: {
    label: "Ledig",
    tone: "success"
  },
  busy: {
    label: "Optaget",
    tone: "warning"
  },
  break: {
    label: "Pause",
    tone: "neutral"
  }
};

export const TASK_STATUS_META = {
  new: {
    label: "Ikke startet",
    tone: "neutral"
  },
  assigned: {
    label: "Tildelt",
    tone: "info"
  },
  in_progress: {
    label: "I gang",
    tone: "warning"
  },
  help_needed: {
    label: "Afventer hjælp",
    tone: "danger"
  },
  done: {
    label: "Færdig",
    tone: "success"
  },
  cancelled: {
    label: "Annulleret",
    tone: "neutral"
  }
};

export const CONNECTIVITY_META = {
  online: {
    label: "Online",
    tone: "success"
  },
  degraded: {
    label: "Degraded",
    tone: "warning"
  },
  offline: {
    label: "Offline",
    tone: "danger"
  }
};

export const HELP_REASONS = [
  "Mangler hænder",
  "Udstyr",
  "Afklaring",
  "Akut patient"
];

export const ADMIN_REASONS = [
  "Kapacitetsændring",
  "Fejltildeling",
  "Afdelingsoverløb",
  "Kritisk omprioritering"
];

export const DAY_PROFILES = {
  normal: {
    label: "Normal dag",
    minTasks: 10
  },
  monday: {
    label: "Mandag (travl)",
    minTasks: 16
  },
  wednesday: {
    label: "Onsdag (travl)",
    minTasks: 15
  },
  friday: {
    label: "Fredag (travl)",
    minTasks: 17
  }
};
