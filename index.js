const functions = require('@google-cloud/functions-framework');
const mailchimp = require('@mailchimp/mailchimp_transactional')(process.env.API_KEY);
const { Pool }  = require('pg');

functions.cloudEvent('sendEmail', cloudEvent => {

  const base64data = cloudEvent.data.message.data;

  const { username,token } = JSON.parse(Buffer.from(base64data, 'base64').toString('utf-8'));
  console.log(username);
  console.log(token);

  const verificationLink = "http://kefihub.in/verify?username="+username+"&token="+token;

    const pool = new Pool({
        user: process.env.PG_USER,
        host: process.env.PG_HOST,
        database: process.env.PG_DB,
        password: process.env.PG_PASSWORD,
        port: '5432',
    });

    updateDatabase = async (username) => {

    const client = await pool.connect();

    try {
       
        console.log(username);
        const now = new Date();
        const twoMinutesInMilliseconds = 2 * 60 * 1000; // Convert 2 minutes to milliseconds
        const validity = new Date(now.getTime() + twoMinutesInMilliseconds); // Add 2 minutes to 'now'
        const sql = 'UPDATE public."Users" SET "tokenValidity" = $1 WHERE username = $2';
        const values = [validity, username];
        await client.query(sql, values);
    } catch (error) {
        console.error('Error executing the query', error.stack);
    } finally {
        client.release();
    }
    };



    updateDatabase(username);

  const message = {
    from_email: "no-reply@kefihub.in",
    subject: "Verify Your Email Address",
    html: `<p>Welcome to Our Service!</p><p>Please verify your email by clicking on the link below:</p><a href="${verificationLink}">Verify Email</a>`,
    to: [
      {
        email: username,
        type: "to"
      }
    ]
  };

  async function run() {
    console.log(message);
    // const response = await mailchimp.messages.send({ message });
    console.log(response);
  }

  run().catch(console.error);
});
