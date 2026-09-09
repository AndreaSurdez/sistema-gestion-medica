module.exports = {
  secret: process.env.JWT_SECRET || 'default_secret_change_in_production',
  expiration: process.env.JWT_EXPIRATION || '1h',
  options: {
    algorithm: 'HS256',
    expiresIn: process.env.JWT_EXPIRATION || '1h'
  }
};