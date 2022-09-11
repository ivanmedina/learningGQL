const express = require('express')
const graphqlHTTP = require('express-graphql')
const schema = require('./schema/shecma')
const mongoose = require('mongoose')
const auth = require('./utils/auth')

mongoose.connect('mongodb://localhost/courses_db',{
    useNewUrlParser: true,
    useUnifiedTopology: true
})
.then(()=>console.log('Conectado a MongoDB correctamente'))
.catch(()=>console.log('Error al intentar conectarse a la base de datos'))

const app = express()

app.use(
    auth.checkHeaders
)

app.use('/graphql', graphqlHTTP.graphqlHTTP((req)=>{
    return {
        schema,
        context:{
            user: req.user
        }
    }
}))

app.listen(3131, ()=>{
    console.log('Listening in 3131');
})
