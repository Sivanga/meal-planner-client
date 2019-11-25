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

const createMenuEnryForUser = (uid, menu, resolve, reject) => {
  console.log("createMenuEnryForUser: ", uid, " menu: ", menu);
  return esClient.index(
    {
      id: uid,
      index: "menus",
      type: "_doc",
      body: {
        menus: [menu]
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

const updateMenuForUser = (uid, change, resolve, reject) => {
  // Add Menu
  if (change.after.val()) {
    console.log("UID: ", uid, " found, update new menu for user");

    esClient.update(
      {
        id: uid,
        type: "_doc",
        index: "menus",
        body: {
          script: {
            source: `ctx._source.menus.add(params.menu)`,
            params: {
              menu: change.after.val()
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
  // Delete menu
  else {
    console.log("UID: ", uid, " found, delete menu for user");

    esClient.update(
      {
        index: "menus",
        type: "_doc",
        id: uid,
        body: {
          script: {
            source: `ctx._source.menus.removeIf(menu -> menu.id == params.menu_id)`,
            params: {
              menu_id: change.before.val().id
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

/** elastic - Listen onWrite menu index */
exports.indexMenusToElastic = functions.database
  .ref("/menus/{uid}/{menuId}")
  .onWrite((change, context) => {
    // Check if this uid exist in /menus/ index
    return new Promise((resolve, reject) => {
      esClient.exists(
        {
          index: "menus",
          type: "_doc",
          id: context.params.uid
        },
        (err, result, statusCode) => {
          if (err) console.log("err: ", err);
          if (result) console.log("result: ", result);

          // User not found under /menus/, creat new index
          if (result.body === false && change.after.val()) {
            return createMenuEnryForUser(
              context.params.uid,
              change.after.val(),
              resolve,
              reject
            );
          } else if (result.body === true) {
            // User already had an entry in /menus/ - update this menu under menus array
            return updateMenuForUser(
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

/** elastic - Listen onWrite public menus index */
exports.indexPublicMenusToElastic = functions.database

  .ref("/publicMenus/{menuId}")
  .onWrite((change, context) => {
    return new Promise((resolve, reject) => {
      if (change.after.val()) {
        console.log("Adding menu: ", context.params.menuId, " to public_menus");
        esClient.index(
          {
            id: context.params.menuId,
            type: "_doc",
            index: "public_menus",
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
        console.log("Deleting menu: ", context.params.menuId, " from public");
        esClient.delete(
          {
            id: context.params.menuId,
            type: "_doc",
            index: "public_menus"
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
      }
    }).catch(err => {
      console.log("err: ", err);
      reject(err);
    });
  });

/** elastic - search in "menus" index */
exports.searchPrivateMenus = functions.https.onCall((data, context) => {
  // callback API
  return new Promise((resolve, reject) => {
    esClient.search(
      {
        index: "menus",
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
                        fields: ["menus.name^3", "menus.dishes"],
                        type: "phrase_prefix"
                      }
                    },
                    path: "menus",
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
        if (
          result.body.hits &&
          result.body.hits.hits &&
          result.body.hits.hits.length > 0
        ) {
          console.log(
            "result.body.hits.hits[0].inner_hits.menus.hits.hits: ",
            result.body.hits.hits[0].inner_hits.menus.hits.hits
          );

          var menusToReturn = [];
          result.body.hits.hits[0].inner_hits.menus.hits.hits.map(result => {
            return menusToReturn.push(result._source);
          });

          resolve(menusToReturn);
        } else {
          resolve([]);
        }
        if (err) {
          reject(err);
        }
      }
    );
  }).catch(err => {
    console.log("catch err: ", err);
    reject(err);
  });
});
/** elastic - search in "public_menus" index */

exports.searchPublicMenus = functions.https.onCall((data, context) => {
  // callback API
  return new Promise((resolve, reject) => {
    esClient.search(
      {
        index: "public_menus",
        type: "_doc",
        body: {
          query: {
            bool: {
              must: {
                multi_match: {
                  query: data.query,
                  type: "phrase_prefix",
                  fields: ["name", "dishes"]
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
          var menusToReturn = [];
          result.body.hits.hits.map(result => {
            return menusToReturn.push(result._source);
          });
          resolve(menusToReturn);
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
