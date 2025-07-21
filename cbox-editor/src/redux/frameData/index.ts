import { Action, createAction } from '@reduxjs/toolkit';
import { Vector2 } from '@lawsumisu/common-utilities';
import * as _ from 'lodash';
import { frameDefinitionEditReducer, FrameDefinitionEditState } from 'src/redux/frameData/frameDefinitionEdit';
import {
  FrameConfigTP,
  FrameDefinitionMap,
  getSpriteIndexFromDefinition,
  TextureDataTP
} from 'src/utilities/frame.util';

interface TextureDataMap {
  [key: string]: FrameConfigTP;
}

function processTextureData(textureData: TextureDataTP): TextureDataMap {
  return textureData.frames.reduce((acc: TextureDataMap, frame: FrameConfigTP) => {
    acc[frame.filename] = frame;
    return acc;
  }, {});
}

export function getSpriteSource(frameData: FrameDataState, frameKey: string): string | null {
  const animDef = frameData.definitionMap[frameKey].animDef;
  const { assetKey } = animDef;
  const { source = null } = frameData.spriteSheets[assetKey] || {};
  return source;
}

export const getSpriteConfig = _.memoize(
  (frameData: FrameDataState, frameKey: string, frameIndex: number) => {
    const animDef = frameData.definitionMap[frameKey].animDef;
    const { prefix, assetKey } = animDef;
    const { texture = {} } = frameData.spriteSheets[assetKey] || {};
    const spriteIndex = getSpriteIndexFromDefinition(animDef, frameIndex);
    const filename = `${prefix}/${spriteIndex.toString().padStart(2, '0')}.png`;
    const config = texture[filename];
    if (config) {
      return config;
    } else {
      console.warn(`Config for ${filename} not Found`);
      return null;
    }
  },
  (frameData: FrameDataState, frameKey: string, frameIndex: number) => {
    const animDef = frameData.definitionMap[frameKey].animDef;
    const { prefix, assetKey } = animDef;
    return [prefix, assetKey, frameKey, frameIndex].join('-');
  }
);

export function getAnchorPosition(config: FrameConfigTP): Vector2 {
  const { w, h } = config.sourceSize;
  const { x, y } = config.spriteSourceSize;
  return new Vector2(Math.floor(config.anchor.x * w - x), Math.floor(config.anchor.y * h - y));
}

interface SpriteSheetInfo {
  source: string;
  texture: TextureDataMap;
}

export interface FrameDataState {
  filename: string;
  definitionMap: FrameDefinitionMap['frameDef'];
  spriteSheets: { [key: string]: SpriteSheetInfo };
  selection: { key: string; frame: number } | null;
  frameDefinitionEdits: FrameDefinitionEditState;
}

const initialState: FrameDataState = {
  filename: '',
  definitionMap: {},
  spriteSheets: {},
  selection: null,
  frameDefinitionEdits: {}
};

export const frameDataActionCreators = {
  select: createAction<{ key: string; frame: number }>('SELECT'),
  loadDefinition: createAction<{ definition: FrameDefinitionMap['frameDef']; name: string }>('LOAD_DEFINITION'),
  loadSpriteSheet: createAction<{ key: string; source: string; textureData: TextureDataTP }>('LOAD_SPRITE_SHEET')
};

export function frameDataReducer(state: FrameDataState = initialState, action: Action): FrameDataState {
  if (frameDataActionCreators.select.match(action)) {
    return {
      ...state,
      selection: { ...action.payload }
    };
  } else if (frameDataActionCreators.loadDefinition.match(action)) {
    return {
      ...state,
      definitionMap: action.payload.definition,
      filename: action.payload.name,
      frameDefinitionEdits: {}
    };
  } else if (frameDataActionCreators.loadSpriteSheet.match(action)) {
    const { key, source, textureData } = action.payload;
    return {
      ...state,
      spriteSheets: {
        ...state.spriteSheets,
        [key]: {
          source,
          texture: processTextureData(textureData)
        }
      }
    };
  }
  return {
    ...state,
    frameDefinitionEdits: frameDefinitionEditReducer(state.frameDefinitionEdits, action)
  };
}
