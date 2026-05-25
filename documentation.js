const swagger = require ('swagger-jsdoc')
const options = {
    definition : {
        openapi:'3.0.0',
        info:{
            title:'Splita App',
            version:'1.0.0',
            description:'swagger documentaion'
        },
        servers:[
            {
                url:"http://localhost:8228/api/v1",
                description: 'production'
            },
            {
                url:"http://localhost:8228/api/v1",
                description: 'development'
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
        "./docs/user.yaml"
    ],
}

module.exports = swagger(options)