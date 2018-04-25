# Project Title

Api Rest usando NodeJS con Express y MongoDB para una red social basica

# Used Technologies

- Nodejs
    - Express
- Mongodb

#Resources used in this project
- Express,
- Mongoose,
- Mongoose-pagination,
- Bcrypt-node,
- Body-parser,
- Cloudinary,
- Connect-multiparty,
- Jwt-simple,
- Moment,
    

### Testing
- Agregar archivos config.js y cloudinary.config.js* en la raiz del proyecto.

config.js:
```js
        module.exports = {
        port : process.env.PORT || 3000,
        db : process.env.MONGODB_URI || 'mongodb://localhost:27017/api',
        SECRET_TOKEN: 'clave_secreta',
    }
```

cloudinary.config.js:
```js
    var cloudinary = require('cloudinary');
    const cloudinary_config = cloudinary.config({ 
        cloud_name: ####, 
        api_key: ####, 
        api_secret: #### 
    });
    module.exports = cloudinary_config;
```

