import { call, all, put, take, fork } from 'redux-saga/effects';
import 'whatwg-fetch';

import {
  COMPILE_REQUEST,
  COMPILE_SUCCESS,
  COMPILE_ERROR,
  COMPILE_URL,
  GET_REQUEST,
  GET_SUCCESS,
  GET_ERROR,
  GET_URL
} from './constants';


function checkStatus(response) {
  // if (response.status >= 200 && response.status < 300) {
  //   return response;
  // }
  // const error = new Error(response.statusText);
  // error.response = response;
  // throw error;
  return response;
}

function parseJSON(response) {
  if (response.status === 204 || response.status === 205) {
    return null;
  }
  if (response.status >= 200 && response.status < 300) {
    return response.json();
  }
  // const error = new Error(response.statusText);
  // error.response = response.json();
  // throw error;
  return response.json();
}



function* compileReq() {
  while (true) {
    const request = yield take(COMPILE_REQUEST);
    const { nodes,edges, history } = request.data;
    yield call(compileFetch, { nodes,edges, history });
  }
}

function* getReq() {
  while (true) {
    const request = yield take(GET_REQUEST);
    const { id, history } = request.data;
    yield call(getFetch, { id, history });
  }
}

function sendCompile({ nodes,edges }) {
  var id=1
  console.log(JSON.stringify({
    edges,nodes
  }));
  return fetch(`${COMPILE_URL}`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    // headers: {
    //   'Content-Type': 'application/json',
    //   Authorization: `Token ${localStorage.getItem('token')}`
    // },
    body: JSON.stringify({
      edges,nodes,id
    }),
  }).then(checkStatus).then(parseJSON);
    // .then((response) => response.json())
    // .then((json) => {
    //   console.log(json);
    // })
    // .catch((ex) => {
    //   console.log('failed', ex);
    // });
}

function sendGet({ id }) {
  console.log(JSON.stringify({
    id
  }));
  return fetch(`${GET_URL}`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    // headers: {
    //   'Content-Type': 'application/json',
    //   Authorization: `Token ${localStorage.getItem('token')}`
    // },
    body: JSON.stringify({
      id
    }),
  }).then(checkStatus).then(parseJSON);
    // .then((response) => response.json())
    // .then((json) => {
    //   console.log(json);
    // })
    // .catch((ex) => {
    //   console.log('failed', ex);
    // });
}

function* compileFetch({ nodes,edges, history }) {
  let response = null;
  try {
    response = yield call(sendCompile, { nodes,edges });
    console.log("sadsaaaa",response);
    if (response[0].status=="ok") {
      console.log(response);
      yield put({ type: COMPILE_SUCCESS, data: response });
    } else {
      console.log('put this', response);
      yield put({ type: COMPILE_ERROR, error: response.non_field_errors });
    }
  } catch (e) {
    yield put({ type: COMPILE_ERROR, error: e.message });
  }
}


function* getFetch({ id, history }) {
  let response = null;
  try {
    response = yield call(sendGet, { id });
    if (response) {
      yield put({ type: GET_SUCCESS, data: response });
    } else {
      console.log('put this', response);
      yield put({ type: GET_ERROR, error: response.non_field_errors });
    }
  } catch (e) {
    yield put({ type: GET_ERROR, error: e.message });
  }
}

// function forwardTo(history, location) {
//   history.push({
//     pathname: location,
//     state: {
//       message: 'takeSuccess',
//     },
//   });
// }


// Individual exports for testing
export default function* defaultSaga() {
  yield all([
    compileReq(),
    getReq(),
  ])
}