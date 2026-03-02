export const mockData = {
  employee: {
    name: "Camilla Nørgaard",
    role: "Prøvetager · Morgenrunde 07:30-09:00",
    status: "klar",
    activeTask: {
      title: "Hver 5. patient kontrol",
      time: "08:10",
      department: "Medicinsk Afsnit 2",
      priority: "advarsel"
    },
    nextTasks: [
      {
        id: "n1",
        title: "Akut blodprøve · Stue 14",
        time: "08:35",
        department: "Akutmodtagelsen",
        priority: "kritisk"
      },
      {
        id: "n2",
        title: "Rutineprøve · Patient 27",
        time: "08:50",
        department: "Kardiologi",
        priority: "ok"
      },
      {
        id: "n3",
        title: "Kontrol efter operation",
        time: "09:05",
        department: "Ortopædkirurgi",
        priority: "advarsel"
      }
    ]
  },
  planner: {
    sections: [
      {
        id: "s1",
        name: "Akutmodtagelsen",
        patientLoad: 18,
        staffOnDuty: 4,
        waitingHelp: 2,
        status: "kritisk"
      },
      {
        id: "s2",
        name: "Kardiologi",
        patientLoad: 12,
        staffOnDuty: 3,
        waitingHelp: 1,
        status: "advarsel"
      },
      {
        id: "s3",
        name: "Onkologi",
        patientLoad: 9,
        staffOnDuty: 3,
        waitingHelp: 0,
        status: "ok"
      },
      {
        id: "s4",
        name: "Kirurgisk",
        patientLoad: 15,
        staffOnDuty: 4,
        waitingHelp: 1,
        status: "advarsel"
      }
    ],
    staff: [
      {
        id: "m1",
        name: "Jonas Madsen",
        section: "Akutmodtagelsen",
        status: "kritisk",
        task: "Behov for hjælp ved patient 32"
      },
      {
        id: "m2",
        name: "Lina Pedersen",
        section: "Kardiologi",
        status: "iGang",
        task: "Morgenpakke · 3 prøver tilbage"
      },
      {
        id: "m3",
        name: "Ahmed Saleh",
        section: "Onkologi",
        status: "ok",
        task: "Rutinekontrol gennemført"
      },
      {
        id: "m4",
        name: "Sofia Møller",
        section: "Kirurgisk",
        status: "advarsel",
        task: "Forsinket pga. forflytning"
      }
    ],
    kanban: {
      ikkeStartet: [
        {
          id: "k1",
          title: "Patient 18 · Rutine",
          section: "Kardiologi",
          eta: "Auto-tildeles om 15 min"
        },
        {
          id: "k2",
          title: "Patient 20 · Fastetrack",
          section: "Akutmodtagelsen",
          eta: "Auto-tildeles om 8 min"
        }
      ],
      iGang: [
        {
          id: "k3",
          title: "Patient 11 · Haster",
          section: "Kirurgisk",
          eta: "Startet 08:02"
        },
        {
          id: "k4",
          title: "Patient 7 · Kontrol",
          section: "Onkologi",
          eta: "Startet 08:05"
        }
      ],
      afventerHjaelp: [
        {
          id: "k5",
          title: "Patient 32 · Akut",
          section: "Akutmodtagelsen",
          eta: "Hjælp anmodet 08:12"
        }
      ]
    }
  }
};
