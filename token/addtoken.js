const jwt = require('jsonwebtoken')

const serect = 'token'

module.exports = (userinfo)=>{

    const token = jwt.sign({
        user:userinfo.username,
        id:userinfo.id
    },serect,{expiresIn:'1h'})

    return token
}
