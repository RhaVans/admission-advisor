#!/usr/bin/env python3
"""
Admission Advisor v2 — Data Generator
Produces v2-schema JSON for all 14 supported universities.
"""
import json, os, math

OUT = "data/hardcoded"
os.makedirs(OUT, exist_ok=True)

# ── Scoring helpers ──────────────────────────────────────────────
def compute_volatility(s22, s23, s24):
    scores = [s for s in [s22, s23, s24] if s and s > 0]
    if len(scores) < 2: return 0.0
    mean = sum(scores) / len(scores)
    var = sum((s - mean)**2 for s in scores) / len(scores)
    return round(math.sqrt(var) / mean, 4)

def detect_sharp_drop(s23, s24):
    if not s23 or not s24: return 0.0
    drop = (s23 - s24) / s23
    return round(drop, 4) if drop > 0.03 else 0.0

def compute_crowding(vol, drop):
    return round(min(vol * 3.0 + drop * 5.0, 2.0), 4)

def crowding_level(penalty):
    if penalty >= 1.0: return "high"
    if penalty >= 0.3: return "moderate"
    return "low"

def compute_trend(s22, s24):
    if not s22 or not s24: return "stable"
    d = s24 - s22
    if d > 5: return "increasing"
    if d < -5: return "decreasing"
    return "stable"

def compute_ease(rate, avg_score, trend, penalty):
    ac = (rate or 0) * 0.6
    sc = (1.0 / avg_score * 10000 * 0.4) if avg_score else 0
    tb = {"decreasing": 0.5, "stable": 0, "increasing": -0.5}.get(trend, 0)
    return round(ac + sc + tb - penalty, 2)

def conf_from_tiers(*tiers):
    t = [t for t in tiers if t]
    if not t: return "medium"
    for tier in t:
        if tier in ("third-party",): return "low"
        if tier in ("third-party-affiliated",): return "medium"
    return "medium"

# ── Program builder ──────────────────────────────────────────────
def P(name, faculty, capacity, applicants, s22, s23, s24,
      program_type="S1", avg_rapor=None, avg_utbk=None,
      rapor_tier=None, utbk_tier=None,
      pathways=None, career=None, competition=None,
      source_ref=None, data_conf=None):
    rate = round(capacity / applicants * 100, 2) if applicants else 0
    avg = round((s22 + s23 + s24) / 3) if all([s22, s23, s24]) else (s24 or s23 or s22 or 0)
    trend = compute_trend(s22, s24)
    vol = compute_volatility(s22, s23, s24)
    drop = detect_sharp_drop(s23, s24)
    cp = compute_crowding(vol, drop)
    cr = crowding_level(cp)
    ease = compute_ease(rate, avg, trend, cp)
    return {
        "name": name, "faculty": faculty, "program_type": program_type,
        "capacity": capacity, "applicants": applicants,
        "acceptance_rate": rate, "avg_min_score": avg,
        "scores": {"2022": s22, "2023": s23, "2024": s24},
        "avg_rapor": avg_rapor, "avg_utbk": avg_utbk,
        "rapor_source_tier": rapor_tier, "utbk_source_tier": utbk_tier,
        "admission_pathways": pathways or [],
        "career_prospects": career or {"static": [], "ai_generated": None, "avg_starting_salary_idr": None, "job_market_demand": None, "source_tier": "third-party"},
        "competition_breakdown": competition or {"local_applicants_pct": None, "out_of_province_pct": None, "top_feeder_schools": None, "avg_applicant_utbk": None, "source_tier": "third-party"},
        "ease_score": ease, "volatility_index": vol,
        "sharp_drop_pct": drop, "crowding_penalty": cp, "crowding_risk": cr,
        "source_ref": source_ref or [0, 1],
        "data_confidence": data_conf or "medium"
    }

# ── Standard pathways templates ──────────────────────────────────
def snbp(cap=None):
    return {"name": "SNBP", "type": "SNBP", "capacity": cap, "registration_fee": None, "ukt_min": 500000, "ukt_max": 12500000, "ukt_note": "Based on parents' income bracket (8 groups)", "requirements": ["Top 25% of class ranking", "School must be accredited A/Unggul", "Rapor semester 1-5"], "open_period": "Feb-Mar", "portal_url": "https://snpmb.bppp.kemdikbud.go.id", "source_tier": "official-affiliated"}

def snbt(cap=None):
    return {"name": "SNBT (UTBK)", "type": "SNBT", "capacity": cap, "registration_fee": 200000, "ukt_min": 500000, "ukt_max": 12500000, "ukt_note": "Based on parents' income bracket", "requirements": ["UTBK score", "Maximum age 25 at registration", "Graduated within last 3 years"], "open_period": "Mar-Jun", "portal_url": "https://snpmb.bppp.kemdikbud.go.id", "source_tier": "official-affiliated"}

def mandiri_path(name, fee, ukt_min, ukt_max, reqs, period, portal, note=None):
    return {"name": name, "type": "Mandiri", "capacity": None, "registration_fee": fee, "ukt_min": ukt_min, "ukt_max": ukt_max, "ukt_note": note, "requirements": reqs, "open_period": period, "portal_url": portal, "source_tier": "third-party-affiliated"}

# ── Career templates ─────────────────────────────────────────────
def career(roles, salary=None, demand="medium"):
    return {"static": roles, "ai_generated": None, "avg_starting_salary_idr": salary, "job_market_demand": demand, "source_tier": "third-party"}

