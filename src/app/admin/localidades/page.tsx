"use client";

import { useSession } from "next-auth/react";
import { useState, useEffect } from "react";

export default function LocalidadesPage() {
    const { data: session } = useSession();
    const [states, setStates] = useState<any[]>([]);
    const [cities, setCities] = useState<any[]>([]);

    const [newState, setNewState] = useState({ uf: "", name: "" });
    const [newCity, setNewCity] = useState({ name: "", stateId: "" });
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchData();
    }, []);

    const fetchData = async () => {
        setLoading(true);
        const [resStates, resCities] = await Promise.all([
            fetch("/api/localidades?type=state"),
            fetch("/api/localidades?type=city")
        ]);
        setStates(await resStates.json());
        setCities(await resCities.json());
        setLoading(false);
    };

    const handleAddState = async () => {
        if (!newState.uf || !newState.name) return;
        const res = await fetch("/api/localidades", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ type: "state", ...newState })
        });
        if (res.ok) {
            setNewState({ uf: "", name: "" });
            fetchData();
        }
    };

    const handleAddCity = async () => {
        if (!newCity.name || !newCity.stateId) return;
        const res = await fetch("/api/localidades", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ type: "city", ...newCity })
        });
        if (res.ok) {
            setNewCity({ name: "", stateId: "" });
            fetchData();
        }
    };

    const handleDelete = async (id: string, type: "state" | "city") => {
        if (!confirm("Tem certeza que deseja remover esta localidade?")) return;
        const res = await fetch(`/api/localidades?id=${id}&type=${type}`, { method: "DELETE" });
        if (res.ok) fetchData();
        else alert("Erro ao excluir. Verifique se há itens vinculados.");
    };

    if ((session?.user as any)?.level === "OPERACIONAL") {
        return <div style={{ padding: "2rem" }}>Acesso restrito para administradores e gestores.</div>;
    }

    return (
        <div style={{ paddingBottom: "5rem" }}>
            <h2 style={{ marginBottom: "2rem" }}>Gestão de Localidades</h2>

            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "2rem" }}>
                {/* Estados */}
                <div>
                    <div className="card" style={{ marginBottom: "1.5rem" }}>
                        <h3>Cadastrar Estado (UF)</h3>
                        <div style={{ display: "flex", gap: "0.5rem", marginTop: "1rem" }}>
                            <input
                                type="text"
                                placeholder="UF (ex: PR)"
                                value={newState.uf}
                                onChange={e => setNewState({ ...newState, uf: e.target.value.toUpperCase() })}
                                style={{ width: "80px", padding: "0.75rem", border: "1px solid var(--border-color)", borderRadius: "var(--radius-sm)" }}
                            />
                            <input
                                type="text"
                                placeholder="Nome do Estado"
                                value={newState.name}
                                onChange={e => setNewState({ ...newState, name: e.target.value })}
                                style={{ flex: 1, padding: "0.75rem", border: "1px solid var(--border-color)", borderRadius: "var(--radius-sm)" }}
                            />
                            <button className="btn btn-primary" onClick={handleAddState}>+</button>
                        </div>
                    </div>

                    <div className="card">
                        <h3>Estados Cadastrados</h3>
                        <div style={{ marginTop: "1rem", display: "flex", flexDirection: "column", gap: "0.5rem" }}>
                            {states.map(s => (
                                <div key={s.id} style={{ display: "flex", justifyContent: "space-between", padding: "0.75rem", backgroundColor: "var(--bg-primary)", borderRadius: "var(--radius-sm)" }}>
                                    <span><strong>{s.uf}</strong> - {s.name} <small style={{ color: "var(--text-muted)" }}>({s._count.cities} cidades)</small></span>
                                    <button onClick={() => handleDelete(s.id, "state")} style={{ color: "#b91c1c", background: "none", border: "none", cursor: "pointer" }}>🗑️</button>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>

                {/* Cidades */}
                <div>
                    <div className="card" style={{ marginBottom: "1.5rem" }}>
                        <h3>Cadastrar Cidade</h3>
                        <div style={{ display: "flex", gap: "0.5rem", marginTop: "1rem" }}>
                            <select
                                value={newCity.stateId}
                                onChange={e => setNewCity({ ...newCity, stateId: e.target.value })}
                                style={{ width: "120px", padding: "0.75rem", border: "1px solid var(--border-color)", borderRadius: "var(--radius-sm)" }}
                            >
                                <option value="">Estado</option>
                                {states.map(s => <option key={s.id} value={s.id}>{s.uf}</option>)}
                            </select>
                            <input
                                type="text"
                                placeholder="Nome da Cidade"
                                value={newCity.name}
                                onChange={e => setNewCity({ ...newCity, name: e.target.value })}
                                style={{ flex: 1, padding: "0.75rem", border: "1px solid var(--border-color)", borderRadius: "var(--radius-sm)" }}
                            />
                            <button className="btn btn-primary" onClick={handleAddCity}>+</button>
                        </div>
                    </div>

                    <div className="card">
                        <h3>Cidades Cadastradas</h3>
                        <div style={{ marginTop: "1rem", display: "grid", gridTemplateColumns: "1fr 1fr", gap: "0.5rem" }}>
                            {cities.map(c => (
                                <div key={c.id} style={{ display: "flex", justifyContent: "space-between", padding: "0.75rem", backgroundColor: "var(--bg-primary)", borderRadius: "var(--radius-sm)" }}>
                                    <span style={{ fontSize: "0.9rem" }}>{c.name} ({c.state?.uf})</span>
                                    <button onClick={() => handleDelete(c.id, "city")} style={{ color: "#b91c1c", background: "none", border: "none", cursor: "pointer" }}>🗑️</button>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
