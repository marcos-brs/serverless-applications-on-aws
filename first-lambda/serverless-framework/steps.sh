#1- install serverless framework
npm install -g serverless

#2- create a new serverless project
serverless create --template aws-nodejs --path hello-sls

#3- deploy the project
serverless deploy

#4- invoke the function
serverless invoke --function hello

#5- invoke locally
serverless invoke local --function hello

#6- invoke locally with logs
serverless invoke local --function hello --log

#7- monitor the function
serverless logs --function hello --tail
