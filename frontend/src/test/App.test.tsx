/// <reference types="vitest" />

import { render, screen } from '@testing-library/react';
import { ChakraProvider } from '@chakra-ui/react';
import App from '../App';
import { describe, it, expect } from 'vitest';

//describe block for group app components elements
describe('App komponens', () => {
  it('display login button', () => {
    
    //virtual DOM , pack chakraUI and app components
    render(
      <ChakraProvider> 
        <App />
      </ChakraProvider>
    );
    
    //query finds that element in the rendered DOM
    const loginButton = screen.getByRole('button', { name: /login/i });  
    expect(loginButton).toBeInTheDocument();
  });
});