"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { useSearchParams, useRouter } from "next/navigation";

export default function BuscarPage() {
    const searchParams = useSearchParams();
    const router = useRouter();
    const [imoveis, setImoveis] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [pagination, setPagination] = useState({ total: 0, page: 1, limit: 12 });
    const [showAdvanced, setShowAdvanced] = useState(false);

    // Filtros de dados
    const [tipos, setTipos] = useState<any[]>([]);
    const [cidades, setCidades] = useState<any[]>([]);
    const [comodidades, setComodidades] = useState<any[]>([]);

    // Estados dos filtros
    const [filters, setFilters] = useState({
        typeId: searchParams.get("typeId") || "",
        cityId: searchParams.get("cityId") || "",
        region: searchParams.get("region") || "",
        status: searchParams.get("status") || "DISPONIVEL",
        minPrice: searchParams.get("minPrice") || "",
        maxPrice: searchParams.get("maxPrice") || "",
        bedrooms: searchParams.get("bedrooms") || "",
        bathrooms: searchParams.get("bathrooms") || "",
        parkingSpaces: searchParams.get("parkingSpaces") || "",
        minArea: searchParams.get("minArea") || "",
        amenities: searchParams.get("amenities") ? searchParams.get("amenities")!.split(",") : [] as string[]
    });

    useEffect(() => {
        fetch("/api/tipos").then(res => res.json()).then(data => setTipos(Array.isArray(data) ? data : []));
        fetch("/api/localidades?type=city").then(res => res.json()).then(data => setCidades(Array.isArray(data) ? data : []));
        fetch("/api/comodidades").then(res => res.json()).then(data => setComodidades(Array.isArray(data) ? data : []));
    }, []);

    useEffect(() => {
        fetchImoveis();
    }, [pagination.page, pagination.limit, filters]);

    const fetchImoveis = async () => {
        setLoading(true);
        let url = `/api/imoveis?page=${pagination.page}&limit=${pagination.limit}`;
        if (filters.typeId) url += `&typeId=${filters.typeId}`;
        if (filters.cityId) url += `&cityId=${filters.cityId}`;
        if (filters.region) url += `&region=${filters.region}`;
        if (filters.status) url += `&status=${filters.status}`;
        if (filters.minPrice) url += `&minPrice=${filters.minPrice}`;
        if (filters.maxPrice) url += `&maxPrice=${filters.maxPrice}`;
        if (filters.bedrooms) url += `&bedrooms=${filters.bedrooms}`;
        if (filters.bathrooms) url += `&bathrooms=${filters.bathrooms}`;
        if (filters.parkingSpaces) url += `&parkingSpaces=${filters.parkingSpaces}`;

        if (filters.amenities.length > 0) url += `&amenities=${filters.amenities.join(",")}`;

        const res = await fetch(url);
        const data = await res.json();
        setImoveis(data.data || []);
        setPagination(prev => ({ ...prev, total: data.total }));
        setLoading(false);
    };

    const handleFilterChange = (key: string, value: any) => {
        setFilters(prev => ({ ...prev, [key]: value }));
        setPagination(prev => ({ ...prev, page: 1 }));
    };

    const toggleAmenity = (id: string) => {
        const current = [...filters.amenities];
        if (current.includes(id)) {
            handleFilterChange("amenities", current.filter(a => a !== id));
        } else {
            handleFilterChange("amenities", [...current, id]);
        }
    };

    const clearFilters = () => {
        setFilters({
            typeId: "", cityId: "", region: "", status: "DISPONIVEL",
            minPrice: "", maxPrice: "", bedrooms: "", bathrooms: "",
            parkingSpaces: "", minArea: "", amenities: []
        });
    };

    return (
        <main style={{ backgroundColor: "var(--bg-primary)", minHeight: "100vh", padding: "3rem 0" }}>
            <div className="container">
                <div style={{ display: "grid", gridTemplateColumns: "320px 1fr", gap: "3rem" }}>

                    {/* Sidebar de Busca */}
                    <aside>
                        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "1.5rem" }}>
                            <h2 style={{ fontSize: "1.5rem", color: "var(--color-dark-blue)", fontWeight: 800 }}>Filtros</h2>
                            <button onClick={clearFilters} style={{ background: "none", border: "none", color: "var(--accent-primary)", fontSize: "0.85rem", cursor: "pointer", fontWeight: 600 }}>Limpar Todos</button>
                        </div>

                        <div className="card" style={{ display: "flex", flexDirection: "column", gap: "1.5rem", boxShadow: "0 4px 6px rgba(0,0,0,0.05)" }}>
                            <div className="form-group">
                                <label style={{ fontWeight: 700 }}>Tipo de Imóvel</label>
                                <select value={filters.typeId} onChange={e => handleFilterChange("typeId", e.target.value)}>
                                    <option value="">Qualquer tipo</option>
                                    {tipos.map(t => <option key={t.id} value={t.id}>{t.name}</option>)}
                                </select>
                            </div>

                            <div className="form-group">
                                <label style={{ fontWeight: 700 }}>Cidade / Localidade</label>
                                <select value={filters.cityId} onChange={e => handleFilterChange("cityId", e.target.value)}>
                                    <option value="">Qualquer lugar</option>
                                    {cidades.map(c => <option key={c.id} value={c.id}>{c.name} - {c.state?.uf}</option>)}
                                </select>
                            </div>

                            <div className="form-group">
                                <label style={{ fontWeight: 700 }}>Preço Máximo</label>
                                <input
                                    type="number"
                                    placeholder="R$ Infinito"
                                    value={filters.maxPrice}
                                    onChange={e => handleFilterChange("maxPrice", e.target.value)}
                                    style={{ width: "100%", padding: "0.8rem", borderRadius: "8px", border: "1px solid var(--border-color)" }}
                                />
                            </div>

                            <button
                                onClick={() => setShowAdvanced(!showAdvanced)}
                                style={{
                                    width: "100%",
                                    padding: "0.8rem",
                                    backgroundColor: "var(--bg-primary)",
                                    border: "1px solid var(--border-color)",
                                    borderRadius: "8px",
                                    cursor: "pointer",
                                    fontWeight: 700,
                                    color: "var(--color-dark-blue)",
                                    display: "flex",
                                    justifyContent: "space-between",
                                    alignItems: "center"
                                }}
                            >
                                🔍 Filtros Avançados
                                <span>{showAdvanced ? "▲" : "▼"}</span>
                            </button>

                            {showAdvanced && (
                                <div style={{ display: "flex", flexDirection: "column", gap: "1.5rem", padding: "1.5rem 0", borderTop: "1px solid var(--border-color)", animation: "fadeIn 0.2s" }}>
                                    <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "1rem" }}>
                                        <div className="form-group">
                                            <label style={{ fontSize: "0.8rem" }}>🛏️ Quartos</label>
                                            <input type="number" placeholder="2+" value={filters.bedrooms} onChange={e => handleFilterChange("bedrooms", e.target.value)} />
                                        </div>
                                        <div className="form-group">
                                            <label style={{ fontSize: "0.8rem" }}>🚿 Banheiros</label>
                                            <input type="number" placeholder="1+" value={filters.bathrooms} onChange={e => handleFilterChange("bathrooms", e.target.value)} />
                                        </div>
                                        <div className="form-group">
                                            <label style={{ fontSize: "0.8rem" }}>🚗 Vagas</label>
                                            <input type="number" placeholder="0" value={filters.parkingSpaces} onChange={e => handleFilterChange("parkingSpaces", e.target.value)} />
                                        </div>
                                    </div>

                                    <div className="form-group">
                                        <label style={{ fontWeight: 700 }}>Comodidades</label>
                                        <div style={{ display: "flex", flexDirection: "column", gap: "0.6rem", maxHeight: "250px", overflowY: "auto", padding: "0.5rem", border: "1px solid var(--bg-primary)", borderRadius: "8px" }}>
                                            {comodidades.map(c => (
                                                <label key={c.id} style={{ display: "flex", alignItems: "center", gap: "0.6rem", fontSize: "0.85rem", cursor: "pointer" }}>
                                                    <input type="checkbox" checked={filters.amenities.includes(c.id)} onChange={() => toggleAmenity(c.id)} /> {c.name}
                                                </label>
                                            ))}
                                        </div>
                                    </div>
                                </div>
                            )}

                            <div className="form-group">
                                <label style={{ fontWeight: 700 }}>Região</label>
                                <div style={{ display: "flex", gap: "0.4rem" }}>
                                    {["", "BRASIL", "EXTERIOR"].map(r => (
                                        <button
                                            key={r}
                                            onClick={() => handleFilterChange("region", r)}
                                            style={{
                                                flex: 1,
                                                padding: "0.6rem 0.2rem",
                                                fontSize: "0.7rem",
                                                borderRadius: "6px",
                                                border: "1px solid var(--border-color)",
                                                backgroundColor: filters.region === r ? "var(--color-dark-blue)" : "white",
                                                color: filters.region === r ? "white" : "inherit",
                                                fontWeight: 700,
                                                cursor: "pointer"
                                            }}
                                        >
                                            {r === "" ? "TODAS" : r}
                                        </button>
                                    ))}
                                </div>
                            </div>
                        </div>
                    </aside>

                    {/* Resultados da Busca */}
                    <section>
                        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-end", marginBottom: "2.5rem" }}>
                            <div>
                                <h1 style={{ fontSize: "2rem", color: "var(--color-dark-blue)", fontWeight: 800 }}>Imóveis Encontrados</h1>
                                <p style={{ color: "var(--text-muted)" }}>Página {pagination.page} de {Math.ceil(pagination.total / pagination.limit) || 1} • {pagination.total} resultados</p>
                            </div>
                            <select
                                value={pagination.limit}
                                onChange={e => setPagination({ ...pagination, limit: parseInt(e.target.value), page: 1 })}
                                style={{ padding: "0.6rem", borderRadius: "8px", border: "1px solid var(--border-color)", backgroundColor: "white", fontSize: "0.85rem" }}
                            >
                                <option value="12">12 por página</option>
                                <option value="24">24 por página</option>
                                <option value="48">48 por página</option>
                            </select>
                        </div>

                        {loading ? (
                            <div style={{ padding: "8rem", textAlign: "center" }}>
                                <div style={{ fontSize: "2rem", animation: "bounce 1s infinite" }}>🔍</div>
                                <p style={{ marginTop: "1rem", fontWeight: 600, color: "var(--text-muted)" }}>Buscando as melhores opções para você...</p>
                            </div>
                        ) : imoveis.length === 0 ? (
                            <div className="card" style={{ textAlign: "center", padding: "6rem 2rem", border: "2px dashed var(--border-color)", backgroundColor: "transparent" }}>
                                <div style={{ fontSize: "4rem", marginBottom: "1.5rem" }}>🏘️</div>
                                <h2 style={{ color: "var(--color-dark-blue)" }}>Nenhum imóvel encontrado</h2>
                                <p style={{ color: "var(--text-muted)", margin: "1rem 0" }}>Tente ajustar seus filtros ou limpar a pesquisa para ver mais resultados.</p>
                                <button onClick={clearFilters} className="btn btn-primary" style={{ marginTop: "1rem", padding: "1rem 2.5rem" }}>Limpar Todos os Filtros</button>
                            </div>
                        ) : (
                            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(300px, 1fr))", gap: "2rem" }}>
                                {imoveis.map(i => (
                                    <Link key={i.id} href={`/imovel/${i.id}`} style={{ textDecoration: "none" }}>
                                        <div className="card" style={{ padding: 0, overflow: "hidden", display: "flex", flexDirection: "column", transition: "transform 0.3s ease, boxShadow 0.3s ease" }} onMouseEnter={e => { e.currentTarget.style.transform = "translateY(-8px)"; e.currentTarget.style.boxShadow = "0 20px 25px -5px rgba(0,0,0,0.1)"; }} onMouseLeave={e => { e.currentTarget.style.transform = "none"; e.currentTarget.style.boxShadow = "var(--shadow-md)"; }}>
                                            <div style={{ position: "relative", height: "220px" }}>
                                                <img src={i.images?.[0]?.url || "/placeholder-house.jpg"} style={{ width: "100%", height: "100%", objectFit: "cover" }} alt={i.title} />
                                                <div style={{ position: "absolute", bottom: "12px", left: "12px", backgroundColor: "rgba(30, 41, 59, 0.9)", color: "white", padding: "0.5rem 1rem", borderRadius: "8px", fontSize: "1.1rem", fontWeight: 800 }}>
                                                    R$ {i.price.toLocaleString("pt-BR")}
                                                </div>
                                            </div>
                                            <div style={{ padding: "1.5rem", flex: 1, display: "flex", flexDirection: "column" }}>
                                                <div style={{ marginBottom: "0.5rem" }}>
                                                    <span style={{ fontSize: "0.75rem", fontWeight: 800, color: "var(--accent-secondary)", textTransform: "uppercase" }}>{i.type?.name}</span>
                                                </div>
                                                <h3 style={{ fontSize: "1.15rem", fontWeight: 800, color: "var(--color-dark-blue)", marginBottom: "0.8rem", height: "2.8rem", overflow: "hidden" }}>{i.title}</h3>
                                                <p style={{ color: "var(--text-muted)", fontSize: "0.85rem", marginBottom: "1.5rem" }}>{i.city?.name} • {i.city?.state?.uf}</p>

                                                <div style={{ marginTop: "auto", display: "flex", gap: "1rem", borderTop: "1px solid var(--bg-primary)", paddingTop: "1rem" }}>
                                                    <div style={{ fontSize: "0.75rem", display: "flex", alignItems: "center", gap: "0.3rem" }}>🛏️ <strong>{i.bedrooms}</strong></div>
                                                    <div style={{ fontSize: "0.75rem", display: "flex", alignItems: "center", gap: "0.3rem" }}>🚿 <strong>{i.bathrooms}</strong></div>
                                                    <div style={{ fontSize: "0.75rem", display: "flex", alignItems: "center", gap: "0.3rem" }}>📏 <strong>{i.totalArea}m²</strong></div>
                                                </div>
                                            </div>
                                        </div>
                                    </Link>
                                ))}
                            </div>
                        )}

                        {/* Paginação */}
                        {pagination.total > pagination.limit && (
                            <div style={{ marginTop: "4rem", display: "flex", justifyContent: "center", gap: "1rem" }}>
                                <button
                                    disabled={pagination.page === 1}
                                    onClick={() => setPagination({ ...pagination, page: pagination.page - 1 })}
                                    className="btn" style={{ padding: "1rem 2rem", backgroundColor: "white", border: "1px solid var(--border-color)", fontWeight: 700 }}
                                >
                                    Anterior
                                </button>
                                <button
                                    disabled={pagination.page * pagination.limit >= pagination.total}
                                    onClick={() => setPagination({ ...pagination, page: pagination.page + 1 })}
                                    className="btn" style={{ padding: "1rem 2rem", backgroundColor: "white", border: "1px solid var(--border-color)", fontWeight: 700 }}
                                >
                                    Próxima Página
                                </button>
                            </div>
                        )}
                    </section>
                </div>
            </div>
        </main>
    );
}
