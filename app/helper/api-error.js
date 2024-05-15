class ApiError extends Error {
  constructor(status, message) {
    super();
    (this.message = message), (this.status = status), (this.success = false);
  }

  static internal(message) {
    return new ApiError(500, message);
  }

  static forbidden(message) {
    return new ApiError(403, message);
  }

  static unauthorized(message) {
    return new ApiError(401, message);
  }

  static badRequest(message) {
    return new ApiError(400, message);
  }

  static pageNotFound(message) {
    return new ApiError(404, message);
  }
}

module.exports = ApiError;
