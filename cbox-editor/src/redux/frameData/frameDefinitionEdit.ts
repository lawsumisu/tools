import { createAction, Action } from '@reduxjs/toolkit';
import { BoxDefinition, BoxType, HitboxDefinition, PushboxDefinition } from 'src/utilities/frame.util';
import * as _ from 'lodash';
import { FrameDataState } from 'src/redux/frameData/index';

export interface FrameDefinitionEditState {
  [key: string]: {
    edits: [];
    editIndex: number;
    data: PushboxDefinition | BoxDefinition;
  };
}

export type TypedBoxDefinition<T extends BoxType> = T extends BoxType.PUSH
  ? PushboxDefinition
  : T extends BoxType.HIT
  ? HitboxDefinition
  : T extends BoxType.HURT
  ? BoxDefinition
  : never;

export function getFrameDefData<T extends BoxType>(
  frameDataState: FrameDataState,
  frameKey: string,
  frameIndex: number,
  type: T
): TypedBoxDefinition<T> | null {
  const { definitionMap, frameDefinitionEdits } = frameDataState;
  const id = getFrameDefId(frameKey, frameIndex, type);
  const originalData = _.get(definitionMap, id, null);
  const data: any = _.merge({}, originalData, (frameDefinitionEdits[id] || {}).data);
  switch (type) {
    case BoxType.HURT:
      return data.boxes ? data : null;
    case BoxType.HIT: {
      return data.boxes ? data : null;
    }
    case BoxType.PUSH: {
      return data.box ? data : null;
    }
    default: {
      return null;
    }
  }
}

export function getFrameDefId(frameKey: string, frameIndex: number, type: BoxType): string {
  const definitionString = type === BoxType.PUSH ? 'pushboxDef' : type === BoxType.HIT ? 'hitboxDef' : 'hurtboxDef';
  return [frameKey, definitionString, frameIndex].join('.');
}

type WithFrameId<T = {}> = T & { frameIndex: number; frameKey: string };
export const frameDefinitionEditActionCreators = {
  addHurtbox: createAction<WithFrameId<{ hurtboxDef: BoxDefinition }>>('ADD_HURTBOX'),
  editHurtbox: createAction<WithFrameId<{ hurtboxDef: Partial<BoxDefinition> }>>('EDIT_HURTBOX'),
  deleteHurtbox: createAction<WithFrameId>('DELETE_HURTBOX'),
  addHitbox: createAction<WithFrameId<{ hitboxDef: HitboxDefinition }>>('ADD_HITBOX'),
  editHitbox: createAction<WithFrameId<{ hitboxDef: Partial<HitboxDefinition> }>>('EDIT_HITBOX'),
  deleteHitbox: createAction<WithFrameId>('DELETE_HITBOX'),
  addPushbox: createAction<WithFrameId<{ pushboxDef: PushboxDefinition }>>('ADD_PUSHBOX'),
  editPushbox: createAction<WithFrameId<{ pushboxDef: Partial<PushboxDefinition> }>>('EDIT_PUSHBOX'),
  deletePushbox: createAction<WithFrameId>('DELETE_PUSHBOX')
};

// TODO update edits field on change to support undo/redo
export function frameDefinitionEditReducer(state: FrameDefinitionEditState, action: Action): FrameDefinitionEditState {
  if (
    frameDefinitionEditActionCreators.addHurtbox.match(action) ||
    frameDefinitionEditActionCreators.editHurtbox.match(action)
  ) {
    const { frameKey, frameIndex, hurtboxDef } = action.payload;
    const id = getFrameDefId(frameKey, frameIndex, BoxType.HURT);
    const newState = _.merge({}, state, { [id]: {} });
    newState[id].data = {
      ...(state[id] || {}).data,
      ...hurtboxDef
    };
    return newState;
  } else if (
    frameDefinitionEditActionCreators.addHitbox.match(action) ||
    frameDefinitionEditActionCreators.editHitbox.match(action)
  ) {
    const { frameKey, frameIndex, hitboxDef } = action.payload;
    const id = getFrameDefId(frameKey, frameIndex, BoxType.HIT);
    const newState = _.merge({}, state, { [id]: {} });
    newState[id].data = {
      ...(state[id] || {}).data,
      ...hitboxDef
    };
    return newState;
  } else if (
    frameDefinitionEditActionCreators.addPushbox.match(action) ||
    frameDefinitionEditActionCreators.editPushbox.match(action)
  ) {
    const { frameKey, frameIndex, pushboxDef } = action.payload;
    const id = getFrameDefId(frameKey, frameIndex, BoxType.PUSH);
    return _.merge({}, state, { [id]: { data: pushboxDef } });
  } else if (
    frameDefinitionEditActionCreators.deleteHurtbox.match(action) ||
    frameDefinitionEditActionCreators.deleteHitbox.match(action) ||
    frameDefinitionEditActionCreators.deletePushbox.match(action)
  ) {
    const { deleteHurtbox, deleteHitbox } = frameDefinitionEditActionCreators;
    const { frameKey, frameIndex } = action.payload;
    const type =
      action.type === deleteHurtbox.type
        ? BoxType.HURT
        : action.type === deleteHitbox.type
        ? BoxType.HIT
        : BoxType.PUSH;
    const id = getFrameDefId(frameKey, frameIndex, type);
    return _.merge({}, state, { [id]: { data: null } });
  }
  return state;
}
