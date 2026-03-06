"use client";

import Link from "next/link";
import { useState, useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";

export default function ImoveisPage() {
    const [imoveis, setImoveis] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [pagination, setPagination] = useState({ total: 0, page: 1, limit: 10 });
    const router = useRouter();
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

    const handleDelete = async (id: string) => {
        if (!confirm("Tem certeza que deseja excluir este imóvel?")) return;
        const res = await fetch(`/api/imoveis?id=${id}`, { method: "DELETE" });
        if (res.ok) fetchImoveis();
    };

    return (
        <div>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "2rem" }}>
                <div>
                    <h2 style={{ fontSize: "1.75rem", color: "var(--color-dark-blue)" }}>Gestão de Imóveis</h2>
                    <p style={{ color: "var(--text-muted)" }}>Consulte e gerencie todos os imóveis cadastrados.</p>
                </div>
                <div style={{ display: "flex", gap: "1rem" }}>
                    <button
                        onClick={() => alert("Gerando arquivo CSV/Excel compatível com Olivia Prado...")}
                        className="btn"
                        style={{ backgroundColor: "var(--color-white)", border: "1px solid var(--border-color)", padding: "0.75rem 1.5rem" }}
                    >
                        📊 Exportar Excel
                    </button>
                    <Link href="/admin/imoveis/novo" className="btn btn-primary" style={{ padding: "0.75rem 1.5rem" }}>
                        + Cadastrar Novo Imóvel
                    </Link>
                </div>
            </div>

            <div className="card" style={{ padding: "0" }}>
                <table style={{ width: "100%", borderCollapse: "collapse" }}>
                    <thead>
                        <tr style={{ textAlign: "left", borderBottom: "1px solid var(--border-color)", color: "var(--text-muted)", fontSize: "0.85rem" }}>
                            <th style={{ padding: "1.25rem" }}>Imóvel</th>
                            <th style={{ padding: "1.25rem" }}>Tipo</th>
                            <th style={{ padding: "1.25rem" }}>Preço</th>
                            <th style={{ padding: "1.25rem" }}>Métricas</th>
                            <th style={{ padding: "1.25rem" }}>Status</th>
                            <th style={{ padding: "1.25rem" }}>Ações</th>
                        </tr>
                    </thead>
                    <tbody>
                        {loading ? (
                            <tr><td colSpan={6} style={{ padding: "3rem", textAlign: "center" }}>Carregando...</td></tr>
                        ) : imoveis.length === 0 ? (
                            <tr><td colSpan={6} style={{ padding: "3rem", textAlign: "center" }}>Nenhum imóvel encontrado.</td></tr>
                        ) : imoveis.map(i => (
                            <tr key={i.id} style={{ borderBottom: "1px solid var(--border-color)" }}>
                                <td style={{ padding: "1.25rem" }}>
                                    <div style={{ fontWeight: 600, color: "var(--color-dark-blue)" }}>{i.title}</div>
                                    <div style={{ fontSize: "0.75rem", color: "var(--text-muted)" }}>Cód: {i.code}</div>
                                </td>
                                <td style={{ padding: "1.25rem" }}>{i.type?.name}</td>
                                <td style={{ padding: "1.25rem", fontWeight: 700 }}>R$ {i.price.toLocaleString("pt-BR")}</td>
                                <td style={{ padding: "1.25rem" }}>
                                    <div style={{ fontSize: "0.8rem" }}>👁️ {i.views || 0} visualizações</div>
                                    <div style={{ fontSize: "0.8rem" }}>💬 {i.clicks || 0} cliques Whats</div>
                                </td>
                                <td style={{ padding: "1.25rem" }}>
                                    <span style={{
                                        padding: "0.25rem 0.75rem",
                                        borderRadius: "20px",
                                        fontSize: "0.75rem",
                                        fontWeight: 600,
                                        backgroundColor: i.status === "DISPONIVEL" ? "#d1fae5" : "#fee2e2",
                                        color: i.status === "DISPONIVEL" ? "#065f46" : "#991b1b"
                                    }}>
                                        {i.status}
                                    </span>
                                </td>
                                <td style={{ padding: "1.25rem" }}>
                                    <div style={{ display: "flex", gap: "1rem" }}>
                                        <Link href={`/admin/imoveis/editar/${i.id}`} style={{ color: "var(--color-dark-blue)", textDecoration: "none" }}>✏️</Link>
                                        <button onClick={() => handleDelete(i.id)} style={{ background: "none", border: "none", cursor: "pointer", color: "#b91c1c" }}>🗑️</button>
                                    </div>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>

                {/* Paginação */}
                <div style={{ padding: "1.25rem", display: "flex", justifyContent: "space-between", alignItems: "center", borderTop: "1px solid var(--border-color)" }}>
                    <span style={{ fontSize: "0.85rem", color: "var(--text-muted)" }}>Mostrando {imoveis.length} de {pagination.total} resultados</span>
                    <div style={{ display: "flex", gap: "0.5rem" }}>
                        <button
                            disabled={pagination.page === 1}
                            onClick={() => setPagination({ ...pagination, page: pagination.page - 1 })}
                            className="btn" style={{ padding: "0.5rem 1rem" }}>Anterior</button>
                        <button
                            disabled={pagination.page * pagination.limit >= pagination.total}
                            onClick={() => setPagination({ ...pagination, page: pagination.page + 1 })}
                            className="btn" style={{ padding: "0.5rem 1rem" }}>Próximo</button>
                    </div>
                </div>
            </div>
        </div>
    );
}
