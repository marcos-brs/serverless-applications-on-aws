# 1 - create policies.json for permission
# {
#   "Version": "2012-10-17",
#   "Statement": [
#     {
#       "Effect": "Allow",
#       "Principal": {
#         "Service": "lambda.amazonaws.com"
#       },
#       "Action": "sts:AssumeRole"
#     }
#   ]
# }

# 2-  create role for lambda function
aws iam create-role \
    --role-name first-lambda-role \
    --assume-role-policy-document file://policies.json \
    | tee logs/iam-create-role.log

# 3- create index.js with codebase
# 4- zip index.js (need install zip)
zip function.zip index.js

# 5- create lambda function
aws lambda create-function \
    --function-name first-lambda-cli \
    --zip-file fileb://function.zip \
    --handler index.handler \
    --runtime nodejs16.x \
    --role arn:aws:iam::729265352465:role/first-lambda-role \
    | tee logs/lambda-create-function.log

# 6- invoke lambda function
aws lambda invoke \
    --function-name first-lambda-cli \
    --log-type Tail \
    logs/lambda-invoke.log

# 7- update lambda function
zip function.zip index.js

aws lambda update-function-code \
    --function-name first-lambda-cli \
    --zip-file fileb://function.zip \
    | tee logs/lambda-update-function.log

# 8- invoke lambda function again
aws lambda invoke \
    --function-name first-lambda-cli \
    --log-type Tail \
    logs/lambda-invoke.log

# 9- delete lambda function
aws lambda delete-function \
    --function-name first-lambda-cli

# 10- delete role
aws iam delete-role \
    --role-name first-lambda-role
