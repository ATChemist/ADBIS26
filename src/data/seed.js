function minutesAgo(minutes) {
  return new Date(Date.now() - minutes * 60 * 1000).toISOString();
}

function minutesFromNow(minutes) {
  return new Date(Date.now() + minutes * 60 * 1000).toISOString();
}

export function createSeedData() {
  const departments = [
    { id: "dep-akut", name: "Akutmodtagelsen" },
    { id: "dep-kardio", name: "Kardiologi" },
    { id: "dep-kir", name: "Kirurgisk" },
    { id: "dep-onko", name: "Onkologi" },
    { id: "dep-lab", name: "Prøvetagning" }
  ];

  const employees = [
    {
      id: "emp-1",
      name: "Camilla Nørgaard",
      role: "Prøvetager",
      status: "available",
      lastActiveAt: minutesAgo(3),
      assignedTaskIds: ["task-102"]
    },
    {
      id: "emp-2",
      name: "Jonas Madsen",
      role: "Prøvetager",
      status: "busy",
      lastActiveAt: minutesAgo(1),
      assignedTaskIds: ["task-103"]
    },
    {
      id: "emp-3",
      name: "Lina Pedersen",
      role: "Prøvetager",
      status: "busy",
      lastActiveAt: minutesAgo(2),
      assignedTaskIds: ["task-104"]
    },
    {
      id: "emp-4",
      name: "Ahmed Saleh",
      role: "Bioanalytiker",
      status: "available",
      lastActiveAt: minutesAgo(4),
      assignedTaskIds: ["task-106"]
    },
    {
      id: "emp-5",
      name: "Sofia Møller",
      role: "Prøvetager",
      status: "break",
      lastActiveAt: minutesAgo(18),
      assignedTaskIds: []
    },
    {
      id: "emp-6",
      name: "Mads Frandsen",
      role: "Prøvetager",
      status: "available",
      lastActiveAt: minutesAgo(5),
      assignedTaskIds: []
    }
  ];

  const tasks = [
    {
      id: "task-101",
      title: "Hver 5. patient kontrol",
      department: "dep-lab",
      priority: "warn",
      status: "new",
      assignedTo: null,
      assignedAt: null,
      startedAt: null,
      completedAt: null,
      createdAt: minutesAgo(22),
      dueAt: minutesFromNow(20)
    },
    {
      id: "task-102",
      title: "Patient 14 · Rutine blodprøve",
      department: "dep-kardio",
      priority: "ok",
      status: "assigned",
      assignedTo: "emp-1",
      assignedAt: minutesAgo(5),
      startedAt: null,
      completedAt: null,
      createdAt: minutesAgo(7),
      dueAt: minutesFromNow(18)
    },
    {
      id: "task-103",
      title: "Patient 32 · Akut prøve",
      department: "dep-akut",
      priority: "crit",
      status: "in_progress",
      assignedTo: "emp-2",
      assignedAt: minutesAgo(10),
      startedAt: minutesAgo(8),
      completedAt: null,
      createdAt: minutesAgo(12),
      dueAt: minutesFromNow(4)
    },
    {
      id: "task-104",
      title: "Post-op kontrol · Stue 7",
      department: "dep-kir",
      priority: "warn",
      status: "help_needed",
      assignedTo: "emp-3",
      assignedAt: minutesAgo(20),
      startedAt: minutesAgo(15),
      completedAt: null,
      createdAt: minutesAgo(25),
      dueAt: minutesFromNow(8)
    },
    {
      id: "task-105",
      title: "Onkologi · Planlagt kontrol",
      department: "dep-onko",
      priority: "ok",
      status: "new",
      assignedTo: null,
      assignedAt: null,
      startedAt: null,
      completedAt: null,
      createdAt: minutesAgo(17),
      dueAt: minutesFromNow(30)
    },
    {
      id: "task-106",
      title: "Kirurgisk · Fastetrack",
      department: "dep-kir",
      priority: "warn",
      status: "in_progress",
      assignedTo: "emp-4",
      assignedAt: minutesAgo(13),
      startedAt: minutesAgo(11),
      completedAt: null,
      createdAt: minutesAgo(15),
      dueAt: minutesFromNow(10)
    },
    {
      id: "task-107",
      title: "Akutmodtagelsen · Kontrol",
      department: "dep-akut",
      priority: "warn",
      status: "new",
      assignedTo: null,
      assignedAt: null,
      startedAt: null,
      completedAt: null,
      createdAt: minutesAgo(9),
      dueAt: minutesFromNow(25)
    },
    {
      id: "task-108",
      title: "Kardiologi · Opfølgende prøve",
      department: "dep-kardio",
      priority: "ok",
      status: "done",
      assignedTo: "emp-1",
      assignedAt: minutesAgo(48),
      startedAt: minutesAgo(44),
      completedAt: minutesAgo(34),
      createdAt: minutesAgo(50),
      dueAt: minutesAgo(35)
    },
    {
      id: "task-109",
      title: "Onkologi · Akut vurdering",
      department: "dep-onko",
      priority: "crit",
      status: "new",
      assignedTo: null,
      assignedAt: null,
      startedAt: null,
      completedAt: null,
      createdAt: minutesAgo(4),
      dueAt: minutesFromNow(12)
    },
    {
      id: "task-110",
      title: "Morgenrunde · patient 48",
      department: "dep-lab",
      priority: "ok",
      status: "assigned",
      assignedTo: "emp-6",
      assignedAt: minutesAgo(2),
      startedAt: null,
      completedAt: null,
      createdAt: minutesAgo(4),
      dueAt: minutesFromNow(28)
    }
  ];

  const eventLog = [
    {
      id: "evt-001",
      ts: minutesAgo(12),
      type: "TASK_STARTED",
      actor: "Jonas Madsen",
      taskId: "task-103",
      details: "Påbegyndte akut prøve i Akutmodtagelsen"
    },
    {
      id: "evt-002",
      ts: minutesAgo(10),
      type: "TASK_ASSIGNED",
      actor: "Planlægger",
      taskId: "task-106",
      details: "Tildelte fastetrack til Ahmed Saleh"
    },
    {
      id: "evt-003",
      ts: minutesAgo(6),
      type: "HELP_REQUESTED",
      actor: "Lina Pedersen",
      taskId: "task-104",
      details: "Anmodede om hjælp: Mangler hænder"
    }
  ];

  return {
    departments,
    employees,
    tasks,
    eventLog,
    currentEmployeeId: "emp-1"
  };
}
