const express = require("express");
const http = require("http");
const fs = require("fs");
const util = require("util");
const moment = require("moment");
const app = express();
const port = 4000;
const body_parser = require("body-parser");

app.use(body_parser.json());
const server = http.createServer(app);
const read_file = util.promisify(fs.readFile);

function save_to_file(filename, new_data, cb) {
  read_file(filename)
    .then(data => {
      let arr = JSON.parse(data); //now its an arr
      arr.push(new_data);
      let json = JSON.stringify(arr); //convert it back to json
      fs.writeFile(filename, json, "utf8", cb); // write it back
    })
    .catch(err => console.log(err));
}
app.post("/submit", function(req, res, next) {
  const {
    author_name,
    body,
    date_created
  } = req.body;
  if (author_name === undefined) {
    return next("Provide author_name field.");
  } else if (body === undefined) {
    return next("Provide body field.");
  } else if (date_created === undefined) {
    return next("Provide date_created field.");
  }
  if (!moment(new Date(date_created)).isValid()) {
    return next("Date is invalid.");
  }
  let new_data = {
    author_name,
    body,
    date_created: moment(date_created, "YYYY-MM-DD")
  };
  save_to_file("db.json", new_data, function(err) {
    if (err) {
      next(err);
    }
    res.send("success");
  });
});
app.get("/feedback", async function(req, res) {

  let data = await read_file("db.json");
  let parsed = JSON.parse(data);
  const {
    from_date,
    to_date,
    by_name
  } = req.query;
  let query_obj = {};

  if (from_date && moment(new Date(from_date)).isValid()) {
    query_obj["from_date"] = obj_date => moment(obj_date).isAfter(from_date);
  }

  if (to_date && moment(new Date(to_date)).isValid()) {
    query_obj["to_date"] = obj_date => moment(obj_date).isBefore(to_date);
  }

  if (by_name) {
    query_obj["by_name"] = obj_name => by_name === obj_name;
  }
  const filtered = filter_array(parsed, query_obj)
  res.json(filtered);
});

function filter_array(array, filters) {
  const filter_keys = Object.keys(filters)

  return array.filter(item => {
    return filter_keys.every(key => {
      if (typeof filters[key] !== 'function') return true;
      if (key === "from_date" || key === "to_date") return filters[key](item["date_created"])
      if (key === "by_name") return filters[key](item["author_name"])
    })
  })
}
app.use(function(err, req, res, next) {
  // formulate an error response here
  console.log("ERR ", err);
  res.status(500).send(err);
});
server.listen(port, () => console.log(`Server listening on port ${port}`));
module.exports = {
  filter_array,
  save_to_file,
}