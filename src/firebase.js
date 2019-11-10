import * as firebase from "firebase/app";
import "firebase/database";
import "firebase/auth";
import "firebase/storage";
import "firebase/functions";

const firebaseConfig = {
  apiKey: process.env.REACT_APP_FIREBASE_API_KEY,
  authDomain: process.env.REACT_APP_FIREBASE_AUTH_DOMAIN,
  databaseURL: process.env.REACT_APP_FIREBASE_DATABASE_URL,
  projectId: process.env.REACT_APP_FIREBASE_PROJECT_ID,
  storageBucket: process.env.REACT_APP_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.REACT_APP_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.REACT_APP_FIREBASE_APP_ID
};
firebase.initializeApp(firebaseConfig);

// Auth
export const authProviders = [
  firebase.auth.GoogleAuthProvider.PROVIDER_ID,
  firebase.auth.FacebookAuthProvider.PROVIDER_ID,
  firebase.auth.TwitterAuthProvider.PROVIDER_ID,
  firebase.auth.GithubAuthProvider.PROVIDER_ID,
  firebase.auth.EmailAuthProvider.PROVIDER_ID
];
export const authRef = firebase.auth();

// DB
export const databaseRef = firebase.database().ref();
export const dishesDbRef = uid => databaseRef.child(`dishes/${uid}`);
export const publicDishesDbRef = () => databaseRef.child(`publicDishes/`);
export const menusDbRef = uid => databaseRef.child(`menus/${uid}`);
export const publicMenusDbRef = () => databaseRef.child(`publicMenus/`);
export const userDbRef = uid => databaseRef.child(`users/${uid}`);
export const mealsDbRef = uid => databaseRef.child(`meals/${uid}`);

// Storage
export const storageRef = uid =>
  firebase
    .storage()
    .ref()
    .child(`/${uid}`);

// SendEmail
const sendEmail = firebase.functions().httpsCallable("sendEmail");
export const sendEmailFromForm = ({ values }) => {
  return sendEmail({ values })
    .then(function(result) {
      return result;
    })
    .catch(function(error) {
      var code = error.code;
      var message = error.message;
      var details = error.details;
      console.log(
        "error. code: ",
        code,
        " message: ",
        message,
        " detailes: ",
        details
      );
    });
};

const getUrlMetaData = firebase.functions().httpsCallable("getUrlMetadata");
export const getDishFromUrl = url => {
  return getUrlMetaData(url);
};

export default firebase;
