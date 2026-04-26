#!/usr/bin/env python3
"""Extension generator batch 3: USU, Politeknik NHI, Politeknik Makassar"""
import sys, os
sys.path.insert(0, os.path.dirname(__file__))
from generate_data_v2 import P, C, Co, build_uni, std_sources, snbp, snbt, mandiri_path

# ══════════════════════════════════════════════════════════════════
# USU - Universitas Sumatera Utara
# ══════════════════════════════════════════════════════════════════
usu_pw = [snbp(), snbt(), mandiri_path("SMM USU", 275000, 500000, 11000000, ["UTBK score or SMM USU exam","Max age 25"], "May-Jul", "https://pmbmandiri.usu.ac.id")]
build_uni("usu", "Universitas Sumatera Utara", "S1", "SMM USU", "0-1000", "2024", [
    P("Teknik Sipil","Fakultas Teknik",38,820,605,602,600, pathways=usu_pw, career=C(["Civil Engineer","Construction Manager"],4800000,"medium"), competition=Co(68,32,None,535.0)),
    P("Teknik Mesin","Fakultas Teknik",35,720,598,595,592, pathways=usu_pw, career=C(["Mechanical Engineer","Manufacturing Engineer"],4800000,"medium"), competition=Co(65,35,None,530.0)),
    P("Teknik Elektro","Fakultas Teknik",32,650,612,610,608, pathways=usu_pw, career=C(["Electrical Engineer","Telecom Engineer"],5200000,"medium"), competition=Co(62,38,None,545.0)),
    P("Teknik Informatika","Fakultas Ilmu Komputer dan Teknologi Informasi",42,1600,642,640,638, pathways=usu_pw, career=C(["Software Engineer","Data Scientist","Web Developer"],6500000,"high"), competition=Co(50,50,None,575.0)),
    P("Sistem Informasi","Fakultas Ilmu Komputer dan Teknologi Informasi",38,1100,618,615,612, pathways=usu_pw, career=C(["IT Consultant","Systems Analyst"],6000000,"high"), competition=Co(52,48,None,555.0)),
    P("Teknik Kimia","Fakultas Teknik",32,580,595,592,590, pathways=usu_pw, career=C(["Chemical Engineer","Process Engineer"],5200000,"medium"), competition=Co(62,38,None,530.0)),
    P("Arsitektur","Fakultas Teknik",28,480,575,572,570, pathways=usu_pw, career=C(["Architect","Urban Designer"],5000000,"medium"), competition=Co(60,40,None,525.0)),
    P("Pendidikan Dokter","Fakultas Kedokteran",60,4600,732,735,738, pathways=usu_pw, career=C(["Medical Doctor","Specialist Physician"],7500000,"high"), competition=Co(50,50,None,678.0)),
    P("Pendidikan Dokter Gigi","Fakultas Kedokteran Gigi",30,1100,685,682,680, pathways=usu_pw, career=C(["Dentist","Orthodontist"],7000000,"high"), competition=Co(52,48,None,625.0)),
    P("Farmasi","Fakultas Farmasi",38,820,598,595,592, pathways=usu_pw, career=C(["Pharmacist","Pharmaceutical Researcher"],5000000,"high"), competition=Co(55,45,None,535.0)),
    P("Ilmu Keperawatan","Fakultas Keperawatan",35,420,498,495,492, pathways=usu_pw, career=C(["Nurse","Healthcare Manager"],4200000,"high"), competition=Co(65,35,None,475.0)),
    P("Ilmu Hukum","Fakultas Hukum",70,2000,612,610,608, pathways=usu_pw, career=C(["Lawyer","Legal Counsel","Notary"],5200000,"high"), competition=Co(58,42,None,548.0)),
    P("Manajemen","Fakultas Ekonomi dan Bisnis",60,2500,635,632,630, pathways=usu_pw, career=C(["Management Consultant","Business Analyst"],6000000,"high"), competition=Co(48,52,None,568.0)),
    P("Akuntansi","Fakultas Ekonomi dan Bisnis",55,2200,628,625,622, pathways=usu_pw, career=C(["Accountant","Auditor","Tax Consultant"],5500000,"high"), competition=Co(50,50,None,562.0)),
    P("Ilmu Ekonomi","Fakultas Ekonomi dan Bisnis",45,1400,605,602,600, pathways=usu_pw, career=C(["Economist","Policy Analyst"],5000000,"medium"), competition=Co(55,45,None,540.0)),
    P("Ilmu Komunikasi","Fakultas Ilmu Sosial dan Ilmu Politik",38,980,588,585,582, pathways=usu_pw, career=C(["PR Specialist","Journalist","Digital Marketer"],4800000,"medium"), competition=Co(55,45,None,530.0)),
    P("Psikologi","Fakultas Psikologi",35,820,608,605,602, pathways=usu_pw, career=C(["Psychologist","HR Specialist","Counselor"],4800000,"medium"), competition=Co(52,48,None,545.0)),
    P("Fisika","Fakultas MIPA",28,250,455,452,450, pathways=usu_pw, career=C(["Physicist","Research Scientist"],4200000,"low"), competition=Co(68,32,None,438.0)),
    P("Kimia","Fakultas MIPA",26,235,450,448,445, pathways=usu_pw, career=C(["Chemist","Lab Analyst"],4000000,"low"), competition=Co(70,30,None,432.0)),
    P("Biologi","Fakultas MIPA",28,270,455,452,450, pathways=usu_pw, career=C(["Biologist","Research Scientist"],3800000,"low"), competition=Co(68,32,None,438.0)),
    P("Agroteknologi","Fakultas Pertanian",35,320,432,430,428, pathways=usu_pw, career=C(["Agronomist","Agricultural Consultant"],3800000,"medium"), competition=Co(72,28,None,418.0)),
    P("Kehutanan","Fakultas Kehutanan",30,260,425,422,420, pathways=usu_pw, career=C(["Forest Engineer","Conservation Specialist"],4200000,"medium"), competition=Co(75,25,None,410.0)),
    P("Sastra Indonesia","Fakultas Ilmu Budaya",30,250,428,425,422, pathways=usu_pw, career=C(["Editor","Content Writer","Translator"],3800000,"low"), competition=Co(72,28,None,412.0)),
    P("Etnomusikologi","Fakultas Ilmu Budaya",22,140,405,402,400, pathways=usu_pw, career=C(["Ethnomusicologist","Cultural Researcher","Music Producer"],3500000,"low"), competition=Co(78,22,None,388.0)),
], std_sources("usu", "Universitas Sumatera Utara", "https://pmbmandiri.usu.ac.id"))

