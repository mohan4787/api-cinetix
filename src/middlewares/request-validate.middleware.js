const bodyValidator = (schema) => {
  return async (req, res, next) => {
    try {
      const data = req.body;
      await schema.validateAsync(data, { abortEarly: false });
      next()
    } catch (exception) {
      let messageBag = {};
      exception.details.map((error) => {
      let key = error.path.pop();
        messageBag[key] = error.message;
      });
      next({
        code: 400,
        detail: messageBag,
        message: "Validation Failed",
        status: "VALIDATION_FAILED",
      });
    }
  };
};

module.exports = bodyValidator;
