const jwt = require("jsonwebtoken");
const User = require("../../models/user/User");
const ApiError = require("../../utils/ApiError");
const asyncHandler = require("../../utils/asyncHandler");
const { isMongoReady } = require("../../config/mongo");

const protect = asyncHandler(async (req, res, next) => {
  if (!isMongoReady()) {
    return next(
      new ApiError(
        503,
        "User/auth database (MongoDB) is not connected. Auth is unavailable until Mongo is reachable."
      )
    );
  }

  let token;

  const authHeader = req.headers.authorization;

  if (authHeader && authHeader.startsWith("Bearer ")) {
    token = authHeader.split(" ")[1];
  } else if (req.cookies?.token) {
    token = req.cookies.token;
  }

  if (!token) {
    return next(new ApiError(401, "Authentication required (no token)"));
  }

  if (token === "undefined" || token === "null" || token === "jwt-token") {
    return next(new ApiError(401, `Invalid token: ${token}`));
  }

  let decoded;

  try {
    decoded = jwt.verify(token, process.env.JWT_SECRET);
  } catch {
    return next(new ApiError(401, "Invalid token (jwt error)"));
  }

  const user = await User.findById(decoded.id).select("-password");

  if (!user || !user.isActive) {
    return next(new ApiError(401, "User not found or inactive"));
  }

  req.user = user;
  next();
});

module.exports = protect;
