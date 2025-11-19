'use client'

import { authClient } from "@/lib/auth-client"
import { useRouter } from "next/navigation"
import { useEffect, useState } from "react"

export default function ProfilePage() {
  const router = useRouter()
  const { data: session, isPending } = authClient.useSession()
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    // 如果未登录且加载完成，跳转到登录页
    if (!isPending && !session) {
      router.push("/login")
    }
  }, [session, isPending, router])

  const handleSignOut = async () => {
    setLoading(true)
    try {
      await authClient.signOut()
      router.push("/login")
    } catch (error) {
      console.error("退出登录失败:", error)
      setLoading(false)
    }
  }

  // 加载中状态
  if (isPending) {
    return (
      <div style={{
        maxWidth: "600px",
        margin: "100px auto",
        padding: "20px",
        textAlign: "center"
      }}>
        <p>加载中...</p>
      </div>
    )
  }

  // 未登录状态
  if (!session) {
    return null // 会通过 useEffect 重定向
  }

  return (
    <div style={{ maxWidth: "600px", margin: "100px auto", padding: "20px" }}>
      <h1 style={{ marginBottom: "30px", textAlign: "center" }}>用户信息</h1>

      <div style={{
        backgroundColor: "#f5f5f5",
        padding: "30px",
        borderRadius: "8px",
        marginBottom: "20px"
      }}>
        <div style={{ marginBottom: "20px" }}>
          <label style={{
            display: "block",
            marginBottom: "8px",
            fontWeight: "600",
            color: "#333"
          }}>
            用户名
          </label>
          <div style={{
            padding: "10px",
            backgroundColor: "white",
            borderRadius: "4px",
            border: "1px solid #ddd"
          }}>
            {session.user.name || "未设置"}
          </div>
        </div>

        <div style={{ marginBottom: "20px" }}>
          <label style={{
            display: "block",
            marginBottom: "8px",
            fontWeight: "600",
            color: "#333"
          }}>
            邮箱
          </label>
          <div style={{
            padding: "10px",
            backgroundColor: "white",
            borderRadius: "4px",
            border: "1px solid #ddd"
          }}>
            {session.user.email}
          </div>
        </div>

        <div style={{ marginBottom: "20px" }}>
          <label style={{
            display: "block",
            marginBottom: "8px",
            fontWeight: "600",
            color: "#333"
          }}>
            用户 ID
          </label>
          <div style={{
            padding: "10px",
            backgroundColor: "white",
            borderRadius: "4px",
            border: "1px solid #ddd",
            fontFamily: "monospace",
            fontSize: "14px"
          }}>
            {session.user.id}
          </div>
        </div>
      </div>

      <button
        onClick={handleSignOut}
        disabled={loading}
        style={{
          width: "100%",
          padding: "12px",
          fontSize: "16px",
          backgroundColor: "#dc2626",
          color: "white",
          border: "none",
          borderRadius: "4px",
          cursor: loading ? "not-allowed" : "pointer",
          opacity: loading ? 0.6 : 1,
          fontWeight: "500"
        }}
      >
        {loading ? "退出中..." : "退出登录"}
      </button>

      <p style={{ marginTop: "20px", textAlign: "center", color: "#666" }}>
        <a href="/" style={{ color: "#0070f3", textDecoration: "none" }}>
          返回首页
        </a>
      </p>
    </div>
  )
}
