

module.exports = {
    port : process.env.PORT || 3800,
    db : process.env.MONGODB_URI || 'mongodb://localhost:27017/mean_social',
    SECRET_TOKEN: 'clave_secreta_red_social_node',
}