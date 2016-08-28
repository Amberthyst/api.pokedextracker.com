'use strict';

const Bluebird = require('bluebird');
const JWT      = require('jsonwebtoken');

const Config = require('../../../../config');
const Knex   = require('../../../../src/libraries/knex');
const Server = require('../../../../src/server');

const firstPokemon  = Factory.build('pokemon', { national_id: 1 });
const secondPokemon = Factory.build('pokemon', { national_id: 2 });

const user = Factory.build('user');

const firstCapture = Factory.build('capture', { pokemon_id: firstPokemon.national_id, user_id: user.id });

const auth = `Bearer ${JWT.sign(user, Config.JWT_SECRET)}`;

describe('capture integration', () => {

  beforeEach(() => {
    return Bluebird.all([
      Knex('pokemon').insert([firstPokemon, secondPokemon]),
      Knex('users').insert(user)
    ])
    .then(() => {
      return Knex('captures').insert(firstCapture);
    });
  });

  describe('list', () => {

    it('returns a collection of captures', () => {
      return Server.inject({
        method: 'GET',
        url: `/captures?user=${user.id}`
      })
      .then((res) => {
        expect(res.statusCode).to.eql(200);
        expect(res.result).to.be.an.instanceof(Array);
      });
    });

    it('requires a user query param', () => {
      return Server.inject({
        method: 'GET',
        url: '/captures'
      })
      .then((res) => {
        expect(res.statusCode).to.eql(422);
        expect(res.result.error.message).to.eql('user is required');
      });
    });

  });

  describe('create', () => {

    it('saves a capture', () => {
      return Server.inject({
        method: 'POST',
        url: '/captures',
        headers: { authorization: auth },
        payload: { pokemon: secondPokemon.national_id }
      })
      .then((res) => {
        expect(res.statusCode).to.eql(200);
        expect(res.result[0].pokemon.national_id).to.eql(secondPokemon.national_id);
      });
    });

    it('requires authentication', () => {
      return Server.inject({
        method: 'POST',
        url: '/captures',
        payload: { pokemon: secondPokemon.national_id }
      })
      .then((res) => {
        expect(res.statusCode).to.eql(401);
      });
    });

  });

  describe('delete', () => {

    it('deletes a capture', () => {
      return Server.inject({
        method: 'DELETE',
        url: '/captures',
        headers: { authorization: auth },
        payload: { pokemon: firstPokemon.national_id }
      })
      .then((res) => {
        expect(res.statusCode).to.eql(200);
        expect(res.result.deleted).to.be.true;
      });
    });

    it('requires authentication', () => {
      return Server.inject({
        method: 'DELETE',
        url: '/captures',
        payload: { pokemon: firstPokemon.national_id }
      })
      .then((res) => {
        expect(res.statusCode).to.eql(401);
      });
    });

  });

});
