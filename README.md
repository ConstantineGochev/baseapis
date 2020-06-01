# Base apis
Tiny apis in rust(actix) and nodejs(express) .
## POST /submit expects json with the following format
```javascript
  {
    "author_name": "A",
    "body": "Some body.",
    "date_created": "2011-03-15"
  }
```
## GET /feedback returns filtered data with optional query params.
Query params are `by_name`, `from_date` and `to_date`

## Get Started
To build the nodejs app with Docker use following commands

`docker build -t mynode ./node`
`docker run -p 4000:4000 -v $PWD/db.json:/app/db.json mynode`

To run the unit tests `npm run test`

To build the rust app - `cargo run` and `cargo test` for the tests
