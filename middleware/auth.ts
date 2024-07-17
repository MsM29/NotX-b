import jwt from "jsonwebtoken";
const secretKey = "secret";

export default function (req, res, next) {
    try{
        console.log(req.headers.cookie)
        const token = req.headers.cookie.slice(15)
        const decodedData=jwt.verify(token, secretKey)
        req.user=decodedData
        next()
    }
    catch(e){
        console.log(e)
        return res.json({message:"Пользователь не авторизован"})
    }
}
