"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { useParams } from "next/navigation";

export default function DetalhesImovelPage() {
    const { id } = useParams();
    const [imovel, setImovel] = useState<any>(null);
    const [fotoAtiva, setFotoAtiva] = useState(0);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        if (!id) return;

        fetch(`/api/imoveis/${id}`)
            .then(res => res.json())
            .then(data => {
                if (data.error) {
                    console.error("Erro da API:", data.error);
                    setImovel(null);
                } else {
                    setImovel(data);
                }
                setLoading(false);
            })
            .catch(err => {
                console.error("Erro ao buscar imóvel:", err);
                setLoading(false);
            });
    }, [id]);

    const handleWhatsApp = async () => {
        if (!imovel) return;

        try {
            await fetch(`/api/imoveis/${id}`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ action: "click" })
            });
        } catch (e) { }

        const msg = encodeURIComponent(`Olá! Gostaria de mais informações sobre o imóvel "${imovel.title}" (Cód: ${imovel.code}). Link: ${window.location.href}`);
        const phone = "5541999999999";
        window.open(`https://wa.me/${phone}?text=${msg}`, "_blank");
    };

    const nextFoto = () => {
        if (imovel?.images?.length) {
            setFotoAtiva((prev) => (prev + 1) % imovel.images.length);
        }
    };

    const prevFoto = () => {
        if (imovel?.images?.length) {
            setFotoAtiva((prev) => (prev === 0 ? imovel.images.length - 1 : prev - 1));
        }
    };

    if (loading) return (
        <div style={{ display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", height: "80vh" }}>
            <div style={{ fontSize: "3rem", animation: "spin 2s linear infinite" }}>⏳</div>
            <p style={{ marginTop: "1.5rem", color: "var(--text-muted)", fontWeight: 700, fontSize: "1.1rem" }}>Preparando experiência premium...</p>
        </div>
    );

    if (!imovel) return (
        <div style={{ padding: "10rem", textAlign: "center" }}>
            <h2 style={{ fontSize: "2rem", color: "var(--color-dark-blue)", fontWeight: 800 }}>Propriedade não encontrada.</h2>
            <p style={{ color: "var(--text-muted)", margin: "1rem 0 2rem" }}>O ativo pode ter sido removido ou o link está incorreto.</p>
            <Link href="/" className="btn btn-primary" style={{ padding: "1rem 2rem", borderRadius: "12px" }}>Voltar ao Início</Link>
        </div>
    );

    const images = imovel.images && imovel.images.length > 0
        ? imovel.images
        : [{ url: "https://images.unsplash.com/photo-1600585154340-be6161a56a0c?auto=format&fit=crop&q=80&w=1920" }];

    return (
        <main style={{ backgroundColor: "#fcfcfc", minHeight: "100vh" }}>
            <div style={{ position: "relative", width: "100%", height: "70vh", backgroundColor: "#000", overflow: "hidden" }}>
                <img
                    src={images[fotoAtiva]?.url}
                    alt={imovel.title}
                    style={{ width: "100%", height: "100%", objectFit: "cover", opacity: 0.85, transition: "opacity 0.5s ease" }}
                    onError={(e) => {
                        (e.target as HTMLImageElement).src = "https://images.unsplash.com/photo-1600585154340-be6161a56a0c?auto=format&fit=crop&q=80&w=1920";
                    }}
                />

                {images.length > 1 && (
                    <>
                        <button onClick={prevFoto} style={{ position: "absolute", left: "3rem", top: "50%", transform: "translateY(-50%)", width: "60px", height: "60px", borderRadius: "50%", border: "none", backgroundColor: "rgba(255,255,255,0.95)", cursor: "pointer", fontSize: "1.5rem", boxShadow: "0 10px 25px rgba(0,0,0,0.3)", display: "flex", alignItems: "center", justifyContent: "center", zIndex: 10 }}>‹</button>
                        <button onClick={nextFoto} style={{ position: "absolute", right: "3rem", top: "50%", transform: "translateY(-50%)", width: "60px", height: "60px", borderRadius: "50%", border: "none", backgroundColor: "rgba(255,255,255,0.95)", cursor: "pointer", fontSize: "1.5rem", boxShadow: "0 10px 25px rgba(0,0,0,0.3)", display: "flex", alignItems: "center", justifyContent: "center", zIndex: 10 }}>›</button>
                    </>
                )}

                <div style={{ position: "absolute", bottom: "3rem", left: "50%", transform: "translateX(-50%)", backgroundColor: "rgba(0,0,0,0.6)", color: "white", padding: "0.6rem 1.5rem", borderRadius: "30px", fontSize: "0.9rem", fontWeight: 800, backdropFilter: "blur(5px)" }}>
                    {fotoAtiva + 1} / {images.length}
                </div>
            </div>

            <div className="container" style={{ marginTop: "-6rem", position: "relative", zIndex: 20, display: "grid", gridTemplateColumns: "1fr 400px", gap: "3.5rem", paddingBottom: "10rem" }}>
                <div style={{ display: "flex", flexDirection: "column", gap: "3rem" }}>
                    <div className="card" style={{ padding: "3.5rem", borderRadius: "32px", boxShadow: "0 25px 50px -12px rgba(0,0,0,0.08)" }}>
                        <div style={{ display: "flex", gap: "1rem", marginBottom: "2rem" }}>
                            <span style={{ backgroundColor: "#dcfce7", color: "#166534", padding: "0.5rem 1.25rem", borderRadius: "10px", fontSize: "0.8rem", fontWeight: 900, textTransform: "uppercase" }}>{imovel.status}</span>
                            <span style={{ backgroundColor: "#f3f4f6", color: "#374151", padding: "0.5rem 1.25rem", borderRadius: "10px", fontSize: "0.8rem", fontWeight: 900, textTransform: "uppercase" }}>{imovel.type?.name || "Imóvel"}</span>
                            <span style={{ backgroundColor: "#eff6ff", color: "#1e40af", padding: "0.5rem 1.25rem", borderRadius: "10px", fontSize: "0.8rem", fontWeight: 900, textTransform: "uppercase" }}>Cód: {imovel.code}</span>
                        </div>

                        <h1 style={{ fontSize: "3rem", fontWeight: 950, color: "var(--color-dark-blue)", lineHeight: "1.1", letterSpacing: "-1.5px" }}>{imovel.title}</h1>
                        <p style={{ fontSize: "1.25rem", color: "var(--text-muted)", marginTop: "1.2rem", display: "flex", alignItems: "center", gap: "0.75rem", fontWeight: 500 }}>
                            📍 {imovel.address}{imovel.address && ", "}{imovel.city?.name} - {imovel.city?.state?.uf ? imovel.city.state.uf : ""}
                        </p>

                        <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: "1.25rem", marginTop: "3.5rem" }}>
                            {[
                                { label: "Quartos", val: imovel.bedrooms ?? 0, icon: "🛏️" },
                                { label: "Banheiros", val: imovel.bathrooms ?? 0, icon: "🚿" },
                                { label: "Vagas", val: imovel.parkingSpaces ?? 0, icon: "🚗" },
                                { label: "Área Total", val: `${imovel.totalArea ?? 0} m²`, icon: "📏" },
                                { label: "Área Útil", val: `${imovel.usefulArea ?? 0} m²`, icon: "🏠" },
                                { label: "Andar", val: imovel.floor ? `${imovel.floor}º` : "Térreo", icon: "🏢" }
                            ].map((item, i) => (
                                <div key={i} style={{ backgroundColor: "#f8fafc", padding: "1.5rem", borderRadius: "20px", textAlign: "center", border: "1px solid #f1f5f9" }}>
                                    <div style={{ fontSize: "1.75rem", marginBottom: "0.5rem" }}>{item.icon}</div>
                                    <div style={{ fontSize: "1.15rem", fontWeight: 900, color: "var(--color-dark-blue)" }}>{item.val}</div>
                                    <div style={{ fontSize: "0.7rem", fontWeight: 700, color: "#64748b", textTransform: "uppercase", marginTop: "0.3rem" }}>{item.label}</div>
                                </div>
                            ))}
                        </div>
                    </div>

                    <section className="card" style={{ padding: "3.5rem", borderRadius: "32px" }}>
                        <h3 style={{ fontSize: "1.75rem", color: "var(--color-dark-blue)", marginBottom: "2rem", fontWeight: 900 }}>Sobre este Ativo</h3>
                        <div style={{ fontSize: "1.2rem", lineHeight: "1.8", color: "#4b5563", whiteSpace: "pre-wrap" }}>
                            {imovel.description || "Nenhuma descrição disponível."}
                        </div>
                    </section>

                    {imovel.customValues && imovel.customValues.length > 0 && (
                        <section className="card" style={{ padding: "3.5rem", borderRadius: "32px", borderLeft: "8px solid var(--accent-secondary)" }}>
                            <h3 style={{ fontSize: "1.75rem", color: "var(--color-dark-blue)", marginBottom: "2.5rem", fontWeight: 900 }}>Diferenciais Técnicos</h3>
                            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "1.5rem" }}>
                                {imovel.customValues.map((cv: any) => (
                                    <div key={cv.customFieldId} style={{ display: "flex", alignItems: "center", gap: "1.25rem", padding: "1.5rem", backgroundColor: "#f9fafb", borderRadius: "18px" }}>
                                        <div style={{ width: "10px", height: "10px", borderRadius: "50%", backgroundColor: "var(--color-olive-green)" }}></div>
                                        <div>
                                            <div style={{ fontSize: "0.75rem", fontWeight: 800, color: "#64748b", textTransform: "uppercase" }}>{cv.customField?.name}</div>
                                            <div style={{ fontSize: "1.1rem", fontWeight: 800, color: "var(--color-dark-blue)", marginTop: "0.2rem" }}>{cv.value}</div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </section>
                    )}

                    <section className="card" style={{ padding: "3.5rem", borderRadius: "32px" }}>
                        <h3 style={{ fontSize: "1.75rem", color: "var(--color-dark-blue)", marginBottom: "2.5rem", fontWeight: 900 }}>Lazer e Comodidades</h3>
                        <div style={{ display: "flex", flexWrap: "wrap", gap: "1rem" }}>
                            {imovel.amenities?.map((a: any) => (
                                <span key={a.amenityId} style={{ padding: "0.8rem 1.75rem", backgroundColor: "white", border: "2px solid #f1f5f9", borderRadius: "50px", fontSize: "0.95rem", fontWeight: 700, color: "var(--color-dark-blue)" }}>
                                    ✨ {a.amenity?.name}
                                </span>
                            ))}
                        </div>
                    </section>
                </div>

                <div style={{ position: "sticky", top: "3rem", height: "fit-content" }}>
                    <div className="card" style={{ padding: "3.5rem", textAlign: "center", boxShadow: "0 35px 60px -15px rgba(0,0,0,0.15)", borderRadius: "40px" }}>
                        <p style={{ fontSize: "0.9rem", fontWeight: 800, color: "#64748b", textTransform: "uppercase" }}>Valor de Investimento</p>
                        <div style={{ fontSize: "3.25rem", fontWeight: 950, color: "var(--color-dark-blue)", margin: "1rem 0 2.5rem" }}>
                            R$ {imovel.price?.toLocaleString("pt-BR")}
                        </div>
                        <div style={{ display: "flex", flexDirection: "column", gap: "1.25rem" }}>
                            <button onClick={handleWhatsApp} style={{ backgroundColor: "#22c55e", color: "white", padding: "1.5rem", borderRadius: "18px", border: "none", fontWeight: 900, fontSize: "1.2rem", cursor: "pointer", boxShadow: "0 20px 25px -5px rgba(34, 197, 94, 0.3)" }}>WhatsApp Brasil</button>
                            <button style={{ backgroundColor: "#fff", color: "var(--color-dark-blue)", padding: "1.5rem", borderRadius: "18px", border: "3px solid var(--color-dark-blue)", fontWeight: 900, fontSize: "1.2rem" }}>Enviar E-mail</button>
                        </div>
                    </div>
                </div>
            </div>
        </main>
    );
}
