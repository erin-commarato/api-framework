const mysql = require('mysql2');

const dbUser = process.env.MYSQL_USER;
const dbName = process.env.MYSQL_DATABASE;
const dbHost = process.env.MYSQL_HOST;
const dbPass = process.env.MYSQL_PASSWORD;

module.exports = () => {
  const module = {
    createConnection: () => {
      const connectionPrams = {
        host: dbHost,
        user: dbUser,
        database: dbName,
        password: dbPass
      };

      return new Promise((resolve, reject) => {
        if (!connectionPrams.password) {
          module
            .getToken(dbUser, dbHost)
            .then(token => {
              connectionPrams.password = token;
              connectionPrams.ssl = 'Amazon RDS';
              connectionPrams.authSwitchHandler = (data, cb) => {
                //  modifies the authentication handler
                if (data.pluginName === 'mysql_clear_password') {
                  //  authentication token is sent in clear text but connection uses SSL encryption
                  cb(null, Buffer.from(`${token}\0`));
                }
              };

              const connection = mysql.createConnection(connectionPrams);

              console.log('got connection');

              resolve(connection);
            })
            .catch(err => reject(err));
        } else {
          const connection = mysql.createConnection(connectionPrams);

          console.log('got connection');

          resolve(connection);
        }
      });
    },

    getToken: (dbUsername, dbEndpoint, region = 'us-east-1', dbPort = 3306) => {
      const promise = new Promise((resolve, reject) => {
        const signer = new AWS.RDS.Signer();

        const params = {
          region,
          hostname: dbEndpoint,
          port: dbPort,
          username: dbUsername
        };
        signer.getAuthToken(params, (err, token) => {
          if (err) {
            console.log('error getting token', err);
            reject(err);
          } else {
            console.log('got token');
            resolve(token);
          }
        });
      });

      return promise;
    },

    addUser: (email, callback) => {
      module
        .createConnection()
        .then(connection => {
          console.log('connenct to DB');

          connection.connect();

          //  set up query
          const query = `INSERT INTO api_users (email) VALUES (${email})`;

          console.log('run query');
          connection.query(query, (error, results /* , fields */) => {
            if (error) console.log('error inserting user record', error);

            if (!results || !results[0]) callback('User not found');
            else callback(error, results[0]);
          });

          connection.end();
        })
        .catch(err => callback(err));
    }
  };

  return module;
};
