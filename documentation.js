const swagger = require ('swagger-jsdoc')
const options = {
    definition : {
        openapi:'3.0.0',
        info:{
            title:'hedgeNest App',
            version:'1.0.0',
            description:'swagger documentaion'
        },
        servers:[
            {
                url: "https://hedgenest.onrender.com",
                description: 'The hosted route'
            },
            {
                url: "http://localhost:8228",
                description: 'Localhost route '
            },
        ],
        components: {
        securitySchemes:{
            bearerAuth:{
                type: 'http',
                scheme: 'bearer',
                bearerformat:'JWT'
            }
        }
    }

    },
    apis: [
        "./docs/users.yaml","./docs/bank.yaml","./docs/kyc.yaml","./docs/payment.yaml", "./docs/conversion.yaml"
    ],
}

module.exports = swagger(options)
