const jwt = require('jsonwebtoken');

module.exports = (req,res, next) => {
    try {
        console.log(req.headers)

        const token = req.headers.authorization.split(' ')[1];

        if(!token){
            return res.status(400).json({message: 'Нет доступа!'})
        }

        const decoded = jwt.verify(token, require('./../config.js').jwtKey)

        req.user = decoded;

        next()

    } catch (e) {
        console.log(e)
        next()
    }
}