"use client";

import { signOut, useSession } from "next-auth/react";
import { useRouter, usePathname } from "next/navigation";
import { useEffect } from "react";
import Link from "next/link";

export default function AdminLayout({ children }: { children: React.ReactNode }) {
    const { data: session, status } = useSession();
    const router = useRouter();
    const pathname = usePathname();

    useEffect(() => {
        if (status === "unauthenticated") {
            router.push("/login");
        }
    }, [status, router]);

    if (status === "loading") {
        return <div style={{ padding: "2rem", textAlign: "center", fontFamily: 'var(--font-sans)' }}>Carregando...</div>;
    }

    if (!session) return null;

    const menuItems = [
        { name: "🏠 Dashboard", path: "/admin" },
        { name: "🏡 Gestão de Imóveis", path: "/admin/imoveis" },
        { name: "📂 Tipos de Imóvel", path: "/admin/tipos" },
        { name: "⚙️ Campos Dinâmicos", path: "/admin/campos" },
        { name: "📍 Localidades", path: "/admin/localidades" },
        { name: "✨ Comodidades", path: "/admin/comodidades" },
        { name: "👥 Usuários", path: "/admin/usuarios" },
    ];

    if ((session.user as any).level === "MASTER") {
        menuItems.push({ name: "📊 Criar Gráficos", path: "/admin/dashboard" });
    }

    return (
        <div style={{ display: "flex", minHeight: "100vh", backgroundColor: "var(--bg-primary)" }}>
            {/* Sidebar */}
            <aside style={{
                width: "260px",
                backgroundColor: "var(--color-dark-blue)",
                color: "white",
                padding: "1.5rem",
                display: "flex",
                flexDirection: "column",
                position: "fixed",
                height: "100vh"
            }}>
                <div style={{ marginBottom: "2.5rem" }}>
                    <h2 style={{ fontSize: "1.25rem", color: "var(--color-beige)", fontWeight: 700 }}>Olivia Prado</h2>
                    <p style={{ fontSize: "0.75rem", color: "rgba(255,255,255,0.5)", marginTop: "0.25rem" }}>Painel Administrativo</p>
                </div>

                <nav style={{ flex: 1, display: "flex", flexDirection: "column", gap: "0.5rem" }}>
                    {menuItems.map((item) => (
                        <Link
                            key={item.path}
                            href={item.path}
                            style={{
                                color: pathname === item.path ? "white" : "rgba(255,255,255,0.7)",
                                padding: "0.75rem 1rem",
                                borderRadius: "var(--radius-md)",
                                backgroundColor: pathname === item.path ? "rgba(255,255,255,0.1)" : "transparent",
                                transition: "all 0.2s ease",
                                fontWeight: pathname === item.path ? 600 : 400
                            }}
                        >
                            {item.name}
                        </Link>
                    ))}
                </nav>

                <div style={{ borderTop: "1px solid rgba(255,255,255,0.1)", paddingTop: "1.5rem" }}>
                    <div style={{ marginBottom: "1rem", fontSize: "0.85rem", color: "rgba(255,255,255,0.6)" }}>
                        Logado como:<br />
                        <strong style={{ color: "var(--color-beige)" }}>{session.user?.email}</strong>
                    </div>
                    <button
                        onClick={() => signOut()}
                        className="btn"
                        style={{
                            backgroundColor: "rgba(239, 68, 68, 0.2)",
                            color: "#f87171",
                            width: "100%",
                            padding: "0.6rem",
                            fontSize: "0.9rem"
                        }}
                    >
                        Sair do Sistema
                    </button>
                </div>
            </aside>

            {/* Main Content Area */}
            <main style={{ marginLeft: "260px", flex: 1, padding: "2.5rem" }}>
                {children}
            </main>
        </div>
    );
}
