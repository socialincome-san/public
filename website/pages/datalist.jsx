// I have added a datalist element to the HTML using React and filled it with data from a Cloud Firestore database.
import React, { useState, useEffect } from 'react';
import ReactDOM from 'react-dom';
import { db } from '../firebase';
import firebase from 'firebase';

const MyDatalist = () => {
  const [items, setItems] = useState([]);
  const options = [
    { value: 'Option 1', label: 'Option 1' },
    { value: 'Option 2', label: 'Option 2' },
  ];

  useEffect(() => {
    // Set up a connection to the Cloud Firestore database
    const database = firebase.firestore();

    // Retrieve the data from the database
    database.collection('items').get().then(snapshot => {
      const items = snapshot.docs.map(doc => ({ value: doc.id, label: doc.data().name }));
      setItems(items);
    });
  }, []);

  // Create the datalist element
  const datalist = React.createElement('datalist', { id: 'org-datalist' },
    items.map(item => React.createElement('option', item))
  );

  return (
    <div>
      {datalist}
      <label htmlFor="organisation-contribution">Choose an option:</label>
      <input type="text" list="org-datalist" id="organisation-contribution" />
    </div>
  );
};

ReactDOM.render(<MyDatalist />, document.getElementById('root'));
