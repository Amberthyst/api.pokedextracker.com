'use strict';

const Bookshelf = require('../libraries/bookshelf');
const Pokemon   = require('./pokemon');

module.exports = Bookshelf.model('Capture', Bookshelf.Model.extend({
  tableName: 'captures',
  hasTimestamps: ['date_created', 'date_modified'],
  pokemon () {
    return this.belongsTo(Pokemon, 'pokemon_id');
  },
  serialize () {
    return {
      user_id: this.get('user_id'),
      pokemon: this.related('pokemon').get('capture_summary'),
      captured: this.get('captured')
    };
  }
}, {
  RELATED: ['pokemon']
}));
