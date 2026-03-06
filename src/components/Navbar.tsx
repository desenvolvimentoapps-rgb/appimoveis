"use client";

import Link from "next/link";

export default function Navbar() {
    return (
        <nav style={{
            backgroundColor: "var(--color-white)",
            padding: "1rem 2rem",
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            boxShadow: "var(--shadow-sm)",
            position: "sticky",
            top: 0,
            zIndex: 1000
        }}>
            <div style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}>
                <div style={{ width: "32px", height: "32px", backgroundColor: "var(--color-dark-blue)", borderRadius: "50%" }}></div>
                <h1 style={{ fontSize: "1.25rem", color: "var(--color-dark-blue)", fontWeight: 700, margin: 0 }}>
                    Olivia Prado
                </h1>
            </div>

            <div style={{ display: "flex", gap: "2rem", alignItems: "center" }}>
                <Link href="/" style={{ fontWeight: 500, color: "var(--text-primary)" }}>Início</Link>
                <Link href="/buscar" style={{ fontWeight: 500, color: "var(--text-primary)" }}>Buscar Imóveis</Link>
                <Link href="/sobre" style={{ fontWeight: 500, color: "var(--text-primary)" }}>Sobre Nós</Link>
                <Link href="/contato" style={{ fontWeight: 500, color: "var(--text-primary)" }}>Contato</Link>
                <Link href="/login" className="btn btn-primary" style={{ padding: "0.5rem 1.25rem", fontSize: "0.9rem" }}>
                    Portal do Corretor
                </Link>
            </div>
        </nav>
    );
}