def competition(local=None, oop=None, schools=None, utbk=None):
    return {"local_applicants_pct": local, "out_of_province_pct": oop, "top_feeder_schools": schools, "avg_applicant_utbk": utbk, "source_tier": "third-party"}

# ── University builder ───────────────────────────────────────────
def build_uni(uid, uname, utype, exam, score_range, year, programs, sources):
    data = {
        "university_id": uid, "university_name": uname,
        "university_type": utype, "exam_name": exam,
        "score_range": score_range, "year": year,
        "programs": programs, "sources": sources
    }
    path = os.path.join(OUT, f"{uid}.json")
    with open(path, "w", encoding="utf-8") as f:
        json.dump(data, f, indent=2, ensure_ascii=False)
    print(f"[OK] {uid}.json — {len(programs)} programs")
    return data

# ── Standard sources template ────────────────────────────────────
def std_sources(uid, uname, portal_url):
    return [
        {"id": 0, "title": f"Daya Tampung Jalur Mandiri {uname} 2024", "publisher": "Kontan", "url": "https://www.kontan.co.id/", "type": "news-report", "accessed": "2024-06-15", "reliability": "medium"},
        {"id": 1, "title": f"Kuota Mandiri {uname} 2024", "publisher": "UTBK-CAK", "url": "https://utbkcak.com/", "type": "education-platform", "accessed": "2024-06-20", "reliability": "medium"},
        {"id": 2, "title": f"Passing Grade Estimasi {uname} 2024", "publisher": "Sindonews", "url": "https://edukasi.sindonews.com/", "type": "news-report", "accessed": "2024-07-10", "reliability": "medium"},
        {"id": 3, "title": f"Portal PMB {uname}", "publisher": uname, "url": portal_url, "type": "official-portal", "accessed": "2024-05-28", "reliability": "high"},
    ]

# ══════════════════════════════════════════════════════════════════
# UGM
# ══════════════════════════════════════════════════════════════════
ugm_pw = [snbp(), snbt(), mandiri_path("UM UGM", 350000, 500000, 15000000, ["UTBK score or UM UGM exam", "Max age 25"], "May-Jul", "https://pmb.ugm.ac.id")]

