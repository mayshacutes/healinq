'use client'

import { useState } from "react"
import { useRouter } from "next/navigation"
import { supabase } from '@/lib/supabaseClient'

export default function Login() {
  const router = useRouter()

  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")

  const handleLogin = async (e) => {
    e.preventDefault()

    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password
    })

    if (error) {
      alert("Login gagal")
      return
    }

    const userId = data.user.id

    // ambil role
    const { data: profile } = await supabase
      .from('profiles')
      .select('role')
      .eq('id', userId)
      .single()

    if (profile.role === 'admin') {
      router.push('/admin')
    } else {
      router.push('/dashboard')
    }
  }

  return (
    <div className="flex h-screen">
      
      {/* FORM */}
      <div className="w-[40%] flex justify-center items-center bg-white rounded-xl shadow-xl m-10">
        <form onSubmit={handleLogin} className="w-[80%] flex flex-col gap-5">
          <h1 className="text-4xl font-bold text-center text-[#0c72a6]">Welcome!</h1>

          <input placeholder="Email" onChange={(e)=>setEmail(e.target.value)} className="input" />
          <input type="password" placeholder="Password" onChange={(e)=>setPassword(e.target.value)} className="input" />

          <button className="btn">Login</button>

          <p className="text-center">
            Don't have account?
            <span onClick={()=>router.push('/signup')} className="text-blue-500 cursor-pointer"> Sign Up</span>
          </p>
        </form>
      </div>

      {/* IMAGE */}
      <div className="w-[60%]">
        <img src="/images/group.png" className="w-full h-full object-cover"/>
      </div>
    </div>
  )
}