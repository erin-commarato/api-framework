const AWS = require('aws-sdk', {region: 'us-east-1'});
if (!AWS.config.region) {
  AWS.config.update({
    region: 'us-east-1'
  });
}

class Cognito {
  constructor() {
    this.userPoolId = process.env.USER_POOL_ID;
    this.clientId = process.env.CLIENT_ID;
    this.cognitoidentityserviceprovider = new AWS.CognitoIdentityServiceProvider();
  }

  registerUser(email, password) {
    try {
      return this._signUp(email, password)
        .then(() => this._confirmSignUp(email))
        .then(() => this.authenticateUser(email, password))
        .then(data => {
          console.log('auth user data', data);
          authData = data;
          return data;
        });
    } catch (e) {
      throw new Error(e);
    }
  }

  authenticateUser(username, password) {
    return new Promise((resolve, reject) => {
      const loginParams = {
        AuthFlow: 'ADMIN_NO_SRP_AUTH',
        ClientId: this.clientId,
        UserPoolId: this.userPoolId,
        AuthParameters: {
          USERNAME: username.toLowerCase(),
          PASSWORD: password
        }
      };

      this.cognitoidentityserviceprovider.adminInitiateAuth(loginParams, (err, data) => {
        if (err) {
          reject(err);
        } else {
          if (data.ChallengeName === 'NEW_PASSWORD_REQUIRED') {
            this.responseToChallenge(
              password,
              data.ChallengeParameters.USER_ID_FOR_SRP,
              data.Session
            ).then(challengeData => resolve(challengeData), challengeErr => reject(challengeErr));
          } else {
            resolve(data);
          }
        }
      });
    });
  }

  responseToChallenge(password, sub, session) {
    return new Promise((resolve, reject) => {
      const params = {
        ChallengeName: 'NEW_PASSWORD_REQUIRED' /* required */,
        ClientId: this.clientId /* required */,
        UserPoolId: this.userPoolId /* required */,
        ChallengeResponses: {
          NEW_PASSWORD: password,
          USERNAME: sub
        },
        ContextData: {
          HttpHeaders: [
            {
              headerName: 'ContentType',
              headerValue: 'application/json'
            }
            /* more items */
          ],
          IpAddress: '127.0.0.1' /* TODO: required */,
          ServerName: 'localhost' /* TODO: required */,
          ServerPath: '/' /* TODO: required */
        },
        Session: session
      };

      this.cognitoidentityserviceprovider.adminRespondToAuthChallenge(params, (err, data) => {
        if (err) {
          reject(err); //  an error occurred
        } else {
          resolve(data); //  successful response
        }
      });
    });
  }

  _signUp(username, password) {
    const params = {
      ClientId: this.clientId,
      Password: password,
      Username: username
    };

    return new Promise((resolve, reject) => {
      this.cognitoidentityserviceprovider.signUp(params, (err, data) => {
        if (err) {
          reject(err);
        } else {
          resolve(data);
        }
      });
    });
  }

  _confirmSignUp(username) {
    return new Promise((resolve, reject) => {
      const params = {
        UserPoolId: this.userPoolId,
        Username: username
      };

      this.cognitoidentityserviceprovider.adminConfirmSignUp(params, err => {
        if (err) {
          reject(err);
        } else {
          resolve(true);
        }
      });
    });
  }
}

//   setUserAttributes(username, attributes) {
//     console.log('Setting user attribures for user');

//     return new Promise((resolve, reject) => {
//       const params = {
//         UserAttributes: attributes,
//         Username: username.toLowerCase(),
//         UserPoolId: userPoolID
//       };

//       cognitoidentityserviceprovider.adminUpdateUserAttributes(params, (err, data) => {
//         if (err && Object.keys(err).length > 0) {
//           // this is sending a blank object with no errors
//           console.log('Error setting user attributes', err);
//           reject(err);
//         } else {
//           resolve(data);
//         }
//       });
//     });
//   }

//   forgotPassword(username) {
//     console.log('Fogot password for user');

//     return new Promise((resolve, reject) => {
//       const params = {
//         ClientId: clientID,
//         Username: username.toLowerCase()
//       };

//       cognitoidentityserviceprovider.forgotPassword(params, (err, data) => {
//         if (err) {
//           console.log('Error requestig forgot pasword', err);
//           reject(err);
//         } else {
//           console.log('Successfully requested forgot password');
//           resolve(data);
//         }
//       });
//     });
//   }

//   resetPassword(username) {
//     console.log('Reset password for user');

//     return new Promise((resolve, reject) => {
//       const params = {
//         UserPoolId: userPoolID /* required */,
//         Username: username.toLowerCase() /* required */
//       };
//       cognitoidentityserviceprovider.adminResetUserPassword(params, (err, data) => {
//         if (err) {
//           console.log(err, err.stack); //  an error occurred
//           reject(err);
//         } else {
//           resolve(data);
//         }
//       });
//     });
//   }

//   listUsers(paginationToken) {
//     const params = {UserPoolId: userPoolID};
//     if (paginationToken) params.PaginationToken = paginationToken;

//     return cognitoidentityserviceprovider.listUsers(params).promise();
//   }

//   getUser(username) {
//     console.log('Get User');

//     return new Promise((resolve, reject) => {
//       const params = {
//         UserPoolId: userPoolID /* required */,
//         Username: username.toLowerCase() /* required */
//       };
//       cognitoidentityserviceprovider.adminGetUser(params, (err, data) => {
//         if (err) {
//           reject(err);
//         } else {
//           resolve(data);
//         }
//       });
//     });
//   }

//   getIdentityId(user) {
//     let identityId = null;

//     if (user.UserAttributes) {
//       const identityIdAttribute = user.UserAttributes.find(
//         element => element.Name === 'custom:identityId'
//       );

//       if (identityIdAttribute) identityId = identityIdAttribute.Value;
//     }

//     return identityId;
//   }

//   verifyEmail(username) {
//     console.log('verifing email');

//     return new Promise((resolve, reject) => {
//       const params = {
//         UserAttributes: [{Name: 'email_verified', Value: 'True'}],
//         UserPoolId: userPoolID,
//         Username: username
//       };

//       cognitoidentityserviceprovider.adminUpdateUserAttributes(params, err => {
//         if (err) reject(err);
//         else resolve(true);
//       });
//     });
//   }

//   getRegistrationStatus(user) {
//     let regStatus = null;

//     if (user.UserAttributes) {
//       const regStatusAttribute = user.UserAttributes.find(
//         element => element.Name === 'custom:registrationStatus'
//       );

//       if (regStatusAttribute) regStatus = regStatusAttribute.Value;
//     }

//     return regStatus;
//   }

//   getEmail(user) {
//     console.log('get user email');

//     const userAttibuteName = user.Attributes ? 'Attributes' : 'UserAttributes';

//     const emailAttribute = user[userAttibuteName].find(element => element.Name === 'email');

//     return emailAttribute ? emailAttribute.Value : '';
//   }

//   deleteUser(username) {
//     console.log('Deleting user', username);

//     return new Promise((resolve, reject) => {
//       const params = {
//         UserPoolId: userPoolID /* required */,
//         Username: username.toLowerCase() /* required */
//       };
//       console.log('Deleting user params', params);

//       cognitoidentityserviceprovider.adminDeleteUser(params, (err, data) => {
//         if (err) {
//           console.log('Error deleting user', err);
//           reject(err);
//         } else {
//           console.log('successfully deleted user');
//           resolve(data);
//         }
//       });
//     });
//   }
// }

module.exports = Cognito;