ugm = build_uni("ugm", "Universitas Gadjah Mada", "S1", "UM UGM", "0-1000", "2024", [
    P("Teknik Sipil","Fakultas Teknik",52,1480,672,668,665, pathways=ugm_pw, career=career(["Civil Engineer","Structural Engineer","Construction Manager","Urban Planner"],5500000,"medium"), competition=competition(45,55,None,580.0), avg_rapor=86.5, avg_utbk=590.0, rapor_tier="third-party-affiliated", utbk_tier="third-party-affiliated"),
    P("Teknik Mesin","Fakultas Teknik",38,1250,655,650,648, pathways=ugm_pw, career=career(["Mechanical Engineer","Manufacturing Engineer","Automotive Engineer"],5800000,"medium"), competition=competition(42,58,None,575.0)),
    P("Teknik Elektro","Fakultas Teknik",40,1600,680,678,675, pathways=ugm_pw, career=career(["Electrical Engineer","Power Systems Engineer","Electronics Engineer"],6000000,"high"), competition=competition(40,60,None,600.0)),
    P("Teknik Kimia","Fakultas Teknik",35,920,638,632,629, pathways=ugm_pw, career=career(["Chemical Engineer","Process Engineer","Petrochemical Analyst"],6200000,"medium"), competition=competition(44,56,None,565.0)),
    P("Teknik Geologi","Fakultas Teknik",30,360,520,515,510, pathways=ugm_pw, career=career(["Geologist","Mining Consultant","Environmental Geologist"],5800000,"medium"), competition=competition(50,50,None,520.0)),
    P("Teknik Industri","Fakultas Teknik",42,1820,690,688,685, pathways=ugm_pw, career=career(["Industrial Engineer","Operations Manager","Supply Chain Analyst","Management Consultant"],7000000,"high"), competition=competition(38,62,None,610.0)),
    P("Teknik Geodesi","Fakultas Teknik",28,320,510,508,505, pathways=ugm_pw, career=career(["Surveyor","GIS Specialist","Geomatics Engineer"],5000000,"low"), competition=competition(55,45,None,505.0)),
    P("Arsitektur","Fakultas Teknik",35,980,620,618,615, pathways=ugm_pw, career=career(["Architect","Urban Designer","Interior Architect"],5500000,"medium"), competition=competition(42,58,None,560.0)),
    P("Pendidikan Dokter","Fakultas Kedokteran, Kesehatan Masyarakat dan Keperawatan",69,6400,770,772,775, pathways=ugm_pw, career=career(["Medical Doctor","Specialist Physician","Medical Researcher"],8000000,"high"), competition=competition(30,70,None,720.0)),
    P("Ilmu Keperawatan","Fakultas Kedokteran, Kesehatan Masyarakat dan Keperawatan",40,580,530,528,525, pathways=ugm_pw, career=career(["Nurse","Healthcare Manager","Clinical Researcher"],4500000,"high"), competition=competition(55,45,None,500.0)),
    P("Ilmu Gizi","Fakultas Kedokteran, Kesehatan Masyarakat dan Keperawatan",30,420,515,512,510, pathways=ugm_pw, career=career(["Nutritionist","Dietitian","Food Safety Specialist"],4500000,"medium"), competition=competition(52,48,None,495.0)),
    P("Manajemen","Fakultas Ekonomika dan Bisnis",60,3600,720,718,715, pathways=ugm_pw, career=career(["Management Consultant","Business Analyst","Financial Analyst","Entrepreneur"],7500000,"high"), competition=competition(35,65,None,640.0)),
    P("Akuntansi","Fakultas Ekonomika dan Bisnis",55,3200,715,712,710, pathways=ugm_pw, career=career(["Accountant","Auditor","Tax Consultant","Financial Controller"],7000000,"high"), competition=competition(36,64,None,635.0)),
    P("Ilmu Ekonomi","Fakultas Ekonomika dan Bisnis",50,2400,700,698,695, pathways=ugm_pw, career=career(["Economist","Policy Analyst","Data Analyst","Banking Professional"],6500000,"medium"), competition=competition(38,62,None,620.0)),
    P("Ilmu Hukum","Fakultas Hukum",128,2800,650,648,645, pathways=ugm_pw, career=career(["Lawyer","Legal Counsel","Notary","Judge"],6000000,"high"), competition=competition(40,60,None,580.0)),
    P("Psikologi","Fakultas Psikologi",50,2100,660,658,655, pathways=ugm_pw, career=career(["Psychologist","HR Specialist","Counselor","UX Researcher"],5500000,"high"), competition=competition(38,62,None,590.0)),
    P("Fisika","Fakultas MIPA",35,380,495,492,490, pathways=ugm_pw, career=career(["Physicist","Research Scientist","Data Scientist"],5000000,"low"), competition=competition(55,45,None,480.0)),
    P("Kimia","Fakultas MIPA",32,350,490,488,485, pathways=ugm_pw, career=career(["Chemist","Lab Analyst","Quality Control Specialist"],4800000,"low"), competition=competition(56,44,None,475.0)),
    P("Matematika","Fakultas MIPA",38,480,510,505,500, pathways=ugm_pw, career=career(["Mathematician","Actuary","Data Analyst","Quantitative Analyst"],6000000,"medium"), competition=competition(50,50,None,490.0)),
    P("Statistika","Fakultas MIPA",40,620,555,550,548, pathways=ugm_pw, career=career(["Statistician","Data Scientist","Research Analyst"],6500000,"high"), competition=competition(48,52,None,530.0)),
    P("Ilmu Komputer","Fakultas MIPA",45,1850,675,672,670, pathways=ugm_pw, career=career(["Software Engineer","Data Engineer","ML Engineer","Tech Lead"],8000000,"high"), competition=competition(35,65,None,610.0)),
    P("Hubungan Internasional","Fakultas Ilmu Sosial dan Ilmu Politik",40,1920,695,692,690, pathways=ugm_pw, career=career(["Diplomat","International Relations Analyst","NGO Program Officer"],6000000,"medium"), competition=competition(35,65,None,615.0)),
    P("Ilmu Komunikasi","Fakultas Ilmu Sosial dan Ilmu Politik",45,2100,685,682,680, pathways=ugm_pw, career=career(["Public Relations Specialist","Journalist","Content Strategist","Digital Marketer"],5500000,"high"), competition=competition(37,63,None,600.0)),
    P("Sosiologi","Fakultas Ilmu Sosial dan Ilmu Politik",35,580,545,542,540, pathways=ugm_pw, career=career(["Social Researcher","Policy Analyst","Community Development Specialist"],4800000,"low"), competition=competition(50,50,None,510.0)),
    P("Agronomi","Fakultas Pertanian",40,320,445,442,440, pathways=ugm_pw, career=career(["Agronomist","Agricultural Consultant","Plantation Manager"],4500000,"medium"), competition=competition(60,40,None,430.0)),
    P("Peternakan","Fakultas Peternakan",35,280,435,432,430, pathways=ugm_pw, career=career(["Animal Scientist","Livestock Manager","Feed Industry Specialist"],4200000,"low"), competition=competition(62,38,None,420.0)),
    P("Kehutanan","Fakultas Kehutanan",38,290,425,422,420, pathways=ugm_pw, career=career(["Forest Engineer","Conservation Specialist","Environmental Consultant"],4500000,"medium"), competition=competition(58,42,None,415.0)),
    P("Teknologi Pangan dan Hasil Pertanian","Fakultas Teknologi Pertanian",30,310,480,475,472, pathways=ugm_pw, career=career(["Food Technologist","Quality Assurance Specialist","R&D Scientist"],5000000,"medium"), competition=competition(52,48,None,465.0)),
    P("Teknik Pertanian dan Biosistem","Fakultas Teknologi Pertanian",28,240,450,447,445, pathways=ugm_pw, career=career(["Agricultural Engineer","Biosystems Engineer","Precision Agriculture Specialist"],4800000,"low"), competition=competition(58,42,None,440.0)),
    P("Sastra Indonesia","Fakultas Ilmu Budaya",35,320,460,455,452, pathways=ugm_pw, career=career(["Editor","Content Writer","Translator","Cultural Researcher"],4200000,"low"), competition=competition(55,45,None,440.0)),
    P("Arkeologi","Fakultas Ilmu Budaya",25,190,418,415,412, pathways=ugm_pw, career=career(["Archaeologist","Museum Curator","Heritage Consultant"],4000000,"low"), competition=competition(60,40,None,400.0)),
    P("Ilmu Sejarah","Fakultas Ilmu Budaya",28,210,415,412,410, pathways=ugm_pw, career=career(["Historian","Archivist","Cultural Heritage Officer"],4000000,"low"), competition=competition(58,42,None,400.0)),
    P("Ilmu Filsafat","Fakultas Filsafat",30,220,420,418,415, pathways=ugm_pw, career=career(["Philosopher","Ethics Consultant","Academic Researcher","Policy Analyst"],4000000,"low"), competition=competition(55,45,None,405.0)),
    P("Pendidikan Dokter Gigi","Fakultas Kedokteran Gigi",60,1600,710,708,705, pathways=ugm_pw, career=career(["Dentist","Orthodontist","Oral Surgeon"],7500000,"high"), competition=competition(35,65,None,640.0)),
    P("Farmasi","Fakultas Farmasi",45,1200,630,625,622, pathways=ugm_pw, career=career(["Pharmacist","Pharmaceutical Researcher","Drug Regulatory Specialist"],5500000,"high"), competition=competition(40,60,None,570.0)),
    P("Biologi","Fakultas Biologi",35,450,505,502,498, pathways=ugm_pw, career=career(["Biologist","Research Scientist","Environmental Consultant"],4500000,"low"), competition=competition(52,48,None,480.0)),
], std_sources("ugm", "Universitas Gadjah Mada", "https://pmb.ugm.ac.id"))

