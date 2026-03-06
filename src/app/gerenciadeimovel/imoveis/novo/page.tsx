"use client";

import { useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";

// Estilo Premium Unificado
const inputStyle = {
    width: "100%",
    padding: "1rem 1.25rem",
    borderRadius: "15px",
    border: "2px solid #eef2f6",
    backgroundColor: "#fff",
    fontSize: "1rem",
    fontWeight: 500,
    color: "var(--color-dark-blue)",
    transition: "all 0.2s ease",
    outline: "none",
    boxShadow: "0 2px 4px rgba(0,0,0,0.02)"
};

const labelStyle = {
    display: "block",
    marginBottom: "0.6rem",
    fontSize: "0.85rem",
    fontWeight: 700,
    color: "#64748b",
    textTransform: "uppercase" as const,
    letterSpacing: "0.5px"
};

export default function NovoImovelGerenciaPage() {
    const router = useRouter();
    const [tipos, setTipos] = useState<any[]>([]);
    const [cidades, setCidades] = useState<any[]>([]);
    const [comodidadesDisponiveis, setComodidadesDisponiveis] = useState<any[]>([]);

    const [tipoSelecionado, setTipoSelecionado] = useState("");
    const [images, setImages] = useState<string[]>([]);
    const fileInputRef = useRef<HTMLInputElement>(null);

    const [form, setForm] = useState({
        title: "",
        code: `IMO-${Math.floor(1000 + Math.random() * 9000)}`,
        status: "DISPONIVEL",
        address: "",
        zipCode: "",
        price: "",
        description: "",
        deliveryDate: "",
        showDeliveryDate: true,
        whatsappBR: true,
        whatsappExt: false,
        region: "BRASIL",
        cityId: "",
        bedrooms: "0",
        bathrooms: "0",
        parkingSpaces: "0",
        totalArea: "0",
        usefulArea: "0",
        floor: ""
    });

    const [amenitiesSelected, setAmenitiesSelected] = useState<string[]>([]);
    const [customValues, setCustomValues] = useState<{ [key: string]: string }>({});

    useEffect(() => {
        fetch("/api/tipos").then(res => res.json()).then(data => setTipos(Array.isArray(data) ? data : []));
        fetch("/api/localidades?type=city").then(res => res.json()).then(data => setCidades(Array.isArray(data) ? data : []));
        fetch("/api/comodidades").then(res => res.json()).then(data => setComodidadesDisponiveis(Array.isArray(data) ? data : []));
    }, []);

    const selectedType = Array.isArray(tipos) ? tipos.find((t: any) => t.id === tipoSelecionado) : null;

    const handleFiles = async (e: React.ChangeEvent<HTMLInputElement>) => {
        if (!e.target.files) return;
        const files = Array.from(e.target.files);

        const readers = files.map(file => {
            return new Promise<string>((resolve) => {
                const reader = new FileReader();
                reader.readAsDataURL(file);
                reader.onload = () => resolve(reader.result as string);
            });
        });

        const newImages = await Promise.all(readers);
        setImages([...images, ...newImages]);
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        const payload = {
            ...form,
            typeId: tipoSelecionado,
            amenities: amenitiesSelected,
            images,
            customValues: Object.entries(customValues).map(([fieldId, val]) => ({
                customFieldId: fieldId,
                value: val
            }))
        };

        const res = await fetch("/api/imoveis", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(payload)
        });

        if (res.ok) {
            alert("Imóvel cadastrado com sucesso!");
            router.push("/gerenciadeimovel/imoveis");
            router.refresh();
        } else {
            const err = await res.json();
            alert("Erro ao cadastrar: " + (err.error || "Verifique os dados."));
        }
    };

    return (
        <form onSubmit={handleSubmit} style={{ maxWidth: "1200px", margin: "0 auto", paddingBottom: "10rem" }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "3rem" }}>
                <div>
                    <h2 style={{ fontSize: "2.5rem", color: "var(--color-dark-blue)", fontWeight: 900, letterSpacing: "-1.5px" }}>Anunciar Propriedade</h2>
                    <p style={{ color: "var(--text-muted)", fontSize: "1.1rem", fontWeight: 500 }}>Cadastre um novo ativo imobiliário no portal corporativo.</p>
                </div>
                <div style={{ display: "flex", gap: "1.5rem" }}>
                    <button type="button" onClick={() => router.back()} className="btn" style={{ padding: "0.8rem 2rem", borderRadius: "12px", border: "2px solid #eef2f6", backgroundColor: "#fff", fontWeight: 700 }}>Descartar</button>
                    <button type="submit" className="btn btn-primary" style={{ padding: "0.8rem 3rem", borderRadius: "12px", fontWeight: 800, backgroundImage: "linear-gradient(135deg, var(--color-dark-blue) 0%, #2c3e50 100%)", boxShadow: "0 10px 25px rgba(0,0,0,0.15)" }}>Publicar Novo Anúncio</button>
                </div>
            </div>

            <div style={{ display: "grid", gridTemplateColumns: "1fr 350px", gap: "3rem" }}>
                <div style={{ display: "flex", flexDirection: "column", gap: "3rem" }}>

                    <section className="card" style={{ padding: "3rem", borderRadius: "32px" }}>
                        <h3 style={{ marginBottom: "2.5rem", color: "var(--color-dark-blue)", fontWeight: 800, fontSize: "1.5rem", display: "flex", alignItems: "center", gap: "1rem" }}>
                            <span style={{ backgroundColor: "var(--color-dark-blue)", color: "#fff", width: "40px", height: "40px", borderRadius: "12px", display: "flex", alignItems: "center", justifyContent: "center" }}>01</span>
                            Informações Gerais
                        </h3>

                        <div className="form-group" style={{ marginBottom: "2rem" }}>
                            <label style={labelStyle}>Título do Imóvel</label>
                            <input type="text" value={form.title} onChange={e => setForm({ ...form, title: e.target.value })} required style={inputStyle} />
                        </div>

                        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "2rem" }}>
                            <div className="form-group">
                                <label style={labelStyle}>Tipo de Unidade</label>
                                <select value={tipoSelecionado} onChange={(e) => setTipoSelecionado(e.target.value)} required style={inputStyle}>
                                    <option value="">Selecione...</option>
                                    {tipos.map(t => <option key={t.id} value={t.id}>{t.name}</option>)}
                                </select>
                            </div>
                            <div className="form-group">
                                <label style={labelStyle}>Valor Mínimo (R$)</label>
                                <input type="number" value={form.price} onChange={e => setForm({ ...form, price: e.target.value })} required style={inputStyle} />
                            </div>
                        </div>

                        <div className="form-group" style={{ marginTop: "2rem" }}>
                            <label style={labelStyle}>Descrição Completa</label>
                            <textarea rows={6} value={form.description} onChange={e => setForm({ ...form, description: e.target.value })} style={{ ...inputStyle, resize: "none" }}></textarea>
                        </div>
                    </section>

                    <section className="card" style={{ padding: "3rem", borderRadius: "32px" }}>
                        <h3 style={{ marginBottom: "2.5rem", color: "var(--color-dark-blue)", fontWeight: 800, fontSize: "1.5rem", display: "flex", alignItems: "center", gap: "1rem" }}>
                            <span style={{ backgroundColor: "var(--color-dark-blue)", color: "#fff", width: "40px", height: "40px", borderRadius: "12px", display: "flex", alignItems: "center", justifyContent: "center" }}>02</span>
                            Ficha Técnica
                        </h3>

                        <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: "2rem" }}>
                            {[
                                { label: "🛏️ Quartos", key: "bedrooms" },
                                { label: "🚿 Banheiros", key: "bathrooms" },
                                { label: "🚗 Vagas", key: "parkingSpaces" },
                                { label: "📏 Área Total", key: "totalArea" },
                                { label: "🏠 Área Útil", key: "usefulArea" },
                                { label: "🏢 Andar", key: "floor" }
                            ].map(item => (
                                <div key={item.key} className="form-group">
                                    <label style={labelStyle}>{item.label}</label>
                                    <input type="text" value={(form as any)[item.key]} onChange={e => setForm({ ...form, [item.key]: e.target.value })} style={inputStyle} />
                                </div>
                            ))}
                        </div>
                    </section>

                    {selectedType && selectedType.customFields?.length > 0 && (
                        <section className="card" style={{ padding: "3rem", borderRadius: "32px", borderLeft: "8px solid var(--accent-secondary)" }}>
                            <h3 style={{ marginBottom: "2.5rem", color: "var(--accent-secondary)", fontWeight: 900, fontSize: "1.5rem" }}>
                                ✨ Detalhes Corporativos {selectedType.name}
                            </h3>
                            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "2rem" }}>
                                {selectedType.customFields.map((f: any) => (
                                    <div key={f.id} className="form-group">
                                        <label style={labelStyle}>{f.name} {f.isRequired && "*"}</label>
                                        <input
                                            type={f.type === "number" ? "number" : "text"}
                                            required={f.isRequired}
                                            value={customValues[f.id] || ""}
                                            onChange={e => setCustomValues({ ...customValues, [f.id]: e.target.value })}
                                            style={inputStyle}
                                        />
                                    </div>
                                ))}
                            </div>
                        </section>
                    )}

                    <section className="card" style={{ padding: "3rem", borderRadius: "32px" }}>
                        <h3 style={{ marginBottom: "2.5rem", color: "var(--color-dark-blue)", fontWeight: 800, fontSize: "1.5rem", display: "flex", alignItems: "center", gap: "1rem" }}>
                            <span style={{ backgroundColor: "var(--color-dark-blue)", color: "#fff", width: "40px", height: "40px", borderRadius: "12px", display: "flex", alignItems: "center", justifyContent: "center" }}>03</span>
                            Galeria de Fotos
                        </h3>
                        <div
                            onClick={() => fileInputRef.current?.click()}
                            style={{ border: "2px dashed #cbd5e1", padding: "5rem 2rem", borderRadius: "24px", textAlign: "center", backgroundColor: "#f8fafc", cursor: "pointer" }}
                        >
                            <input type="file" multiple accept="image/*" ref={fileInputRef} onChange={handleFiles} style={{ display: "none" }} />
                            <div style={{ fontSize: "3rem", marginBottom: "1rem" }}>🎞️</div>
                            <p style={{ fontWeight: 800, color: "var(--color-dark-blue)" }}>Importar Ativos Visuais</p>
                        </div>
                        {images.length > 0 && (
                            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(160px, 1fr))", gap: "1.5rem", marginTop: "3rem" }}>
                                {images.map((img, idx) => (
                                    <div key={idx} style={{ position: "relative", height: "160px", borderRadius: "18px", overflow: "hidden", border: "2px solid #eef2f6" }}>
                                        <img src={img} style={{ width: "100%", height: "100%", objectFit: "cover" }} />
                                        <button type="button" onClick={() => setImages(images.filter((_, i) => i !== idx))} style={{ position: "absolute", top: "10px", right: "10px", backgroundColor: "rgba(220, 38, 38, 0.9)", color: "white", border: "none", borderRadius: "10px", width: "32px", height: "32px", cursor: "pointer" }}>✕</button>
                                    </div>
                                ))}
                            </div>
                        )}
                    </section>
                </div>

                <div style={{ display: "flex", flexDirection: "column", gap: "2.5rem", position: "sticky", top: "2rem", height: "fit-content" }}>
                    <section className="card" style={{ padding: "2.5rem", borderRadius: "28px" }}>
                        <h4 style={{ marginBottom: "1.5rem", fontWeight: 800, color: "var(--color-dark-blue)" }}>Status e Local</h4>
                        <div className="form-group" style={{ marginBottom: "1.5rem" }}>
                            <select value={form.status} onChange={e => setForm({ ...form, status: e.target.value })} style={inputStyle}>
                                <option value="DISPONIVEL">✅ Disponível</option>
                                <option value="RESERVADO">🟡 Reservado</option>
                            </select>
                        </div>
                        <div className="form-group">
                            <label style={labelStyle}>Cidade Sede</label>
                            <select value={form.cityId} onChange={e => setForm({ ...form, cityId: e.target.value })} style={inputStyle}>
                                <option value="">Selecione...</option>
                                {cidades.map(c => <option key={c.id} value={c.id}>{c.name} - {c.state?.uf}</option>)}
                            </select>
                        </div>
                    </section>

                    <section className="card" style={{ padding: "2.5rem", borderRadius: "28px" }}>
                        <h4 style={{ marginBottom: "1.5rem", fontWeight: 800, color: "var(--color-dark-blue)" }}>Comodidades</h4>
                        <div style={{ maxHeight: "400px", overflowY: "auto", display: "flex", flexDirection: "column", gap: "0.8rem" }} className="no-scrollbar">
                            {comodidadesDisponiveis.map(c => (
                                <label key={c.id} style={{ display: "flex", alignItems: "center", gap: "0.8rem", fontSize: "0.9rem", padding: "0.80rem", borderRadius: "12px", border: "1px solid #f1f5f9", cursor: "pointer" }}>
                                    <input
                                        type="checkbox"
                                        checked={amenitiesSelected.includes(c.id)}
                                        onChange={e => {
                                            if (e.target.checked) setAmenitiesSelected([...amenitiesSelected, c.id]);
                                            else setAmenitiesSelected(amenitiesSelected.filter(id => id !== c.id));
                                        }}
                                        style={{ width: "18px", height: "18px" }}
                                    /> <span style={{ fontWeight: 600 }}>{c.name}</span>
                                </label>
                            ))}
                        </div>
                    </section>
                </div>
            </div>
        </form>
    );
}
