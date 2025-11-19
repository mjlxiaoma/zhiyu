'use client'

import { authClient } from "@/lib/auth-client"
import { useState } from "react"
import { useRouter } from "next/navigation"

export default function RegisterPage() {
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [name, setName] = useState("")
  const [error, setError] = useState("")
  const [loading, setLoading] = useState(false)
  const router = useRouter()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError("")
    setLoading(true)

    try {
      await authClient.signUp.email({
        email,
        password,
        name,
      })

      // 注册成功，跳转到登录页
      router.push("/login")
    } catch (err: any) {
      setError(err.message || "注册失败，请重试")
    } finally {
      setLoading(false)
    }
  }

  return (
    <div style={{ maxWidth: "400px", margin: "100px auto", padding: "20px" }}>
      <h1 style={{ marginBottom: "30px", textAlign: "center" }}>用户注册</h1>

      <form onSubmit={handleSubmit}>
        <div style={{ marginBottom: "15px" }}>
          <label htmlFor="name" style={{ display: "block", marginBottom: "5px" }}>
            姓名
          </label>
          <input
            id="name"
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            required
            style={{
              width: "100%",
              padding: "8px",
              fontSize: "16px",
              border: "1px solid #ccc",
              borderRadius: "4px"
            }}
          />
        </div>

        <div style={{ marginBottom: "15px" }}>
          <label htmlFor="email" style={{ display: "block", marginBottom: "5px" }}>
            邮箱
          </label>
          <input
            id="email"
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            style={{
              width: "100%",
              padding: "8px",
              fontSize: "16px",
              border: "1px solid #ccc",
              borderRadius: "4px"
            }}
          />
        </div>

        <div style={{ marginBottom: "20px" }}>
          <label htmlFor="password" style={{ display: "block", marginBottom: "5px" }}>
            密码
          </label>
          <input
            id="password"
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            minLength={8}
            style={{
              width: "100%",
              padding: "8px",
              fontSize: "16px",
              border: "1px solid #ccc",
              borderRadius: "4px"
            }}
          />
        </div>

        {error && (
          <div style={{
            color: "red",
            marginBottom: "15px",
            padding: "10px",
            backgroundColor: "#fee",
            borderRadius: "4px"
          }}>
            {error}
          </div>
        )}

        <button
          type="submit"
          disabled={loading}
          style={{
            width: "100%",
            padding: "10px",
            fontSize: "16px",
            backgroundColor: "#0070f3",
            color: "white",
            border: "none",
            borderRadius: "4px",
            cursor: loading ? "not-allowed" : "pointer",
            opacity: loading ? 0.6 : 1
          }}
        >
          {loading ? "注册中..." : "注册"}
        </button>
      </form>

      <p style={{ marginTop: "20px", textAlign: "center" }}>
        已有账号？{" "}
        <a href="/login" style={{ color: "#0070f3", textDecoration: "none" }}>
          去登录
        </a>
      </p>
    </div>
  )
}
