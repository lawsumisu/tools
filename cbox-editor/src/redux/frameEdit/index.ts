import { Action, createAction } from '@reduxjs/toolkit';

export interface FrameEditState {
  frame: {
    key: string;
    index: number;
  } | null;
}

const initialState: FrameEditState = {
  frame: null
};

export const frameEditActionCreators = {
  clear: createAction('CLEAR'),
  select: createAction<{ key: string; index: number }>('SELECT')
};

export function frameEditReducer(state: FrameEditState = initialState, action: Action): FrameEditState {
  if (frameEditActionCreators.select.match(action)) {
    return {
      ...state,
      frame: action.payload
    };
  } else if (frameEditActionCreators.clear.match(action)) {
    return {
      ...state,
      frame: null
    };
  }
  return state;
}
