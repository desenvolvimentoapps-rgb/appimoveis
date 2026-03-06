"use client";

import { useState, useEffect } from "react";

export default function GraficosMasterPage() {
    const [data, setData] = useState<any>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetch("/api/dashboards")
            .then(res => res.json())
            .then(res => {
                setData(res);
                setLoading(false);
            })
            .catch(() => setLoading(false));
    }, []);

    if (loading) return (
        <div style={{ padding: "10rem", textAlign: "center" }}>
            <div style={{ fontSize: "3rem", animation: "spin 2s linear infinite" }}>📊</div>
            <p style={{ marginTop: "1.5rem", fontWeight: 700, color: "var(--text-muted)" }}>Consolidando inteligência de mercado...</p>
        </div>
    );

    if (!data) return <div style={{ padding: "5rem", textAlign: "center" }}>Erro ao carregar dados analíticos.</div>;

    const maxCount = Math.max(...data.tipos.map((t: any) => t.count), 1);

    return (
        <div style={{ display: "flex", flexDirection: "column", gap: "3rem" }}>
            <header>
                <h1 style={{ fontSize: "2.5rem", fontWeight: 900, color: "var(--color-dark-blue)", letterSpacing: "-1.5px" }}>Business Intelligence</h1>
                <p style={{ color: "var(--text-muted)", fontSize: "1.1rem", fontWeight: 500 }}>Análise volumétrica e performance de ativos imobiliários.</p>
            </header>

            {/* Métricas Rápidas */}
            <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: "2rem" }}>
                {[
                    { label: "Ativos Totais", val: data.metrics.totalImoveis, icon: "🏘️" },
                    { label: "Visualizações", val: data.metrics.views, icon: "👁️" },
                    { label: "Conversões (Clicks)", val: data.metrics.clicks, icon: "🎯" }
                ].map((m, i) => (
                    <div key={i} className="card" style={{ padding: "2rem", borderRadius: "24px", boxShadow: "0 10px 15px -3px rgba(0,0,0,0.05)" }}>
                        <div style={{ fontSize: "2rem", marginBottom: "1rem" }}>{m.icon}</div>
                        <div style={{ fontSize: "0.85rem", fontWeight: 800, color: "#94a3b8", textTransform: "uppercase" }}>{m.label}</div>
                        <div style={{ fontSize: "2.5rem", fontWeight: 950, color: "var(--color-dark-blue)" }}>{m.val}</div>
                    </div>
                ))}
            </div>

            <div style={{ display: "grid", gridTemplateColumns: "1.5fr 1fr", gap: "2rem" }}>

                {/* Gráfico de Barras: Distribuição por Tipo */}
                <section className="card" style={{ padding: "3rem", borderRadius: "32px" }}>
                    <h3 style={{ marginBottom: "2.5rem", fontWeight: 900, fontSize: "1.35rem", color: "var(--color-dark-blue)" }}>Distribuição por Tipologia</h3>
                    <div style={{ display: "flex", flexDirection: "column", gap: "1.5rem" }}>
                        {data.tipos.map((t: any, idx: number) => (
                            <div key={idx} style={{ position: "relative" }}>
                                <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "0.5rem", fontWeight: 700, fontSize: "0.9rem" }}>
                                    <span>{t.label}</span>
                                    <span>{t.count} und.</span>
                                </div>
                                <div style={{ width: "100%", height: "12px", backgroundColor: "#f1f5f9", borderRadius: "10px", overflow: "hidden" }}>
                                    <div style={{
                                        width: `${(t.count / maxCount) * 100}%`,
                                        height: "100%",
                                        backgroundColor: `hsl(${210 + (idx * 20)}, 70%, 50%)`,
                                        borderRadius: "10px",
                                        transition: "width 1s ease-out"
                                    }}></div>
                                </div>
                            </div>
                        ))}
                    </div>
                </section>

                {/* Gráfico de Status: Donut Style */}
                <section className="card" style={{ padding: "3rem", borderRadius: "32px" }}>
                    <h3 style={{ marginBottom: "2.5rem", fontWeight: 900, fontSize: "1.35rem", color: "var(--color-dark-blue)" }}>Status do Inventário</h3>
                    <div style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>
                        {data.status.map((s: any, idx: number) => (
                            <div key={idx} style={{ padding: "1.25rem", borderRadius: "18px", backgroundColor: "#f8fafc", display: "flex", alignItems: "center", justifyContent: "space-between", border: "1px solid #eef2f6" }}>
                                <div style={{ display: "flex", alignItems: "center", gap: "1rem" }}>
                                    <div style={{ width: "12px", height: "12px", borderRadius: "50%", backgroundColor: s.label === "DISPONIVEL" ? "#22c55e" : "#ef4444" }}></div>
                                    <span style={{ fontWeight: 800, color: "var(--color-dark-blue)", fontSize: "0.95rem" }}>{s.label}</span>
                                </div>
                                <span style={{ fontWeight: 900, fontSize: "1.2rem" }}>{s.count}</span>
                            </div>
                        ))}
                    </div>
                </section>

            </div>

            {/* Localidades */}
            <section className="card" style={{ padding: "3rem", borderRadius: "32px", borderTop: "8px solid var(--color-dark-blue)" }}>
                <h3 style={{ marginBottom: "2.5rem", fontWeight: 900, fontSize: "1.35rem", color: "var(--color-dark-blue)" }}>Market Share por Localidade</h3>
                <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(200px, 1fr))", gap: "1.5rem" }}>
                    {data.cidades.map((c: any, i: number) => (
                        <div key={i} style={{ padding: "1.5rem", textAlign: "center", backgroundColor: "#f1f5f9", borderRadius: "20px" }}>
                            <div style={{ fontSize: "1.5rem", marginBottom: "0.5rem" }}>📍</div>
                            <div style={{ fontWeight: 800, color: "var(--color-dark-blue)" }}>{c.label}</div>
                            <div style={{ color: "var(--text-muted)", fontSize: "0.85rem", fontWeight: 700 }}>{c.count} Imóveis</div>
                        </div>
                    ))}
                </div>
            </section>
        </div>
    );
}
