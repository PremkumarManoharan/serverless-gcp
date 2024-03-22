const functions = require('@google-cloud/functions-framework');
const mailchimp = require('@mailchimp/mailchimp_transactional')(process.env.api_key);

functions.cloudEvent('sendEmail', cloudEvent => {
  
  const email = cloudEvent.data.message.data;
  const originalString = Buffer.from(email, 'base64').toString('utf-8');

    async function run() {
    const response = await mailchimp.users.ping();
    console.log(response);
    console.log(originalString);
    }
    run();
});