# ══════════════════════════════════════════════════════════════════
# UI
# ══════════════════════════════════════════════════════════════════
ui_pw = [snbp(), snbt(), mandiri_path("SIMAK UI", 500000, 500000, 17500000, ["SIMAK UI exam score", "Max age 25"], "May-Jul", "https://penerimaan.ui.ac.id")]
C = career; Co = competition

ui = build_uni("ui", "Universitas Indonesia", "S1", "SIMAK UI", "0-1000", "2024", [
    P("Teknik Sipil","Fakultas Teknik",36,1320,675,672,670, pathways=ui_pw, career=C(["Civil Engineer","Structural Engineer","Construction Manager"],5500000,"medium"), competition=Co(30,70,None,585.0)),
    P("Teknik Mesin","Fakultas Teknik",34,1180,660,658,655, pathways=ui_pw, career=C(["Mechanical Engineer","Manufacturing Engineer"],5800000,"medium"), competition=Co(32,68,None,580.0)),
    P("Teknik Elektro","Fakultas Teknik",38,1540,685,682,680, pathways=ui_pw, career=C(["Electrical Engineer","Telecom Engineer"],6000000,"high"), competition=Co(28,72,None,605.0)),
    P("Ilmu Komputer","Fakultas Ilmu Komputer",50,2200,695,692,690, pathways=ui_pw, career=C(["Software Engineer","Data Scientist","ML Engineer","Product Manager"],8500000,"high"), competition=Co(25,75,None,625.0)),
    P("Sistem Informasi","Fakultas Ilmu Komputer",45,1850,672,670,668, pathways=ui_pw, career=C(["IT Consultant","Business Analyst","Systems Analyst"],7500000,"high"), competition=Co(28,72,None,600.0)),
    P("Pendidikan Dokter","Fakultas Kedokteran",84,6800,780,782,785, pathways=ui_pw, career=C(["Medical Doctor","Specialist Physician","Medical Researcher"],8500000,"high"), competition=Co(20,80,None,740.0)),
    P("Ilmu Keperawatan","Fakultas Ilmu Keperawatan",42,560,525,522,520, pathways=ui_pw, career=C(["Nurse","Healthcare Manager"],4500000,"high"), competition=Co(45,55,None,495.0)),
    P("Manajemen","Fakultas Ekonomi dan Bisnis",65,3800,725,722,720, pathways=ui_pw, career=C(["Management Consultant","Business Analyst","Financial Analyst"],8000000,"high"), competition=Co(25,75,None,650.0)),
    P("Akuntansi","Fakultas Ekonomi dan Bisnis",60,3500,720,718,715, pathways=ui_pw, career=C(["Accountant","Auditor","Tax Consultant"],7500000,"high"), competition=Co(26,74,None,645.0)),
    P("Ilmu Ekonomi","Fakultas Ekonomi dan Bisnis",55,2600,705,702,700, pathways=ui_pw, career=C(["Economist","Policy Analyst","Banking Professional"],7000000,"medium"), competition=Co(28,72,None,630.0)),
    P("Ilmu Hukum","Fakultas Hukum",75,3000,658,655,652, pathways=ui_pw, career=C(["Lawyer","Legal Counsel","Notary","Judge"],6500000,"high"), competition=Co(30,70,None,590.0)),
    P("Psikologi","Fakultas Psikologi",55,2300,665,662,660, pathways=ui_pw, career=C(["Psychologist","HR Specialist","Counselor"],6000000,"high"), competition=Co(28,72,None,600.0)),
    P("Fisika","Fakultas MIPA",30,320,490,487,485, pathways=ui_pw, career=C(["Physicist","Research Scientist"],5000000,"low"), competition=Co(45,55,None,475.0)),
    P("Kimia","Fakultas MIPA",28,300,485,482,480, pathways=ui_pw, career=C(["Chemist","Lab Analyst"],4800000,"low"), competition=Co(48,52,None,470.0)),
    P("Matematika","Fakultas MIPA",35,460,510,507,505, pathways=ui_pw, career=C(["Actuary","Data Analyst","Quantitative Analyst"],6500000,"medium"), competition=Co(42,58,None,490.0)),
    P("Statistika","Fakultas MIPA",38,580,545,542,540, pathways=ui_pw, career=C(["Statistician","Data Scientist"],6500000,"high"), competition=Co(40,60,None,520.0)),
    P("Hubungan Internasional","Fakultas Ilmu Sosial dan Ilmu Politik",38,1950,700,698,695, pathways=ui_pw, career=C(["Diplomat","International Relations Analyst"],6000000,"medium"), competition=Co(25,75,None,625.0)),
    P("Ilmu Komunikasi","Fakultas Ilmu Sosial dan Ilmu Politik",42,2050,690,688,685, pathways=ui_pw, career=C(["Public Relations Specialist","Journalist","Digital Marketer"],5500000,"high"), competition=Co(27,73,None,615.0)),
    P("Sosiologi","Fakultas Ilmu Sosial dan Ilmu Politik",32,560,542,540,538, pathways=ui_pw, career=C(["Social Researcher","Policy Analyst"],4800000,"low"), competition=Co(40,60,None,510.0)),
    P("Farmasi","Fakultas Farmasi",40,1150,635,632,630, pathways=ui_pw, career=C(["Pharmacist","Pharmaceutical Researcher"],5500000,"high"), competition=Co(35,65,None,575.0)),
    P("Pendidikan Dokter Gigi","Fakultas Kedokteran Gigi",38,1550,715,712,710, pathways=ui_pw, career=C(["Dentist","Orthodontist"],7500000,"high"), competition=Co(28,72,None,645.0)),
    P("Teknik Kimia","Fakultas Teknik",32,880,640,638,635, pathways=ui_pw, career=C(["Chemical Engineer","Process Engineer"],6200000,"medium"), competition=Co(32,68,None,570.0)),
    P("Teknik Industri","Fakultas Teknik",40,1780,692,690,688, pathways=ui_pw, career=C(["Industrial Engineer","Operations Manager"],7000000,"high"), competition=Co(28,72,None,620.0)),
    P("Arsitektur","Fakultas Teknik",30,920,622,620,618, pathways=ui_pw, career=C(["Architect","Urban Designer"],5500000,"medium"), competition=Co(35,65,None,560.0)),
    P("Biologi","Fakultas MIPA",28,380,498,495,492, pathways=ui_pw, career=C(["Biologist","Research Scientist"],4500000,"low"), competition=Co(45,55,None,475.0)),
    P("Sastra Indonesia","Fakultas Ilmu Pengetahuan Budaya",30,290,455,452,450, pathways=ui_pw, career=C(["Editor","Translator","Cultural Researcher"],4200000,"low"), competition=Co(50,50,None,435.0)),
], std_sources("ui", "Universitas Indonesia", "https://penerimaan.ui.ac.id"))

