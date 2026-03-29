'use client'

import { useState } from "react"
import { useRouter } from "next/navigation"
import { supabase } from '@/lib/supabaseClient'

export default function SignUp() {
  const router = useRouter()

  const [formData, setFormData] = useState({
    username: "",
    email: "",
    password: "",
    confirmPassword: "",
  })

  const handleChange = (e) => {
    const { name, value } = e.target
    setFormData(prev => ({ ...prev, [name]: value }))
  }

  const handleSubmit = async (e) => {
    e.preventDefault()

    if (formData.password !== formData.confirmPassword) {
      alert("Password tidak sama!")
      return
    }

    const { data, error } = await supabase.auth.signUp({
      email: formData.email,
      password: formData.password
    })

    if (error) {
      alert(error.message)
      return
    }

    // simpan ke profiles
    await supabase.from('profiles').insert([
      {
        id: data.user.id,
        username: formData.username,
        role: 'user'
      }
    ])

    alert("Berhasil daftar!")
    router.push('/login')
  }

  return (
    <div className="flex h-screen">
      
      {/* FORM */}
      <div className="w-[40%] flex justify-center items-center bg-white rounded-xl shadow-xl m-10">
        <form onSubmit={handleSubmit} className="w-[80%] flex flex-col gap-5">
          <h1 className="text-4xl font-bold text-center text-[#0c72a6]">Sign Up</h1>

          <input name="username" placeholder="Username" onChange={handleChange} className="input" />
          <input name="email" placeholder="Email" onChange={handleChange} className="input" />
          <input name="password" type="password" placeholder="Password" onChange={handleChange} className="input" />
          <input name="confirmPassword" type="password" placeholder="Konfirmasi Password" onChange={handleChange} className="input" />

          <button className="btn">Sign Up</button>

          <p className="text-center">
            Already have an account? 
            <span onClick={() => router.push('/login')} className="text-blue-500 cursor-pointer"> Sign In</span>
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