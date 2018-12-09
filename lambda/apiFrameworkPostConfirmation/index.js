const mysql = require('mysql');

exports.handler = (event, context, callback) => {
  console.log(mysql);
  callback(null, 'ok');
};