# ══════════════════════════════════════════════════════════════════
# Politeknik Pariwisata NHI Bandung (D4/Vokasi)
# ══════════════════════════════════════════════════════════════════
def vokasi_path(name, fee, spp, reqs, period, portal, note=None):
    return {"name": name, "type": "Vokasi", "capacity": None, "registration_fee": fee, "ukt_min": spp, "ukt_max": spp, "ukt_note": note or "Flat SPP model, not UKT bracket", "requirements": reqs, "open_period": period, "portal_url": portal, "source_tier": "third-party-affiliated"}

nhi_pw = [vokasi_path("Sipenmaru NHI", 300000, 8500000, ["Academic test","Skills/practical test","Interview","Health check"], "Mar-Jun", "https://poltekpar-bdg.ac.id", note="Flat SPP per semester under Kemenparekraf, not UKT bracket system")]
build_uni("poltekniknhi", "Politeknik Pariwisata NHI Bandung", "D4", "Sipenmaru NHI", "0-1000", "2024", [
    P("Administrasi Hotel","Jurusan Hospitaliti",45,580,475,472,470, program_type="D4", pathways=nhi_pw, career=C(["Hotel Manager","Front Office Manager","Hospitality Director","Revenue Manager"],5500000,"high"), competition=Co(40,60,None,450.0)),
    P("Manajemen Tata Boga","Jurusan Hospitaliti",35,420,458,455,452, program_type="D4", pathways=nhi_pw, career=C(["Executive Chef","F&B Manager","Culinary Director","Restaurant Manager"],5000000,"high"), competition=Co(42,58,None,438.0)),
    P("Manajemen Tata Hidangan","Jurusan Hospitaliti",30,320,445,442,440, program_type="D4", pathways=nhi_pw, career=C(["F&B Service Manager","Banquet Manager","Restaurant Supervisor"],4500000,"medium"), competition=Co(45,55,None,428.0)),
    P("Manajemen Kepariwisataan","Jurusan Kepariwisataan",40,520,468,465,462, program_type="D4", pathways=nhi_pw, career=C(["Tourism Manager","Destination Planner","Travel Consultant","Event Coordinator"],5000000,"high"), competition=Co(38,62,None,448.0)),
    P("Manajemen Bisnis Perjalanan","Jurusan Kepariwisataan",35,380,452,450,448, program_type="D4", pathways=nhi_pw, career=C(["Travel Manager","Tour Operator","OTA Manager"],4800000,"medium"), competition=Co(42,58,None,435.0)),
    P("Manajemen Konvensi dan Event","Jurusan Kepariwisataan",30,310,448,445,442, program_type="D4", pathways=nhi_pw, career=C(["MICE Manager","Event Planner","Convention Center Manager"],5200000,"high"), competition=Co(45,55,None,430.0)),
    P("Manajemen Destinasi Pariwisata","Jurusan Kepariwisataan",28,260,438,435,432, program_type="D4", pathways=nhi_pw, career=C(["Destination Manager","Ecotourism Specialist","Tourism Policy Analyst"],4500000,"medium"), competition=Co(48,52,None,422.0)),
    P("Seni Kuliner","Jurusan Hospitaliti",25,350,462,460,458, program_type="D4", pathways=nhi_pw, career=C(["Pastry Chef","Culinary Artist","Food Stylist","Catering Manager"],4800000,"medium"), competition=Co(38,62,None,445.0)),
], std_sources("poltekniknhi", "Politeknik Pariwisata NHI Bandung", "https://poltekpar-bdg.ac.id"))

