// src/pages/_document.js
import React from 'react'
import { Html, Head, Main, NextScript } from 'next/document'
export default function Document() {
  return (
    <Html lang="es">
      <Head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link href="https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@400;500;600;700;800&display=swap" rel="stylesheet" />
        <meta name="description" content="Portal EdugenAI - Generador de actividades educativas con IA" />
      </Head>
      <body><Main /><NextScript /></body>
    </Html>
  )
}
