'use strict'
var cloudinary = require('cloudinary');
const cloudinary_config = cloudinary.config({ 
    cloud_name: 'dftu7s8cf', 
    api_key: '479194718319492', 
    api_secret: 'ymVJcMAkDYClt_aiZk3nNY8mMno' 
  });
module.exports = cloudinary_config;