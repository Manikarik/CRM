import React, { useState, useEffect } from "react";
import "./App.css";
import { initializeApp } from "firebase/app";
import {
  getAuth,
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signOut,
  onAuthStateChanged,
} from "firebase/auth";
import {
  getFirestore,
  collection,
  addDoc,
  getDocs,
  deleteDoc,
  doc,
} from "firebase/firestore";

// 🔹 Firebase config
const firebaseConfig = {
  apiKey: "",
  authDomain: "crma-5fe62.fiom",
  projectId: "ce62",
  storageBucket: "crma-5ft.com",
  messagingSenderId: "7209121206",
  appId: "1:7:9f475eb27f8875797",
  measurementId: "G-NV8NHVR",
};

// 🔹 Initialize Firebase
const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);

function App() {
  const [user, setUser] = useState(null);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [customers, setCustomers] = useState([]);
  const [newCustomer, setNewCustomer] = useState("");

  const customersRef = collection(db, "customers");

  // Watch auth state
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      setUser(currentUser);
      if (currentUser) fetchCustomers();
    });
    return () => unsubscribe();
  }, []);

  const fetchCustomers = async () => {
    const snapshot = await getDocs(customersRef);
    setCustomers(snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() })));
  };

  // Auth handlers
  const handleSignup = async () => {
    try {
      await createUserWithEmailAndPassword(auth, email, password);
      setEmail(""); setPassword("");
    } catch (err) {
      alert(err.message);
    }
  };

  const handleLogin = async () => {
    try {
      await signInWithEmailAndPassword(auth, email, password);
      setEmail(""); setPassword("");
    } catch (err) {
      alert(err.message);
    }
  };

  const handleLogout = async () => {
    await signOut(auth);
    setCustomers([]);
  };

  // CRUD
  const addCustomer = async () => {
    if (!newCustomer.trim()) return;
    await addDoc(customersRef, { name: newCustomer });
    setNewCustomer("");
    fetchCustomers();
  };

  const deleteCustomer = async (id, name) => {
    if (!window.confirm(`Delete ${name}?`)) return;
    await deleteDoc(doc(db, "customers", id));
    fetchCustomers();
  };

  // 🔹 JSX
  if (!user) {
    return (
      <div className="app-container">
        <h1 className="app-title">🚀 Simple CRM</h1>
        <div className="auth-card">
          <h2 className="auth-title">Login / Signup</h2>
          <input
            type="email"
            placeholder="Enter your email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
          />
          <input
            type="password"
            placeholder="Enter your password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />
          <button className="auth-btn" onClick={handleLogin}>Login</button>
          <button className="auth-btn green-btn" onClick={handleSignup}>Sign Up</button>
        </div>
      </div>
    );
  }

  return (
    <div className="app-container">
      <h1 className="app-title">🚀 Simple CRM</h1>
      <div className="auth-card">
        <div className="header">
          <h2 className="auth-title">Welcome, {user.email}</h2>
          <button className="auth-btn red-btn" onClick={handleLogout}>Logout</button>
        </div>

        <div className="section">
          <h3>Add Customer</h3>
          <div className="actions">
            <input
              type="text"
              placeholder="Customer name"
              value={newCustomer}
              onChange={(e) => setNewCustomer(e.target.value)}
            />
            <button className="auth-btn" onClick={addCustomer}>Add</button>
          </div>
        </div>

        <h3>Customer List</h3>
        <ul className="list">
          {customers.map((c) => (
            <li key={c.id} className="list-item">
              {c.name}
              <button className="auth-btn red-btn small-btn" onClick={() => deleteCustomer(c.id, c.name)}>Delete</button>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}

export default App;
