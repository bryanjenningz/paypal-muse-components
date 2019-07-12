/* @flow */
import { uniqueID } from 'belter/src';

/*
** the reason this is exported as a default object is to get rid of error
** "Cannot set property "prop" of #<Object> which has only a getter"
** - flow and eslint have to be disabled on whatever line this is used.
*/

// eslint-disable-next-line import/no-default-export
export default {
    generateId: uniqueID
};
