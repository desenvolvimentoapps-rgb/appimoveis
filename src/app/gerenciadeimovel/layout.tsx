"use client";

import { signOut, useSession } from "next-auth/react";
import { useRouter, usePathname } from "next/navigation";
import { useEffect } from "react";
import Link from "next/link";

export default function GerenciaLayout({ children }: { children: React.ReactNode }) {
    const { data: session, status } = useSession();
    const router = useRouter();
    const pathname = usePathname();

    useEffect(() => {
        if (status === "unauthenticated") {
            router.push("/login");
        }
    }, [status, router]);

    if (status === "loading") {
        return <div style={{ padding: "2rem", textAlign: "center" }}>Carregando Portal...</div>;
    }

    if (!session) return null;

    const menuItems = [
        { name: "🏠 Dashboard", path: "/gerenciadeimovel" },
        { name: "🏡 Meus Imóveis", path: "/gerenciadeimovel/imoveis" },
        { name: "➕ Novo Imóvel", path: "/gerenciadeimovel/imoveis/novo" },
    ];

    return (
        <div style={{ display: "flex", minHeight: "100vh", backgroundColor: "var(--bg-primary)" }}>
            {/* Sidebar Corporativa */}
            <aside style={{
                width: "260px",
                backgroundColor: "#1e293b",
                color: "white",
                padding: "2rem 1.5rem",
                display: "flex",
                flexDirection: "column",
                position: "fixed",
                height: "100vh",
                boxShadow: "4px 0 10px rgba(0,0,0,0.1)"
            }}>
                <div style={{ marginBottom: "3rem" }}>
                    <h2 style={{ fontSize: "1.4rem", color: "var(--color-beige)", fontWeight: 800 }}>REDE OLIVIA</h2>
                    <p style={{ fontSize: "0.7rem", color: "rgba(255,255,255,0.5)", textTransform: "uppercase", letterSpacing: "1px" }}>Portal do Corretor</p>
                </div>

                <nav style={{ flex: 1, display: "flex", flexDirection: "column", gap: "0.8rem" }}>
                    {menuItems.map((item) => (
                        <Link
                            key={item.path}
                            href={item.path}
                            style={{
                                color: pathname === item.path ? "white" : "rgba(255,255,255,0.6)",
                                padding: "0.8rem 1.2rem",
                                borderRadius: "12px",
                                backgroundColor: pathname === item.path ? "rgba(255,255,255,0.1)" : "transparent",
                                transition: "all 0.2s ease",
                                fontWeight: pathname === item.path ? 700 : 500,
                                fontSize: "0.95rem"
                            }}
                        >
                            {item.name}
                        </Link>
                    ))}
                </nav>

                <div style={{ borderTop: "1px solid rgba(255,255,255,0.1)", paddingTop: "1.5rem" }}>
                    <div style={{ marginBottom: "1.5rem", padding: "1rem", borderRadius: "10px", backgroundColor: "rgba(0,0,0,0.2)" }}>
                        <p style={{ fontSize: "0.7rem", color: "rgba(255,255,255,0.4)", marginBottom: "0.3rem" }}>PERFIL ATIVO</p>
                        <strong style={{ color: "var(--color-beige)", fontSize: "0.9rem", display: "block", overflow: "hidden", textOverflow: "ellipsis" }}>{session.user?.name || session.user?.email}</strong>
                        <span style={{ fontSize: "0.7rem", color: "#94a3b8" }}>Nível: {(session.user as any)?.level}</span>
                    </div>
                    <button
                        onClick={() => signOut()}
                        style={{
                            backgroundColor: "#ef4444",
                            color: "white",
                            width: "100%",
                            padding: "0.75rem",
                            borderRadius: "8px",
                            border: "none",
                            cursor: "pointer",
                            fontWeight: 700,
                            fontSize: "0.9rem",
                            transition: "opacity 0.2s"
                        }}
                        onMouseEnter={e => e.currentTarget.style.opacity = "0.9"}
                        onMouseLeave={e => e.currentTarget.style.opacity = "1"}
                    >
                        Sair do Portal
                    </button>
                </div>
            </aside>

            {/* Main Content Area */}
            <main style={{ marginLeft: "260px", flex: 1, padding: "3rem" }}>
                {children}
            </main>
        </div>
    );
}
