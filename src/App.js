import React, { useState, useEffect } from 'react';
import './App.css';
import { API } from 'aws-amplify';
import { withAuthenticator, AmplifySignOut } from '@aws-amplify/ui-react';
import { listCheques } from './graphql/queries';
import { createCheque as createChequeMutation, deleteCheque as deleteChequeMutation } from './graphql/mutations';

const initialFormState = { payee: '', amountWord: '' }

function App() {
  const [Cheques, setCheques] = useState([]);
  const [formData, setFormData] = useState(initialFormState);

  useEffect(() => {
    fetchCheques();
  }, []);

  async function fetchCheques() {
    const apiData = await API.graphql({ query: listCheques });
    setCheques(apiData.data.listCheques.items);
  }

  async function createCheque() {
    if (!formData.payee || !formData.amountWord) return;
    await API.graphql({ query: createChequeMutation, variables: { input: formData } });
    setCheques([ ...Cheques, formData ]);
    setFormData(initialFormState);
  }

  async function deleteCheque({ id }) {
    const newChequesArray = Cheques.filter(Cheque => Cheque.id !== id);
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
      <button onClick={createCheque}>Create Cheque</button>
      <div style={{marginBottom: 30}}>
        {
          Cheques.map(Cheque => (
            <div key={Cheque.id || Cheque.payee}>
              <h2>{Cheque.payee}</h2>
              <p>{Cheque.amountWord}</p>
              <button onClick={() => deleteCheque(Cheque)}>Delete Cheque</button>
            </div>
          ))
        }
      </div>
      <AmplifySignOut />
    </div>
  );
}

export default withAuthenticator(App);