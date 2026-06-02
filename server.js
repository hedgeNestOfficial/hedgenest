require('dotenv').config()
require('./config/database')
require('./model/user')
const cors = require('cors')

const swaggerUi = require('swagger-ui-express')
const swagger = require('./documentation')
const expressSession = require('express-session')
const { passport } = require('./middleware/passport')


const userRouter = require('./routes/user')
const bankRouter = require('./routes/bank')
const kycRouter = require('./routes/kyc')

const express = require('express')
const PORT = process.env.PORT || 3333
const app = express()

app.use(cors());

app.use(expressSession({
  secret:'michael',
  resave:true,
  saveUninitialized:true
}))
app.use(passport.initialize())
app.use(passport.session())

app.use('/api/v1', userRouter)
app.use('/api/v1', bankRouter)
app.use('/api/v1', kycRouter)

app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swagger))

app.listen(PORT, () =>{
    console.log(`Server is running on PORT: ${PORT}`)
});
