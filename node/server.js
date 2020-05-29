const express = require('express');
const http = require('http');
const fs = require('fs');
const util = require('util');
const app = express();

const port = 4000;
const body_parser = require('body-parser');

app.use(body_parser.json());
const server = http.createServer(app);
const read_file = util.promisify(fs.readFile);

function save_to_file(filename, new_data, cb) {
  read_file(filename).then(data => {
    let arr = JSON.parse(data); //now its an arr
    arr.push(new_data);
    let json = JSON.stringify(arr); //convert it back to json
    fs.writeFile(filename, json, 'utf8', cb); // write it back

  }).catch(err => console.log(err))
}
app.post("/submit", function(req, res, next) {
  if (req.body.author_name === undefined) {
    return next("Provide author_name field.")
  } else if (req.body.body === undefined) {
    return next("Provide body field.")
  } else if (req.body.date_created === undefined) {
    return next("Provide date_created field.")
  }
  let new_data = {
    author_name: req.body.author_name,
    body: req.body.body,
    date_created: req.body.date_created
  }
  save_to_file("db.json", new_data, function(err) {
    if (err) {
      next(err)
    }
    res.send('success')
  })
})
app.get("/feedback", async function(req, res) {
  let data = await read_file("db.json")
  let parsed = JSON.parse(data)
  res.json(parsed)
})
app.use(function(err, req, res, next) {
  // formulate an error response here
  console.log("ERR ", err);
  res.status(500).send(err)
});
server.listen(port, () => console.log(`Server listening on port ${port}`))