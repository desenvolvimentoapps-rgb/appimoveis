"use client";

import { useSession } from "next-auth/react";
import { useState, useEffect } from "react";

export default function DashboardAdmin() {
    const { data: session } = useSession();
    const [charts, setCharts] = useState<any[]>([]);
    const [users, setUsers] = useState<any[]>([]);
    const [showConfig, setShowConfig] = useState(false);
    const [editChartId, setEditChartId] = useState<string | null>(null);
    const [stats, setStats] = useState({ active: 0, inactive: 0, visits: 0, clicks: 0 });

    const [newChart, setNewChart] = useState({
        title: "",
        type: "BAR",
        dataSource: "property_type",
        allowedUserIds: [] as string[]
    });

    useEffect(() => {
        fetchCharts();
        fetchStats();
        if ((session?.user as any)?.level === "MASTER") {
            fetch("/api/usuarios")
                .then(res => res.json())
                .then(data => setUsers(Array.isArray(data) ? data : []));
        }
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

    const handleCreateOrUpdateChart = async () => {
        if (!newChart.title) return alert("Dê um título ao gráfico.");

        const method = editChartId ? "PUT" : "POST";
        const body = editChartId ? { ...newChart, id: editChartId } : newChart;

        const res = await fetch("/api/analytics/charts", {
            method,
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(body)
        });

        if (res.ok) {
            setShowConfig(false);
            setEditChartId(null);
            setNewChart({ title: "", type: "BAR", dataSource: "property_type", allowedUserIds: [] });
            fetchCharts();
        }
    };

    const handleDeleteChart = async (id: string) => {
        if (!confirm("Remover este gráfico permanentemente?")) return;
        const res = await fetch(`/api/analytics/charts?id=${id}`, { method: "DELETE" });
        if (res.ok) fetchCharts();
    };

    const isAdmin = (session?.user as any)?.level === "MASTER";

    return (
        <div style={{ paddingBottom: "5rem" }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "2.5rem" }}>
                <div>
                    <h2 style={{ fontSize: "1.85rem", color: "var(--color-dark-blue)", fontWeight: 800 }}>Dashboard Inteligente</h2>
                    <p style={{ color: "var(--text-muted)", fontSize: "0.9rem" }}>Acompanhe o desempenho e as tendências da Rede Olivia Prado</p>
                </div>
                {isAdmin && (
                    <button className="btn btn-primary" onClick={() => {
                        setEditChartId(null);
                        setNewChart({ title: "", type: "BAR", dataSource: "property_type", allowedUserIds: [] });
                        setShowConfig(true);
                    }} style={{ padding: "0.8rem 1.5rem", borderRadius: "var(--radius-md)", fontWeight: 700 }}>
                        📊 Criar Novo Gráfico
                    </button>
                )}
            </div>

            {/* Cards Estatísticos */}
            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(240px, 1fr))", gap: "1.5rem", marginBottom: "3rem" }}>
                {[
                    { label: "Imóveis Ativos", value: stats.active, color: "var(--color-olive-green)", filter: "DISPONIVEL", emoji: "🏠" },
                    { label: "Venda/Aluguel", value: stats.inactive, color: "var(--color-dark-blue)", filter: "VENDIDO", emoji: "🤝" },
                    { label: "Views Totais", value: stats.visits, color: "#1d4ed8", filter: "VIEWS", emoji: "👁️" },
                    { label: "Conversão Zap", value: stats.clicks, color: "#059669", filter: "CLICKS", emoji: "📱" }
                ].map((c, i) => (
                    <div key={i} className="card" style={{ borderLeft: `5px solid ${c.color}`, cursor: "pointer", transition: "transform 0.2s" }} onClick={() => window.location.href = `/admin/imoveis?filter=${c.filter}`} onMouseEnter={e => e.currentTarget.style.transform = "translateY(-4px)"} onMouseLeave={e => e.currentTarget.style.transform = "translateY(0)"}>
                        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
                            <div>
                                <span style={{ fontSize: "0.8rem", fontWeight: 700, color: "var(--text-muted)", textTransform: "uppercase", letterSpacing: "1px" }}>{c.label}</span>
                                <p style={{ fontSize: "2.25rem", fontWeight: 800, marginTop: "0.5rem", color: "var(--color-dark-blue)" }}>{c.value}</p>
                            </div>
                            <span style={{ fontSize: "2rem" }}>{c.emoji}</span>
                        </div>
                    </div>
                ))}
            </div>

            {/* Listagem de Gráficos Dinâmicos */}
            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(480px, 1fr))", gap: "2rem" }}>
                {charts.map((chart) => (
                    <div key={chart.id} className="card" style={{ position: "relative" }}>
                        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "2rem" }}>
                            <div>
                                <h3 style={{ fontSize: "1.2rem", color: "var(--color-dark-blue)" }}>{chart.title}</h3>
                                <span style={{ fontSize: "0.7rem", color: "var(--text-muted)" }}>FONTE: {chart.dataSource.toUpperCase()}</span>
                            </div>
                            {isAdmin && (
                                <div style={{ display: "flex", gap: "0.5rem" }}>
                                    <button
                                        onClick={() => {
                                            setEditChartId(chart.id);
                                            setNewChart({
                                                title: chart.title,
                                                type: chart.type,
                                                dataSource: chart.dataSource,
                                                allowedUserIds: chart.allowedUsers?.map((au: any) => au.userId) || []
                                            });
                                            setShowConfig(true);
                                        }}
                                        style={{ background: "none", border: "1px solid var(--border-color)", borderRadius: "5px", padding: "0.3rem", cursor: "pointer" }} title="Editar"
                                    >✏️</button>
                                    <button onClick={() => handleDeleteChart(chart.id)} style={{ background: "none", border: "1px solid var(--border-color)", color: "#ef4444", borderRadius: "5px", padding: "0.3rem", cursor: "pointer" }} title="Excluir">🗑️</button>
                                </div>
                            )}
                        </div>

                        {/* Visualização de Barras Proporcional */}
                        <div style={{ height: "280px", display: "flex", alignItems: "flex-end", gap: "12px", padding: "1rem", borderBottom: "2px solid var(--bg-primary)" }}>
                            {chart.data?.length > 0 ? chart.data.map((d: any, idx: number) => {
                                const max = Math.max(...chart.data.map((i: any) => i.value)) || 1;
                                const height = (d.value / max) * 100;
                                return (
                                    <div key={idx} style={{ flex: 1, backgroundColor: "var(--color-olive-green)", height: `${height}%`, borderRadius: "6px 6px 0 0", position: "relative", minWidth: "40px", transition: "height 0.6s cubic-bezier(0.4, 0, 0.2, 1)" }}>
                                        <div style={{ position: "absolute", bottom: "-45px", left: "50%", transform: "translateX(-50%) rotate(-45deg)", width: "100%", textAlign: "right", whiteSpace: "nowrap", fontSize: "0.65rem", fontWeight: 600, color: "var(--text-muted)" }}>{d.label}</div>
                                        <div style={{ position: "absolute", top: "-25px", left: "50%", transform: "translateX(-50%)", fontSize: "0.8rem", fontWeight: 800, color: "var(--color-dark-blue)" }}>{d.value}</div>
                                    </div>
                                );
                            }) : <p style={{ width: "100%", textAlign: "center", color: "var(--text-muted)", paddingBottom: "5rem" }}>Nenhum dado capturado ainda.</p>}
                        </div>
                    </div>
                ))}
            </div>

            {/* Modal de Configuração (Create/Edit) */}
            {showConfig && (
                <div style={{ position: "fixed", inset: 0, backgroundColor: "rgba(0,0,0,0.6)", display: "flex", alignItems: "center", justifyContent: "center", zIndex: 1000, backdropFilter: "blur(4px)" }}>
                    <div className="card" style={{ width: "100%", maxWidth: "650px", animation: "slideUp 0.3s ease" }}>
                        <h3 style={{ marginBottom: "1.5rem", color: "var(--color-dark-blue)" }}>{editChartId ? "✏️ Editar Gráfico" : "📊 Configurar Novo Gráfico"}</h3>
                        <div style={{ display: "flex", flexDirection: "column", gap: "1.25rem" }}>
                            <div className="form-group">
                                <label style={{ fontWeight: 600 }}>Nome Visual do Gráfico</label>
                                <input
                                    type="text"
                                    placeholder="Ex: Vendas por Bairro, Tipos em Estoque..."
                                    value={newChart.title}
                                    onChange={e => setNewChart({ ...newChart, title: e.target.value })}
                                />
                            </div>

                            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "1rem" }}>
                                <div className="form-group">
                                    <label style={{ fontWeight: 600 }}>Tipo de Exibição</label>
                                    <select value={newChart.type} onChange={e => setNewChart({ ...newChart, type: e.target.value })}>
                                        <option value="BAR">Gráfico de Barras</option>
                                        <option value="PIE">Gráfico de Pizza</option>
                                        <option value="NUMBER">Somatório (Número)</option>
                                    </select>
                                </div>
                                <div className="form-group">
                                    <label style={{ fontWeight: 600 }}>Fonte de Dados</label>
                                    <select value={newChart.dataSource} onChange={e => setNewChart({ ...newChart, dataSource: e.target.value })}>
                                        <option value="property_type">Estoque por Tipo de Imóvel</option>
                                        <option value="status">Volume por Status</option>
                                        <option value="city">Volume por Cidade</option>
                                        <option value="amenity">Imóveis com Comodidades específicas</option>
                                        <option value="region">Distribuição BR vs Exterior</option>
                                    </select>
                                </div>
                            </div>

                            <label style={{ fontWeight: 700, fontSize: "0.9rem", color: "var(--color-dark-blue)", marginTop: "0.5rem" }}>🔓 Controle de Acesso</label>
                            <p style={{ fontSize: "0.75rem", color: "var(--text-muted)", marginTop: "-0.5rem" }}>Selecione quem poderá visualizar este gráfico em seus próprios dashboards corporativos.</p>

                            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(180px, 1fr))", gap: "0.8rem", maxHeight: "180px", overflowY: "auto", border: "1px solid var(--border-color)", padding: "1rem", borderRadius: "10px", backgroundColor: "var(--bg-primary)" }}>
                                {users.map(u => (
                                    <label key={u.id} style={{ fontSize: "0.85rem", display: "flex", alignItems: "center", gap: "0.6rem", cursor: "pointer", userSelect: "none" }}>
                                        <input
                                            type="checkbox"
                                            checked={newChart.allowedUserIds.includes(u.id)}
                                            onChange={e => {
                                                if (e.target.checked) {
                                                    setNewChart({ ...newChart, allowedUserIds: [...newChart.allowedUserIds, u.id] });
                                                } else {
                                                    setNewChart({ ...newChart, allowedUserIds: newChart.allowedUserIds.filter(id => id !== u.id) });
                                                }
                                            }}
                                        /> {u.name || u.email.split('@')[0]}
                                    </label>
                                ))}
                                {users.length === 0 && <p style={{ fontSize: "0.75rem", color: "var(--text-muted)" }}>Nenhum usuário cadastrado.</p>}
                            </div>

                            <div style={{ display: "flex", gap: "1rem", marginTop: "1rem" }}>
                                <button className="btn btn-primary" style={{ flex: 1.5, padding: "1rem" }} onClick={handleCreateOrUpdateChart}>
                                    {editChartId ? "Atualizar Gráfico" : "Criar Gráfico"}
                                </button>
                                <button className="btn" style={{ flex: 1, backgroundColor: "#f3f4f6" }} onClick={() => setShowConfig(false)}>Cancelar</button>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