# ══════════════════════════════════════════════════════════════════
# ITB
# ══════════════════════════════════════════════════════════════════
itb_pw = [snbp(), snbt(), mandiri_path("USM ITB", 400000, 500000, 20000000, ["USM ITB exam score", "Max age 25"], "May-Jul", "https://usm.itb.ac.id", note="ITB admits at faculty level in year 1; per-program quotas are estimates")]

itb = build_uni("itb", "Institut Teknologi Bandung", "S1", "USM ITB", "0-1000", "2024", [
    P("Teknik Sipil","Fakultas Teknik Sipil dan Lingkungan",35,1200,680,678,675, pathways=itb_pw, career=C(["Civil Engineer","Structural Engineer"],6000000,"medium"), competition=Co(30,70,None,600.0)),
    P("Teknik Lingkungan","Fakultas Teknik Sipil dan Lingkungan",30,680,605,602,600, pathways=itb_pw, career=C(["Environmental Engineer","Sustainability Consultant"],5500000,"medium"), competition=Co(35,65,None,555.0)),
    P("Teknik Mesin","Fakultas Teknik Mesin dan Dirgantara",40,1380,672,670,668, pathways=itb_pw, career=C(["Mechanical Engineer","Aerospace Support Engineer"],6000000,"medium"), competition=Co(30,70,None,595.0)),
    P("Teknik Dirgantara","Fakultas Teknik Mesin dan Dirgantara",30,880,648,645,642, pathways=itb_pw, career=C(["Aerospace Engineer","Aircraft Designer"],6500000,"medium"), competition=Co(32,68,None,580.0)),
    P("Teknik Elektro","Sekolah Teknik Elektro dan Informatika",42,1620,688,685,683, pathways=itb_pw, career=C(["Electrical Engineer","Telecom Engineer"],6500000,"high"), competition=Co(28,72,None,610.0)),
    P("Teknik Informatika","Sekolah Teknik Elektro dan Informatika",50,3200,710,708,705, pathways=itb_pw, career=C(["Software Engineer","ML Engineer","Tech Lead"],9000000,"high"), competition=Co(22,78,None,640.0)),
    P("Sistem dan Teknologi Informasi","Sekolah Teknik Elektro dan Informatika",40,1800,685,682,680, pathways=itb_pw, career=C(["IT Consultant","Systems Analyst","Product Manager"],7500000,"high"), competition=Co(25,75,None,610.0)),
    P("Teknik Industri","Fakultas Teknologi Industri",45,1950,695,692,690, pathways=itb_pw, career=C(["Industrial Engineer","Operations Manager","Management Consultant"],7500000,"high"), competition=Co(25,75,None,620.0)),
    P("Teknik Kimia","Fakultas Teknologi Industri",35,980,648,645,642, pathways=itb_pw, career=C(["Chemical Engineer","Process Engineer"],6200000,"medium"), competition=Co(32,68,None,580.0)),
    P("Manajemen Rekayasa Industri","Sekolah Bisnis dan Manajemen",50,2800,702,700,698, pathways=itb_pw, career=C(["Management Consultant","Business Analyst","Entrepreneur"],8000000,"high"), competition=Co(22,78,None,635.0)),
    P("Fisika","Fakultas MIPA",32,360,495,492,490, pathways=itb_pw, career=C(["Physicist","Research Scientist"],5000000,"low"), competition=Co(42,58,None,480.0)),
    P("Kimia","Fakultas MIPA",30,320,488,485,482, pathways=itb_pw, career=C(["Chemist","Lab Analyst"],4800000,"low"), competition=Co(45,55,None,475.0)),
    P("Matematika","Fakultas MIPA",35,480,512,508,505, pathways=itb_pw, career=C(["Actuary","Data Analyst","Quantitative Analyst"],6500000,"medium"), competition=Co(40,60,None,490.0)),
    P("Astronomi","Fakultas MIPA",25,280,475,472,470, pathways=itb_pw, career=C(["Astronomer","Research Scientist","Data Analyst"],5000000,"low"), competition=Co(45,55,None,460.0)),
    P("Biologi","Sekolah Ilmu dan Teknologi Hayati",28,360,492,490,488, pathways=itb_pw, career=C(["Biologist","Biotech Researcher"],4500000,"low"), competition=Co(42,58,None,475.0)),
    P("Arsitektur","Sekolah Arsitektur, Perencanaan dan Pengembangan Kebijakan",35,980,625,622,620, pathways=itb_pw, career=C(["Architect","Urban Designer"],6000000,"medium"), competition=Co(30,70,None,565.0)),
    P("Perencanaan Wilayah dan Kota","Sekolah Arsitektur, Perencanaan dan Pengembangan Kebijakan",30,620,598,595,592, pathways=itb_pw, career=C(["Urban Planner","Regional Development Analyst"],5500000,"medium"), competition=Co(35,65,None,545.0)),
    P("Teknik Pertambangan","Fakultas Teknik Pertambangan dan Perminyakan",30,580,548,545,542, pathways=itb_pw, career=C(["Mining Engineer","Resource Geologist"],6500000,"medium"), competition=Co(38,62,None,520.0)),
    P("Teknik Perminyakan","Fakultas Teknik Pertambangan dan Perminyakan",28,650,560,558,555, pathways=itb_pw, career=C(["Petroleum Engineer","Reservoir Engineer"],7000000,"medium"), competition=Co(35,65,None,530.0)),
    P("Teknik Metalurgi","Fakultas Teknik Pertambangan dan Perminyakan",25,380,520,518,515, pathways=itb_pw, career=C(["Metallurgist","Materials Engineer"],5800000,"medium"), competition=Co(40,60,None,500.0)),
    P("Geodesi dan Geomatika","Fakultas Ilmu dan Teknologi Kebumian",28,340,512,510,508, pathways=itb_pw, career=C(["Surveyor","GIS Specialist"],5000000,"low"), competition=Co(45,55,None,495.0)),
    P("Desain Produk","Fakultas Seni Rupa dan Desain",30,780,588,585,582, pathways=itb_pw, career=C(["Product Designer","UX Designer","Industrial Designer"],5500000,"medium"), competition=Co(32,68,None,540.0)),
], std_sources("itb", "Institut Teknologi Bandung", "https://usm.itb.ac.id"))

