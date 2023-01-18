//imported the Firebase module 
import firebase from 'firebase/compat/app';


//initialized the firebase config
firebase.firestore().collection('firebase.json').add({
    data: 'your data'
  });
//this will initialize the app
//adding firebase.firestore() method to access the database and .get() to retrieve the data
firebase.firestore().collection('organisation-collection').get().then((snapshot) => {
    snapshot.forEach((doc) => {
      console.log(doc.data());
    });
  });



