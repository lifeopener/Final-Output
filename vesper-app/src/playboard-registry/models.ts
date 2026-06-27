export type PlayBoardPlane = 'end-user' | 'operator' | 'system-state';

export type ScreenStatus = '미착수' | '부분구현' | '구현·머지완료' | '검증완료';
export type WorkItemStatus = '미착수' | '리뷰대기' | '완료';

export interface ScreenEngineering {
  authGate: string;
  clientActions: string[];
  serverActions: string[];
  dataReads: string[];
  dataWrites: string[];
  telemetryEvents: string[];
  exceptionStates: string[]; // slugs in system-state plane
  controlAreaNotes: Record<string, string>; // areaId -> note
}

export interface ScreenRegistry {
  plane: PlayBoardPlane;
  slug: string;
  title: string;
  route: string;
  designSpecType: '서비스형' | '콘텐츠형' | '상태형';
  flowNote: string;
  status: ScreenStatus;
  statusNote?: string;
  workItems: string[]; // WorkItem IDs
  requirementRefs: string[];
  implLocation?: string;
  engineering: ScreenEngineering;
}

export interface WorkItemRegistry {
  id: string;
  title: string;
  phase: string;
  status: WorkItemStatus;
  externalRefs?: string;
  dependsOn: string[]; // WorkItem IDs
  screens: string[]; // 'plane/slug'
  doc: string;
}

export interface Policy {
  statement: string;
  detail: string;
}

export interface Decision {
  name: string;
  value: string;
}

export interface Standard {
  title: string;
  path: string;
}

export interface ControlAreaRegistry {
  area: string;
  goal: string;
  summary: string;
  policies: Policy[];
  decisions: Decision[];
  standards: Standard[];
  workItems: string[]; // WorkItem IDs
  gaps: string[];
}

export interface FlowRegistry {
  id: string;
  title: string;
  description: string;
  plane: PlayBoardPlane;
  screens: string[]; // 'plane/slug'
  isSequential: boolean;
}

// Global SoT structure
export interface PlayBoardSoT {
  planes: PlayBoardPlane[];
  screens: ScreenRegistry[];
  workItems: WorkItemRegistry[];
  controlAreas: ControlAreaRegistry[];
  flows: FlowRegistry[];
  phaseOrder: string[];
  statusOrder: ScreenStatus[];
  day1Anchor: string;
}
