// src/pages/_app.js
import React from 'react'
import '@/styles/globals.css'
import { Toaster } from 'react-hot-toast'

export default function App({ Component, pageProps }) {
  return (
    <>
      <Component {...pageProps} />
      <Toaster
        position="top-right"
        toastOptions={{
          style: {
            fontFamily: 'Plus Jakarta Sans, sans-serif',
            fontSize: 13,
            borderRadius: 12,
            border: '1px solid #e2e8f0',
            color: '#1e2554',
          },
        }}
      />
    </>
  )
}
