export interface Position {
  line: number;
  col: number;
}

export interface Location {
  file: string;
  start: Position;
  end: Position;
}

export interface Usage {
  location: Location;
}