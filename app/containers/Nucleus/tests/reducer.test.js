import { fromJS } from 'immutable';
import nucleusReducer from '../reducer';

describe('nucleusReducer', () => {
  it('returns the initial state', () => {
    expect(nucleusReducer(undefined, {})).toEqual(fromJS({}));
  });
});
