const uuid = require('uuid')
const Joi = require('@hapi/joi')
const argTypeEnum = require('./util/argType.enum')
const validatorDecorator = require('./util/validator.decorator')
class Handler {

  constructor(dynamoDbService) {
    this.dynamoDbService = dynamoDbService
    this.dyanoDbTable = process.env.DYNAMODB_TABLE
  }

  static validator() {
    return Joi.object({
      nome: Joi.string().min(2).max(100).required(),
      poder: Joi.string().min(2).max(20).required(),
    })
  }

  async insertItem(params) {
    return this.dynamoDbService.put(params).promise()
  }

  prepareData(data) {
    const params = {
      TableName: this.dyanoDbTable,
      Item: {
        ...data,
        id: uuid.v4(),
        createdAt: new Date().toISOString(),
      }
    }

    return params
  }

  handlerSuccess(data) {
    return {
      statusCode: 200,
      body: JSON.stringify(data)
    }
  }

  handlerError(data) {
    return {
      statusCode: data.statusCode || 501,
      headers: { 'Content-Type': 'text/plain' },
      body: 'Couldn\'t create item',
    }
  }

  async main(event) {
    try {
      const data = event.body

      const dbParams = this.prepareData(data)
      await this.insertItem(dbParams)

      return this.handlerSuccess(dbParams.Item)


    } catch (error) {
      console.log(error)
      return this.handlerError({ statusCode: 500 })
    }
  }
}

const AWS = require('aws-sdk')
const dynamoDB = new AWS.DynamoDB.DocumentClient()
const handler = new Handler(dynamoDB)
module.exports = validatorDecorator(handler.main.bind(handler), Handler.validator(), argTypeEnum.BODY)
