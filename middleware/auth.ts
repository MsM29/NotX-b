import jwt from "jsonwebtoken";
const secretKey = "secret";

export default function (req, res, next) {
    try{
        const token = req.headers.cookie.slice(15)
        const decodedData=jwt.verify(token, secretKey)
        req.user=decodedData
        next()
    }
    catch(e){
        return res.sendStatus(400)
    }
}