# ══════════════════════════════════════════════════════════════════
# Politeknik Negeri Makassar (D4/Vokasi)
# ══════════════════════════════════════════════════════════════════
polmak_pw = [vokasi_path("SM Polimak", 250000, 6500000, ["Academic test","Portfolio/practical assessment","Health check"], "Mar-Jun", "https://polimakers.ac.id", note="Flat SPP per semester under Kemdikbud")]
build_uni("polmak", "Politeknik Negeri Makassar", "D4", "SM Polimak", "0-1000", "2024", [
    P("Teknik Mesin","Jurusan Teknik Mesin",35,320,458,455,452, program_type="D4", pathways=polmak_pw, career=C(["Mechanical Technician","Manufacturing Supervisor","Maintenance Engineer"],4500000,"medium"), competition=Co(75,25,None,435.0)),
    P("Teknik Elektro","Jurusan Teknik Elektro",32,290,452,450,448, program_type="D4", pathways=polmak_pw, career=C(["Electrical Technician","Power Systems Technician","PLC Programmer"],4500000,"medium"), competition=Co(78,22,None,432.0)),
    P("Teknik Sipil","Jurusan Teknik Sipil",35,310,448,445,442, program_type="D4", pathways=polmak_pw, career=C(["Civil Engineering Technician","Construction Supervisor"],4200000,"medium"), competition=Co(75,25,None,428.0)),
    P("Teknik Kimia","Jurusan Teknik Kimia",28,240,438,435,432, program_type="D4", pathways=polmak_pw, career=C(["Chemical Process Technician","Lab Technician","Quality Control"],4000000,"low"), competition=Co(78,22,None,420.0)),
    P("Administrasi Bisnis","Jurusan Administrasi Niaga",38,380,442,440,438, program_type="D4", pathways=polmak_pw, career=C(["Business Administrator","Office Manager","Administrative Coordinator"],4000000,"medium"), competition=Co(72,28,None,425.0)),
    P("Akuntansi","Jurusan Akuntansi",35,340,445,442,440, program_type="D4", pathways=polmak_pw, career=C(["Accountant","Bookkeeper","Tax Assistant"],4200000,"medium"), competition=Co(75,25,None,428.0)),
    P("Teknik Informatika","Jurusan Teknik Elektro",35,420,468,465,462, program_type="D4", pathways=polmak_pw, career=C(["Software Developer","IT Support Specialist","Web Developer"],5500000,"high"), competition=Co(68,32,None,448.0)),
    P("Teknik Multimedia dan Jaringan","Jurusan Teknik Elektro",30,350,458,455,452, program_type="D4", pathways=polmak_pw, career=C(["Network Engineer","Multimedia Developer","IT Infrastructure Specialist"],5000000,"high"), competition=Co(70,30,None,438.0)),
    P("Manajemen Pemasaran","Jurusan Administrasi Niaga",32,310,435,432,430, program_type="D4", pathways=polmak_pw, career=C(["Marketing Coordinator","Sales Manager","Digital Marketer"],4200000,"medium"), competition=Co(75,25,None,418.0)),
    P("Teknik Listrik","Jurusan Teknik Elektro",28,220,428,425,422, program_type="D4", pathways=polmak_pw, career=C(["Electrical Installer","Power Distribution Technician"],4000000,"medium"), competition=Co(80,20,None,410.0)),
], std_sources("polmak", "Politeknik Negeri Makassar", "https://polimakers.ac.id"))

print("[OK] Batch 3 done: USU, Politeknik NHI, Politeknik Makassar")
print("[OK] All 14 universities generated!")
