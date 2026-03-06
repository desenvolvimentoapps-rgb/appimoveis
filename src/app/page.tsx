"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";

export default function Home() {
  const router = useRouter();
  const [tipos, setTipos] = useState<any[]>([]);
  const [cidades, setCidades] = useState<any[]>([]);
  const [destaques, setDestaques] = useState<any[]>([]);

  const [filtros, setFiltros] = useState({
    typeId: "",
    cityId: "",
    region: ""
  });

  useEffect(() => {
    fetch("/api/tipos")
      .then(res => res.json())
      .then(data => setTipos(Array.isArray(data) ? data : []))
      .catch(() => setTipos([]));

    fetch("/api/localidades?type=city")
      .then(res => res.json())
      .then(data => setCidades(Array.isArray(data) ? data : []))
      .catch(() => setCidades([]));

    fetch("/api/imoveis?limit=3")
      .then(res => res.json())
      .then(data => setDestaques(Array.isArray(data?.data) ? data.data : []))
      .catch(() => setDestaques([]));
  }, []);

  const handleSearch = () => {
    let params = new URLSearchParams();
    if (filtros.typeId) params.append("typeId", filtros.typeId);
    if (filtros.cityId) params.append("cityId", filtros.cityId);
    if (filtros.region) params.append("region", filtros.region);
    router.push(`/buscar?${params.toString()}`);
  };

  return (
    <main>
      {/* HERO SECTION */}
      <section style={{
        height: "85vh", position: "relative", display: "flex", alignItems: "center", justifyContent: "center",
        background: "linear-gradient(rgba(10, 25, 47, 0.6), rgba(10, 25, 47, 0.6)), url('https://images.unsplash.com/photo-1600585154340-be6199f7d009?q=80&w=2070') center/cover"
      }}>
        <div className="container" style={{ textAlign: "center", color: "white", zIndex: 10 }}>
          <h1 style={{ fontSize: "4rem", fontWeight: 800, marginBottom: "1rem" }}>Rede Imobiliária Olivia Prado</h1>
          <p style={{ fontSize: "1.5rem", marginBottom: "3rem", fontWeight: 300 }}>Encontre o seu refúgio de luxo com atendimento exclusivo.</p>

          {/* QUICK SEARCH */}
          <div style={{
            backgroundColor: "rgba(255, 255, 255, 0.1)", backdropFilter: "blur(10px)", padding: "2rem",
            borderRadius: "var(--radius-lg)", display: "flex", gap: "1rem", maxWidth: "1000px", margin: "0 auto",
            border: "1px solid rgba(255,255,255,0.2)"
          }}>
            <select
              value={filtros.typeId}
              onChange={e => setFiltros({ ...filtros, typeId: e.target.value })}
              style={{ flex: 1, padding: "1rem", borderRadius: "var(--radius-sm)", border: "none", outline: "none" }}
            >
              <option value="">Tipo de Imóvel</option>
              {tipos.map(t => <option key={t.id} value={t.id}>{t.name}</option>)}
            </select>
            <select
              value={filtros.cityId}
              onChange={e => setFiltros({ ...filtros, cityId: e.target.value })}
              style={{ flex: 1, padding: "1rem", borderRadius: "var(--radius-sm)", border: "none", outline: "none" }}
            >
              <option value="">Onde você deseja morar?</option>
              {cidades.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
            </select>
            <select
              value={filtros.region}
              onChange={e => setFiltros({ ...filtros, region: e.target.value })}
              style={{ flex: 1, padding: "1rem", borderRadius: "var(--radius-sm)", border: "none", outline: "none" }}
            >
              <option value="">Região</option>
              <option value="BRASIL">Brasil</option>
              <option value="EXTERIOR">Exterior</option>
            </select>
            <button className="btn btn-primary" style={{ padding: "0 2.5rem" }} onClick={handleSearch}>BUSCAR</button>
          </div>
        </div>
      </section>

      {/* DESTAQUES */}
      <section className="container" style={{ padding: "6rem 0" }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-end", marginBottom: "3rem" }}>
          <div>
            <span style={{ color: "var(--accent-primary)", fontWeight: 700, textTransform: "uppercase", letterSpacing: "2px" }}>Exclusividade</span>
            <h2 style={{ fontSize: "2.5rem", marginTop: "0.5rem" }}>Imóveis em Destaque</h2>
          </div>
          <Link href="/buscar" style={{ color: "var(--color-dark-blue)", fontWeight: 600, textDecoration: "none", borderBottom: "2px solid var(--accent-primary)" }}>Ver todos os imóveis</Link>
        </div>

        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(350px, 1fr))", gap: "2.5rem" }}>
          {destaques.map((imovel) => (
            <div key={imovel.id} className="card" style={{ padding: "0", overflow: "hidden", transition: "transform 0.3s" }} onMouseEnter={e => e.currentTarget.style.transform = "translateY(-10px)"} onMouseLeave={e => e.currentTarget.style.transform = "none"}>
              <Link href={`/imovel/${imovel.id}`} style={{ textDecoration: "none", color: "inherit" }}>
                <div style={{ height: "250px", position: "relative" }}>
                  <img src={imovel.images[0]?.url || "https://images.unsplash.com/photo-1512917774080-9991f1c4c750?q=80&w=2070"} style={{ width: "100%", height: "100%", objectFit: "cover" }} alt={imovel.title} />
                  <div style={{ position: "absolute", top: "1rem", left: "1rem", backgroundColor: "var(--color-dark-blue)", color: "white", padding: "0.25rem 1rem", borderRadius: "20px", fontSize: "0.75rem", fontWeight: 600 }}>{imovel.type?.name}</div>
                </div>
                <div style={{ padding: "1.5rem" }}>
                  <h3 style={{ fontSize: "1.4rem", marginBottom: "0.5rem", color: "var(--color-dark-blue)" }}>{imovel.title}</h3>
                  <p style={{ color: "var(--text-muted)", marginBottom: "1.5rem", fontSize: "0.9rem" }}>{imovel.city?.name}, {imovel.city?.state?.uf}</p>
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                    <span style={{ fontSize: "1.5rem", fontWeight: 800, color: "var(--accent-primary)" }}>R$ {imovel.price.toLocaleString("pt-BR")}</span>
                    <span style={{ fontWeight: 600, fontSize: "0.9rem" }}>Detalhes →</span>
                  </div>
                </div>
              </Link>
            </div>
          ))}
        </div>
      </section>
    </main>
  );
}
