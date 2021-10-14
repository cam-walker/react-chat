import React, { useState, useRef } from 'react';
import Popup from 'reactjs-popup';
import SignaturePad from 'react-signature-canvas';
import './App.css';
//import Canvas from './canvas';
import firebase from 'firebase/app';
import 'firebase/firestore';
import 'firebase/auth';
import { useAuthState } from 'react-firebase-hooks/auth';
import { useCollectionData } from 'react-firebase-hooks/firestore';

firebase.initializeApp
({
  apiKey: "AIzaSyAgSl05jUY01ns9JM0ekoyHbzz10jIzf4c",
  authDomain: "chat-app-ac6fe.firebaseapp.com",
  projectId: "chat-app-ac6fe",
  storageBucket: "chat-app-ac6fe.appspot.com",
  messagingSenderId: "824141881410",
  appId: "1:824141881410:web:68a867abf0dca7705ecddb",
});
/* A Firebase authorization */
const auth = firebase.auth();
const firestore = firebase.firestore();
/* A Firebase authorization */
function App() 
  {
    const [user] = useAuthState(auth);
    return (
      <div className="App">
        <header className="App-header">
          &#9998; PicChat
          <SignOut />
        </header>
        <section>
          {
            user ? <ChatRoom /> : <SignIn />
          }
        </section>
      </div>
  );
}
/* Sign in */
function SignIn() 
{
  const signInWithGoogle = () => 
    {
      const provider = new firebase.auth.GoogleAuthProvider();
      auth.signInWithPopup(provider);
    }
  return (
    <>
      <button className="sign-in-button" onClick={signInWithGoogle}>Sign in with Google</button>
      <p className="loginPar">Do not violate the community guidelines or you will be banned</p>
    </>
  )
}
/* Sign out */
function SignOut() 
{
  return auth.currentUser && 
  (
    <button onClick={() => auth.signOut()}>Sign out</button>
  )
}
/* Container for the chat room */
function ChatRoom() {
  /* Stores messages on database and assigns messages an ID */
  const empty = useRef()
  const messagesRef = firestore.collection('messages');
  const imagesRef = firestore.collection('images')
  const query = messagesRef.orderBy('createdAt').limit(25);
  const imageQuery = imagesRef.orderBy('createdAt').limit(25);
  const [messages] = useCollectionData(query, { idField: 'id' });
  const [imageMessages] = useCollectionData(imageQuery, { idField: 'id' });
  const [formValue, setFormValue] = useState('');
  /* Assigns a UID and photo url to the authenticated user.  */
  const sendMessage = async (e) => 
    {
      e.preventDefault();
      const {uid, photoURL} = auth.currentUser;
      await messagesRef.add
        ({
          text: formValue,
          createdAt: firebase.firestore.FieldValue.serverTimestamp(),
          uid,
          photoURL,
          imageURL
        })
      setFormValue('');
      empty.current.scrollIntoView({ behavior: 'smooth' });
    }
  const [imageURL, setImageURL] = useState(null);
  const sigCanvas = useRef({});
  const clear = () => sigCanvas.current.clear();
  /* Sending drawing as a message is still in progress.
  Right now, drawn messages can only be seen locally */
  const save = () =>
    setImageURL(sigCanvas.current.getCanvas().toDataURL("image/svg/xml", 1.0));
  return (<>
    <main>
      {
        messages && messages.map(msg => <ChatMessage key={msg.id} message={msg} />)
      }
      {/* Styling for the drawn message */}
      {imageURL ? 
        (
          <img
            src={imageURL}
            alt="drawing"
            style=
            {
              {
                position: 'inherit',
                display: 'flex',
                alignItems: 'center',
                flexDirection: 'row-reverse',
                alignSelf: 'flex-end',
                width: 'auto',
                height: '60vh'
              }
            }
          />
        ) : null
      }
      <span ref={empty}></span>
    </main>
{/* Buttons for clearing the signature canvas, closing the window, and saving the drawing */}
    <form onSubmit={sendMessage}>
      <Popup modal trigger=
        {
          <button type="reset">&#9998;</button>
        }
      closeDocumentOnClick={false}>
        {
          close => 
        (
          <>
            <SignaturePad
              ref={sigCanvas}
              canvasProps={{className: "signatureCanvas"}}
            />
            <button className="canvButton" onClick={close}>Close</button>
            <button className="canvButton" onClick={clear}>Clear</button>
            <button type="submit" className="canvButton" onClick={save}>Send</button>
          </>
        )}
      </Popup>
      <input value={formValue} onChange={(e) => setFormValue(e.target.value)} placeholder="Type your message" />
      <button type="submit" disabled={!formValue}>&#9654;</button>
    </form>
  </>)
} 
/* Messages have text, a unique ID, and a photoURl for the profile pic */
function ChatMessage(props) {
  const { text, uid, photoURL } = props.message;
  const messageClass = uid === auth.currentUser.uid ? 'sent' : 'received';
  return(<>
    <div className={`message ${messageClass}`}>
      <img src={photoURL || 'https://api.adorable.io/avatars/23/abott@adorable.png'} alt='profile' />
      <p>{text}</p>
    </div>
  </>)
}
export default App;
