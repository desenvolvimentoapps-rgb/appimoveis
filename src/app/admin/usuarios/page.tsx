"use client";

import { useSession } from "next-auth/react";
import { useState, useEffect } from "react";

export default function UsuariosPage() {
    const { data: session } = useSession();
    const [usuarios, setUsuarios] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [form, setForm] = useState({
        name: "",
        email: "",
        password: "",
        level: "OPERACIONAL",
        forceReset: false
    });
    const [editId, setEditId] = useState<string | null>(null);

    useEffect(() => {
        fetchUsers();
    }, []);

    const fetchUsers = () => {
        setLoading(true);
        fetch("/api/usuarios")
            .then(res => res.json())
            .then(data => {
                setUsuarios(Array.isArray(data) ? data : []);
                setLoading(false);
            });
    };

    const handleSave = async (e: React.FormEvent) => {
        e.preventDefault();
        const method = editId ? "PUT" : "POST";
        const res = await fetch("/api/usuarios", {
            method,
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(editId ? { id: editId, ...form } : form)
        });

        if (res.ok) {
            setForm({ name: "", email: "", password: "", level: "OPERACIONAL", forceReset: false });
            setEditId(null);
            fetchUsers();
        } else {
            const err = await res.json();
            alert(err.error || "Erro ao salvar usuário.");
        }
    };

    const handleDelete = async (id: string) => {
        if (!confirm("Excluir usuário permanentemente?")) return;
        const res = await fetch(`/api/usuarios?id=${id}`, { method: "DELETE" });
        if (res.ok) fetchUsers();
    };

    if ((session?.user as any)?.level !== "MASTER") {
        return <div style={{ padding: "2rem" }}>Acesso restrito ao Master Administrator.</div>;
    }

    return (
        <div style={{ paddingBottom: "5rem" }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "2.5rem" }}>
                <h2 style={{ fontSize: "1.75rem", color: "var(--color-dark-blue)" }}>Gestão de Equipe e Acessos</h2>
                <div style={{ backgroundColor: "var(--bg-primary)", padding: "0.5rem 1rem", borderRadius: "20px", fontSize: "0.85rem", color: "var(--text-muted)" }}>
                    Total: {usuarios.length} integrantes
                </div>
            </div>

            <div className="card" style={{ marginBottom: "3rem", borderTop: "4px solid var(--accent-primary)", boxShadow: "0 10px 15px -3px rgba(0,0,0,0.1)" }}>
                <h3 style={{ marginBottom: "1.5rem", color: "var(--color-dark-blue)" }}>{editId ? "✏️ Editar Usuário" : "👤 Cadastrar Novo Integrante"}</h3>
                <form onSubmit={handleSave} style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))", gap: "1.5rem" }}>
                    <div className="form-group">
                        <label style={{ fontWeight: 600 }}>Nome Completo</label>
                        <input
                            type="text"
                            value={form.name}
                            onChange={e => setForm({ ...form, name: e.target.value })}
                            placeholder="Ex: João Silva"
                            required
                            style={{ padding: "0.8rem", borderRadius: "var(--radius-sm)", border: "1px solid var(--border-color)" }}
                        />
                    </div>
                    <div className="form-group">
                        <label style={{ fontWeight: 600 }}>E-mail corporativo</label>
                        <input
                            type="email"
                            value={form.email}
                            onChange={e => setForm({ ...form, email: e.target.value })}
                            placeholder="email@oliviaprado.com.br"
                            required
                            style={{ padding: "0.8rem", borderRadius: "var(--radius-sm)", border: "1px solid var(--border-color)" }}
                        />
                    </div>
                    <div className="form-group">
                        <label style={{ fontWeight: 600 }}>Senha {editId && "(Opcional)"}</label>
                        <input
                            type="password"
                            value={form.password}
                            onChange={e => setForm({ ...form, password: e.target.value })}
                            placeholder={editId ? "Mantenha vazio p/ não alterar" : "••••••••"}
                            required={!editId}
                            style={{ padding: "0.8rem", borderRadius: "var(--radius-sm)", border: "1px solid var(--border-color)" }}
                        />
                    </div>
                    <div className="form-group">
                        <label style={{ fontWeight: 600 }}>Nível de Acesso</label>
                        <select
                            value={form.level}
                            onChange={e => setForm({ ...form, level: e.target.value })}
                            style={{ padding: "0.8rem", borderRadius: "var(--radius-sm)", border: "1px solid var(--border-color)", backgroundColor: "white" }}
                        >
                            <option value="MASTER">Master Administrator</option>
                            <option value="GESTOR">Gestor de Rede</option>
                            <option value="OPERACIONAL">Corretor / Operacional</option>
                        </select>
                    </div>

                    <div style={{ alignSelf: "center" }}>
                        <label style={{ display: "flex", alignItems: "center", gap: "0.5rem", fontSize: "0.9rem", cursor: "pointer", userSelect: "none" }}>
                            <input
                                type="checkbox"
                                checked={form.forceReset}
                                onChange={e => setForm({ ...form, forceReset: e.target.checked })}
                            />
                            <strong>Forçar troca de senha</strong>
                        </label>
                        <p style={{ fontSize: "0.7rem", color: "var(--text-muted)", marginTop: "0.2rem" }}>O usuário deverá criar uma nova senha ao logar.</p>
                    </div>

                    <div style={{ display: "flex", gap: "0.5rem", alignItems: "center" }}>
                        <button type="submit" className="btn btn-primary" style={{ flex: 1, padding: "0.8rem" }}>{editId ? "Salvar" : "Cadastrar"}</button>
                        {editId && (
                            <button
                                type="button"
                                className="btn"
                                onClick={() => { setEditId(null); setForm({ name: "", email: "", password: "", level: "OPERACIONAL", forceReset: false }); }}
                                style={{ backgroundColor: "#f3f4f6" }}
                            >✕</button>
                        )}
                    </div>
                </form>
            </div>

            <div className="card">
                <h3 style={{ marginBottom: "1.5rem" }}>Membros da Equipe</h3>
                <div style={{ overflowX: "auto" }}>
                    <table style={{ width: "100%", borderCollapse: "collapse" }}>
                        <thead>
                            <tr style={{ textAlign: "left", borderBottom: "2px solid var(--bg-primary)" }}>
                                <th style={{ padding: "1.2rem 1rem" }}>Colaborador</th>
                                <th style={{ padding: "1.2rem 1rem" }}>Login / E-mail</th>
                                <th style={{ padding: "1.2rem 1rem" }}>Permissão</th>
                                <th style={{ padding: "1.2rem 1rem" }}>Segurança</th>
                                <th style={{ padding: "1.2rem 1rem" }}>Status</th>
                                <th style={{ padding: "1.2rem 1rem", textAlign: "right" }}>Ações</th>
                            </tr>
                        </thead>
                        <tbody>
                            {usuarios.map(u => (
                                <tr key={u.id} style={{ borderBottom: "1px solid var(--bg-primary)", transition: "background 0.2s" }} onMouseEnter={e => e.currentTarget.style.backgroundColor = "#fcfcfc"} onMouseLeave={e => e.currentTarget.style.backgroundColor = "transparent"}>
                                    <td style={{ padding: "1.2rem 1rem", fontWeight: 600 }}>{u.name || "---"}</td>
                                    <td style={{ padding: "1.2rem 1rem", color: "var(--text-muted)" }}>{u.email}</td>
                                    <td style={{ padding: "1.2rem 1rem" }}>
                                        <span style={{
                                            fontSize: "0.75rem", fontWeight: 800, padding: "0.25rem 0.6rem", borderRadius: "10px",
                                            backgroundColor: u.level === "MASTER" ? "#fee2e2" : u.level === "GESTOR" ? "#dcfce7" : "#f3f4f6",
                                            color: u.level === "MASTER" ? "#991b1b" : u.level === "GESTOR" ? "#166534" : "#4b5563"
                                        }}>{u.level}</span>
                                    </td>
                                    <td style={{ padding: "1.2rem 1rem" }}>
                                        {u.forceReset && <span style={{ color: "#d97706", fontSize: "0.8rem", display: "flex", alignItems: "center", gap: "0.3rem" }}>⚠️ Reset pendente</span>}
                                    </td>
                                    <td style={{ padding: "1.2rem 1rem" }}>
                                        <span style={{
                                            display: "inline-block", width: "8px", height: "8px", borderRadius: "50%",
                                            backgroundColor: u.status === "ATIVO" ? "#22c55e" : "#ef4444", marginRight: "0.5rem"
                                        }}></span>
                                        {u.status}
                                    </td>
                                    <td style={{ padding: "1.2rem 1rem", textAlign: "right" }}>
                                        <div style={{ display: "flex", gap: "0.8rem", justifyContent: "flex-end" }}>
                                            <button
                                                onClick={() => { setEditId(u.id); setForm({ name: u.name, email: u.email, password: "", level: u.level, forceReset: !!u.forceReset }); }}
                                                style={{ color: "var(--color-dark-blue)", background: "none", border: "none", cursor: "pointer", fontSize: "1.1rem" }}
                                                title="Editar"
                                            >✏️</button>
                                            <button
                                                onClick={() => handleDelete(u.id)}
                                                style={{ color: "#ef4444", background: "none", border: "none", cursor: "pointer", fontSize: "1.1rem" }}
                                                title="Excluir"
                                            >🗑️</button>
                                        </div>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
}
