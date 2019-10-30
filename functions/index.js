const functions = require("firebase-functions");
const nodemailer = require("nodemailer");
var smtpTransport = require("nodemailer-smtp-transport");

const urlMetadata = require("url-metadata");

const gmailEmail = functions.config().gmail.email;
const gmailPassword = functions.config().gmail.password;
const mailTransport = nodemailer.createTransport(
  smtpTransport({
    service: "gmail",
    host: "smtp.gmail.com",
    auth: {
      user: gmailEmail,
      pass: gmailPassword
    }
  })
);

exports.sendEmail = functions.https.onCall((data, context) => {
  const mailOptions = {
    from: data.values.email,
    to: gmailEmail,
    subject: data.values.subject,
    text: `From:${data.values.name} \n\nEmail: ${data.values.email} \n\nMessage: ${data.values.message}`
  };

  return mailTransport.sendMail(mailOptions).then(() => {
    return { isEmailSend: true };
  });
});

exports.getUrlMetadata = functions.https.onCall((data, context) => {
  return urlMetadata(data)
    .then(metadata => {
      // success handler
      console.log("metadata: ", metadata);
      var result = {
        name: metadata.title,
        image: metadata.image,
        description: metadata.description
      };
      return result;
    })
    .then(error => {
      // failure handler
      console.log(error);
      return error;
    })
    .catch(error => {
      console.error(error);
      return error;
    });
});
