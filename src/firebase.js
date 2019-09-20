import * as firebase from "firebase/app";
import "firebase/database";
import "firebase/auth";
import "firebase/storage";

const firebaseConfig = {
  apiKey: "AIzaSyCUcZFnJsEGLp2Uj6wxBeSX0sZ3g6WeRyk",
  authDomain: "meal-planner-80ef4.firebaseapp.com",
  databaseURL: "https://meal-planner-80ef4.firebaseio.com",
  projectId: "meal-planner-80ef4",
  storageBucket: "meal-planner-80ef4.appspot.com",
  messagingSenderId: "772653107202",
  appId: "1:772653107202:web:e1fc29c5502b4bd29bbf1b"
};

firebase.initializeApp(firebaseConfig);

const databaseRef = firebase.database().ref();
export const dishesDbRef = databaseRef.child("dishes");

export const storageRef = firebase.storage().ref();

export const autProviders = [
  firebase.auth.GoogleAuthProvider.PROVIDER_ID,
  firebase.auth.FacebookAuthProvider.PROVIDER_ID,
  firebase.auth.TwitterAuthProvider.PROVIDER_ID,
  firebase.auth.GithubAuthProvider.PROVIDER_ID,
  firebase.auth.EmailAuthProvider.PROVIDER_ID,
  firebase.auth.PhoneAuthProvider.PROVIDER_ID
];
export const auth = firebase.auth();

export default firebase;
