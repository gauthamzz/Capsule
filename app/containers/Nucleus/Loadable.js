/**
 *
 * Asynchronously loads the component for Nucleus
 *
 */

import loadable from 'loadable-components';

export default loadable(() => import('./index'));
