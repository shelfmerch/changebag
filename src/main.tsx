// Import API URL fixer first to ensure it runs before any other code
import './utils/apiUrlFixer';

import React from 'react';
import { createRoot } from 'react-dom/client';
import App from './App';
import './index.css';

const root = createRoot(document.getElementById('root')!);
root.render(<App />);
