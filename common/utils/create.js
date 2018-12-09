const {exec} = require('child_process');

const environment = process.argv[2];

let claudiaCommand = null;
// get name of dir nmp was run in.
const lambdaName = process
  .cwd()
  .split('/')
  .pop();

console.log(`Executing ${environment} create claudia command for ${lambdaName}`);

if (environment === 'prod') {
  claudiaCommand = `claudia create --region us-east-1 --handler index.handler --name ${lambdaName} --set-env-from-json ../../common/prod-env.json --config=./.claudia/prod_claudia.json  --profile personal --role lambda_basic_execution`;
} else if (environment === 'test') {
  claudiaCommand = `claudia create --region us-east-1 --handler index.handler --name ${lambdaName}_test --set-env-from-json ../../common/test-env.json --config=./.claudia/test_claudia.json --profile personal --role lambda_basic_execution`;
} else if (environment === 'dev') {
  claudiaCommand = `claudia create --region us-east-1 --handler index.handler --name ${lambdaName}_dev --set-env-from-json ../../common/dev-env.json --config=./.claudia/dev_claudia.json --profile personal --role lambda_basic_execution`;
} else {
  console.error(
    `Unkown configuration environment [${environment}]. Usage: create [prod, test, dev]`
  );
}

if (claudiaCommand) {
  exec(claudiaCommand, (error, stdout, stderr) => {
    if (error || stderr) console.error(error || stderr);
    else console.log(stdout);
  });
}
