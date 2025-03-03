# Scheduler App Server

## Serves As a Validator And Schedule Creator For Respective UI

### For Local Development

##### yarn
`yarn && yarn start`
##### npm
`npm i && npm start`

### For Production Ready Build

##### Run
`docker build -t scheduler-api-dc .`
##### then run
`docker run --name scheduler-server -p 9080:9080 scheduler-api-dc`
##### Server will start listening for request at the following URI
[http://localhost:9080](http://localhost:9080)