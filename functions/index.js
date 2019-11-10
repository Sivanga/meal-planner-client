const functions = require("firebase-functions");
const nodemailer = require("nodemailer");
var smtpTransport = require("nodemailer-smtp-transport");
const _ = require("lodash");
const request = require("request-promise");
const firebase = require("firebase");
const { Client } = require("@elastic/elasticsearch");
const elasticSearchConfig = functions.config().elasticsearch;

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

/** Contact us page */
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

/** Import dish form url */
exports.getUrlMetadata = functions.https.onCall((data, context) => {
  return urlMetadata(data)
    .then(metadata => {
      // success handler
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

/** elastic search - map index */
exports.indexDishesToElastic = functions.database
  .ref("/dishes/{uid}/{dishId}")
  .onWrite((change, context) => {
    let dishData = change.after.val();
    let dishId = context.params.dishId;
    let uid = context.params.uid;

    let elasticsearchFields = ["name", "tags", "recipe", "link"];
    let elasticSearchUrl =
      elasticSearchConfig.url + "dishes/" + uid + "/" + dishId;
    let elasticSearchMethod = dishData ? "POST" : "DELETE";

    let elasticsearchRequest = {
      method: elasticSearchMethod,
      uri: elasticSearchUrl,
      auth: {
        username: elasticSearchConfig.user,
        password: elasticSearchConfig.password
      },
      body: _.pick(dishData, elasticsearchFields),
      json: true
    };

    return request(elasticsearchRequest).then(response => {
      return console.log("Elasticsearch response", response);
    });
  });

exports.search = functions.https.onCall((data, context) => {
  const esClient = new Client({
    cloud: {
      id: elasticSearchConfig.cloud_id
    },
    auth: {
      username: elasticSearchConfig.user,
      password: elasticSearchConfig.password
    }
  });

  // callback API
  return new Promise((resolve, reject) => {
    esClient.search(
      {
        index: "dishes",
        body: {
          query: {
            match: { name: data }
          }
        }
      },
      { ignore: [404] },

      (err, result) => {
        if (err) console.log("err: ", err);
        if (result) resolve(result.body.hits.hits);
      }
    );
  });
});
