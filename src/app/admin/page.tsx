"use client";

import { useSession } from "next-auth/react";

export default function AdminPage() {
    const { data: session } = useSession();

    if (!session) return null;

    return (
        <div style={{ display: "flex", flexDirection: "column", gap: "2rem" }}>
            <header>
                <h1 style={{ fontSize: "2rem", color: "var(--color-dark-blue)" }}>
                    Bem-vindo, {session.user?.name}
                </h1>
                <p style={{ color: "var(--text-muted)", marginTop: "0.25rem" }}>
                    Aqui está o resumo da sua imobiliária hoje.
                </p>
            </header>

            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(260px, 1fr))", gap: "1.5rem" }}>
                <div className="card">
                    <span style={{ fontSize: "0.85rem", color: "var(--text-muted)", textTransform: "uppercase", fontWeight: 600 }}>Imóveis Ativos</span>
                    <h2 style={{ fontSize: "2.5rem", marginTop: "0.5rem" }}>0</h2>
                </div>
                <div className="card">
                    <span style={{ fontSize: "0.85rem", color: "var(--text-muted)", textTransform: "uppercase", fontWeight: 600 }}>Leads Recebidos</span>
                    <h2 style={{ fontSize: "2.5rem", marginTop: "0.5rem" }}>0</h2>
                </div>
                <div className="card" style={{ borderLeft: "4px solid var(--accent-primary)" }}>
                    <span style={{ fontSize: "0.85rem", color: "var(--text-muted)", textTransform: "uppercase", fontWeight: 600 }}>Usuário Atual</span>
                    <h2 style={{ fontSize: "1.5rem", marginTop: "0.5rem" }}>{(session.user as any)?.level}</h2>
                </div>
            </div>

            <div className="card" style={{ backgroundColor: "var(--color-beige)", border: "none" }}>
                <h3 style={{ color: "var(--color-olive-dark)" }}>🚀 Dica do Sistema</h3>
                <p style={{ marginTop: "0.5rem", color: "var(--text-primary)" }}>
                    Comece cadastrando seus <strong>Tipos de Imóvel</strong> e <strong>Localidades</strong> para habilitar os filtros de busca no site público.
                </p>
            </div>
        </div>
    );
}
