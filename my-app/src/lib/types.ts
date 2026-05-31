export interface Project {
  id: number;
  name: string;
  source_image: string;
  preview_image: string | null;
  rows: number;
  cols: number;
  board_type: string;
  palette_id: string;
  color_limit: number;
  dither_enabled: number;
  status: 'editing' | 'completed';
  created_at: string;
  updated_at: string;
}

export interface Cell {
  id: number;
  project_id: number;
  row: number;
  col: number;
  color_no: string | null;
  hex: string | null;
  completed: number;
}

export interface PaletteColor {
  id: number;
  brand: string;
  color_no: string;
  name: string;
  hex: string;
  rgb: string;
}

export interface CellUpdate {
  row: number;
  col: number;
  color_no: string;
  hex: string;
}

export interface ColorStats {
  color_no: string;
  name: string;
  hex: string;
  count: number;
  percentage: number;
}

export interface EditorState {
  project: Project;
  cells: Cell[][];
  palette: PaletteColor[];
}
