require('dotenv').config()
require('./config/database')
require('./model/user')

const express = require('express')
const cors = require('cors')
const PORT = process.env.PORT || 3333

const swaggerUi = require('swagger-ui-express')
const app = express()

const { passport } = require('./middleware/passport')


const swagger = require('./documentation')
const userRouter = require('./routes/user')
const bankRouter = require('./routes/bank')
const kycRouter = require('./routes/kyc')
const paymentRouter = require('./routes/payment')
const conversionRouter = require('./routes/conversion')
const adminRouter = require('./routes/admin')


app.use(express.json());
app.use(cors())

app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swagger))

app.use('/api/v1', userRouter)
app.use('/api/v1', bankRouter)
app.use('/api/v1', kycRouter)
app.use('/api/v1', paymentRouter)
app.use('/api/v1', conversionRouter)
app.use('/api/v1', adminRouter)

app.listen(PORT, () =>{
    console.log(`Server is running on PORT: ${PORT}`)
});
