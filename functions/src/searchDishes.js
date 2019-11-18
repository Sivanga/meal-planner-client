const functions = require("firebase-functions");
// Elastic search
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
            source: `ctx._source.dishes.removeIf(dish -> dish.id == params.dish_id)`,
            params: {
              dish_id: change.before.val().id
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

/** elastic - Listen onWrite public dishes index */
exports.indexPublicDishesToElastic = functions.database

  .ref("/publicDishes/{dishId}")
  .onWrite((change, context) => {
    return new Promise((resolve, reject) => {
      if (change.after.val()) {
        console.log("Adding dish: ", context.params.dishId, " to public");
        esClient.index(
          {
            id: context.params.dishId,
            type: "_doc",
            index: "public_dishes",
            body: change.after.val()
          },
          { ignore: 404 },
          (err, result) => {
            if (err) {
              console.log("err: ", err);
              reject(err);
            }
            console.log("result: ", result);
            resolve(result);
          }
        );
      } else {
        console.log("Deleting dish: ", context.params.dishId, " from public");
        esClient.delete(
          {
            id: context.params.dishId,
            type: "_doc",
            index: "public_dishes"
          },
          { ignore: 404 },
          (err, result) => {
            if (err) {
              console.log(err);
              reject(err);
            }
            console.log(result);
            resolve(result);
          }
        );
      }
    });
  });

/** elastic - search in "dishes" index */
exports.searchPrivateDishes = functions.https.onCall((data, context) => {
  // callback API
  return new Promise((resolve, reject) => {
    esClient.search(
      {
        index: "dishes",
        body: {
          query: {
            bool: {
              must: [
                {
                  match: { _id: data.uid }
                },
                {
                  nested: {
                    query: {
                      multi_match: {
                        query: data.query,
                        fields: [
                          "dishes.name^3",
                          "dishes.link",
                          "dishes.recipe",
                          "dishes.tags"
                        ],
                        type: "phrase_prefix"
                      }
                    },
                    path: "dishes",
                    inner_hits: {}
                  }
                }
              ]
            }
          }
        }
      },
      { ignore: [404] },
      (err, result) => {
        if (result) console.log(result);
        if (result.body.hits) {
          console.log(
            "result.body.hits.hits[0].inner_hits.dishes.hits.hits: ",
            result.body.hits.hits[0].inner_hits.dishes.hits.hits
          );

          var dishesToReturn = [];
          result.body.hits.hits[0].inner_hits.dishes.hits.hits.map(result => {
            return dishesToReturn.push(result._source);
          });

          resolve(dishesToReturn);
        }
        if (err) {
          reject(err);
        }
      }
    );
  }).catch(err => {
    reject(err);
  });
});
/** elastic - search in "public_dishes" index */

exports.searchPublicDishes = functions.https.onCall((data, context) => {
  // callback API
  return new Promise((resolve, reject) => {
    esClient.search(
      {
        index: "public_dishes",
        type: "_doc",
        body: {
          query: {
            bool: {
              must: {
                multi_match: {
                  query: data.query,
                  type: "phrase_prefix",
                  fields: ["name", "link", "recipe", "tags"]
                }
              },
              must_not: {
                match: { ownerUid: data.uid ? data.uid : "dummy" } // If there's no connected user, return all public result of all users
              }
            }
          }
        }
      },
      { ignore: [404] },
      (err, result) => {
        if (result.body.hits) {
          console.log("result.body.hits: ", result.body.hits);
          var dishesToReturn = [];
          result.body.hits.hits.map(result => {
            return dishesToReturn.push(result._source);
          });
          resolve(dishesToReturn);
        }
        if (err) {
          console.log(" err: ", err);

          reject(err);
        }
      }
    );
  }).catch(err => {
    console.log("catch err: ", err);
    reject(err);
  });
});