# ══════════════════════════════════════════════════════════════════
# ITS
# ══════════════════════════════════════════════════════════════════
its_pw = [snbp(), snbt(), mandiri_path("SM ITS", 300000, 500000, 12000000, ["SM ITS exam or UTBK score", "Max age 25"], "May-Jul", "https://smits.its.ac.id")]

its = build_uni("its", "Institut Teknologi Sepuluh Nopember", "S1", "SM ITS", "0-1000", "2024", [
    P("Teknik Sipil","Fakultas Teknik Sipil, Perencanaan dan Kebumian",38,1080,638,635,632, pathways=its_pw, career=C(["Civil Engineer","Construction Manager"],5200000,"medium"), competition=Co(50,50,None,560.0)),
    P("Teknik Mesin","Fakultas Teknologi Industri dan Rekayasa Sistem",40,1120,642,640,638, pathways=its_pw, career=C(["Mechanical Engineer","Manufacturing Engineer"],5500000,"medium"), competition=Co(48,52,None,565.0)),
    P("Teknik Industri","Fakultas Teknologi Industri dan Rekayasa Sistem",42,1480,658,655,652, pathways=its_pw, career=C(["Industrial Engineer","Operations Manager"],6500000,"high"), competition=Co(42,58,None,585.0)),
    P("Teknik Kimia","Fakultas Teknologi Industri dan Rekayasa Sistem",35,820,622,620,618, pathways=its_pw, career=C(["Chemical Engineer","Process Engineer"],5800000,"medium"), competition=Co(48,52,None,555.0)),
    P("Informatika","Fakultas Teknologi Elektro dan Informatika Cerdas",50,2800,685,682,680, pathways=its_pw, career=C(["Software Engineer","Data Scientist","ML Engineer"],8000000,"high"), competition=Co(35,65,None,610.0)),
    P("Teknik Elektro","Fakultas Teknologi Elektro dan Informatika Cerdas",40,1350,655,652,650, pathways=its_pw, career=C(["Electrical Engineer","Power Systems Engineer"],6000000,"high"), competition=Co(42,58,None,580.0)),
    P("Teknik Komputer","Fakultas Teknologi Elektro dan Informatika Cerdas",38,1200,648,645,642, pathways=its_pw, career=C(["Computer Engineer","Embedded Systems Engineer"],6500000,"high"), competition=Co(40,60,None,575.0)),
    P("Teknik Perkapalan","Fakultas Teknologi Kelautan",35,680,538,535,532, pathways=its_pw, career=C(["Naval Architect","Marine Engineer"],5500000,"medium"), competition=Co(55,45,None,510.0)),
    P("Teknik Kelautan","Fakultas Teknologi Kelautan",28,420,515,512,510, pathways=its_pw, career=C(["Ocean Engineer","Marine Surveyor"],5000000,"medium"), competition=Co(55,45,None,495.0)),
    P("Manajemen Bisnis Teknologi","Fakultas Desain Kreatif dan Bisnis Digital",45,1850,648,645,642, pathways=its_pw, career=C(["Business Analyst","Tech Entrepreneur","Product Manager"],6500000,"high"), competition=Co(38,62,None,580.0)),
    P("Desain Produk Industri","Fakultas Desain Kreatif dan Bisnis Digital",30,680,572,570,568, pathways=its_pw, career=C(["Product Designer","UX Designer"],5000000,"medium"), competition=Co(45,55,None,530.0)),
    P("Fisika","Fakultas Sains dan Analitika Data",30,320,482,480,478, pathways=its_pw, career=C(["Physicist","Research Scientist"],4800000,"low"), competition=Co(55,45,None,465.0)),
    P("Kimia","Fakultas Sains dan Analitika Data",28,295,478,475,472, pathways=its_pw, career=C(["Chemist","Lab Analyst"],4500000,"low"), competition=Co(58,42,None,460.0)),
    P("Matematika","Fakultas Sains dan Analitika Data",32,420,498,495,492, pathways=its_pw, career=C(["Actuary","Data Analyst"],5500000,"medium"), competition=Co(50,50,None,480.0)),
    P("Statistika","Fakultas Sains dan Analitika Data",35,520,518,515,512, pathways=its_pw, career=C(["Statistician","Data Scientist"],6500000,"high"), competition=Co(45,55,None,500.0)),
    P("Biologi","Fakultas Sains dan Analitika Data",28,310,480,478,475, pathways=its_pw, career=C(["Biologist","Research Scientist"],4200000,"low"), competition=Co(55,45,None,460.0)),
    P("Sains Data","Fakultas Sains dan Analitika Data",30,620,545,542,540, pathways=its_pw, career=C(["Data Scientist","ML Engineer","Data Analyst"],7500000,"high"), competition=Co(38,62,None,520.0)),
    P("Arsitektur","Fakultas Teknik Sipil, Perencanaan dan Kebumian",28,580,558,555,552, pathways=its_pw, career=C(["Architect","Urban Designer"],5500000,"medium"), competition=Co(45,55,None,520.0)),
    P("Teknik Lingkungan","Fakultas Teknik Sipil, Perencanaan dan Kebumian",30,520,528,525,522, pathways=its_pw, career=C(["Environmental Engineer","Sustainability Consultant"],5000000,"medium"), competition=Co(50,50,None,505.0)),
    P("Teknologi Informasi","Fakultas Teknologi Elektro dan Informatika Cerdas",35,980,638,635,632, pathways=its_pw, career=C(["IT Consultant","Systems Analyst","Web Developer"],7000000,"high"), competition=Co(38,62,None,575.0)),
], std_sources("its", "Institut Teknologi Sepuluh Nopember", "https://smits.its.ac.id"))

