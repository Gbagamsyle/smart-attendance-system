import { useState } from "react"
import { supabase } from "../services/supabase"

export default function Login(){

  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")

  const login = async () => {

    const { error } = await supabase.auth.signInWithPassword({

      email,
      password

    })

    if(error){
      alert(error.message)
    }else{
      alert("Logged in successfully")
    }

  }

  return (

    <div className="h-screen flex flex-col items-center justify-center gap-4">

      <h1 className="text-2xl font-bold">

        Smart Attendance Login

      </h1>

      <input
        placeholder="Email"
        value={email}
        onChange={(e)=>setEmail(e.target.value)}
        className="border p-2"
      />

      <input
        placeholder="Password"
        type="password"
        value={password}
        onChange={(e)=>setPassword(e.target.value)}
        className="border p-2"
      />

      <button
        onClick={login}
        className="bg-blue-500 text-white px-4 py-2"
      >
        Login
      </button>

    </div>

  )
}