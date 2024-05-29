const jwt = require("jsonwebtoken");

const config = process.env;

let verifyToken = (req, res, next) => {
    const authorizationHeader = req.headers.authorization;
  
    if (!authorizationHeader) {
      return res.status(403).send("A token is required for authentication");
    }
  
    const token = authorizationHeader.split(" ")[1]; // Extract the token from the "Bearer <token>" format
  
    if (!token) {
      return res.status(403).send("A token is required for authentication");
    }
  
    try {
      const decoded = jwt.verify(token, "jwt_secret_key"); // Giải mã token
      req.user = decoded;
      next();
    } catch (err) {
      return res.status(401).send("Invalid Token");
    }
};

let verifyTokenQuanLi = (req, res, next) => {
    const authorizationHeader = req.headers.authorization;
  
    if (!authorizationHeader) {
      return res.status(403).send("A token is required for authentication");
    }
  
    const token = authorizationHeader.split(" ")[1]; // Extract the token from the "Bearer <token>" format
  
    if (!token) {
      return res.status(403).send("A token is required for authentication");
    }
  
    try {
      const decoded = jwt.verify(token, "jwt_secret_key"); // Decode the token
      const { MaVaitro } = decoded; // Get the MaVaitro from the decoded token
  
      if (MaVaitro === "QL") {
        req.user = decoded;
        next();
      } else {
        return res.status(401).send("Unauthorized access"); // If the MaVaitro is not "quanli", send an unauthorized access error
      }
    } catch (err) {
      return res.status(401).send("Invalid Token");
    }
  };

let getUserIdFromToken  = async (req) => {
  try {
    const authorizationHeader = req.headers.authorization;
    if (!authorizationHeader) {
      return null;
    }
    const token = authorizationHeader.split(' ')[1]; // Lấy token từ header của request
    if (!token) {
      throw new Error("Missing token");
    }
    const decodedToken = jwt.verify(token, "jwt_secret_key");  
    return {
        MaTk: decodedToken.MaTk,
        MaVaitro: decodedToken.MaVaitro
    };
  } catch (err) {
    return null;
  }
};


module.exports = {
  verifyToken,
  verifyTokenQuanLi,
  getUserIdFromToken

};