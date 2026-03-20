# EduGenAI — versión simplificada

Generador de actividades educativas con Claude AI. Stack mínimo, sin bases de datos SQL ni ORM.

## Stack

| Capa       | Tecnología                           |
|------------|--------------------------------------|
| Framework  | Next.js 14 (Pages Router)            |
| UI         | React 18 + Tailwind CSS              |
| Auth       | Firebase Authentication              |
| Base datos | Firebase Firestore (NoSQL)           |
| IA         | Anthropic Claude API                 |
| Export     | jsPDF (PDF) + MSWord HTML (DOC)      |

## Estructura

```
src/
├── pages/
│   ├── _app.js          # App wrapper
│   ├── _document.js     # HTML <head>
│   ├── index.js         # Redirect
│   ├── login.js         # Login + Registro
│   ├── dashboard.js     # Panel principal
│   ├── generator.js     # Generador con IA
│   ├── activities.js    # Listado de actividades
│   └── api/
│       └── generate.js  # API: llama a Claude + guarda en Firestore
├── components/
│   ├── Layout.jsx       # Sidebar + Topbar compartido
│   └── ActivityCard.jsx # Tarjeta de actividad + modal
└── lib/
    ├── firebase.js      # Firebase client SDK
    ├── firebaseAdmin.js # Firebase Admin (server-side)
    ├── auth.js          # JWT helpers (para rutas extra si necesitas)
    ├── markdown.js      # Markdown → HTML
    └── export.js        # PDF y DOC
```

## Instalación

```bash
# 1. Instalar dependencias
npm install

# 2. Configurar variables de entorno
cp .env.example .env.local
# Editar .env.local con tus claves

# 3. Arrancar
npm run dev   →   http://localhost:3000
```

## Variables de entorno requeridas

```env
ANTHROPIC_API_KEY=sk-ant-...
NEXT_PUBLIC_FIREBASE_API_KEY=...
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=...
NEXT_PUBLIC_FIREBASE_PROJECT_ID=...
FIREBASE_CLIENT_EMAIL=...
FIREBASE_PRIVATE_KEY="..."
```

## Configurar Firebase (5 minutos)

1. Ir a [console.firebase.google.com](https://console.firebase.google.com)
2. Crear proyecto → Agregar app web → Copiar config al `.env.local`
3. Authentication → Habilitar **Email/Password**
4. Firestore Database → Crear base de datos en modo prueba
5. Project Settings → Service Accounts → Generate new private key
   → Copiar `client_email` y `private_key` al `.env.local`
6. En Firestore → Rules, pegar:
```
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    match /activities/{doc} {
      allow read, write: if request.auth != null && request.auth.uid == resource.data.userId;
      allow create: if request.auth != null;
    }
  }
}
```
