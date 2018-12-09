const environment = process.argv[2];
let claudiaCommand = null;
const lambdaName = process
  .cwd()
  .split('/')
  .pop();

const {exec} = require('child_process');

console.log(`Executing ${environment} update claudia command for ${lambdaName}`);

if (environment === 'prod') {
  claudiaCommand =
    'claudia update --update-env-from-json ../../common/prod-env.json --config=.claudia/prod_claudia.json --profile personal';
} else if (environment === 'test') {
  claudiaCommand =
    'claudia update --update-env-from-json ../../common/test-env.json --config=.claudia/test_claudia.json --profile personal';
} else if (environment === 'dev') {
  claudiaCommand =
    'claudia update --update-env-from-json ../../common/dev-env.json --config=.claudia/dev_claudia.json --profile personal';
} else {
  console.error(`Unkown configuration [${environment}]. Usage: update [prod, test, dev]`);
}

if (claudiaCommand) {
  exec(claudiaCommand, (error, stdout, stderr) => {
    if (error || stderr) console.error(error || stderr);
    else console.log(`finished update for ${lambdaName}`);
  });
}
