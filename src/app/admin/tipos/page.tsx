"use client";

import { useSession } from "next-auth/react";
import { useState, useEffect } from "react";

export default function TiposPage() {
    const { data: session } = useSession();
    const [tipos, setTipos] = useState<any[]>([]);
    const [novoTipo, setNovoTipo] = useState("");
    const [editId, setEditId] = useState<string | null>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchTipos();
    }, []);

    const fetchTipos = () => {
        setLoading(true);
        fetch("/api/tipos")
            .then(res => res.json())
            .then(data => {
                setTipos(Array.isArray(data) ? data : []);
                setLoading(false);
            });
    };

    const handleSave = async () => {
        if (!novoTipo.trim()) return;
        const method = editId ? "PUT" : "POST";
        const res = await fetch("/api/tipos", {
            method,
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(editId ? { id: editId, name: novoTipo } : { name: novoTipo }),
        });
        if (res.ok) {
            setNovoTipo("");
            setEditId(null);
            fetchTipos();
        } else {
            const err = await res.json();
            alert("Erro ao salvar tipo: " + (err.error || "Tente novamente."));
        }
    };

    const handleDelete = async (id: string) => {
        if (!confirm("Tem certeza? Isso pode afetar imóveis vinculados.")) return;
        const res = await fetch(`/api/tipos?id=${id}`, { method: "DELETE" });
        if (res.ok) fetchTipos();
        else alert("Erro ao excluir. Verifique se há imóveis vinculados.");
    };

    const isAdmin = (session?.user as any)?.level === "MASTER" || (session?.user as any)?.level === "GESTOR";

    if (!session) return null;

    return (
        <div>
            <h2 style={{ marginBottom: "2rem" }}>Gestão de Tipos de Imóvel</h2>

            {isAdmin && (
                <div className="card" style={{ marginBottom: "2.5rem", borderLeft: "4px solid var(--accent-primary)" }}>
                    <h3 style={{ marginBottom: "1rem" }}>{editId ? "Editar Tipo" : "Cadastrar Novo Tipo"}</h3>
                    <div style={{ display: "flex", gap: "1rem" }}>
                        <input
                            type="text"
                            placeholder="Ex: Apartamento, Casa, Terreno..."
                            value={novoTipo}
                            onChange={(e) => setNovoTipo(e.target.value)}
                            style={{ flex: 1, padding: "0.75rem", borderRadius: "var(--radius-sm)", border: "1px solid var(--border-color)", outline: "none" }}
                        />
                        <button className="btn btn-primary" onClick={handleSave}>{editId ? "Atualizar" : "Adicionar"}</button>
                        {editId && <button className="btn" onClick={() => { setEditId(null); setNovoTipo(""); }}>Cancelar</button>}
                    </div>
                </div>
            )}

            <div className="card">
                <h3>Tipos Cadastrados</h3>
                {loading ? <p style={{ marginTop: "1rem" }}>Carregando...</p> : (
                    <table style={{ width: "100%", marginTop: "1rem", borderCollapse: "collapse" }}>
                        <thead>
                            <tr style={{ textAlign: "left", borderBottom: "1px solid var(--border-color)" }}>
                                <th style={{ padding: "1rem" }}>Nome do Tipo</th>
                                <th style={{ padding: "1rem" }}>Campos / Imóveis</th>
                                <th style={{ padding: "1rem" }}>Ações</th>
                            </tr>
                        </thead>
                        <tbody>
                            {tipos.length === 0 ? (
                                <tr><td colSpan={3} style={{ padding: "2rem", textAlign: "center" }}>Nenhum tipo cadastrado.</td></tr>
                            ) : tipos.map((t) => (
                                <tr key={t.id} style={{ borderBottom: "1px solid var(--border-color)" }}>
                                    <td style={{ padding: "1rem", fontWeight: 500 }}>{t.name}</td>
                                    <td style={{ padding: "1rem" }}>
                                        <span style={{ fontSize: "0.85rem" }}>{t.fields?.length || 0} campos • {t._count?.properties || 0} imóveis</span>
                                    </td>
                                    <td style={{ padding: "1rem" }}>
                                        <div style={{ display: "flex", gap: "1rem" }}>
                                            <button onClick={() => { setEditId(t.id); setNovoTipo(t.name); }} style={{ color: "var(--color-dark-blue)", background: "none", border: "none", cursor: "pointer" }}>✏️</button>
                                            <button onClick={() => handleDelete(t.id)} style={{ color: "#b91c1c", background: "none", border: "none", cursor: "pointer" }}>🗑️</button>
                                        </div>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                )}
            </div>
        </div>
    );
}
