
import './App.css';
import LoginForms from './components/auth';
import ReactDOM from "react-dom/client";
import { BrowserRouter, Routes, Route } from "react-router-dom";

function App() {
  return (
    <div className="App">
    <LoginForms/>
    </div>
  );
}

export default App;
