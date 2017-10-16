const { authenticate } = require('feathers-authentication').hooks;
const commonHooks = require('feathers-hooks-common');
const { restrictToOwner } = require('feathers-authentication-hooks');


const restrict = [
  authenticate('jwt'),
  restrictToOwner({
    idField: '_id',
    ownerField: '_id'
  })
];

const restrictToInstructor = [
  authenticate('jwt'),
  commonHooks.when(hook => !!hook.params.user &&
    !(hook.params.user.role === "Instructor"),
  commonHooks.disallow('external'))
];

const restrictGet = [
  commonHooks.when(hook => !!hook.params.user &&
    !(hook.params.user.role === "Instructor"
    || hook.params.user.role === "TA"),
    restrictToOwner({
      idField: '_id',
      ownerField: '_id'
    })
  )
];

module.exports = {
  before: {
    all: [],
    find: [
    ...restrictToInstructor
    ],
    get: [ ...restrictGet ],
    create: [ ...restrictToInstructor ],
    update: [ ...restrictToInstructor ],
    patch: [ ...restrictToInstructor ],
    remove: [ ...restrictToInstructor ]
  },

  after: {
    all: [
      commonHooks.when(
        hook => hook.params.provider,
        commonHooks.discard('password')
      )
    ],
    find: [],
    get: [],
    create: [],
    update: [],
    patch: [],
    remove: []
  },

  error: {
    all: [],
    find: [],
    get: [],
    create: [],
    update: [],
    patch: [],
    remove: []
  }
};
