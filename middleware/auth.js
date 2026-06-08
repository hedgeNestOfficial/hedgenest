const jwt = require('jsonwebtoken')

const Authentication = async (req, res, next)=>{
    try {
        const token = req.headers.authorization?.split(" ")[1]
        

        if(!token){
            return res.status(401).json({
                message:'Token not Found'
            })
        }
        const Validtoken =  jwt.verify(token, process.env.SECRET_KEY,(err,data)=>{
            if(err){
                console.log(err.message)
                return res.status(500).json({
                    message:'Token validation failed'
                })
            }
            req.user = data
            next()

        })
    } catch (error) {
        console.log(error)
        res.status(500).json({
            message: error.message
        })
    }
}
const adminAuth = (req, res,next)=>{
    if(req.user.role !== 'admin'){
        return res.status(403).json({
            message:'Unauthorized Access'
        })
    }
    next()
}
module.exports = {
    Authentication,
    adminAuth
}
