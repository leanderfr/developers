
import React from 'react';
import ReactDOM from 'react-dom/client';
import Main from './layout/Main.jsx';

const root = ReactDOM.createRoot(document.getElementById('root'));

// React.StrictMode retirado porque renderiza o componente 2x
root.render(
        <Main />
);

