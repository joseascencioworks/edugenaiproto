// src/pages/_app.js
import '@/styles/globals.css'
import { Toaster } from 'react-hot-toast'

export default function App({ Component, pageProps }) {
  return (
    <>
      <Component {...pageProps} />
      <Toaster
        position="top-right"
        toastOptions={{
          style: { fontFamily: 'Plus Jakarta Sans', fontSize: 13, borderRadius: 12 },
        }}
      />
    </>
  )
}
