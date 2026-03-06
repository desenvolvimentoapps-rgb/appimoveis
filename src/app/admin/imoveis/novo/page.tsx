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

export default function NovoImovelPage() {
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
        // Novos campos fixos
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
        // Fetch baseline data com tratamento de erro
        fetch("/api/tipos")
            .then(res => res.json())
            .then(data => setTipos(Array.isArray(data) ? data : []))
            .catch(() => setTipos([]));

        fetch("/api/localidades?type=city")
            .then(res => res.json())
            .then(data => setCidades(Array.isArray(data) ? data : []))
            .catch(() => setCidades([]));

        fetch("/api/comodidades")
            .then(res => res.json())
            .then(data => setComodidadesDisponiveis(Array.isArray(data) ? data : []))
            .catch(() => setComodidadesDisponiveis([]));
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
            router.push("/admin/imoveis");
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
                    <h2 style={{ fontSize: "2.5rem", color: "var(--color-dark-blue)", fontWeight: 900, letterSpacing: "-1.5px" }}>Novo Ativo</h2>
                    <p style={{ color: "var(--text-muted)", fontSize: "1.1rem", fontWeight: 500 }}>Inicie o anúncio de uma nova propriedade exclusiva.</p>
                </div>
                <div style={{ display: "flex", gap: "1.5rem" }}>
                    <button type="button" onClick={() => router.back()} className="btn" style={{ padding: "0.8rem 2rem", borderRadius: "12px", border: "2px solid #eef2f6", backgroundColor: "#fff", fontWeight: 700 }}>Descartar</button>
                    <button type="submit" className="btn btn-primary" style={{ padding: "0.8rem 3rem", borderRadius: "12px", fontWeight: 800, backgroundImage: "linear-gradient(135deg, var(--color-dark-blue) 0%, #2c3e50 100%)", boxShadow: "0 10px 25px rgba(0,0,0,0.15)" }}>Publicar Imóvel</button>
                </div>
            </div>

            <div style={{ display: "grid", gridTemplateColumns: "1fr 350px", gap: "3rem" }}>
                <div style={{ display: "flex", flexDirection: "column", gap: "3rem" }}>

                    {/* Seção 1: Essencial */}
                    <section className="card" style={{ padding: "3rem", borderRadius: "32px", boxShadow: "0 10px 30px rgba(0,0,0,0.02)" }}>
                        <h3 style={{ marginBottom: "2.5rem", color: "var(--color-dark-blue)", fontWeight: 800, fontSize: "1.5rem", display: "flex", alignItems: "center", gap: "1rem" }}>
                            <span style={{ backgroundColor: "var(--color-dark-blue)", color: "#fff", width: "40px", height: "40px", borderRadius: "12px", display: "flex", alignItems: "center", justifyContent: "center" }}>01</span>
                            Identificação e Valor
                        </h3>

                        <div className="form-group" style={{ marginBottom: "2rem" }}>
                            <label style={labelStyle}>Título do Anúncio (Exclusivo)</label>
                            <input type="text" value={form.title} onChange={e => setForm({ ...form, title: e.target.value })} required style={inputStyle} placeholder="Ex: Loft Industrial com Vista Panorâmica" />
                        </div>

                        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "2rem" }}>
                            <div className="form-group">
                                <label style={labelStyle}>Classificação do Ativo</label>
                                <select value={tipoSelecionado} onChange={(e) => setTipoSelecionado(e.target.value)} required style={inputStyle}>
                                    <option value="">Selecione o tipo...</option>
                                    {tipos.map(t => <option key={t.id} value={t.id}>{t.name}</option>)}
                                </select>
                            </div>
                            <div className="form-group">
                                <label style={labelStyle}>Valor de Venda (R$)</label>
                                <input type="number" value={form.price} onChange={e => setForm({ ...form, price: e.target.value })} required style={inputStyle} placeholder="0" />
                            </div>
                        </div>

                        <div className="form-group" style={{ marginTop: "2rem" }}>
                            <label style={labelStyle}>Descrição Narrativa</label>
                            <textarea rows={6} value={form.description} onChange={e => setForm({ ...form, description: e.target.value })} style={{ ...inputStyle, resize: "none" }} placeholder="Conte a história deste imóvel e seus diferenciais únicos..."></textarea>
                        </div>
                    </section>

                    {/* Seção 2: Especificações */}
                    <section className="card" style={{ padding: "3rem", borderRadius: "32px" }}>
                        <h3 style={{ marginBottom: "2.5rem", color: "var(--color-dark-blue)", fontWeight: 800, fontSize: "1.5rem", display: "flex", alignItems: "center", gap: "1rem" }}>
                            <span style={{ backgroundColor: "var(--color-dark-blue)", color: "#fff", width: "40px", height: "40px", borderRadius: "12px", display: "flex", alignItems: "center", justifyContent: "center" }}>02</span>
                            Ficha Técnica
                        </h3>

                        <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: "2rem" }}>
                            <div className="form-group">
                                <label style={labelStyle}>🛏️ Quartos</label>
                                <input type="number" value={form.bedrooms} onChange={e => setForm({ ...form, bedrooms: e.target.value })} style={inputStyle} />
                            </div>
                            <div className="form-group">
                                <label style={labelStyle}>🚿 Banheiros</label>
                                <input type="number" value={form.bathrooms} onChange={e => setForm({ ...form, bathrooms: e.target.value })} style={inputStyle} />
                            </div>
                            <div className="form-group">
                                <label style={labelStyle}>🚗 Vagas</label>
                                <input type="number" value={form.parkingSpaces} onChange={e => setForm({ ...form, parkingSpaces: e.target.value })} style={inputStyle} />
                            </div>
                            <div className="form-group">
                                <label style={labelStyle}>📏 Área Total (m²)</label>
                                <input type="number" value={form.totalArea} onChange={e => setForm({ ...form, totalArea: e.target.value })} style={inputStyle} />
                            </div>
                            <div className="form-group">
                                <label style={labelStyle}>🏠 Área Útil (m²)</label>
                                <input type="number" value={form.usefulArea} onChange={e => setForm({ ...form, usefulArea: e.target.value })} style={inputStyle} />
                            </div>
                            <div className="form-group">
                                <label style={labelStyle}>🏢 Andar</label>
                                <input type="number" value={form.floor} onChange={e => setForm({ ...form, floor: e.target.value })} placeholder="Ex: 12" style={inputStyle} />
                            </div>
                        </div>
                    </section>

                    {/* Características Dinâmicas */}
                    {selectedType && selectedType.customFields?.length > 0 && (
                        <section className="card" style={{ padding: "3rem", borderRadius: "32px", borderLeft: "8px solid var(--accent-secondary)", backgroundColor: "#fdfdfd" }}>
                            <h3 style={{ marginBottom: "2.5rem", color: "var(--accent-secondary)", fontWeight: 900, fontSize: "1.5rem" }}>
                                ✨ Detalhes de {selectedType.name}
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
                                            placeholder={`Informe ${f.name.toLowerCase()}`}
                                            style={inputStyle}
                                        />
                                    </div>
                                ))}
                            </div>
                        </section>
                    )}

                    {/* Localização */}
                    <section className="card" style={{ padding: "3rem", borderRadius: "32px" }}>
                        <h3 style={{ marginBottom: "2.5rem", color: "var(--color-dark-blue)", fontWeight: 800, fontSize: "1.5rem", display: "flex", alignItems: "center", gap: "1rem" }}>
                            <span style={{ backgroundColor: "var(--color-dark-blue)", color: "#fff", width: "40px", height: "40px", borderRadius: "12px", display: "flex", alignItems: "center", justifyContent: "center" }}>03</span>
                            Localização
                        </h3>
                        <div style={{ display: "grid", gridTemplateColumns: "150px 1fr", gap: "2rem" }}>
                            <div className="form-group">
                                <label style={labelStyle}>CEP</label>
                                <input type="text" value={form.zipCode} onChange={e => setForm({ ...form, zipCode: e.target.value })} placeholder="00000-000" style={inputStyle} />
                            </div>
                            <div className="form-group">
                                <label style={labelStyle}>Cidade / Estado</label>
                                <select value={form.cityId} onChange={e => setForm({ ...form, cityId: e.target.value })} required style={inputStyle}>
                                    <option value="">Selecione a cidade...</option>
                                    {Array.isArray(cidades) && cidades.map(c => <option key={c.id} value={c.id}>{c.name} - {c.state?.uf}</option>)}
                                </select>
                            </div>
                        </div>
                        <div className="form-group" style={{ marginTop: "2rem" }}>
                            <label style={labelStyle}>Rua e Número</label>
                            <input type="text" value={form.address} onChange={e => setForm({ ...form, address: e.target.value })} placeholder="Ex: Av. Brasil, 1500" style={inputStyle} />
                        </div>
                    </section>

                    {/* Galeria Imersiva */}
                    <section className="card" style={{ padding: "3rem", borderRadius: "32px" }}>
                        <h3 style={{ marginBottom: "2.5rem", color: "var(--color-dark-blue)", fontWeight: 800, fontSize: "1.5rem", display: "flex", alignItems: "center", gap: "1rem" }}>
                            <span style={{ backgroundColor: "var(--color-dark-blue)", color: "#fff", width: "40px", height: "40px", borderRadius: "12px", display: "flex", alignItems: "center", justifyContent: "center" }}>04</span>
                            Experiência Visual
                        </h3>
                        <div
                            onClick={() => fileInputRef.current?.click()}
                            style={{ border: "2px dashed #cbd5e1", padding: "5rem 2rem", borderRadius: "24px", textAlign: "center", backgroundColor: "#f8fafc", cursor: "pointer", transition: "all 0.3s" }}
                        >
                            <input type="file" multiple accept="image/*" ref={fileInputRef} onChange={handleFiles} style={{ display: "none" }} />
                            <div style={{ fontSize: "3.5rem", marginBottom: "1.5rem" }}>🖼️</div>
                            <p style={{ fontWeight: 800, color: "var(--color-dark-blue)", fontSize: "1.25rem" }}>Importar Fotografias</p>
                            <p style={{ fontSize: "0.9rem", color: "#64748b", marginTop: "0.5rem" }}>Selecione imagens em alta definição (JPG, PNG)</p>
                        </div>
                        {images.length > 0 && (
                            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(160px, 1fr))", gap: "1.5rem", marginTop: "3rem" }}>
                                {images.map((img, idx) => (
                                    <div key={idx} style={{ position: "relative", height: "160px", borderRadius: "18px", overflow: "hidden", border: "3px solid #eef2f6", boxShadow: "0 10px 15px -3px rgba(0,0,0,0.05)" }}>
                                        <img src={img} style={{ width: "100%", height: "100%", objectFit: "cover" }} alt="Exploração" />
                                        <button type="button" onClick={() => setImages(images.filter((_, i) => i !== idx))} style={{ position: "absolute", top: "10px", right: "10px", backgroundColor: "rgba(220, 38, 38, 0.9)", color: "white", border: "none", borderRadius: "10px", width: "32px", height: "32px", cursor: "pointer", fontSize: "1.1rem" }}>✕</button>
                                    </div>
                                ))}
                            </div>
                        )}
                    </section>
                </div>

                {/* Sidebar Sticky */}
                <div style={{ display: "flex", flexDirection: "column", gap: "2rem", position: "sticky", top: "2rem", height: "fit-content" }}>
                    <section className="card" style={{ borderTop: "4px solid var(--color-olive-green)" }}>
                        <h4 style={{ marginBottom: "1.2rem", color: "var(--color-dark-blue)" }}>Status & Visibilidade</h4>
                        <div className="form-group">
                            <label>Disponibilidade</label>
                            <select value={form.status} onChange={e => setForm({ ...form, status: e.target.value })}>
                                <option value="DISPONIVEL">✅ Disponível</option>
                                <option value="VENDIDO">🔴 Vendido</option>
                                <option value="ALUGADO">🔵 Alugado</option>
                                <option value="RESERVADO">🟠 Reservado</option>
                            </select>
                        </div>
                        <div className="form-group" style={{ marginTop: "1rem" }}>
                            <label>Região Operacional</label>
                            <select value={form.region} onChange={e => setForm({ ...form, region: e.target.value })}>
                                <option value="BRASIL">🇧🇷 Brasil</option>
                                <option value="EXTERIOR">🌎 Exterior</option>
                            </select>
                        </div>
                        <div className="form-group" style={{ marginTop: "1.5rem" }}>
                            <label>Data de Entrega</label>
                            <input type="date" value={form.deliveryDate} onChange={e => setForm({ ...form, deliveryDate: e.target.value })} style={{ fontSize: "0.85rem" }} />
                            <label style={{ display: "flex", alignItems: "center", gap: "0.6rem", marginTop: "0.8rem", fontSize: "0.85rem", cursor: "pointer", padding: "0.5rem", borderRadius: "5px", backgroundColor: "var(--bg-primary)" }}>
                                <input type="checkbox" checked={form.showDeliveryDate} onChange={e => setForm({ ...form, showDeliveryDate: e.target.checked })} /> Visível Púb.
                            </label>
                        </div>
                    </section>

                    <section className="card">
                        <h4 style={{ marginBottom: "1.2rem" }}>Canais WhatsApp</h4>
                        <div style={{ display: "flex", flexDirection: "column", gap: "0.8rem" }}>
                            <label style={{ display: "flex", alignItems: "center", gap: "0.6rem", fontSize: "0.9rem", cursor: "pointer" }}>
                                <input type="checkbox" checked={form.whatsappBR} onChange={e => setForm({ ...form, whatsappBR: e.target.checked })} /> Central Brasil
                            </label>
                            <label style={{ display: "flex", alignItems: "center", gap: "0.6rem", fontSize: "0.9rem", cursor: "pointer" }}>
                                <input type="checkbox" checked={form.whatsappExt} onChange={e => setForm({ ...form, whatsappExt: e.target.checked })} /> Central Exterior
                            </label>
                        </div>
                    </section>

                    <section className="card" style={{ maxHeight: "400px", overflow: "hidden", display: "flex", flexDirection: "column" }}>
                        <h4 style={{ marginBottom: "1rem" }}>Comodidades</h4>
                        <div style={{ flex: 1, overflowY: "auto", display: "flex", flexDirection: "column", gap: "0.6rem", paddingRight: "0.5rem" }}>
                            {Array.isArray(comodidadesDisponiveis) && comodidadesDisponiveis.map(c => (
                                <label key={c.id} style={{ display: "flex", alignItems: "center", gap: "0.6rem", fontSize: "0.85rem", cursor: "pointer", padding: "0.4rem", borderRadius: "5px", transition: "background 0.2s" }} onMouseEnter={e => e.currentTarget.style.backgroundColor = "var(--bg-primary)"} onMouseLeave={e => e.currentTarget.style.backgroundColor = "transparent"}>
                                    <input
                                        type="checkbox"
                                        checked={amenitiesSelected.includes(c.id)}
                                        onChange={e => {
                                            if (e.target.checked) setAmenitiesSelected([...amenitiesSelected, c.id]);
                                            else setAmenitiesSelected(amenitiesSelected.filter(id => id !== c.id));
                                        }}
                                    /> {c.name}
                                </label>
                            ))}
                        </div>
                    </section>
                </div>
            </div>
        </form>
    );
}
