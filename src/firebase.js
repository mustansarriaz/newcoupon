import { initializeApp } from "firebase/app";
import { getDatabase, get, child, ref, update, push } from "firebase/database";

// Your web app's Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyCbeifWp-qE04LAVhpoSaolZk4TgCQkgNA",
  authDomain: "coupan-e3010.firebaseapp.com",
  databaseURL: "https://coupan-e3010-default-rtdb.firebaseio.com",
  projectId: "coupan-e3010",
  storageBucket: "coupan-e3010.appspot.com",
  messagingSenderId: "315010262393",
  appId: "1:315010262393:web:8af644cf0de17059963ba8",
};
// Initialize Firebase
const firebase = initializeApp(firebaseConfig);

console.log(firebase);

chrome.runtime.onMessage.addListener((msg, sender, response) => {
  if (msg.command == "fetch") {
    var domain = msg.data.domain;
    var enc_domain = btoa(domain);

    const dbRef = ref(getDatabase(firebase));
    get(child(dbRef, "/domain/" + enc_domain))
      .then((snapshot) => {
        if (snapshot.exists()) {
          response({
            type: "result",
            status: "success",
            data: snapshot.val(),
            request: msg,
          });
        } else {
          response({
            type: "result",
            status: "success",
            data: [],
            request: msg,
          });
          console.log("No data available");
        }
      })
      .catch((error) => {
        console.error(error);
        response({
          type: "result",
          status: "error",
          error: error,
          data: [],
          request: msg,
        });
        console.log("No data available");
      });
  }

  //submit coupon data..
  if (msg.command == "post") {
    var domain = msg.data.domain;
    var enc_domain = btoa(domain);
    var couponData = msg.data.coupon;

    const payload = {
      ...couponData,
    };

    console.log("insert", payload, enc_domain);

    try {
      const db = getDatabase(firebase);
      const postId = push(child(ref(db), "/domain/" + enc_domain)).key;
      update(ref(db, "/domain/" + enc_domain + "/" + postId), payload)
        .then(() => {
          //return response
          response({
            type: "result",
            status: "success",
            data: postId,
            request: msg,
          });
        })
        .catch((error) => {
          // The write failed...
          console.log("error:", e);
          response({
            type: "result",
            status: "error",
            data: error,
            request: msg,
          });
        });
    } catch (e) {
      console.log("error:", e);
      response({ type: "result", status: "error", data: e, request: msg });
    }
  }

  return true;
});
