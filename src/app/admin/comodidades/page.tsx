"use client";

import { useSession } from "next-auth/react";
import { useState, useEffect } from "react";

export default function ComodidadesPage() {
    const { data: session } = useSession();
    const [amenities, setAmenities] = useState<any[]>([]);
    const [newAmenity, setNewAmenity] = useState({ name: "", icon: "" });
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchAmenities();
    }, []);

    const fetchAmenities = () => {
        setLoading(true);
        fetch("/api/comodidades")
            .then(res => res.json())
            .then(data => {
                setAmenities(Array.isArray(data) ? data : []);
                setLoading(false);
            });
    };

    const handleSave = async () => {
        if (!newAmenity.name) return;
        const res = await fetch("/api/comodidades", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(newAmenity)
        });
        if (res.ok) {
            setNewAmenity({ name: "", icon: "" });
            fetchAmenities();
        }
    };

    const handleDelete = async (id: string) => {
        if (!confirm("Excluir comodidade?")) return;
        const res = await fetch(`/api/comodidades?id=${id}`, { method: "DELETE" });
        if (res.ok) fetchAmenities();
    };

    const isAdmin = (session?.user as any)?.level === "MASTER" || (session?.user as any)?.level === "GESTOR";

    if (!session) return null;

    return (
        <div>
            <h2 style={{ marginBottom: "2rem" }}>Gestão de Comodidades</h2>

            {isAdmin && (
                <div className="card" style={{ marginBottom: "2.5rem", borderLeft: "4px solid var(--accent-secondary)" }}>
                    <h3 style={{ marginBottom: "1rem" }}>Adicionar Comodidade</h3>
                    <div style={{ display: "flex", gap: "1rem" }}>
                        <input
                            type="text"
                            placeholder="Ex: Piscina, Quadra, Academia..."
                            value={newAmenity.name}
                            onChange={(e) => setNewAmenity({ ...newAmenity, name: e.target.value })}
                            style={{ flex: 1, padding: "0.75rem", borderRadius: "var(--radius-sm)", border: "1px solid var(--border-color)" }}
                        />
                        <button className="btn btn-primary" onClick={handleSave}>Adicionar</button>
                    </div>
                </div>
            )}

            <div className="card">
                <h3>Lista de Comodidades</h3>
                {loading ? <p>Carregando...</p> : (
                    <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(200px, 1fr))", gap: "1rem", marginTop: "1rem" }}>
                        {amenities.map((a) => (
                            <div key={a.id} style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "1rem", backgroundColor: "var(--bg-primary)", borderRadius: "var(--radius-sm)" }}>
                                <span style={{ fontWeight: 500 }}>{a.name}</span>
                                <button onClick={() => handleDelete(a.id)} style={{ color: "#b91c1c", background: "none", border: "none", cursor: "pointer" }}>🗑️</button>
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
}
