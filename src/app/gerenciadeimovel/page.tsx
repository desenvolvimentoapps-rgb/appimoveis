"use client";

import { useSession } from "next-auth/react";
import { useState, useEffect } from "react";

export default function GerenciaDashboard() {
    const { data: session } = useSession();
    const [charts, setCharts] = useState<any[]>([]);
    const [stats, setStats] = useState({ active: 0, inactive: 0, visits: 0, clicks: 0 });

    useEffect(() => {
        fetchCharts();
        fetchStats();
    }, [session]);

    const fetchCharts = () => {
        fetch("/api/analytics/charts")
            .then(res => res.json())
            .then(data => setCharts(Array.isArray(data) ? data : []));
    };

    const fetchStats = () => {
        fetch("/api/imoveis?limit=999")
            .then(res => res.json())
            .then(res => {
                const data = res.data || [];
                setStats({
                    active: data.filter((i: any) => i.status === "DISPONIVEL").length,
                    inactive: data.filter((i: any) => i.status !== "DISPONIVEL").length,
                    visits: data.reduce((acc: number, cur: any) => acc + (cur.views || 0), 0),
                    clicks: data.reduce((acc: number, cur: any) => acc + (cur.clicks || 0), 0)
                });
            });
    };

    return (
        <div style={{ paddingBottom: "5rem" }}>
            <div style={{ marginBottom: "2.5rem" }}>
                <h2 style={{ fontSize: "1.85rem", color: "var(--color-dark-blue)", fontWeight: 800 }}>Bem-vindo ao Portal Corporativo</h2>
                <p style={{ color: "var(--text-muted)", fontSize: "0.95rem" }}>Confira as metas e o desempenho da rede Olivia Prado.</p>
            </div>

            {/* Cards de Resumo */}
            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))", gap: "1.5rem", marginBottom: "3rem" }}>
                {[
                    { label: "Seus Imóveis Ativos", value: stats.active, color: "var(--color-olive-green)", icon: "🏠" },
                    { label: "Visitas no Portal", value: stats.visits, color: "#1d4ed8", icon: "👁️" },
                    { label: "Interessados (Zap)", value: stats.clicks, color: "#059669", icon: "📱" }
                ].map((c, i) => (
                    <div key={i} className="card" style={{ borderTop: `4px solid ${c.color}` }}>
                        <div style={{ fontSize: "1.5rem", marginBottom: "0.5rem" }}>{c.icon}</div>
                        <span style={{ fontSize: "0.75rem", fontWeight: 700, color: "var(--text-muted)", textTransform: "uppercase" }}>{c.label}</span>
                        <p style={{ fontSize: "2rem", fontWeight: 800, marginTop: "0.4rem", color: "var(--color-dark-blue)" }}>{c.value}</p>
                    </div>
                ))}
            </div>

            <h3 style={{ marginBottom: "1.5rem", color: "var(--color-dark-blue)" }}>📊 Relatórios Disponibilizados</h3>

            {/* Listagem de Gráficos Autorizados */}
            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(450px, 1fr))", gap: "2rem" }}>
                {charts.length === 0 ? (
                    <div className="card" style={{ gridColumn: "1 / -1", textAlign: "center", padding: "4rem", color: "var(--text-muted)" }}>
                        <div style={{ fontSize: "3rem", marginBottom: "1.5rem" }}>📈</div>
                        <h3 style={{ color: "var(--color-dark-blue)" }}>Prepare-se para crescer!</h3>
                        <p style={{ marginTop: "0.5rem" }}>Seus indicadores de desempenho aparecerão aqui em breve.</p>
                    </div>
                ) : charts.map((chart) => (
                    <div key={chart.id} className="card">
                        <div style={{ marginBottom: "1.5rem" }}>
                            <h3 style={{ fontSize: "1.1rem" }}>{chart.title}</h3>
                            <span style={{ fontSize: "0.7rem", color: "var(--text-muted)" }}>Dados Gerais Olivia Prado</span>
                        </div>

                        <div style={{ height: "250px", display: "flex", alignItems: "flex-end", gap: "10px", padding: "1rem", borderBottom: "1px solid var(--bg-primary)" }}>
                            {chart.data?.length > 0 ? chart.data.map((d: any, idx: number) => {
                                const max = Math.max(...chart.data.map((i: any) => i.value)) || 1;
                                const height = (d.value / max) * 100;
                                return (
                                    <div key={idx} style={{ flex: 1, backgroundColor: "var(--color-dark-blue)", height: `${height}%`, borderRadius: "4px 4px 0 0", position: "relative" }}>
                                        <span style={{ position: "absolute", bottom: "-30px", left: "50%", transform: "translateX(-50%) rotate(-35deg)", fontSize: "0.6rem", whiteSpace: "nowrap" }}>{d.label}</span>
                                        <span style={{ position: "absolute", top: "-20px", left: "50%", transform: "translateX(-50%)", fontSize: "0.7rem", fontWeight: 700 }}>{d.value}</span>
                                    </div>
                                );
                            }) : null}
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
}
