# baseapis
docker build -t mynode ./node 
docker run -p 4000:4000 -v $PWD/db.json:/app/db.json mynode
