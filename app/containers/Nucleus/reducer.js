/*
 *
 * Nucleus reducer
 *
 */

import { fromJS } from 'immutable';
import {
  COMPILE_REQUEST,
  COMPILE_SUCCESS,
  COMPILE_ERROR,
  GET_REQUEST,
  GET_SUCCESS,
  GET_ERROR,
} from './constants';

export const initialState = fromJS({});

function nucleusReducer(state = initialState, action) {
  switch (action.type) {
    case COMPILE_REQUEST: {
      console.log('action', action);
      return state;
    }
    case COMPILE_SUCCESS:{
      console.log("boi",action.data);
      return state.set('data', action.data);
    }

    case COMPILE_ERROR: {
      console.log('action', action);
      return state.set('error', action.error);
    }

    case GET_REQUEST: {
      console.log('action', action);
      return state;
    }
    case GET_SUCCESS:{
      return state.set('data', action.data);
    }

    case GET_ERROR: {
      console.log('action', action);
      return state.set('error', action.error);
    }

    default:
      return state;
  }
}

export default nucleusReducer;
