var _ = require('lodash');
var config = require('./default');

module.exports = _.defaultsDeep(
  {
    server: {
      port: 929
    },
    db: {
      name: 'apm_testing'
    }
  },
  config
);
