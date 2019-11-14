const functions = require("firebase-functions");
const nodemailer = require("nodemailer");
var smtpTransport = require("nodemailer-smtp-transport");
const _ = require("lodash");
const request = require("request-promise");
const firebase = require("firebase");
const elasticSearchConfig = functions.config().elasticsearch;

const { Client } = require("@elastic/elasticsearch");
const esClient = new Client({
  cloud: {
    id: elasticSearchConfig.cloud_id
  },
  auth: {
    username: elasticSearchConfig.user,
    password: elasticSearchConfig.password
  },
  log: "trace"
});

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

const createDishesMapping = uid => {
  esClient.index(
    {
      index: "dishes",
      type: "_doc",
      body: {
        mappings: {
          uid: {
            properties: {
              dishes: {
                type: "nested"
              }
            }
          }
        }
      }
    },
    (err, result) => {
      if (err) console.log(err);
      console.log(result);
    }
  );
};

const createDishesEnryForUser = (uid, dish, resolve, reject) => {
  console.log("createDishesEnryForUser: ", uid, " dish: ", dish);
  return esClient.index(
    {
      id: uid,
      index: "dishes",
      type: "_doc",
      body: {
        dishes: [dish]
      }
    },
    (err, result) => {
      if (err) {
        console.log(err);
        reject(err);
      }
      console.log(result);
      resolve(result);
    }
  );
};

const updateDishForUser = (uid, change, resolve, reject) => {
  // Add dish
  if (change.after.val()) {
    console.log("UID: ", uid, " found, update new dish for user");

    esClient.update(
      {
        id: uid,
        type: "_doc",
        index: "dishes",
        body: {
          script: {
            source: `ctx._source.dishes.add(params.dish)`,
            params: {
              dish: change.after.val()
            }
          }
        }
      },
      { ignore: 404 },
      (err, result) => {
        if (err) {
          reject(err);
        }
        resolve(result);
      }
    );
  }
  // Delete dish
  else {
    console.log("UID: ", uid, " found, delete dish for user");

    esClient.update(
      {
        index: "dishes",
        type: "_doc",
        id: uid,
        body: {
          script: {
            source: `ctx._source.dishes.removeIf(dish -> dish._id == params.dish_id)`,
            params: {
              dish_id: change.before.val()._id
            }
          }
        }
      },
      { ignore: 404 },
      (err, result) => {
        if (err) {
          reject(err);
        }
        resolve(result);
      }
    );
  }
};

/** elastic - Listen onWrite dishes index */
exports.indexDishesToElastic = functions.database
  .ref("/dishes/{uid}/{dishId}")
  .onWrite((change, context) => {
    // Check if this uid exist in /dishes/ index
    return new Promise((resolve, reject) => {
      esClient.exists(
        {
          index: "dishes",
          type: "_doc",
          id: context.params.uid
        },
        (err, result, statusCode) => {
          if (err) console.log("err: ", err);
          if (result) console.log("result: ", result);

          // User not found under /dishes/, creat new index
          if (result.body === false && change.after.val()) {
            return createDishesEnryForUser(
              context.params.uid,
              change.after.val(),
              resolve,
              reject
            );
          } else if (result.body === true) {
            // User already had an entry in /dishes/ - update this dish under dishes array
            return updateDishForUser(
              context.params.uid,
              change,
              resolve,
              reject
            );
          }
          return null;
        }
      );
    });
  });
