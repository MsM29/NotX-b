import jwt from "jsonwebtoken";
const secretKey = "secret";

export function auth(req, res, next) {
  try {
    const token = req.headers.cookie.slice(15);
    const decodedData = jwt.verify(token, secretKey);
    req.user = decodedData;
    next();
  } catch (e) {
    console.log(e)
    return res.sendStatus(400);
  }
}

export function generateAccessToken(id, login, email) {
  const payload = {
    id,
    login,
    email,
  };
  return jwt.sign(payload, secretKey, { expiresIn: "24h" });
}
