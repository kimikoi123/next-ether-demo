import { initializeApp } from 'firebase/app'
import { getAuth } from 'firebase/auth';
import { getDatabase } from 'firebase/database';



const firebaseConfig = {
    apiKey: "AIzaSyBK6GXDAs9N7iWV8z9EE47tsP603kUu_3c",
    authDomain: "multiplayer-demo-3483c.firebaseapp.com",
    databaseURL: "https://multiplayer-demo-3483c-default-rtdb.asia-southeast1.firebasedatabase.app",
    projectId: "multiplayer-demo-3483c",
    storageBucket: "multiplayer-demo-3483c.appspot.com",
    messagingSenderId: "1070035467092",
    appId: "1:1070035467092:web:1c6c6c297e2429c38b26c1"
  };

const app = initializeApp(firebaseConfig);

export const auth = getAuth(app)
export const database = getDatabase(app)


export default app;