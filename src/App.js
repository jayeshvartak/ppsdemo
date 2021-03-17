import React, { useState, useEffect } from 'react';
import './App.css';
import { API, Storage, graphqlOperation } from 'aws-amplify';
import { withAuthenticator, AmplifySignOut } from '@aws-amplify/ui-react';
import { listCheques } from './graphql/queries';
//import { createCheque as createChequeMutation, updateCheque as updateChequeMutation, deleteCheque as deleteChequeMutation } from './graphql/mutations';
import { updateCheque as updateChequeMutation, deleteCheque as deleteChequeMutation } from './graphql/mutations';
import { onCreateCheque, onUpdateCheque } from './graphql/subscriptions';

const initialFormState = { payee: '', image: '', status: '0' }

function App() {
  const [cheques, setCheques] = useState([]);
  const [formData, setFormData] = useState(initialFormState);

  useEffect(() => {
    fetchCheques();
    const subscriptionOnCreate = API.graphql(graphqlOperation(onCreateCheque)).subscribe({
      next: apiData => {
        console.log("onCreateCheque::");
        console.log(apiData);
        fetchCheques();
//        setCheques([ ...cheques, apiData.value.data.onCreateCheque ]);
      }
    });

//    return () => subscriptionOnCreate.unsubscribe(); 

    const subscriptionOnUpdate = API.graphql(graphqlOperation(onUpdateCheque)).subscribe({
      next: apiData => {
        console.log(apiData);
        fetchCheques();
      }
    });

    return () => {
      subscriptionOnCreate.unsubscribe(); 
      subscriptionOnUpdate.unsubscribe(); 
    }
  }, []);

 
  async function onChange(e) {
    if (!e.target.files[0]) return
    const file = e.target.files[0];
//    setFormData({ ...formData, image: file.name });
//    await Storage.put(file.name, file);
    var filename = "image-"+ Date.now();
    setFormData({ ...formData, image: filename });
    await Storage.put(filename, file);
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
    console.log("fetchCheques::");   
    console.log(apiData);   
    setCheques(apiData.data.listCheques.items);
  }
/*
  async function createCheque() {
//    if (!formData.payee || !formData.amountWord) return;
    await API.graphql({ query: createChequeMutation, variables: { input: formData } });
    if (formData.image) {
      const image = await Storage.get(formData.image);
      formData.image = image;
    }
//    setCheques([ ...cheques, formData ]);
    setFormData(initialFormState);
  }

  async function uploadCheque() {
        if (!formData.image) return;
        formData.status = 0;
        await API.graphql({ query: createChequeMutation, variables: { input: formData } });
        if (formData.image) {
          const image = await Storage.get(formData.image);
          formData.image = image;
        }
//        setCheques([ ...cheques, formData ]);
//        setCheques(cheques);
        setFormData(initialFormState);
      }
    
  async function recreateCheque({ id }) {
    const checkToBeDeleted = cheques.filter(cheque => cheque.id === id);
//    setCheques(newChequesArray);
//    formData.status = 2;
//    createCheque();
    checkToBeDeleted[0].status = 2;
    checkToBeDeleted[0].id = '';
    checkToBeDeleted[0].image = '';
    delete checkToBeDeleted[0].id;
    delete checkToBeDeleted[0].createdAt;
    delete checkToBeDeleted[0].updatedAt;
    console.log(checkToBeDeleted[0]);
    await API.graphql({ query: createChequeMutation, variables: { input: checkToBeDeleted[0] } });
    await API.graphql({ query: deleteChequeMutation, variables: { input: { id } }});
  }
*/
  async function confirmCheque({ id }) {
    console.log(id);
//    const newChequesArray = cheques.filter(cheque => cheque.id !== id);
    const checkToBeDeleted = cheques.filter(cheque => cheque.id === id);
//    setCheques(newChequesArray);
//    formData.status = 2;
//    createCheque();
    checkToBeDeleted[0].status = 2;
    delete checkToBeDeleted[0].createdAt;
    delete checkToBeDeleted[0].updatedAt;
    console.log(checkToBeDeleted[0]);
    await API.graphql({ query: updateChequeMutation, variables: { input: checkToBeDeleted[0] } });
    setCheques(cheques);
}

  async function deleteCheque({ id }) {

    const newChequesArray = cheques.filter(cheque => cheque.id !== id);
    setCheques(newChequesArray);
    await API.graphql({ query: deleteChequeMutation, variables: { input: { id } }});
  }

  return (
    <div className="App">
      <h1>Positive Pay System App</h1>
      <label>Upload scan/photo of Cheque: </label>
      <input
              id="check_file"
              type="file"
              onChange={onChange}
            />
      <br></br>
      <br></br>
      <hr></hr>
      <div style={{marginBottom: 30}}>
        {
          cheques.filter(cheque => cheque.status === "1").map(cheque => (
            <div key={cheque.id || cheque.payee}>
              {
                cheque.image && <img src={cheque.image} alt="" style={{width: 600}} />
              }
            <br></br>
            <label>Payee: </label>
            <input
              onChange={e => setFormData({ ...formData, 'payee': e.target.value})}
              placeholder="Payee"
              value={cheque.payee}
            />
            <br></br>
            <label>Amount in Word: </label>
            <input
              onChange={e => setFormData({ ...formData, 'amountWord': e.target.value})}
              placeholder="Amount in Word"
              value={cheque.amountWord}
            />
            <br></br>
            <label>Amount in Number: </label>
            <input
              onChange={e => setFormData({ ...formData, 'amountNumber': e.target.value})}
              placeholder="Amount in Number"
              value={cheque.amountNumber}
            />
            <br></br>
            <label>Cheque Date: </label>
            <input
              onChange={e => setFormData({ ...formData, 'chequeDate': e.target.value})}
              placeholder="Cheque Date"
              value={cheque.chequeDate}
            />
            <br></br>
            <label>Cheque Number: </label>
            <input
              onChange={e => setFormData({ ...formData, 'chequeNumber': e.target.value})}
              placeholder="Cheque Number"
              value={cheque.chequeNumber}
            />
            <br></br>
              <button onClick={() => confirmCheque(cheque)}>Add PPS cheque</button>
              <br></br>
            </div>
          ))
        }
      </div>
      <hr></hr>
      <h1>Issued Cheques</h1>
      <div>
      <table border="1" align="center" cellSpacing="0">
        <thead>
          <tr>
            <th>Payee</th>
            <th>Amount in Word</th>
            <th>Amount in Number</th>
            <th>Cheque Date</th>
            <th>Cheque Number</th>
            {/*
            <th>Status</th>
            <th>Delete</th>
            */}
          </tr>
        </thead>
        <tbody>
        {
          cheques.filter(cheque => cheque.status === "2").map(cheque => (
            
            <tr><td>{cheque.payee}</td>
              <td>{cheque.amountWord}</td>
              <td>{cheque.amountNumber}</td>
              <td>{cheque.chequeDate}</td>
              <td>{cheque.chequeNumber}</td>
              {/*
              <td>{cheque.status}</td>
              <td>
                <button onClick={() => deleteCheque(cheque)}>Delete cheque</button>
              </td>
              */}
            </tr>

          ))
        }
        </tbody>
      </table> 
      <br></br>
      </div>
      <AmplifySignOut />
    </div>
  );
}

export default withAuthenticator(App);