// Copyright IBM Corp. 2013,2019. All Rights Reserved.
// Node module: loopback-connector-mongodb
// This file is licensed under the MIT License.
// License text available at https://opensource.org/licenses/MIT

'use strict';

require('./init.js');

let ds, Book, Chapter;

describe('ObjectID', function() {
  before(function() {
    ds = global.getDataSource();
    Book = ds.define('Book');
    Chapter = ds.define('Chapter');
    Book.hasMany('chapters');
    Chapter.belongsTo('book');
  });

  it('should cast foreign keys as ObjectID', function(done) {
    Chapter.beforeCreate = function(next, data) {
      data.bookId.should.be.an.instanceOf(ds.ObjectID);
      this.bookId.should.be.an.instanceOf(ds.ObjectID);
      next();
    };

    Book.create(function(err, book) {
      if (err) return done(err);
      Chapter.create({bookId: book.id.toString()}, done);
    });
  });

  it('should convert 24 byte hex string as ObjectID', function() {
    const ObjectID = ds.connector.getDefaultIdType();
    const str = '52fcef5c0325ace8dcb7a0bd';
    ObjectID(str).should.be.an.instanceOf(ds.ObjectID);
  });

  it('should not convert 12 byte string as ObjectID', function() {
    const ObjectID = ds.connector.getDefaultIdType();
    const str = 'line-by-line';
    ObjectID(str).should.be.equal(str);
  });

  it('should keep mongodb ObjectID as is', function() {
    const ObjectID = ds.connector.getDefaultIdType();
    const id = new ds.ObjectID();
    ObjectID(id).should.be.an.instanceOf(ds.ObjectID);
  });

  it('should keep non-string id as it', function() {
    const ObjectID = ds.connector.getDefaultIdType();
    const id = 123;
    ObjectID(id).should.be.equal(123);
  });

  it('coerces ObjectID', function() {
    const coercedId = ds.connector.isObjectIDProperty('Book', {}, '52fcef5c0325ace8dcb7a0bd');
    coercedId.should.be.True();
  });

  it('given strictObjectIDCoercion: true, does not coerce ObjectID', function() {
    const coercedId = ds.connector.isObjectIDProperty(
      'Book',
      {},
      '52fcef5c0325ace8dcb7a0bd',
      {strictObjectIDCoercion: true}
    );
    coercedId.should.be.False();
  });
});
