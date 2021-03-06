/// <reference types="react-scripts" />

interface LTWH {
  left: number;
  top: number;
  width: number;
  height: number;
}

interface Highlight {
  id: string;
  position: {
    boundingRect: LTWH;
    rects: LTWH[];
  };
  comment?: string;
}

type Mapping = [string, string];
