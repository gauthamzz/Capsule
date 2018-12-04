import { createSelector } from 'reselect';
import { initialState } from './reducer';

/**
 * Direct selector to the nucleus state domain
 */

const selectNucleusDomain = state => state.get('nucleus', initialState);

/**
 * Other specific selectors
 */

/**
 * Default selector used by Nucleus
 */

const makeSelectNucleus = () =>
  createSelector(selectNucleusDomain, substate => substate.toJS());

export default makeSelectNucleus;
export { selectNucleusDomain };
