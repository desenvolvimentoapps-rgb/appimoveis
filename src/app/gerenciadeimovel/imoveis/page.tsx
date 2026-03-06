"use client";

import Link from "next/link";
import { useState, useEffect } from "react";
import { useSearchParams } from "next/navigation";

export default function MeusImoveisPage() {
    const [imoveis, setImoveis] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [pagination, setPagination] = useState({ total: 0, page: 1, limit: 12 });
    const searchParams = useSearchParams();
    const filter = searchParams.get("filter");

    useEffect(() => {
        fetchImoveis();
    }, [pagination.page, pagination.limit, filter]);

    const fetchImoveis = async () => {
        setLoading(true);
        const res = await fetch(`/api/imoveis?page=${pagination.page}&limit=${pagination.limit}${filter ? `&status=${filter}` : ""}`);
        const data = await res.json();
        setImoveis(data.data || []);
        setPagination(prev => ({ ...prev, total: data.total }));
        setLoading(false);
    };

    return (
        <div>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "2.5rem" }}>
                <div>
                    <h2 style={{ fontSize: "1.75rem", color: "var(--color-dark-blue)", fontWeight: 800 }}>Gestão de Imóveis</h2>
                    <p style={{ color: "var(--text-muted)" }}>Gerencie seus anúncios e acompanhe o desempenho em tempo real.</p>
                </div>
                <Link href="/gerenciadeimovel/imoveis/novo" className="btn btn-primary" style={{ padding: "0.8rem 1.5rem", borderRadius: "10px", fontWeight: 700 }}>
                    🚀 Novo Anúncio
                </Link>
            </div>

            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(320px, 1fr))", gap: "2rem" }}>
                {loading ? (
                    <div style={{ gridColumn: "1/-1", textAlign: "center", padding: "4rem" }}>Carregando seus imóveis...</div>
                ) : imoveis.length === 0 ? (
                    <div className="card" style={{ gridColumn: "1/-1", textAlign: "center", padding: "4rem" }}>
                        <div style={{ fontSize: "3rem", marginBottom: "1rem" }}>🏘️</div>
                        <h3>Você ainda não possui imóveis.</h3>
                        <p style={{ color: "var(--text-muted)", margin: "1rem 0" }}>Comece agora mesmo a cadastrar suas propriedades para o portal.</p>
                        <Link href="/gerenciadeimovel/imoveis/novo" className="btn btn-primary">Começar Cadastro</Link>
                    </div>
                ) : imoveis.map(i => (
                    <div key={i.id} className="card" style={{ padding: 0, overflow: "hidden", display: "flex", flexDirection: "column" }}>
                        <div style={{ position: "relative", height: "180px" }}>
                            <img src={i.images?.[0]?.url || "/placeholder-house.jpg"} style={{ width: "100%", height: "100%", objectFit: "cover" }} />
                            <div style={{ position: "absolute", top: "10px", right: "10px", backgroundColor: i.status === "DISPONIVEL" ? "var(--color-olive-green)" : "#ef4444", color: "white", padding: "0.4rem 0.8rem", borderRadius: "20px", fontSize: "0.7rem", fontWeight: 800 }}>
                                {i.status}
                            </div>
                        </div>
                        <div style={{ padding: "1.5rem", flex: 1 }}>
                            <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "0.5rem" }}>
                                <span style={{ fontSize: "0.75rem", fontWeight: 700, color: "var(--accent-secondary)" }}>{i.type?.name}</span>
                                <span style={{ fontSize: "0.75rem", color: "var(--text-muted)" }}>{i.code}</span>
                            </div>
                            <h4 style={{ marginBottom: "1rem", color: "var(--color-dark-blue)", minHeight: "2.5rem" }}>{i.title}</h4>
                            <div style={{ display: "flex", gap: "1rem", backgroundColor: "var(--bg-primary)", padding: "0.8rem", borderRadius: "8px", marginBottom: "1.5rem" }}>
                                <div style={{ flex: 1, textAlign: "center" }}>
                                    <div style={{ fontSize: "0.6rem", color: "var(--text-muted)" }}>VIEWS</div>
                                    <div style={{ fontWeight: 800 }}>{i.views || 0}</div>
                                </div>
                                <div style={{ flex: 1, textAlign: "center", borderLeft: "1px solid var(--border-color)" }}>
                                    <div style={{ fontSize: "0.6rem", color: "var(--text-muted)" }}>CLICKS</div>
                                    <div style={{ fontWeight: 800 }}>{i.clicks || 0}</div>
                                </div>
                            </div>
                            <div style={{ display: "flex", gap: "0.8rem" }}>
                                <Link href={`/gerenciadeimovel/imoveis/editar/${i.id}`} className="btn" style={{ flex: 1, backgroundColor: "var(--bg-primary)", color: "var(--color-dark-blue)", fontSize: "0.85rem", padding: "0.6rem" }}>Editar</Link>
                                <button className="btn" style={{ flex: 1, backgroundColor: "rgba(30, 41, 59, 0.05)", fontSize: "0.85rem", padding: "0.6rem" }}>Detalhes</button>
                            </div>
                        </div>
                    </div>
                ))}
            </div>

            {/* Pagination Controls */}
            {pagination.total > pagination.limit && (
                <div style={{ marginTop: "3rem", display: "flex", justifyContent: "center", gap: "1rem" }}>
                    <button disabled={pagination.page === 1} onClick={() => setPagination({ ...pagination, page: pagination.page - 1 })} className="btn" style={{ border: "1px solid var(--border-color)" }}>Anterior</button>
                    <button disabled={pagination.page * pagination.limit >= pagination.total} onClick={() => setPagination({ ...pagination, page: pagination.page + 1 })} className="btn" style={{ border: "1px solid var(--border-color)" }}>Próximo</button>
                </div>
            )}
        </div>
    );
}
