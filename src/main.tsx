import {StrictMode} from 'react';
import {createRoot} from 'react-dom/client';
import App from './App.tsx';
import './index.css';
import { MenuProvider } from './contexts/MenuContext.tsx';
import { CartProvider } from './contexts/CartContext.tsx';

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <MenuProvider>
      <CartProvider>
        <App />
      </CartProvider>
    </MenuProvider>
  </StrictMode>,
);
