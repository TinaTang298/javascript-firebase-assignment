const firebaseConfig = {
  apiKey: "AIzaSyCMp1QpdTCdsekz_dDMHyTZFU5TFn6NR6A",
  authDomain: "wit-assignment6.firebaseapp.com",
  databaseURL: "https://wit-assignment6-default-rtdb.firebaseio.com",
  projectId: "wit-assignment6",
  storageBucket: "wit-assignment6.appspot.com",
  messagingSenderId: "733479714669",
  appId: "1:733479714669:web:97edc4a4131855493a2464"
};
firebase.initializeApp(firebaseConfig);

const auth = firebase.auth();
const db = firebase.database();

// Switch views
function showSignup() {
  document.getElementById('signupSection').style.display = 'block';
  document.getElementById('loginSection').style.display = 'none';
  document.getElementById('birthdaySection').style.display = 'none';
}

function showLogin() {
  document.getElementById('signupSection').style.display = 'none';
  document.getElementById('loginSection').style.display = 'block';
  document.getElementById('birthdaySection').style.display = 'none';
}

function showBirthday() {
  document.getElementById('signupSection').style.display = 'none';
  document.getElementById('loginSection').style.display = 'none';
  document.getElementById('birthdaySection').style.display = 'block';
}

// Sign up
document.getElementById('signupForm').addEventListener('submit', function (e) {
  e.preventDefault();
  const name = document.getElementById('name').value;
  const dob = document.getElementById('dob').value;
  const email = document.getElementById('email').value;
  const password = document.getElementById('password').value;

  auth.createUserWithEmailAndPassword(email, password)
    .then(userCredential => {
      const user = userCredential.user;
      return db.ref('users/' + user.uid).set({
        name: name,
        dob: dob,
        email: email
      });
    })
    .then(() => {
      showLogin();
    })
    .catch(error => {
      console.error(error.message);
    });
});

// Log in
document.getElementById('loginForm').addEventListener('submit', function (e) {
  e.preventDefault();
  const email = document.getElementById('emailLogin').value;
  const password = document.getElementById('passwordLogin').value;

  auth.signInWithEmailAndPassword(email, password)
    .then(() => {
      showBirthday();
      displayUserInfo(auth.currentUser.uid);
    })
    .catch(error => {
      console.error(error.message);
    });
});

// Display birthday message
function displayUserInfo(uid) {
  db.ref('users/' + uid).get().then((snapshot) => {
    if (snapshot.exists()) {
      const data = snapshot.val();
      const name = data.name;

      // Parse the DOB string
      const [year, month, day] = data.dob.split("-").map(Number);
      
      // Get today's date
      const today = new Date();
      const todayMonth = today.getMonth() + 1; // Add 1 because getMonth() returns 0-11
      const todayDate = today.getDate();

      console.log("Today's Month and Date:", todayMonth, todayDate);
      console.log("DOB Month and Date:", month, day);

      if (todayMonth === month && todayDate === day) {
        fetch('https://type.fit/api/quotes')
          .then(response => response.json())
          .then(quotes => {
            const randomQuote = quotes[Math.floor(Math.random() * quotes.length)].text;
            document.getElementById('welcomeMessage').innerText = `Happy Birthday, ${name.toUpperCase()}!`;
            document.getElementById('birthdayMessage').innerText = `Quote of the day: "${randomQuote}"`;
          })
          .catch(error => console.error('Error fetching quotes:', error));
      } else {
        const nextBirthday = new Date(today.getFullYear(), month - 1, day);
        if (nextBirthday < today) {
          nextBirthday.setFullYear(today.getFullYear() + 1);
        }
        const daysUntilBirthday = Math.ceil((nextBirthday - today) / (1000 * 60 * 60 * 24));

        console.log("Days until birthday:", daysUntilBirthday);

        document.getElementById('welcomeMessage').innerText = `Welcome back, ${name.toUpperCase()}!`;
        document.getElementById('birthdayMessage').innerText = `There are ${daysUntilBirthday} days left until your birthday.`;
      }
    } else {
      console.log('No user data found.');
    }
  }).catch(error => console.error('Error fetching user data:', error));
}




// Log out
document.getElementById('logoutButton').addEventListener('click', function () {
  auth.signOut().then(() => {
    showLogin();
  });
});

// Initial view
auth.onAuthStateChanged(user => {
  if (user) {
    showBirthday();
    displayUserInfo(user.uid);
  } else {
    showLogin();
  }
});
