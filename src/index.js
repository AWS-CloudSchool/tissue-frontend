import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';
import { createGlobalStyle } from 'styled-components';
import axios from "axios";
import YoutubeSearchPage from './components/YoutubeSearchPage';
import FixedNotionEditor from './components/FixedNotionEditor';
import { BrowserRouter, Routes, Route } from 'react-router-dom';

axios.defaults.baseURL = process.env.REACT_APP_API_BASE_URL;

console.log('API BASE URL:', process.env.REACT_APP_API_BASE_URL);

const GlobalStyle = createGlobalStyle`
  * {
    margin: 0;
    padding: 0;
    box-sizing: border-box;
  }

  body {
    margin: 0;
    font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', 'Roboto', 'Oxygen',
      'Ubuntu', 'Cantarell', 'Fira Sans', 'Droid Sans', 'Helvetica Neue',
      sans-serif;
    -webkit-font-smoothing: antialiased;
    -moz-osx-font-smoothing: grayscale;
  }
`;

const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(
// <React.StrictMode>
  <>
    <GlobalStyle />
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<App />} />
        <Route path="/youtube-search" element={<YoutubeSearchPage />} />
        <Route path="/editor" element={<FixedNotionEditor />} />
      </Routes>
    </BrowserRouter>
  </>
//  </React.StrictMode>
); 