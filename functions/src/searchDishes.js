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
      index: "dishes_v4",
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
        index: "dishes_v4",

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
        index: "dishes_v4",
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
          index: "dishes_v4",
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
            index: "public_dishes_v6",
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
            index: "public_dishes_v6"
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
  console.log("Search for ", data.query, " in dishes. filters: ", data.filters);
  return new Promise((resolve, reject) => {
    esClient.search(
      {
        index: "dishes_v4",
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
                      bool: {
                        should: [
                          {
                            multi_match: {
                              query: data.query,
                              fields: [
                                "dishes.name^3",
                                "dishes.link",
                                "dishes.ingredient",
                                "dishes.meals.name"
                              ],
                              type: "phrase_prefix"
                            }
                          },
                          {
                            term: {
                              "dishes.tags.name": data.query
                            }
                          }
                        ]
                      }
                    },
                    path: "dishes",
                    inner_hits: { size: 30 } // Search as text in all fields
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
            result.body.hits.hits[0].inner_hits.dishes.hits.hits.map(result => {
              return dishesToReturn.push(result._source);
            });
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
        index: "public_dishes_v6",
        body: {
          query: {
            bool: {
              should: [
                {
                  multi_match: {
                    query: data.query,
                    type: "phrase_prefix",
                    fields: ["name", "link", "ingredient"]
                  }
                },
                {
                  term: {
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
          console.log("err.meta.body.error: ", err.meta.body.error);
          reject(err);
        }
      }
    );
  }).catch(err => {
    console.log("catch err: ", err);
  });
});

/** elastic - search in "public_dishes" index */
exports.searchPublicDishesForMeals = functions.https.onCall((data, context) => {
  console.log(
    "Search for meals",
    data.meals,
    " with filters: ",
    data.filters,
    " in public_dishes"
  );

  let meals = data.meals.map(({ name }) => name);
  // callback API
  return new Promise((resolve, reject) => {
    esClient.search(
      {
        index: "public_dishes_v6",
        body: {
          size: 0,
          query: {
            bool: {
              must_not: {
                match: { ownerUid: data.uid ? data.uid : "dummy" } // If there's no connected user, return all public result of all users
              }
            }
          },
          aggs: {
            meals: {
              terms: {
                field: "meals.name",
                include: meals
              },

              aggs: {
                top_hits: {
                  top_hits: {
                    _source: {
                      includes: [
                        "id",
                        "meals",
                        "name",
                        "ownerUid",
                        "sharePublic",
                        "tags",
                        "favoriteUsers",
                        "imageFile",
                        "recipe",
                        "localImageUrl",
                        "link",
                        "imageUrl"
                      ]
                    },
                    size: 30,
                    sort: {
                      _script: {
                        type: "number",
                        script: {
                          lang: "painless",
                          source:
                            "(System.currentTimeMillis() + doc['_id'].value).hashCode()"
                        },
                        order: "asc"
                      }
                    }
                  }
                }
              }
            }
          }
        }
      },
      { ignore: [404] },
      (err, result) => {
        if (result.body.aggregations) {
          console.log(
            "result.body.aggregations: ",
            result.body.aggregations.meals.buckets
          );
          var dishesToReturn = [];
          result.body.aggregations.meals.buckets.map(buckets => {
            return buckets.top_hits.hits.hits.map(bucket => {
              return dishesToReturn.push(bucket._source);
            });
          });
          resolve(dishesToReturn);
        }
        if (err) {
          console.log("err.meta.body.error: ", err.meta.body.error);
          reject(err);
        }
      }
    );
  }).catch(err => {
    console.log("catch err: ", err);
    reject(err);
  });
});

// Get most popular tags
exports.getPopularTags = functions.https.onCall((data, context) => {
  // callback API
  return new Promise((resolve, reject) => {
    esClient.msearch(
      {
        body: [
          { index: "dishes_v4" },
          {
            query: {
              match_all: {}
            },
            size: 0,
            aggs: {
              dishes: {
                nested: {
                  path: "dishes"
                },
                aggs: {
                  popular_tags: {
                    terms: {
                      field: "dishes.tags.name",
                      size: 5,
                      min_doc_count: 2
                    }
                  }
                }
              }
            }
          },
          { index: "public_dishes_v6" },
          {
            query: {
              match_all: {}
            },
            size: 0,
            aggs: {
              popular_tags: {
                terms: {
                  field: "tags.name",
                  min_doc_count: 2,
                  size: 5
                }
              }
            }
          }
        ]
      },
      { ignore: [404] },
      (err, result) => {
        if (result) {
          console.log(result.body.responses);

          var tagsArray = [];
          if (
            result.body.responses[0].aggregations.dishes.popular_tags.buckets
          ) {
            tagsArray =
              result.body.responses[0].aggregations.dishes.popular_tags.buckets;
          }

          if (
            result.body.responses[1].aggregations &&
            result.body.responses[1].aggregations.popular_tags.buckets
          ) {
            tagsArray.concat(
              result.body.responses[1].aggregations.popular_tags.buckets
            );
          }
          console.log("tagsArray: ", tagsArray);
          resolve(tagsArray);
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

/** elastic - search in both "dishes" and "public_dishes" index */
exports.searchAllDishes = functions.https.onCall((data, context) => {
  console.log("Search for ", data.query, " in all dishes. tags: ", data.tags);

  if (data.tags && data.tags.length > 0) {
    return searchFilteredDishes(data);
  }
  console.log("data.uid: ", data.uid, " data.query: ", data.query);
  // callback API
  return new Promise((resolve, reject) => {
    esClient.msearch(
      {
        body: [
          { index: "dishes_v4" },
          {
            query: {
              bool: {
                must: [{ match: { _id: data.uid } }],
                should: [
                  {
                    nested: {
                      query: {
                        bool: {
                          should: [
                            {
                              multi_match: {
                                query: data.query,
                                fields: [
                                  "dishes.name^3",
                                  "dishes.link",
                                  "dishes.ingredient",
                                  "dishes.meals.name"
                                ],
                                type: "phrase_prefix"
                              }
                            },
                            {
                              term: {
                                "dishes.tags.name": data.query
                              }
                            }
                          ]
                        }
                      },

                      path: "dishes",
                      inner_hits: { size: 30 } // Search in keyword tags
                    }
                  }
                ]
              }
            }
          },
          { index: "public_dishes_v6" },
          {
            query: {
              bool: {
                should: [
                  {
                    multi_match: {
                      query: data.query,
                      type: "phrase_prefix",
                      fields: ["name", "link", "ingredient"]
                    }
                  },
                  {
                    term: {
                      "tags.name": data.query
                    }
                  },
                  {
                    term: {
                      "meals.name": data.query
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
          handleAllDishesResult(err, result, resolve, reject);
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

const searchFilteredDishes = (data, context) => {
  if (data.query) {
    console.log("searchFilteredDishes with query: ", data.query);
    return new Promise((resolve, reject) => {
      esClient.msearch(
        {
          body: [
            { index: "dishes_v4" },
            {
              query: {
                bool: {
                  must: [
                    {
                      match: { _id: data.uid }
                    },
                    {
                      nested: {
                        query: {
                          bool: {
                            must: [
                              {
                                bool: {
                                  should: [
                                    {
                                      terms: {
                                        "dishes.tags.name": data.tags
                                      }
                                    },
                                    {
                                      terms: {
                                        "dishes.meals.name": data.tags
                                      }
                                    }
                                  ]
                                }
                              },
                              {
                                multi_match: {
                                  query: data.query,
                                  fields: [
                                    "dishes.name^3",
                                    "dishes.link",
                                    "dishes.ingredient"
                                  ],
                                  type: "phrase_prefix"
                                }
                              }
                            ]
                          }
                        },
                        path: "dishes",
                        inner_hits: { size: 30 }
                      }
                    }
                  ]
                }
              }
            },
            { index: "public_dishes_v6" },
            {
              query: {
                bool: {
                  must: [
                    {
                      multi_match: {
                        query: data.query,
                        type: "phrase_prefix",
                        fields: ["name", "link", "ingredient"]
                      }
                    },
                    {
                      bool: {
                        should: [
                          {
                            terms: {
                              "tags.name": data.tags
                            }
                          },
                          {
                            terms: {
                              "meals.name": data.tags
                            }
                          }
                        ]
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
          handleAllDishesResult(err, result, resolve, reject);
        }
      );
    }).catch(err => {
      reject(err);
    });
  } else {
    console.log("searchFilteredDishes without query");
    return new Promise((resolve, reject) => {
      esClient.msearch(
        {
          body: [
            { index: "dishes_v4" },
            {
              query: {
                bool: {
                  must: [
                    {
                      match: { _id: data.uid }
                    },
                    {
                      nested: {
                        query: {
                          bool: {
                            must: [
                              {
                                bool: {
                                  should: [
                                    {
                                      terms: {
                                        "dishes.tags.name": data.tags
                                      }
                                    },
                                    {
                                      terms: {
                                        "dishes.meals.name": data.tags
                                      }
                                    },
                                    {
                                      terms: {
                                        "dishes.name": data.tags
                                      }
                                    },
                                    {
                                      terms: {
                                        "dishes.link": data.tags
                                      }
                                    },
                                    {
                                      terms: {
                                        "dishes.ingredient": data.tags
                                      }
                                    }
                                  ]
                                }
                              }
                            ]
                          }
                        },
                        path: "dishes",
                        inner_hits: { size: 30 }
                      }
                    }
                  ]
                }
              }
            },
            { index: "public_dishes_v6" },
            {
              query: {
                bool: {
                  must_not: [
                    { match: { ownerUid: data.uid } },
                    { match: { favoriteUsers: data.uid } }
                  ],
                  should: [
                    {
                      terms: {
                        "tags.name": data.tags
                      }
                    },
                    {
                      terms: {
                        "meals.name": data.tags
                      }
                    },
                    {
                      terms: {
                        name: data.tags
                      }
                    },
                    {
                      terms: {
                        link: data.tags
                      }
                    },
                    {
                      terms: {
                        ingredient: data.tags
                      }
                    }
                  ]
                }
              }
            }
          ]
        },
        { ignore: [404] },
        (err, result) => {
          handleAllDishesResult(err, result, resolve, reject);
        }
      );
    }).catch(err => {
      reject(err);
    });
  }
};

const handleAllDishesResult = (err, result, resolve, reject) => {
  if (result) console.log(result);
  var dishes = [];

  if (result.body.responses && result.body.responses[0].hits.hits[0]) {
    dishes = dishes.concat(
      result.body.responses[0].hits.hits[0].inner_hits.dishes.hits.hits
    );
  }
  if (result.body.responses && result.body.responses[1].hits.hits) {
    dishes = dishes.concat(result.body.responses[1].hits.hits);
  }

  var dishesToReturn = [];
  dishes.map(result => {
    if (result._source.id) {
      return dishesToReturn.push(result._source);
    }
  });

  resolve(dishesToReturn);

  if (err) {
    reject(err);
  }
};
