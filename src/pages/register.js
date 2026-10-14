import { useState } from 'react'

import { useRouter } from 'next/router'

import {
  createUserWithEmailAndPassword
} from 'firebase/auth'

import { auth } from '@/lib/firebase'

export default function Register() {

  const router = useRouter()

  const [email, setEmail] = useState('')

  const [password, setPassword] = useState('')

  async function handleRegister(e) {

    e.preventDefault()

    try {

      await createUserWithEmailAndPassword(
        auth,
        email,
        password
      )

      router.push('/generator')

    } catch (error) {

      alert(error.message)
    }
  }

  return (
    <div className="p-10">

      <h1>Registro</h1>

      <form onSubmit={handleRegister}>

        <input
          placeholder="Correo"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
        />

        <input
          type="password"
          placeholder="Contraseña"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
        />

        <button type="submit">
          Registrarse
        </button>

      </form>

    </div>
  )
}