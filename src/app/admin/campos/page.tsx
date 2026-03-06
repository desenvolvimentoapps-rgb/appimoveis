"use client";

import { useSession } from "next-auth/react";
import { useState, useEffect } from "react";

export default function CamposDinamicosPage() {
    const { data: session } = useSession();
    const [tipos, setTipos] = useState<any[]>([]);
    const [tipoSelecionado, setTipoSelecionado] = useState("");
    const [campos, setCampos] = useState<any[]>([]);
    const [loading, setLoading] = useState(false);
    const [editId, setEditId] = useState<string | null>(null);

    const [novoCampo, setNovoCampo] = useState({
        name: "",
        type: "text",
        required: false,
        showInSearch: true,
        showInList: true
    });

    useEffect(() => {
        fetch("/api/tipos")
            .then(res => res.json())
            .then(data => setTipos(Array.isArray(data) ? data : []));
    }, []);

    useEffect(() => {
        if (tipoSelecionado) {
            setLoading(true);
            fetch(`/api/campos?typeId=${tipoSelecionado}`)
                .then(res => res.json())
                .then(data => {
                    setCampos(Array.isArray(data) ? data : []);
                    setLoading(false);
                });
        } else {
            setCampos([]);
        }
    }, [tipoSelecionado]);

    const handleSaveField = async () => {
        if (!novoCampo.name) {
            alert("O nome do campo é obrigatório.");
            return;
        }
        if (!tipoSelecionado) {
            alert("Selecione um Tipo de Imóvel primeiro.");
            return;
        }

        const method = editId ? "PUT" : "POST";
        const body = editId ? { ...novoCampo, id: editId } : { ...novoCampo, propertyTypeId: tipoSelecionado };

        const res = await fetch("/api/campos", {
            method,
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(body),
        });

        if (res.ok) {
            setEditId(null);
            setNovoCampo({ name: "", type: "text", required: false, showInSearch: true, showInList: true });
            // Recarregar campos
            fetch(`/api/campos?typeId=${tipoSelecionado}`)
                .then(res => res.json())
                .then(data => setCampos(Array.isArray(data) ? data : []));
        } else {
            alert("Erro ao salvar campo.");
        }
    };

    const handleEditClick = (campo: any) => {
        setEditId(campo.id);
        setNovoCampo({
            name: campo.name,
            type: campo.type,
            required: campo.isRequired,
            showInSearch: campo.showInSearch,
            showInList: campo.showInList
        });
    };

    const handleDelete = async (id: string) => {
        if (!confirm("Excluir este campo? Isso removerá o dado em todos os imóveis deste tipo.")) return;
        const res = await fetch(`/api/campos?id=${id}`, { method: "DELETE" });
        if (res.ok) {
            setCampos(campos.filter(c => c.id !== id));
        }
    };

    if (!session) return null;
    if ((session?.user as any)?.level !== "MASTER") {
        return <div style={{ padding: "2rem" }}>Acesso restrito ao Administrador Master.</div>;
    }

    return (
        <div style={{ paddingBottom: "5rem" }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "2rem" }}>
                <h2 style={{ fontSize: "1.75rem", color: "var(--color-dark-blue)" }}>Construtor de Atributos Dinâmicos (EAV)</h2>
                <div style={{ backgroundColor: "var(--bg-primary)", padding: "0.5rem 1rem", borderRadius: "10px", fontSize: "0.8rem", color: "var(--text-muted)" }}>
                    Configure campos únicos para cada tipo de imóvel
                </div>
            </div>

            <div style={{ display: "grid", gridTemplateColumns: "300px 1fr", gap: "2rem" }}>
                {/* Sidebar: Seleção de Tipo */}
                <aside>
                    <div className="card" style={{ position: "sticky", top: "2rem" }}>
                        <h4 style={{ marginBottom: "1rem" }}>1. Definir Amarracão</h4>
                        <p style={{ fontSize: "0.85rem", color: "var(--text-muted)", marginBottom: "1.5rem" }}>
                            Escolha o tipo de imóvel para o qual deseja criar atributos personalizados.
                        </p>
                        <div className="form-group">
                            <label style={{ fontWeight: 600 }}>Tipo de Imóvel</label>
                            <select
                                value={tipoSelecionado}
                                onChange={(e) => setTipoSelecionado(e.target.value)}
                                style={{ width: "100%", padding: "0.8rem", borderRadius: "var(--radius-sm)", border: "2px solid var(--accent-primary)", outline: "none" }}
                            >
                                <option value="">Selecione...</option>
                                {tipos.map(t => <option key={t.id} value={t.id}>{t.name}</option>)}
                            </select>
                        </div>
                    </div>
                </aside>

                {/* Main Content: Cadastro e Listagem */}
                <main>
                    {!tipoSelecionado ? (
                        <div className="card" style={{ textAlign: "center", padding: "4rem 2rem", border: "2px dashed var(--border-color)", backgroundColor: "transparent" }}>
                            <div style={{ fontSize: "3rem", marginBottom: "1rem" }}>👈</div>
                            <h3>Manual de Configuração</h3>
                            <p style={{ color: "var(--text-muted)", maxWidth: "400px", margin: "1rem auto" }}>
                                Selecione um tipo de imóvel na barra lateral para começar a adicionar atributos como "Nº de Suítes", "Área de Churrasqueira", ou "Distância da Praia".
                            </p>
                        </div>
                    ) : (
                        <div style={{ display: "flex", flexDirection: "column", gap: "2rem" }}>
                            <div className="card" style={{ borderLeft: "5px solid var(--color-olive-green)", boxShadow: "0 4px 6px rgba(0,0,0,0.05)" }}>
                                <h3 style={{ marginBottom: "1.5rem" }}>➕ Novo Atributo para {tipos.find(t => t.id === tipoSelecionado)?.name}</h3>
                                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 180px", gap: "1.5rem", alignItems: "flex-end" }}>
                                    <div className="form-group">
                                        <label style={{ fontWeight: 600 }}>Nome do Campo</label>
                                        <input
                                            type="text"
                                            placeholder="Ex: Piscina Privativa, Vagas..."
                                            value={novoCampo.name}
                                            onChange={e => setNovoCampo({ ...novoCampo, name: e.target.value })}
                                            style={{ padding: "0.8rem", width: "100%" }}
                                        />
                                    </div>
                                    <div className="form-group">
                                        <label style={{ fontWeight: 600 }}>Tipo de Dado</label>
                                        <select
                                            value={novoCampo.type}
                                            onChange={e => setNovoCampo({ ...novoCampo, type: e.target.value })}
                                            style={{ padding: "0.8rem", width: "100%" }}
                                        >
                                            <option value="text">Texto Simples (ex: Cor)</option>
                                            <option value="number">Número (ex: Medida)</option>
                                            <option value="boolean">Sim/Não (Checkbox)</option>
                                            <option value="textarea">Descrição Longa</option>
                                        </select>
                                    </div>
                                    <div style={{ display: "flex", gap: "1rem" }}>
                                        <button className="btn btn-primary" onClick={handleSaveField} style={{ height: "48px", fontWeight: 700, flex: 1 }}>
                                            {editId ? "Salvar Alterações" : "Adicionar Atributo"}
                                        </button>
                                        {editId && (
                                            <button className="btn" onClick={() => { setEditId(null); setNovoCampo({ name: "", type: "text", required: false, showInSearch: true, showInList: true }); }} style={{ height: "48px", backgroundColor: "#f3f4f6" }}>
                                                Cancelar
                                            </button>
                                        )}
                                    </div>
                                </div>

                                <div style={{ display: "flex", flexWrap: "wrap", gap: "1.5rem", marginTop: "1.5rem", padding: "1rem", backgroundColor: "var(--bg-primary)", borderRadius: "10px" }}>
                                    <label style={{ display: "flex", alignItems: "center", gap: "0.5rem", fontSize: "0.85rem", cursor: "pointer" }}>
                                        <input type="checkbox" checked={novoCampo.required} onChange={e => setNovoCampo({ ...novoCampo, required: e.target.checked })} />
                                        <strong>Obrigatório</strong> no cadastro
                                    </label>
                                    <label style={{ display: "flex", alignItems: "center", gap: "0.5rem", fontSize: "0.85rem", cursor: "pointer" }}>
                                        <input type="checkbox" checked={novoCampo.showInSearch} onChange={e => setNovoCampo({ ...novoCampo, showInSearch: e.target.checked })} />
                                        Virar <strong>Filtro de Busca</strong>
                                    </label>
                                    <label style={{ display: "flex", alignItems: "center", gap: "0.5rem", fontSize: "0.85rem", cursor: "pointer" }}>
                                        <input type="checkbox" checked={novoCampo.showInList} onChange={e => setNovoCampo({ ...novoCampo, showInList: e.target.checked })} />
                                        Mostrar no <strong>Card do Site</strong>
                                    </label>
                                </div>
                            </div>

                            <div className="card">
                                <h3 style={{ marginBottom: "1.5rem" }}>📋 Atributos Vinculados</h3>
                                {loading ? <p>Carregando...</p> : (
                                    <div style={{ overflowX: "auto" }}>
                                        <table style={{ width: "100%", borderCollapse: "collapse" }}>
                                            <thead>
                                                <tr style={{ textAlign: "left", borderBottom: "2px solid var(--bg-primary)" }}>
                                                    <th style={{ padding: "1rem" }}>Atributo</th>
                                                    <th style={{ padding: "1rem" }}>Tipo</th>
                                                    <th style={{ padding: "1rem" }}>Configuração</th>
                                                    <th style={{ padding: "1rem", textAlign: "right" }}>Ações</th>
                                                </tr>
                                            </thead>
                                            <tbody>
                                                {campos.length === 0 ? (
                                                    <tr><td colSpan={4} style={{ padding: "3rem", textAlign: "center", color: "var(--text-muted)" }}>Nenhum atributo personalizado cadastrado.</td></tr>
                                                ) : campos.map((c: any) => (
                                                    <tr key={c.id} style={{ borderBottom: "1px solid var(--bg-primary)", transition: "background 0.2s" }} onMouseEnter={e => e.currentTarget.style.backgroundColor = "#fcfcfc"} onMouseLeave={e => e.currentTarget.style.backgroundColor = "transparent"}>
                                                        <td style={{ padding: "1rem", fontWeight: 600 }}>{c.name}</td>
                                                        <td style={{ padding: "1rem" }}>
                                                            <span style={{ fontSize: "0.75rem", padding: "0.2rem 0.5rem", backgroundColor: "var(--bg-primary)", borderRadius: "5px" }}>{c.type.toUpperCase()}</span>
                                                        </td>
                                                        <td style={{ padding: "1rem", fontSize: "0.8rem" }}>
                                                            {c.required && <span style={{ color: "#b91c1c", marginRight: "0.5rem" }}>● Obrigatório</span>}
                                                            {c.showInSearch && <span style={{ color: "var(--color-olive-green)", marginRight: "0.5rem" }}>● Filtro</span>}
                                                            {c.showInList && <span style={{ color: "var(--color-dark-blue)" }}>● Visível Card</span>}
                                                        </td>
                                                        <td style={{ padding: "1rem", textAlign: "right" }}>
                                                            <div style={{ display: "flex", gap: "0.8rem", justifyContent: "flex-end" }}>
                                                                <button onClick={() => handleEditClick(c)} style={{ color: "var(--color-dark-blue)", background: "none", border: "none", cursor: "pointer", fontWeight: "bold" }}>✏️ Editar</button>
                                                                <button onClick={() => handleDelete(c.id)} style={{ color: "#ef4444", background: "none", border: "none", cursor: "pointer", fontWeight: "bold" }}>🗑️ Excluir</button>
                                                            </div>
                                                        </td>
                                                    </tr>
                                                ))}
                                            </tbody>
                                        </table>
                                    </div>
                                )}
                            </div>
                        </div>
                    )}
                </main>
            </div>
        </div>
    );
}
