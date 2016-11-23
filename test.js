var bcrypt = require('bcrypt');
var salt = bcrypt.genSaltSync(10);
var password = 'yejiaquan';
var hash = bcrypt.hashSync(password, salt);
//var hash = '$2a$10$YgLoNGvTtPBfOCZXJY4XGesqFd.SoH6poxrf4SPrCS/zaR4nkynoW';

console.log(hash);
console.log(bcrypt.compareSync(password, hash));