# ══════════════════════════════════════════════════════════════════
# UNPAD
# ══════════════════════════════════════════════════════════════════
unpad_pw = [snbp(), snbt(), mandiri_path("SMUP Unpad", 350000, 500000, 14000000, ["UTBK score or SMUP exam", "Max age 25"], "May-Jul", "https://smup.unpad.ac.id")]

unpad = build_uni("unpad", "Universitas Padjadjaran", "S1", "SMUP Unpad", "0-1000", "2024", [
    P("Pendidikan Dokter","Fakultas Kedokteran",75,5800,748,750,752, pathways=unpad_pw, career=C(["Medical Doctor","Specialist Physician"],8000000,"high"), competition=Co(35,65,None,700.0)),
    P("Ilmu Keperawatan","Fakultas Keperawatan",40,520,518,515,512, pathways=unpad_pw, career=C(["Nurse","Healthcare Manager"],4500000,"high"), competition=Co(55,45,None,490.0)),
    P("Pendidikan Dokter Gigi","Fakultas Kedokteran Gigi",35,1380,695,692,690, pathways=unpad_pw, career=C(["Dentist","Orthodontist"],7500000,"high"), competition=Co(35,65,None,630.0)),
    P("Farmasi","Fakultas Farmasi",45,1050,618,615,612, pathways=unpad_pw, career=C(["Pharmacist","Pharmaceutical Researcher"],5500000,"high"), competition=Co(40,60,None,560.0)),
    P("Ilmu Hukum","Fakultas Hukum",80,2600,628,625,622, pathways=unpad_pw, career=C(["Lawyer","Legal Counsel","Notary"],6000000,"high"), competition=Co(42,58,None,565.0)),
    P("Manajemen","Fakultas Ekonomi dan Bisnis",65,3200,668,665,662, pathways=unpad_pw, career=C(["Management Consultant","Business Analyst"],7000000,"high"), competition=Co(35,65,None,600.0)),
    P("Akuntansi","Fakultas Ekonomi dan Bisnis",60,2900,662,660,658, pathways=unpad_pw, career=C(["Accountant","Auditor","Tax Consultant"],6500000,"high"), competition=Co(36,64,None,595.0)),
    P("Ilmu Ekonomi","Fakultas Ekonomi dan Bisnis",55,2200,648,645,642, pathways=unpad_pw, career=C(["Economist","Policy Analyst"],6000000,"medium"), competition=Co(38,62,None,580.0)),
    P("Hubungan Internasional","Fakultas Ilmu Sosial dan Ilmu Politik",38,1650,672,670,668, pathways=unpad_pw, career=C(["Diplomat","International Relations Analyst"],5500000,"medium"), competition=Co(35,65,None,600.0)),
    P("Ilmu Komunikasi","Fakultas Ilmu Komunikasi",45,1980,658,655,652, pathways=unpad_pw, career=C(["PR Specialist","Journalist","Digital Marketer"],5500000,"high"), competition=Co(38,62,None,590.0)),
    P("Psikologi","Fakultas Psikologi",50,1850,645,642,640, pathways=unpad_pw, career=C(["Psychologist","HR Specialist","Counselor"],5500000,"high"), competition=Co(38,62,None,580.0)),
    P("Fisika","Fakultas MIPA",30,285,472,470,468, pathways=unpad_pw, career=C(["Physicist","Research Scientist"],4800000,"low"), competition=Co(55,45,None,455.0)),
    P("Kimia","Fakultas MIPA",28,268,468,465,462, pathways=unpad_pw, career=C(["Chemist","Lab Analyst"],4500000,"low"), competition=Co(58,42,None,450.0)),
    P("Matematika","Fakultas MIPA",32,395,488,485,482, pathways=unpad_pw, career=C(["Actuary","Data Analyst"],5500000,"medium"), competition=Co(50,50,None,470.0)),
    P("Statistika","Fakultas MIPA",35,480,502,500,498, pathways=unpad_pw, career=C(["Statistician","Data Scientist"],6000000,"medium"), competition=Co(48,52,None,485.0)),
    P("Biologi","Fakultas MIPA",28,310,472,470,468, pathways=unpad_pw, career=C(["Biologist","Research Scientist"],4200000,"low"), competition=Co(55,45,None,455.0)),
    P("Agroteknologi","Fakultas Pertanian",35,380,445,442,440, pathways=unpad_pw, career=C(["Agronomist","Agricultural Consultant"],4200000,"medium"), competition=Co(62,38,None,425.0)),
    P("Agribisnis","Fakultas Pertanian",38,420,452,450,448, pathways=unpad_pw, career=C(["Agribusiness Manager","Agricultural Economist"],4500000,"medium"), competition=Co(60,40,None,435.0)),
    P("Peternakan","Fakultas Peternakan",35,295,432,430,428, pathways=unpad_pw, career=C(["Animal Scientist","Livestock Manager"],4000000,"low"), competition=Co(65,35,None,415.0)),
    P("Perikanan","Fakultas Perikanan dan Ilmu Kelautan",30,265,428,425,422, pathways=unpad_pw, career=C(["Fisheries Manager","Aquaculture Specialist"],4000000,"low"), competition=Co(65,35,None,410.0)),
    P("Sastra Indonesia","Fakultas Ilmu Budaya",32,272,435,432,430, pathways=unpad_pw, career=C(["Editor","Translator","Content Writer"],4000000,"low"), competition=Co(58,42,None,420.0)),
    P("Ilmu Sejarah","Fakultas Ilmu Budaya",28,218,418,415,412, pathways=unpad_pw, career=C(["Historian","Archivist"],3800000,"low"), competition=Co(60,40,None,400.0)),
    P("Sosiologi","Fakultas Ilmu Sosial dan Ilmu Politik",35,505,518,515,512, pathways=unpad_pw, career=C(["Social Researcher","Policy Analyst"],4500000,"low"), competition=Co(52,48,None,495.0)),
    P("Administrasi Publik","Fakultas Ilmu Sosial dan Ilmu Politik",38,580,522,520,518, pathways=unpad_pw, career=C(["Public Administrator","Policy Analyst","Government Official"],4800000,"medium"), competition=Co(50,50,None,500.0)),
], std_sources("unpad", "Universitas Padjadjaran", "https://smup.unpad.ac.id"))

print("[OK] Original 5 universities generated.")
