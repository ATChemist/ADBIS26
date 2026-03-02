import type { ScreenKey } from './models/types';

export interface RouteItem {
  key: ScreenKey;
  path: string;
  label: string;
  role: 'prototype' | 'bioanalytiker' | 'planlaegger' | 'rekvirent';
  description: string;
}

export const APP_ROUTES: RouteItem[] = [
  {
    key: 'home',
    path: '/',
    label: 'Vælg rolle',
    role: 'prototype',
    description: 'Startside med adgang til alle flows',
  },
  {
    key: 'bio.dashboard',
    path: '/bio',
    label: 'Bioanalytiker · Min vagt',
    role: 'bioanalytiker',
    description: 'Dashboard med morgenrunde-status og hjælp-knap',
  },
  {
    key: 'bio.tasks',
    path: '/bio/opgaver',
    label: 'Bioanalytiker · Opgaveliste',
    role: 'bioanalytiker',
    description: 'Liste med filtre Mine/Team/Akut og timerbadges',
  },
  {
    key: 'bio.detail',
    path: '/bio/opgaver/:taskId',
    label: 'Bioanalytiker · Opgavedetalje',
    role: 'bioanalytiker',
    description: 'Detalje med stor CTA, ekstra tjek og hjælp',
  },
  {
    key: 'bio.cancel',
    path: '/bio/opgaver/:taskId/afmeld',
    label: 'Bioanalytiker · Afmeld opgave',
    role: 'bioanalytiker',
    description: 'Kontrolleret afmelding med årsag og ekstra friktion',
  },
  {
    key: 'planner.overview',
    path: '/plan',
    label: 'Planlægger · Overblik',
    role: 'planlaegger',
    description: 'Heatmap/board, hjælp-signaler og morgenrunde-progress',
  },
  {
    key: 'planner.assign',
    path: '/plan/tildeling',
    label: 'Planlægger · Tildeling',
    role: 'planlaegger',
    description: 'Drag-and-drop af opgaver til team/medarbejder + låsning',
  },
  {
    key: 'planner.chat',
    path: '/plan/beskeder/:taskId',
    label: 'Planlægger · Kommunikation',
    role: 'planlaegger',
    description: 'Chat-tråd pr. opgave med skabelonbeskeder',
  },
  {
    key: 'requester.create',
    path: '/rekvirent/opret',
    label: 'Rekvirent · Opret opgave',
    role: 'rekvirent',
    description: 'Bestillingsflow (1 skærm) med afdeling/type/prioritet/patient',
  },
  {
    key: 'requester.confirm',
    path: '/rekvirent/kvittering/:taskId',
    label: 'Rekvirent · Opgave sendt',
    role: 'rekvirent',
    description: 'Bekræftelsesskærm med forventet respons',
  },
  {
    key: 'requester.status',
    path: '/rekvirent/status',
    label: 'Rekvirent · Status på egne opgaver',
    role: 'rekvirent',
    description: 'Liste over afdelingens opgaver og seneste opdatering',
  },
];

export const PATHS = {
  home: '/',
  bioDashboard: '/bio',
  bioTasks: '/bio/opgaver',
  bioTaskDetail: (taskId: string) => `/bio/opgaver/${taskId}`,
  bioTaskCancel: (taskId: string) => `/bio/opgaver/${taskId}/afmeld`,
  plannerOverview: '/plan',
  plannerAssign: '/plan/tildeling',
  plannerChat: (taskId: string) => `/plan/beskeder/${taskId}`,
  requesterCreate: '/rekvirent/opret',
  requesterConfirm: (taskId: string) => `/rekvirent/kvittering/${taskId}`,
  requesterStatus: '/rekvirent/status',
};
