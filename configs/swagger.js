import swaggerJSDoc from "swagger-jsdoc";
import swaggerUi from "swagger-ui-express"

const swaggerOptions = {
    swaggerDefinition:{
        openapi: "3.0.0",
        info:{
            title: "social network API",
            version:"1.0.0",
            description: "API de social network",
            contact:{
                name: "Angel Magaña",
                email: "amagana-2023257@kinal.edu.gt"
            }
        },
        servers:[
            {
                url: "http://127.0.0.1:3000/ventas/v1"
            }
        ]
    },
    apis:[
        "./src/user/*.js",
    ]
}

const swaggerDocs = swaggerJSDoc(swaggerOptions)

export { swaggerDocs, swaggerUi }