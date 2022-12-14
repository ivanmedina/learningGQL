const  bcrypt = require('bcrypt')
const User = require('../models/user')
const jwt = require('jsonwebtoken')

const auth =  {
    login: async(email, password, secretKey)=>{
        const user = await User.findOne({email: email})
        if(!user) return {error: 'Usuario o contraseña incorrectos'}
        const validPassword = await bcrypt.compare(password, user.password)
        if(!validPassword) return {error: 'Usuario o contrasña incorrectos'}

        const token = await jwt.sign({
            _id: user._id,
            name: user.name,
            date: user.date
        }, secretKey)

        return  {message: 'login correcto', token}
    },
    checkHeaders: (req, res, next)=>{
        const token = req.header('Authorization')
        if(!token){
            req.user = {auth: false}
            return next()
        }
        console.log(req.user)
        const jwtToken = token.split(' ')[1]
        console.log(jwtToken)
        if(jwtToken){
            try{
                const payload = jwt.verify(jwtToken, process.env.SECRET_KEY_GRAPHQL_UDEMY)
                console.log('payload',payload)
                req.user = payload
                req.user.auth = true
                return next()
            }catch(e){
                req.user = {auth:false}
                return next()
            }
        }else{
            req.user = {auth: false}
            return next()
        }
    }
}

module.exports = auth