use actix_web::{web, App, HttpResponse, HttpServer,  middleware};
use std::fs::{File, write};
use std::io::prelude::*;
use std::path::Path;
use serde::{Serialize, Deserialize};
use serde_json::*;
use chrono::{NaiveDate};


fn read_file(path: &Path) -> String{
    let display = path.display();
    //
    // // Open the path in read-only mode, returns `io::Result<File>`
    let mut file = match File::open(path) {
        // The `description` method of `io::Error` returns a string that
        // describes the error
        Err(why) => panic!("couldn't open {}", display),
        Ok(file) => file,
    };
    //
    // Read the file contents into a string, returns `io::Result<usize>`
    let mut s = String::new();
    match file.read_to_string(&mut s) {
        Err(why) => panic!("couldn't read {}", display),
        Ok(_) => print!("{} contains:\n{}", display, s),
    }
    s
}

#[test]
fn test_read_file() {
    let path = &Path::new("db.json");
    println!("{:?}", path);
    read_file(path);
}
#[derive(Serialize, Deserialize,Debug,Clone)]
struct FeedBack {
    author_name: String,
    body: String,
    #[serde(with = "date_from_str")]
    date_created: NaiveDate
}

#[derive(Deserialize, Clone)]
struct QueryParams {
    #[serde(with = "date_from_str")]
    from_date: NaiveDate,
    #[serde(with = "date_from_str")]
    to_date: NaiveDate,
    by_author: Option<String>
}
mod date_from_str {
    use chrono::{NaiveDate};
    use serde::{self, Deserialize, Serializer, Deserializer};
    const FORMAT: &'static str = "%Y-%m-%d";


    pub fn serialize<S>(
        date: &NaiveDate,
        serializer: S,
    ) -> Result<S::Ok, S::Error>
    where
        S: Serializer,
    {
        let s = format!("{}", date.format(FORMAT));
        serializer.serialize_str(&s)
    }

    pub fn deserialize<'de, D>(
        deserializer: D,
    ) -> Result<NaiveDate, D::Error>
    where
        D: Deserializer<'de>,
    {
        let s = String::deserialize(deserializer)?;
        NaiveDate::parse_from_str(&s, FORMAT).map_err(serde::de::Error::custom)
    }
}

async fn submit(feedback: web::Json<FeedBack>) -> HttpResponse {
    let path = &Path::new("db.json");
    let fb: FeedBack = FeedBack{
        author_name:feedback.author_name.clone(),
        body:feedback.body.clone(),
        date_created:feedback.date_created
    };

    let file_contents: String = read_file(&path);
    let mut json: Vec<FeedBack> = from_str(&file_contents).unwrap();

    json.push(fb);
    let ser = to_string(&json).unwrap();
    write(&path, ser);
    HttpResponse::Ok().content_type("application/json").json(feedback.0)
}
async fn feedback(web::Query(params): web::Query<QueryParams>) -> HttpResponse {

    let path = &Path::new("db.json");

    let file_contents: String = read_file(&path);
    let json: Vec<FeedBack> = from_str(&file_contents).unwrap();
    let filtered: Vec<FeedBack> = json.iter().filter(|f| {
        if params.by_author.is_none() {
            return f.date_created.ge(&params.from_date) && f.date_created.le(&params.to_date)
        } else {
            return f.date_created.ge(&params.from_date) &&
                   f.date_created.le(&params.to_date) &&
                   &f.author_name == params.by_author.as_ref().unwrap()
        }
    }).cloned().collect();
    println!("FILTERED {:?}", filtered);
    let ser_fil = to_string(&filtered).unwrap();
    let s: Vec<FeedBack> = from_str(&ser_fil).unwrap();
    HttpResponse::Ok().content_type("application/json").json(s)

}
#[actix_rt::main]
async fn main() -> std::io::Result<()> {
    std::env::set_var("RUST_LOG", "actix_web=info");
    env_logger::init();
    HttpServer::new(|| {
        App::new()
        .wrap(middleware::Logger::default())
        .data(web::JsonConfig::default().limit(4096)) // <- limit size of the payload (global configuration)
        .service(web::resource("/submit").route(web::post().to(submit)))
        .route("/feedback", web::get().to(feedback))
    })
    .bind("127.0.0.1:8000")?
    .run()
    .await
}
