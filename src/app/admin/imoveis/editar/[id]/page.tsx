"use client";

import { useState, useEffect, useRef } from "react";
import { useRouter, useParams } from "next/navigation";

// Estilo Premium para os inputs
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

export default function EditarImovelPage() {
    const router = useRouter();
    const { id } = useParams();
    const [tipos, setTipos] = useState<any[]>([]);
    const [cidades, setCidades] = useState<any[]>([]);
    const [comodidadesDisponiveis, setComodidadesDisponiveis] = useState<any[]>([]);

    const [tipoSelecionado, setTipoSelecionado] = useState("");
    const [images, setImages] = useState<string[]>([]);
    const fileInputRef = useRef<HTMLInputElement>(null);
    const [loading, setLoading] = useState(true);

    const [form, setForm] = useState({
        title: "",
        code: "",
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
        const fetchData = async () => {
            try {
                const [resTipos, resCidades, resComodidades, resImovel] = await Promise.all([
                    fetch("/api/tipos"),
                    fetch("/api/localidades?type=city"),
                    fetch("/api/comodidades"),
                    fetch(`/api/imoveis/${id}`)
                ]);

                const dataTipos = await resTipos.json();
                const dataCidades = await resCidades.json();
                const dataComodidades = await resComodidades.json();
                const imovel = await resImovel.json();

                if (imovel.error) {
                    alert("Imóvel não encontrado!");
                    router.push("/admin/imoveis");
                    return;
                }

                setTipos(Array.isArray(dataTipos) ? dataTipos : []);
                setCidades(Array.isArray(dataCidades) ? dataCidades : []);
                setComodidadesDisponiveis(Array.isArray(dataComodidades) ? dataComodidades : []);

                if (imovel) {
                    setForm({
                        title: imovel.title || "",
                        code: imovel.code || "",
                        status: imovel.status || "DISPONIVEL",
                        address: imovel.address || "",
                        zipCode: imovel.zipCode || "",
                        price: imovel.price?.toString() || "",
                        description: imovel.description || "",
                        deliveryDate: imovel.deliveryDate ? new Date(imovel.deliveryDate).toISOString().split('T')[0] : "",
                        showDeliveryDate: imovel.showDeliveryDate ?? true,
                        whatsappBR: imovel.whatsappBR ?? true,
                        whatsappExt: imovel.whatsappExt ?? false,
                        region: imovel.region || "BRASIL",
                        cityId: imovel.cityId || "",
                        bedrooms: imovel.bedrooms?.toString() || "0",
                        bathrooms: imovel.bathrooms?.toString() || "0",
                        parkingSpaces: imovel.parkingSpaces?.toString() || "0",
                        totalArea: imovel.totalArea?.toString() || "0",
                        usefulArea: imovel.usefulArea?.toString() || "0",
                        floor: imovel.floor?.toString() || ""
                    });
                    setTipoSelecionado(imovel.typeId || "");
                    setAmenitiesSelected(imovel.amenities?.map((a: any) => a.amenityId) || []);
                    setImages(imovel.images?.map((img: any) => img.url) || []);

                    const cvs: any = {};
                    imovel.customValues?.forEach((cv: any) => {
                        cvs[cv.customFieldId] = cv.value;
                    });
                    setCustomValues(cvs);
                }
                setLoading(false);
            } catch (error) {
                console.error("Erro ao carregar dados:", error);
                setLoading(false);
            }
        };

        fetchData();
    }, [id, router]);

    const selectedType = tipos.find((t: any) => t.id === tipoSelecionado);

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
            id,
            typeId: tipoSelecionado,
            amenities: amenitiesSelected,
            images,
            customValues: Object.entries(customValues).map(([fieldId, val]) => ({
                customFieldId: fieldId,
                value: val
            }))
        };

        const res = await fetch("/api/imoveis", {
            method: "PUT",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(payload)
        });

        if (res.ok) {
            alert("Imóvel atualizado com sucesso!");
            router.push("/admin/imoveis");
            router.refresh();
        } else {
            const err = await res.json();
            alert("Erro ao salvar imóvel: " + (err.error || "Verifique os campos."));
        }
    };

    if (loading) return (
        <div style={{ padding: "10rem", textAlign: "center" }}>
            <div style={{ fontSize: "3rem", animation: "spin 2s linear infinite" }}>🔄</div>
            <p style={{ marginTop: "1rem", fontWeight: 700, color: "var(--text-muted)" }}>Sincronizando dados exclusivos...</p>
        </div>
    );

    return (
        <form onSubmit={handleSubmit} style={{ maxWidth: "1200px", margin: "0 auto", paddingBottom: "10rem" }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "3rem" }}>
                <div>
                    <h2 style={{ fontSize: "2.25rem", color: "var(--color-dark-blue)", fontWeight: 900, letterSpacing: "-1px" }}>Refinar Imóvel</h2>
                    <p style={{ color: "var(--text-muted)", fontSize: "1rem", fontWeight: 500 }}>Aprimore os detalhes da propriedade #{form.code}</p>
                </div>
                <div style={{ display: "flex", gap: "1.25rem" }}>
                    <button type="button" onClick={() => router.back()} className="btn" style={{ backgroundColor: "#fff", border: "2px solid #eef2f6", padding: "0.8rem 2rem", borderRadius: "12px", fontWeight: 700 }}>Cancelar</button>
                    <button type="submit" className="btn btn-primary" style={{ padding: "0.8rem 2.5rem", borderRadius: "12px", fontWeight: 800, backgroundImage: "linear-gradient(135deg, var(--color-dark-blue) 0%, #2c3e50 100%)", boxShadow: "0 10px 20px rgba(0,0,0,0.1)" }}>Publicar Atualizações</button>
                </div>
            </div>

            <div style={{ display: "grid", gridTemplateColumns: "1fr 350px", gap: "2.5rem" }}>
                <div style={{ display: "flex", flexDirection: "column", gap: "3rem" }}>

                    {/* Informações Básicas */}
                    <section className="card" style={{ padding: "2.5rem", borderRadius: "24px", boxShadow: "0 4px 20px rgba(0,0,0,0.03)" }}>
                        <h3 style={{ marginBottom: "2rem", color: "var(--color-dark-blue)", fontWeight: 800, fontSize: "1.25rem", display: "flex", alignItems: "center", gap: "0.75rem" }}>
                            <span style={{ backgroundColor: "var(--color-dark-blue)", color: "#fff", width: "32px", height: "32px", borderRadius: "8px", display: "flex", alignItems: "center", justifyContent: "center", fontSize: "0.9rem" }}>01</span>
                            Dados Principais
                        </h3>

                        <div className="form-group" style={{ marginBottom: "1.5rem" }}>
                            <label style={labelStyle}>Título do Imóvel</label>
                            <input type="text" value={form.title} onChange={e => setForm({ ...form, title: e.target.value })} required style={inputStyle} placeholder="Ex: Mansão Suspensa no Ecoville" />
                        </div>

                        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "1.5rem" }}>
                            <div className="form-group">
                                <label style={labelStyle}>Tipo de Imóvel</label>
                                <select value={tipoSelecionado} onChange={(e) => setTipoSelecionado(e.target.value)} required style={inputStyle}>
                                    <option value="">Selecione...</option>
                                    {tipos.map(t => <option key={t.id} value={t.id}>{t.name}</option>)}
                                </select>
                            </div>
                            <div className="form-group">
                                <label style={labelStyle}>Preço de Investimento (R$)</label>
                                <input type="number" value={form.price} onChange={e => setForm({ ...form, price: e.target.value })} required style={inputStyle} placeholder="0,00" />
                            </div>
                        </div>

                        <div className="form-group" style={{ marginTop: "1.5rem" }}>
                            <label style={labelStyle}>Endereço Completo</label>
                            <input type="text" value={form.address} onChange={e => setForm({ ...form, address: e.target.value })} style={inputStyle} placeholder="Rua, Número, Bairro" />
                        </div>

                        <div className="form-group" style={{ marginTop: "1.5rem" }}>
                            <label style={labelStyle}>Descrição do Luxo / Detalhes</label>
                            <textarea rows={6} value={form.description} onChange={e => setForm({ ...form, description: e.target.value })} style={{ ...inputStyle, resize: "none" }} placeholder="Descreva os diferenciais únicos deste imóvel..."></textarea>
                        </div>
                    </section>

                    {/* Ficha Técnica */}
                    <section className="card" style={{ padding: "2.5rem", borderRadius: "24px" }}>
                        <h3 style={{ marginBottom: "2rem", color: "var(--color-dark-blue)", fontWeight: 800, fontSize: "1.25rem", display: "flex", alignItems: "center", gap: "0.75rem" }}>
                            <span style={{ backgroundColor: "var(--color-dark-blue)", color: "#fff", width: "32px", height: "32px", borderRadius: "8px", display: "flex", alignItems: "center", justifyContent: "center", fontSize: "0.9rem" }}>02</span>
                            Atributos Técnicos
                        </h3>
                        <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: "1.5rem" }}>
                            {[
                                { label: "🛏️ Quartos", key: "bedrooms" },
                                { label: "🚿 Banheiros", key: "bathrooms" },
                                { label: "🚗 Vagas", key: "parkingSpaces" },
                                { label: "📏 Área Total (m²)", key: "totalArea" },
                                { label: "🏠 Área Útil (m²)", key: "usefulArea" },
                                { label: "🏢 Andar", key: "floor", type: "text" }
                            ].map((item) => (
                                <div key={item.key} className="form-group">
                                    <label style={labelStyle}>{item.label}</label>
                                    <input
                                        type={item.type || "number"}
                                        value={(form as any)[item.key]}
                                        onChange={e => setForm({ ...form, [item.key]: e.target.value })}
                                        style={inputStyle}
                                    />
                                </div>
                            ))}
                        </div>
                    </section>

                    {/* Características Dinâmicas */}
                    {selectedType && selectedType.customFields?.length > 0 && (
                        <section className="card" style={{ padding: "2.5rem", borderRadius: "24px", borderLeft: "6px solid var(--accent-secondary)" }}>
                            <h3 style={{ marginBottom: "2rem", color: "var(--accent-secondary)", fontWeight: 900, fontSize: "1.25rem" }}>✨ Diferenciais de {selectedType.name}</h3>
                            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "1.5rem" }}>
                                {selectedType.customFields.map((f: any) => (
                                    <div key={f.id} className="form-group">
                                        <label style={labelStyle}>{f.name} {f.isRequired && "*"}</label>
                                        <input
                                            type={f.type === "number" ? "number" : "text"}
                                            required={f.isRequired}
                                            value={customValues[f.id] || ""}
                                            onChange={e => setCustomValues({ ...customValues, [f.id]: e.target.value })}
                                            style={inputStyle}
                                            placeholder={`Informe ${f.name.toLowerCase()}`}
                                        />
                                    </div>
                                ))}
                            </div>
                        </section>
                    )}

                    {/* Fotos */}
                    <section className="card" style={{ padding: "2.5rem", borderRadius: "24px" }}>
                        <h3 style={{ marginBottom: "2rem", color: "var(--color-dark-blue)", fontWeight: 800, fontSize: "1.25rem", display: "flex", alignItems: "center", gap: "0.75rem" }}>
                            <span style={{ backgroundColor: "var(--color-dark-blue)", color: "#fff", width: "32px", height: "32px", borderRadius: "8px", display: "flex", alignItems: "center", justifyContent: "center", fontSize: "0.9rem" }}>03</span>
                            Galeria Exclusiva
                        </h3>
                        <div
                            onClick={() => fileInputRef.current?.click()}
                            style={{ border: "2px dashed #cbd5e1", padding: "4rem 2rem", borderRadius: "20px", textAlign: "center", backgroundColor: "#f8fafc", cursor: "pointer", transition: "all 0.2s" }}
                        >
                            <input type="file" multiple accept="image/*" ref={fileInputRef} onChange={handleFiles} style={{ display: "none" }} />
                            <div style={{ fontSize: "2.5rem", marginBottom: "1rem" }}>📸</div>
                            <p style={{ fontWeight: 700, color: "var(--color-dark-blue)" }}>Adicionar novas fotografias</p>
                            <p style={{ fontSize: "0.85rem", color: "#64748b" }}>Arraste ou clique para selecionar arquivos de alta resolução</p>
                        </div>
                        {images.length > 0 && (
                            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(150px, 1fr))", gap: "1.25rem", marginTop: "2.5rem" }}>
                                {images.map((img, idx) => (
                                    <div key={idx} style={{ position: "relative", height: "150px", borderRadius: "15px", overflow: "hidden", border: "2px solid #eef2f6", boxShadow: "0 4px 6px -1px rgba(0,0,0,0.1)" }}>
                                        <img src={img} style={{ width: "100%", height: "100%", objectFit: "cover" }} alt="Preview" />
                                        <button type="button" onClick={() => setImages(images.filter((_, i) => i !== idx))} style={{ position: "absolute", top: "8px", right: "8px", backgroundColor: "rgba(239, 68, 68, 0.9)", color: "white", border: "none", borderRadius: "8px", width: "28px", height: "28px", cursor: "pointer", fontWeight: "bold" }}>✕</button>
                                    </div>
                                ))}
                            </div>
                        )}
                    </section>
                </div>

                {/* Sidebar */}
                <div style={{ display: "flex", flexDirection: "column", gap: "2.5rem", position: "sticky", top: "2rem", height: "fit-content" }}>
                    <section className="card" style={{ padding: "2rem", borderRadius: "24px" }}>
                        <h4 style={{ marginBottom: "1.5rem", fontWeight: 800, color: "var(--color-dark-blue)" }}>Status do Imóvel</h4>
                        <div className="form-group">
                            <label style={labelStyle}>Disponibilidade</label>
                            <select value={form.status} onChange={e => setForm({ ...form, status: e.target.value })} style={inputStyle}>
                                <option value="DISPONIVEL">✅ Disponível</option>
                                <option value="VENDIDO">🔴 Vendido</option>
                                <option value="ALUGADO">🔵 Alugado</option>
                                <option value="RESERVADO">🟡 Reservado</option>
                            </select>
                        </div>
                        <div className="form-group" style={{ marginTop: "1.5rem" }}>
                            <label style={labelStyle}>Cidades Disponíveis</label>
                            <select value={form.cityId} onChange={e => setForm({ ...form, cityId: e.target.value })} style={inputStyle}>
                                <option value="">Selecione a cidade...</option>
                                {cidades.map(c => <option key={c.id} value={c.id}>{c.name} - {c.state?.uf}</option>)}
                            </select>
                        </div>
                    </section>

                    <section className="card" style={{ padding: "2rem", borderRadius: "24px" }}>
                        <h4 style={{ marginBottom: "1.5rem", fontWeight: 800, color: "var(--color-dark-blue)" }}>Destaques e Lazer</h4>
                        <div style={{ maxHeight: "400px", overflowY: "auto", display: "flex", flexDirection: "column", gap: "0.75rem" }} className="no-scrollbar">
                            {comodidadesDisponiveis.map(c => (
                                <label key={c.id} style={{ display: "flex", alignItems: "center", gap: "0.75rem", fontSize: "0.9rem", cursor: "pointer", padding: "0.75rem", borderRadius: "12px", border: "1px solid #f1f5f9", transition: "all 0.2s" }}>
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

                    <section className="card" style={{ padding: "2rem", borderRadius: "24px", backgroundColor: "#f8fafc", border: "2px solid #e2e8f0" }}>
                        <h4 style={{ marginBottom: "1.25rem", fontWeight: 800, color: "var(--color-dark-blue)" }}>Timeline do Projeto</h4>
                        <div className="form-group">
                            <label style={labelStyle}>Previsão de Entrega</label>
                            <input type="date" value={form.deliveryDate} onChange={e => setForm({ ...form, deliveryDate: e.target.value })} style={inputStyle} />
                        </div>
                        <label style={{ display: "flex", alignItems: "center", gap: "0.75rem", marginTop: "1rem", cursor: "pointer", fontSize: "0.9rem", fontWeight: 700 }}>
                            <input type="checkbox" checked={form.showDeliveryDate} onChange={e => setForm({ ...form, showDeliveryDate: e.target.checked })} style={{ width: "18px", height: "18px" }} />
                            Exibir no site
                        </label>
                    </section>
                </div>
            </div>
        </form>
    );
}
