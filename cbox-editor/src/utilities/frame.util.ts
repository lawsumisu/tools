import * as _ from 'lodash';

export interface FrameConfigTP {
  filename: string;
  rotated: boolean;
  trimmed: boolean;
  sourceSize: {
    w: number;
    h: number;
  };
  spriteSourceSize: {
    w: number;
    h: number;
    x: number;
    y: number;
  };
  frame: {
    w: number;
    h: number;
    x: number;
    y: number;
  };
  anchor: {
    x: number;
    y: number;
  };
}

export interface TextureDataTP {
  image: string;
  format: string;
  size: {
    w: number;
    h: number;
  };
  scale: number;
  frames: FrameConfigTP[];
}

export interface CircleBoxConfig {
  x: number;
  y: number;
  r: number;
}

export interface CapsuleBoxConfig {
  x1: number;
  y1: number;
  x2: number;
  y2: number;
  r: number;
}

export interface PushboxConfig {
  x: number;
  y: number;
  width: number;
  height: number;
}

export interface Hit {
  damage: number;
  angle: number;
  knockback: number;
  type: string[];
  hitstop: number[];
  hitstun: number;
  velocity: {
    ground: { angle: number, magnitude: number };
    air?: { angle: number, magnitude: number };
  };
  pushback: {
    base: number;
    decay: number;
  };
  sfx?: string;
}

export function isCircleBox(box: BoxConfig): box is CircleBoxConfig {
  return _.has(box, 'x');
}

export type BoxConfig = CircleBoxConfig | CapsuleBoxConfig

export interface AnimationFrameConfig {
  index: number;
  endIndex?: number;
  loop?: number;
  prefix?: string;
  sfx?: string;
}

export interface AnimationDefinition {
  frames: number | Array<number | AnimationFrameConfig>;
  assetKey: string;
  prefix: string;
  frameRate: number;
  repeat?: number;
}

export enum BoxType {
  HIT = 'HIT',
  HURT = 'HURT',
  PUSH = 'PUSH',
}

export interface BoxDefinition {
  tag?: string | number;
  boxes: BoxConfig[];
  persistThroughFrame?: number;
}

export const defaultHit: Hit = {
  damage: 0,
  angle: 0,
  knockback: 0,
  velocity: {
    ground: { magnitude: 0, angle: 0},
  },
  type: [],
  hitstop: [0, 0],
  hitstun: 0,
  pushback: {
    base: 0,
    decay: 0,
  }
};

export interface HitboxDefinition extends BoxDefinition {
  hit?: Partial<Hit>;
}

export interface PushboxDefinition {
  box: PushboxConfig;
  persistThroughFrame?: number;
}

export interface FrameDefinition {
  animDef: AnimationDefinition;
  hurtboxDef?: {
    [key: number]: BoxDefinition;
  }
  hitboxDef?: {
    hit: Partial<Hit>;
    [key: number]: HitboxDefinition;
  };
  pushboxDef?: {
    [key: number]: PushboxDefinition;
  }
}

export type FrameDefinitionMap = {
  name: string;
  tempPushbox: {x: number, y: number, width: number, height: number};
  frameDef: {
    [key: string]: FrameDefinition;
  }
};

export function getSpriteIndexFromDefinition(animDef: AnimationDefinition, frameIndex: number): number {
  const { frames } = animDef;
  if (_.isNumber(frames)) {
    return frameIndex + 1;
  } else {
    let frameIndexOffset = 0;
    for (let i = 0; i < frames.length; i++) {
      const config: number | AnimationFrameConfig = frames[i];
      const mappedConfig: AnimationFrameConfig = _.isNumber(config) ? { index: config } : config;
      const { index: start, endIndex: end = start } = mappedConfig;
      const f = frameIndex - frameIndexOffset;
      if (f <= end - start) {
        return start + f;
      } else {
        frameIndexOffset += end - start + 1;
      }
    }
    return -1;
  }
}