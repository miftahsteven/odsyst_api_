const { verify } = require("../app/helper/auth-jwt");
const ApiError = require("../app/helper/api-error");
const { JsonWebTokenError, TokenExpiredError } = require("jsonwebtoken");
const { prisma } = require("../prisma/client");

const authentication = async (req, res, next) => {
  try {
    const headerToken = req.headers.authorization;

    if (headerToken) {
      const token = headerToken.split(" ")[1];
      const payload = verify(token);
      //console.log("+++++++TOKEN", JSON.stringify(token));
      req.user = payload;
      req.user_id = payload.id;
      //const {id} = req.user;
      const user = await prisma.users.findFirst({
        where : {user_token: token, id: payload.id, user_status:1}        
      })

      //const user = {};

      //console.log("+++++++", JSON.stringify(user));

      if(user){
        return next();
      }else{
        return res.status(502).send({
          success: false,
          code: 502,
          message: "Login Problem: System Detect You're Login in other device, Please Re-Login",
        });
      }
    }
    //throw ApiError.badRequest("Login Ulang !");
    // return res.status(401).send({
    //   success: false,
    //   message: "ERROR : ANDA HARUS LOGIN ULANG",
    // });
  } catch (error) {
    if (error instanceof TokenExpiredError) {
      return res.status(502).send({
        success: false,
        code: 502,
        message: "ERROR : LOGIN EXPIRED",
      });
    }
    if (error instanceof JsonWebTokenError) {
      console.log("error", error.message);
      // res.send({
      //   success: false,
      //   code: 101,
      //   message: "ERROR : LOGIN EXPIRED",
      // });
    }
  }
};

const authorization =
  (...roles) =>
  (req, res, next) => {
    // console.log(req.user.role);
    // console.log(roles);
    const userRoles = req.user.role.split(",");
    const userRolesArray = [];
    for (i = 0; i < userRoles.length; i++) {
      userRolesArray.push(userRoles[i]);
      // console.log(userRoles[i]);
    }
    const intersection = roles.filter((element) => userRolesArray.includes(element));
    // console.log(intersection);
    // if (roles.includes(intersection)) {
    if (intersection.length > 0) {
      next();
    } else {
      next(ApiError.forbidden("forbidden !"));
    }
  };

module.exports = {
  authentication,
  authorization,
};
