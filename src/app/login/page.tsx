"use client";

import { useState } from "react";
import { signIn } from "next-auth/react";
import { useRouter } from "next/navigation";

export default function LoginPage() {
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [error, setError] = useState("");
    const router = useRouter();

    const handleLogin = async (e: React.FormEvent) => {
        e.preventDefault();
        setError("");

        const res = await signIn("credentials", {
            email,
            password,
            redirect: false,
        });

        if (res?.error) {
            setError(res.error);
        } else {
            router.push("/admin");
        }
    };

    return (
        <div style={{ display: "flex", minHeight: "100vh", alignItems: "center", justifyContent: "center", backgroundColor: "var(--bg-primary)" }}>
            <div className="card" style={{ width: "100%", maxWidth: "400px" }}>
                <h2 style={{ textAlign: "center", marginBottom: "1.5rem", color: "var(--color-dark-blue)" }}>
                    Acesso Restrito
                </h2>
                {error && (
                    <div style={{ backgroundColor: "#fee2e2", color: "#b91c1c", padding: "0.75rem", borderRadius: "var(--radius-sm)", marginBottom: "1rem", fontSize: "0.875rem", textAlign: "center" }}>
                        {error}
                    </div>
                )}
                <form onSubmit={handleLogin} style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>
                    <div>
                        <label style={{ display: "block", marginBottom: "0.5rem", fontWeight: 500 }}>Email ou Login</label>
                        <input
                            type="text"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            required
                            style={{ width: "100%", padding: "0.75rem", borderRadius: "var(--radius-sm)", border: "1px solid var(--border-color)", outline: "none", fontSize: "1rem" }}
                        />
                    </div>
                    <div>
                        <label style={{ display: "block", marginBottom: "0.5rem", fontWeight: 500 }}>Senha</label>
                        <input
                            type="password"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            required
                            style={{ width: "100%", padding: "0.75rem", borderRadius: "var(--radius-sm)", border: "1px solid var(--border-color)", outline: "none", fontSize: "1rem" }}
                        />
                    </div>
                    <button type="submit" className="btn btn-primary" style={{ marginTop: "0.5rem", width: "100%" }}>
                        Entrar no Sistema
                    </button>
                </form>
            </div>
        </div>
    );
}
