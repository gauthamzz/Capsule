/*
 *
 * SignupPage actions
 *
 */

import {
  COMPILE_ERROR,
  COMPILE_REQUEST,
  COMPILE_SUCCESS,
  GET_ERROR,
  GET_REQUEST,
  GET_SUCCESS,
} from './constants';

export function compileError(error) {
  return {
    type: COMPILE_ERROR,
    error,
  };
}

export function compileSuccess() {
  return {
    type: COMPILE_SUCCESS,
  };
}

export function compileRequest(data) {
  return {
    type: COMPILE_REQUEST,
    data,
  };
}

export function getError(error) {
  return {
    type: GET_ERROR,
    error,
  };
}

export function getSuccess() {
  return {
    type: GET_SUCCESS,
  };
}

export function getRequest(data) {
  return {
    type: GET_REQUEST,
    data,
  };
}