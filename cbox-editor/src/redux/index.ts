import { combineReducers, Reducer } from 'redux';
import { configureStore } from '@reduxjs/toolkit';
import { frameDataReducer, FrameDataState } from 'src/redux/frameData';
import { frameEditReducer, FrameEditState } from 'src/redux/frameEdit';
import { useSelector } from 'react-redux';

export interface AppState {
  frameData: FrameDataState;
  frameEdit: FrameEditState;
}

const rootReducer: Reducer<AppState> = combineReducers({
  frameData: frameDataReducer,
  frameEdit: frameEditReducer
});

const store = configureStore({ reducer: rootReducer });
export const useAppSelector = useSelector.withTypes<AppState>();

export { store };
