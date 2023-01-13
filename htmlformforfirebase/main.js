// Initialize Firebase (ADD YOUR OWN DATA)
const firebaseConfig = {
  apiKey: "AIzaSyCbeifWp-qE04LAVhpoSaolZk4TgCQkgNA",
  authDomain: "coupan-e3010.firebaseapp.com",
  databaseURL: "https://coupan-e3010-default-rtdb.firebaseio.com",
  projectId: "coupan-e3010",
  storageBucket: "coupan-e3010.appspot.com",
  messagingSenderId: "315010262393",
  appId: "1:315010262393:web:8af644cf0de17059963ba8"
    

  };

firebase.initializeApp(firebaseConfig);

// Reference messages collection
var messagesRef = firebase.database().ref('domain');

// Listen for form submit
document.getElementById('contactForm').addEventListener('submit', submitForm);

// Submit form
function submitForm(e){
  e.preventDefault();

  // Get values
  var code = getInputVal('code');
  var name = getInputVal('name');
  var start = getInputVal('start');
  var end = getInputVal('end');
  var live = getInputVal('ena');
  var description = getInputVal('description');


  // Save message
  saveMessage(code, name,start, end, live,description);

  // Show alert
  document.querySelector('.alert').style.display = 'block';

  // Hide alert after 3 seconds
  setTimeout(function(){
    document.querySelector('.alert').style.display = 'none';
  },3000);

  // Clear form
  document.getElementById('contactForm').reset();
}

// Function to get get form values
function getInputVal(id){
  return document.getElementById(id).value;
}

// Save message to firebase
function saveMessage(code, name,start, end,live, description){
  var newMessageRef = messagesRef.push();
  newMessageRef.set({
    code: code,
    name: name,
    start:start,
    end:end,
    live:live,
    description:description,
    
  });
}