const functions = require('@google-cloud/functions-framework');
const mailchimp = require('@mailchimp/mailchimp_transactional')(process.env.API_KEY);
const axios = require('axios');

functions.cloudEvent('sendEmail', cloudEvent => {

  const base64data = cloudEvent.data.message.data;

  const { username,token } = JSON.parse(Buffer.from(base64data, 'base64').toString('utf-8'));
  console.log(username);
  console.log(token);

  const verificationLink = "http://kefihub.in:3000/v1/user/verify?username="+username+"&token="+token;

  performGetRequest = async (req, res) => {
    const url = 'http://kefihub.in:3000/v1/user/emailSent?username='+username;
    try {
      const response = await axios.get(url);
      console.log('Data updated successfully:', response.data);
      res.status(200).json(response.data);
    } catch (error) {
      console.error('Error during GET request:', error.message);
      res.status(500).send('Failed to perform GET request');
    }
  };
  
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
    // console.log(response);
    performGetRequest();
  }

  run().catch(console.error);
});
