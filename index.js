const functions = require('@google-cloud/functions-framework');
const dotenv = require('dotenv')
const sgMail = require('@sendgrid/mail')
dotenv.config()
sgMail.setApiKey(process.env.SENDGRID_API_KEY)
const { Pool } = require('pg');




async function test() {
  const message = {
    from: "no-reply@kefihub.in",
    subject: "Verify Your Email Address",
    html: `<p>Welcome to Our Service!</p><p>Please verify your email by clicking on the link below:</p><a href="">Verify Email</a>`,
    to: "premmano98@gmail.com"
  };
  const status = await sgMail.send(message);
  console.log(status);
}
test()
functions.cloudEvent('sendEmail', cloudEvent => {

const pool = new Pool({
  user: process.env.PG_USER,
  host: process.env.PG_HOST,
  database: process.env.PG_DB,
  password: process.env.PG_PASSWORD,
  port: 5432, // Default port for PostgreSQL
});

  const base64data = cloudEvent.data.message.data;

  const { username,token } = JSON.parse(Buffer.from(base64data, 'base64').toString('utf-8'));

  console.log(username);
  console.log(token);

  const verificationLink = "http://kefihub.in:3000/v1/user/verify?username="+username+"&token="+token;
  
  const message = {
    from: "no-reply@kefihub.in",
    subject: "Verify Your Email Address",
    html: `<p>Welcome to Our Service!</p><p>Please verify your email by clicking on the link below:</p><a href="${verificationLink}">Verify Email</a>`,
    to: username
  };

  async function run() {
    console.log(message);
   const status = await sgMail
    .send(message)
    .then(() => {
      console.log('Email sent');
      const now = new Date();
      const twoMinutesInMilliseconds = 2 * 60 * 1000; // Convert 2 minutes to milliseconds
      const validity = new Date(now.getTime() + twoMinutesInMilliseconds); // Add 2 minutes to 'now'
      const updateQuery = 'UPDATE public."Users" SET "tokenValidity" = $1 WHERE username = $2';
      const values = [validity, username];

      pool.query(updateQuery, values, (err, res) => {
      if (err) {
        console.error('Error executing query', err.stack);
      } else {
        console.log('Query executed successfully:', res);
      }
      pool.end();
});
    })
    .catch((error) => {
      console.error(error)
    })
    console.log(status);
     
  }
  run().catch(console.error);
});
