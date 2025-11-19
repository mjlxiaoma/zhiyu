'use client'

import { authClient } from "@/lib/auth-client"
import { useState } from "react"
import { useRouter } from "next/navigation"

export default function LoginPage() {
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [error, setError] = useState("")
  const [loading, setLoading] = useState(false)
  const router = useRouter()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError("")
    setLoading(true)

    try {
      await authClient.signIn.email({
        email,
        password,
      })

      // 登录成功，跳转到用户信息页
      router.push("/profile")
    } catch (err: any) {
      setError(err.message || "登录失败，请检查邮箱和密码")
    } finally {
      setLoading(false)
    }
  }

  return (
    <div style={{ maxWidth: "400px", margin: "100px auto", padding: "20px" }}>
      <h1 style={{ marginBottom: "30px", textAlign: "center" }}>用户登录</h1>

      <form onSubmit={handleSubmit}>
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
          {loading ? "登录中..." : "登录"}
        </button>
      </form>

      <p style={{ marginTop: "20px", textAlign: "center" }}>
        还没有账号？{" "}
        <a href="/register" style={{ color: "#0070f3", textDecoration: "none" }}>
          去注册
        </a>
      </p>
    </div>
  )
}
