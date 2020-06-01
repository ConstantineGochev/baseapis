const {
  expect,
  assert,
} = require('chai')
const fs = require("fs");
const util = require("util");
const moment = require('moment')

const read_file = util.promisify(fs.readFile);
const write_file = util.promisify(fs.writeFile)
const {
  filter_array,
  save_to_file,
} = require("../helpers")

describe('Tests', function() {
  const items = [{
    "author_name": "B",
    "body": "sdas",
    "date_created": "2011-08-18T21:00:00.000Z"
  }, {
    "author_name": "Aaa",
    "body": "sdas",
    "date_created": "2013-08-18T21:00:00.000Z"
  }, {
    "author_name": "Aaa",
    "body": "sdas",
    "date_created": "2015-08-18T21:00:00.000Z"
  }, {
    "author_name": "Der",
    "body": "sdas",
    "date_created": "2011-03-11T22:00:00.000Z"
  }, {
    "author_name": "Ze",
    "body": "sdas",
    "date_created": "2011-03-11T22:00:00.000Z"
  }]
  describe('Array filter ', function() {

    it('should only return one match', function() {
      let filters = {
        from_date: obj_date => moment(obj_date).isAfter("2013-08-17"),
        to_date: obj_date => moment(obj_date).isBefore("2014-08-17"),
        by_name: obj_name => obj_name === "Aaa"
      };
      const filtered = filter_array(items, filters)
      const expected = [{
        "author_name": "Aaa",
        "body": "sdas",
        "date_created": "2013-08-18T21:00:00.000Z"
      }]
      assert.deepEqual(filtered, expected, "Arrays are equal");

    });
    it("should return multiple matches", function() {
      let filters = {
        from_date: obj_date => moment(obj_date).isAfter("2013-08-17"),
        to_date: obj_date => moment(obj_date).isBefore("2016-08-17"),
        by_name: obj_name => obj_name === "Aaa"
      };
      const filtered = filter_array(items, filters)
      const expected = [{
        "author_name": "Aaa",
        "body": "sdas",
        "date_created": "2013-08-18T21:00:00.000Z"
      }, {
        "author_name": "Aaa",
        "body": "sdas",
        "date_created": "2015-08-18T21:00:00.000Z"
      }]
      assert.deepEqual(filtered, expected, "Arrays are equal");
    })

    it("should return multiple matches by one criteria", function() {
      let filters = {
        from_date: obj_date => moment(obj_date).isAfter("2011-08-18"),
      };
      const filtered = filter_array(items, filters)
      const expected = [{
        "author_name": "B",
        "body": "sdas",
        "date_created": "2011-08-18T21:00:00.000Z"
      }, {
        "author_name": "Aaa",
        "body": "sdas",
        "date_created": "2013-08-18T21:00:00.000Z"
      }, {
        "author_name": "Aaa",
        "body": "sdas",
        "date_created": "2015-08-18T21:00:00.000Z"
      }]
      assert.deepEqual(filtered, expected, "Arrays are equal");
    })
  });
  describe("Save to file", function() {
    let data, parsed, len
    before(function(done) {
      read_file("db.json").then(d => {
        data = d
        parsed = JSON.parse(data)
        len = parsed.length
        done()
      }).catch(err => console.log(err))
    })
    it("should save object to json file", function() {
      let new_obj = items[Math.random() * items.length]

      save_to_file("db.json", new_obj, async function(err) {

        const data = await read_file("db.json")

        let parsed = JSON.parse(data)
        let new_len = parsed.length
        assert.strictEqual(len + 1, new_len, "old len += 1 should equal new len.")
      })

    })
  })
});