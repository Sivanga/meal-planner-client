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
    console.log("UID: ", uid, " found, update dish for user");

    esClient.update(
      {
        id: uid,
        type: "_doc",
        index: "dishes",

        body: {
          script: {
            source: `def found_dish = ctx._source.dishes.find(currDish -> currDish.id == params.dish.id); 
            if (found_dish != null) { 
              for (change in params.dish.entrySet()) {
                found_dish[change.getKey()] = change.getValue()
              }
            } else { 
              ctx._source.dishes.add(params.dish)
            }`,
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
        console.log(
          "Adding/ Editing dish: ",
          context.params.dishId,
          " in public_dishes"
        );
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
  console.log("Search for ", data.query, " in dishes");
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
                }
              ],
              should: [
                {
                  nested: {
                    query: {
                      multi_match: {
                        query: data.query,
                        fields: [
                          "dishes.name^3",
                          "dishes.link",
                          "dishes.recipe",
                          "dishes.meals.name"
                        ],
                        type: "phrase_prefix"
                      }
                    },
                    path: "dishes",
                    inner_hits: { name: "searchText" } // Search as text in all fields
                  }
                },
                {
                  nested: {
                    query: {
                      match: {
                        "dishes.tags.name": data.query
                      }
                    },
                    path: "dishes",
                    inner_hits: { name: "searchTags" } // Search in keyword tags
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
          var dishesToReturn = [];
          if (result.body.hits.hits[0]) {
            result.body.hits.hits[0].inner_hits.searchText.hits.hits.map(
              result => {
                return dishesToReturn.push(result._source);
              }
            );
            result.body.hits.hits[0].inner_hits.searchTags.hits.hits.map(
              result => {
                return dishesToReturn.push(result._source);
              }
            );
          }

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
  console.log("Search for ", data.query, " in public_dishes");
  // callback API
  return new Promise((resolve, reject) => {
    esClient.search(
      {
        index: "public_dishes",
        body: {
          query: {
            bool: {
              should: [
                {
                  multi_match: {
                    query: data.query,
                    type: "phrase_prefix",
                    fields: ["name", "link", "recipe", "meals.name"]
                  }
                },
                {
                  match: {
                    "tags.name": data.query
                  }
                }
              ],
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
          console.log(" err: ");
          console.log(err);
          reject(err);
        }
      }
    );
  }).catch(err => {
    console.log("catch err: ");
    console.log(err);
    reject(err);
  });
});

/** elastic - search in both "dishes" and "public_dishes" index */
exports.searchAllDishes = functions.https.onCall((data, context) => {
  console.log("Search for ", data.query, " in all dishes");
  // callback API
  return new Promise((resolve, reject) => {
    esClient.msearch(
      {
        body: [
          { index: "dishes" },
          {
            query: {
              bool: {
                must: [{ match: { _id: data.uid } }],
                should: [
                  {
                    nested: {
                      query: {
                        multi_match: {
                          query: data.query,
                          fields: [
                            "dishes.name^3",
                            "dishes.link",
                            "dishes.recipe",
                            "dishes.meals.name"
                          ],
                          type: "phrase_prefix"
                        }
                      },
                      path: "dishes",
                      inner_hits: { name: "searchText" }
                    }
                  },
                  {
                    nested: {
                      query: {
                        match: {
                          "dishes.tags.name": data.query
                        }
                      },
                      path: "dishes",
                      inner_hits: { name: "searchTags" } // Search in keyword tags
                    }
                  }
                ]
              }
            }
          },
          { index: "public_dishes" },
          {
            query: {
              bool: {
                should: [
                  {
                    multi_match: {
                      query: data.query,
                      type: "phrase_prefix",
                      fields: ["name", "link", "recipe", "meals"]
                    }
                  },
                  {
                    match: {
                      "tags.name": data.query
                    }
                  }
                ],
                must_not: [
                  { match: { ownerUid: data.uid } },
                  { match: { favoriteUsers: data.uid } }
                ]
              }
            }
          }
        ]
      },
      { ignore: [404] },
      (err, result) => {
        if (result) {
          console.log(result);

          var dishesArray = [];
          if (result.body.responses[0].hits.hits[0]) {
            dishesArray =
              result.body.responses[0].hits.hits[0].inner_hits.searchText.hits
                .hits;

            dishesArray = dishesArray.concat(
              result.body.responses[0].hits.hits[0].inner_hits.searchTags.hits
                .hits
            );
          }
          var publidDishesArray = dishesArray.concat(
            result.body.responses[1].hits.hits
          );

          var dishesToReturn = [];
          publidDishesArray.map(result => {
            return dishesToReturn.push(result._source);
          });
          console.log("dishesToReturn: ", dishesToReturn);

          resolve(dishesToReturn);
        }

        if (err) {
          console.log(err);
          reject(err);
        }
      }
    );
  }).catch(err => {
    console.log("catch err: ", err);
    reject(err);
  });
});
