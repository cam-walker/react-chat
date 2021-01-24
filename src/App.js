import React, { useState, useRef } from 'react';
import './App.css';
import firebase from 'firebase/app';
import 'firebase/firestore';
import 'firebase/auth';

import { useAuthState } from 'react-firebase-hooks/auth';
import { useCollectionData } from 'react-firebase-hooks/firestore';

firebase.initializeApp({
  apiKey: "AIzaSyAgSl05jUY01ns9JM0ekoyHbzz10jIzf4c",
  authDomain: "chat-app-ac6fe.firebaseapp.com",
  projectId: "chat-app-ac6fe",
  storageBucket: "chat-app-ac6fe.appspot.com",
  messagingSenderId: "824141881410",
  appId: "1:824141881410:web:68a867abf0dca7705ecddb",
});

const auth = firebase.auth();
const firestore = firebase.firestore();



function App() {
const [user] = useAuthState(auth);
return (
  <div className="App">
    <header className="App-header">
    Superchat
    </header>
      <section>
      {user ? <ChatRoom /> : <SignIn />}
      </section>
    
  </div>
);
}
function SignIn() {
const signInWithGoogle = () => {
  const provider = new firebase.auth.GoogleAuthProvider();
  auth.signInWithPopup(provider);
}
return (
  <>
  <button onClick={signInWithGoogle}>Sign in with Google</button>
  <p>Do not violate the community guidelines or you will be banned</p>
  </>
)
}

function SignOut() {
return auth.currentUser && (
  <button onClick={() => auth.SignOut()}>Sign out</button>
)
}

function ChatRoom() {

const empty = useRef()
const messagesRef = firestore.collection('messages');
const query = messagesRef.orderBy('createdAt').limit(25);

const [messages] = useCollectionData(query, {idField: 'id'});

const [formValue, setFormValue] = useState('');

const sendMessage = async(e) => {

  e.preventDefault();

  const {uid, photoURL} = auth.currentUser;

  await messagesRef.add({
    text: formValue,
    createdAt: firebase.firestore.FieldValue.serverTimestamp(),
    uid,
    photoURL
  })
  setFormValue('');

  empty.current.scrollIntoView({ behavior: 'smooth'});
}

return (<>
  <main>

    {messages && messages.map(msg => <ChatMessage key={msg.id} message={msg} />)}

    <span ref={empty}></span>

  </main>

  <form onSubmit={sendMessage}>

    <input value={formValue} onChange={(e) => setFormValue(e.target.value)} placeholder="say something nice" />

    <button type="submit" disabled={!formValue}>-></button>

  </form>
</>)
}
function ChatMessage(props){
    const { text, uid, photoURL } = props.message;

    const messageClass = uid === auth.currentUser.uid ? 'sent' : 'received';

    return (<>
      <div className={`message ${messageClass}`}>
        <img src={photoURL || 'https://api.adorable.io/avatars/23/abott@adorable.png'} />
        <p>{text}</p>
      </div>
    </>)
}
export default App;
