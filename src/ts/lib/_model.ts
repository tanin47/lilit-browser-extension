export interface Position {
  line: number;
  col: number;
}

export interface Location {
  path: string;
  start: Position;
  end: Position;
}

export interface Jar {
  id: number;
}

export interface UsageCount {
  module: string;
  jar: Jar;
  path: string;
  count: number;
}

export type Token = Usage | Definition;

export interface Definition {
  type: string;
  nodeId: string;
  module: string;
  jarId?: number;
  location?: Location;
  counts: UsageCount[];
}

export interface Usage {
  type: string;
  location: Location;
  definition: Definition;
}
