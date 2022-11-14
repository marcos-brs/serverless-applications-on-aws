const validatorDecorator = (fn, schema, argsType) => {
  return async function (event, context) {
    const data = JSON.parse(event[argsType])
    const { error, value } = schema.validate(data, { abortEarly: false });

    if (error) {
      return {
        statusCode: 422,
        body: error.message
      }
    }

    event[argsType] = value;

    return fn.apply(this, arguments);
  };
}

module.exports = validatorDecorator
