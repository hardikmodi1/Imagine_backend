var SparkPost=require('sparkpost');
import 'babel-polyfill';
const key='8ebfdf305a25226f0993e870beb597bb30bb669c';
const client=new SparkPost('da94ad6a0079dcdb3583043b40500eecd9695d42');

export const sendEmail = async (recipient, url) => {
  const response = await client.transmissions.send({
    options: {
      sandbox: true
    },
    content: {
      from: "testing@sparkpostbox.com",
      subject: "Confirm Email",
      html: `<html>
        <body>
        <p>Testing SparkPost - the world's most awesomest email service!</p>
        <a href="${url}">confirm email</a>
        </body>
        </html>`
    },
    recipients: [{ address: recipient }]
  });
  console.log(response);
};