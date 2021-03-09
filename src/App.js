import React, { useState, useEffect } from 'react';
import './App.css';
import { API, Storage, graphqlOperation } from 'aws-amplify';
import { withAuthenticator, AmplifySignOut } from '@aws-amplify/ui-react';
import { listCheques } from './graphql/queries';
import { createCheque as createChequeMutation, deleteCheque as deleteChequeMutation } from './graphql/mutations';
import { onCreateCheque, onUpdateCheque } from './graphql/subscriptions';

const initialFormState = { payee: '', amountWord: '' }

function App() {
  const [Cheques, setCheques] = useState([]);
  const [formData, setFormData] = useState(initialFormState);

  useEffect(() => {
    fetchCheques();
    const subscriptionOnCreate = API.graphql(graphqlOperation(onCreateCheque)).subscribe({
      next: apiData => {
        console.log(apiData);
        fetchCheques();
//        setCheques([ ...cheques, apiData.value.data.onCreateCheque ]);
      }
    });

    return () => subscriptionOnCreate.unsubscribe(); 

/*    
    const subscriptionOnUpdate = API.graphql(graphqlOperation(onUpdateCheque)).subscribe({
      next: apiData => {
        console.log(apiData);
        fetchCheques();
      }
    });

    return () => subscriptionOnUpdate.unsubscribe(); 
*/
  }, []);

  async function onChange(e) {
    if (!e.target.files[0]) return
    const file = e.target.files[0];
    setFormData({ ...formData, image: file.name });
    await Storage.put(file.name, file);
    fetchCheques();
  }

  async function fetchCheques() {
    const apiData = await API.graphql({ query: listCheques });
    const chequesFromAPI = apiData.data.listCheques.items;
    await Promise.all(chequesFromAPI.map(async cheque => {
      if (cheque.image) {
        const image = await Storage.get(cheque.image);
        cheque.image = image;
      }
      return cheque;
    }))
       
    setCheques(apiData.data.listCheques.items);
  }

  async function createCheque() {
    if (!formData.payee || !formData.amountWord) return;
    await API.graphql({ query: createChequeMutation, variables: { input: formData } });
    if (formData.image) {
      const image = await Storage.get(formData.image);
      formData.image = image;
    }
    setCheques([ ...Cheques, formData ]);
    setFormData(initialFormState);
  }

  async function deleteCheque({ id }) {
    const newChequesArray = Cheques.filter(cheque => cheque.id !== id);
    setCheques(newChequesArray);
    await API.graphql({ query: deleteChequeMutation, variables: { input: { id } }});
  }

  return (
    <div className="App">
      <h1>My Cheques App</h1>
      <input
        onChange={e => setFormData({ ...formData, 'payee': e.target.value})}
        placeholder="Payee"
        value={formData.payee}
      />
      <input
        onChange={e => setFormData({ ...formData, 'amountWord': e.target.value})}
        placeholder="Amount in Word"
        value={formData.amountWord}
      />
      <input
        type="file"
        onChange={onChange}
      />
      <button onClick={createCheque}>Create Cheque</button>
      <div style={{marginBottom: 30}}>
        {
          Cheques.map(cheque => (
            <div key={cheque.id || cheque.payee}>
              <h2>{cheque.payee}</h2>
              <p>{cheque.amountWord}</p>
              <button onClick={() => deleteCheque(cheque)}>Delete Cheque</button>
              {
                cheque.image && <img src={cheque.image} style={{width: 400}} />
              }
            </div>
          ))
        }
      </div>
      <AmplifySignOut />
    </div>
  );
}

export default withAuthenticator(App);