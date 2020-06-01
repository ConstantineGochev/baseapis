const util = require("util");
const fs = require("fs");
const read_file = util.promisify(fs.readFile);

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
module.exports = {
  filter_array,
  save_to_file,
  read_file
}