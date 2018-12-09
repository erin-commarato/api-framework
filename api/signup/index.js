const Cognito = require('cognito');
const faker = require('faker');

exports.handler = async (event, context, callback) => {
  // const {email, password} = event;
  const email = faker.internet.email();
  console.log('Signing up:', email);
  const password = `${faker.internet.password()}123`;

  const userPool = new Cognito();
  const signup = await userPool.registerUser(email.toLowerCase(), password);

  callback(null, {signup});
};
