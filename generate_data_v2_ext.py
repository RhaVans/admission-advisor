#!/usr/bin/env python3
"""Extension generator for 9 new universities - imports helpers from generate_data_v2."""
import sys, os
sys.path.insert(0, os.path.dirname(__file__))
from generate_data_v2 import P, C, Co, build_uni, std_sources, snbp, snbt, mandiri_path, career, competition

# ══════════════════════════════════════════════════════════════════
# UB - Universitas Brawijaya
# ══════════════════════════════════════════════════════════════════
ub_pw = [snbp(), snbt(), mandiri_path("Selma UB", 300000, 500000, 13000000, ["UTBK score or Selma UB exam","Max age 25"], "May-Jul", "https://selma.ub.ac.id")]
build_uni("ub", "Universitas Brawijaya", "S1", "Selma UB", "0-1000", "2024", [
    P("Teknik Sipil","Fakultas Teknik",40,980,615,612,610, pathways=ub_pw, career=C(["Civil Engineer","Construction Manager"],5000000,"medium"), competition=Co(55,45,None,545.0)),
    P("Teknik Mesin","Fakultas Teknik",38,920,608,605,602, pathways=ub_pw, career=C(["Mechanical Engineer","Manufacturing Engineer"],5200000,"medium"), competition=Co(52,48,None,540.0)),
    P("Teknik Elektro","Fakultas Teknik",35,850,622,620,618, pathways=ub_pw, career=C(["Electrical Engineer","Telecom Engineer"],5500000,"medium"), competition=Co(50,50,None,555.0)),
    P("Teknik Informatika","Fakultas Ilmu Komputer",45,2100,658,655,652, pathways=ub_pw, career=C(["Software Engineer","Data Scientist","Web Developer"],7000000,"high"), competition=Co(40,60,None,590.0)),
    P("Sistem Informasi","Fakultas Ilmu Komputer",40,1500,635,632,630, pathways=ub_pw, career=C(["IT Consultant","Business Analyst","Systems Analyst"],6500000,"high"), competition=Co(42,58,None,570.0)),
    P("Pendidikan Dokter","Fakultas Kedokteran",65,5200,735,738,740, pathways=ub_pw, career=C(["Medical Doctor","Specialist Physician"],7500000,"high"), competition=Co(45,55,None,680.0)),
    P("Ilmu Hukum","Fakultas Hukum",85,2400,618,615,612, pathways=ub_pw, career=C(["Lawyer","Legal Counsel","Notary"],5500000,"high"), competition=Co(50,50,None,555.0)),
    P("Manajemen","Fakultas Ekonomi dan Bisnis",70,3100,648,645,642, pathways=ub_pw, career=C(["Management Consultant","Business Analyst"],6500000,"high"), competition=Co(42,58,None,580.0)),
    P("Akuntansi","Fakultas Ekonomi dan Bisnis",65,2800,642,640,638, pathways=ub_pw, career=C(["Accountant","Auditor","Tax Consultant"],6000000,"high"), competition=Co(44,56,None,575.0)),
    P("Ilmu Ekonomi","Fakultas Ekonomi dan Bisnis",55,1800,625,622,620, pathways=ub_pw, career=C(["Economist","Policy Analyst"],5500000,"medium"), competition=Co(48,52,None,560.0)),
    P("Ilmu Komunikasi","Fakultas Ilmu Sosial dan Ilmu Politik",42,1650,632,630,628, pathways=ub_pw, career=C(["PR Specialist","Journalist","Digital Marketer"],5000000,"medium"), competition=Co(48,52,None,565.0)),
    P("Administrasi Publik","Fakultas Ilmu Administrasi",45,1200,608,605,602, pathways=ub_pw, career=C(["Public Administrator","Government Official"],4800000,"medium"), competition=Co(52,48,None,545.0)),
    P("Fisika","Fakultas MIPA",30,280,462,460,458, pathways=ub_pw, career=C(["Physicist","Research Scientist"],4500000,"low"), competition=Co(60,40,None,445.0)),
    P("Kimia","Fakultas MIPA",28,260,458,455,452, pathways=ub_pw, career=C(["Chemist","Lab Analyst"],4200000,"low"), competition=Co(62,38,None,440.0)),
    P("Matematika","Fakultas MIPA",32,380,478,475,472, pathways=ub_pw, career=C(["Actuary","Data Analyst"],5000000,"medium"), competition=Co(55,45,None,460.0)),
    P("Biologi","Fakultas MIPA",28,290,460,458,455, pathways=ub_pw, career=C(["Biologist","Research Scientist"],4000000,"low"), competition=Co(60,40,None,442.0)),
    P("Agribisnis","Fakultas Pertanian",40,380,432,430,428, pathways=ub_pw, career=C(["Agribusiness Manager","Agricultural Economist"],4200000,"medium"), competition=Co(65,35,None,418.0)),
    P("Agroteknologi","Fakultas Pertanian",38,350,428,425,422, pathways=ub_pw, career=C(["Agronomist","Agricultural Consultant"],4000000,"medium"), competition=Co(68,32,None,412.0)),
    P("Peternakan","Fakultas Peternakan",35,270,418,415,412, pathways=ub_pw, career=C(["Animal Scientist","Livestock Manager"],3800000,"low"), competition=Co(70,30,None,405.0)),
    P("Perikanan","Fakultas Perikanan dan Ilmu Kelautan",30,240,412,410,408, pathways=ub_pw, career=C(["Fisheries Manager","Aquaculture Specialist"],3800000,"low"), competition=Co(72,28,None,398.0)),
    P("Farmasi","Fakultas Kedokteran",40,980,612,610,608, pathways=ub_pw, career=C(["Pharmacist","Pharmaceutical Researcher"],5200000,"high"), competition=Co(48,52,None,550.0)),
    P("Ilmu Keperawatan","Fakultas Kedokteran",38,480,505,502,500, pathways=ub_pw, career=C(["Nurse","Healthcare Manager"],4200000,"high"), competition=Co(55,45,None,480.0)),
    P("Psikologi","Fakultas Ilmu Sosial dan Ilmu Politik",42,1400,628,625,622, pathways=ub_pw, career=C(["Psychologist","HR Specialist","Counselor"],5000000,"high"), competition=Co(45,55,None,565.0)),
    P("Sastra Indonesia","Fakultas Ilmu Budaya",30,260,430,428,425, pathways=ub_pw, career=C(["Editor","Content Writer","Translator"],3800000,"low"), competition=Co(65,35,None,415.0)),
    P("Teknologi Pangan","Fakultas Teknologi Pertanian",32,340,455,452,450, pathways=ub_pw, career=C(["Food Technologist","Quality Assurance"],4500000,"medium"), competition=Co(58,42,None,438.0)),
], std_sources("ub", "Universitas Brawijaya", "https://selma.ub.ac.id"))

# ══════════════════════════════════════════════════════════════════
# UPN Veteran Yogyakarta
# ══════════════════════════════════════════════════════════════════
upn_pw = [snbp(), snbt(), mandiri_path("SMM UPN", 250000, 500000, 10000000, ["UTBK score or SMM UPN exam","Max age 25"], "May-Jul", "https://smm.upnyk.ac.id", note="Semi-public (ex-kedinasan) may have different fee structure")]
build_uni("upn_jogja", "UPN Veteran Yogyakarta", "S1", "SMM UPN", "0-1000", "2024", [
    P("Teknik Pertambangan","Fakultas Teknologi Mineral",30,420,525,522,518, pathways=upn_pw, career=C(["Mining Engineer","Resource Geologist","Mine Planner"],6500000,"high"), competition=Co(55,45,None,500.0), data_conf="low"),
    P("Teknik Perminyakan","Fakultas Teknologi Mineral",28,380,535,532,528, pathways=upn_pw, career=C(["Petroleum Engineer","Reservoir Engineer"],7000000,"medium"), competition=Co(52,48,None,510.0), data_conf="low"),
    P("Teknik Lingkungan","Fakultas Teknologi Mineral",28,320,498,495,492, pathways=upn_pw, career=C(["Environmental Engineer","Sustainability Consultant"],5000000,"medium"), competition=Co(58,42,None,478.0), data_conf="low"),
    P("Teknik Geologi","Fakultas Teknologi Mineral",25,290,505,502,498, pathways=upn_pw, career=C(["Geologist","Mining Consultant"],5500000,"medium"), competition=Co(55,45,None,482.0), data_conf="low"),
    P("Teknik Kimia","Fakultas Teknik Industri",30,380,512,510,508, pathways=upn_pw, career=C(["Chemical Engineer","Process Engineer"],5200000,"medium"), competition=Co(52,48,None,490.0), data_conf="low"),
    P("Teknik Industri","Fakultas Teknik Industri",35,520,535,532,530, pathways=upn_pw, career=C(["Industrial Engineer","Operations Manager"],5800000,"medium"), competition=Co(48,52,None,510.0), data_conf="low"),
    P("Teknik Informatika","Fakultas Teknik Industri",35,680,548,545,542, pathways=upn_pw, career=C(["Software Engineer","Web Developer"],6500000,"high"), competition=Co(45,55,None,520.0), data_conf="low"),
    P("Ilmu Hukum","Fakultas Hukum",45,620,505,502,500, pathways=upn_pw, career=C(["Lawyer","Legal Counsel","Notary"],5000000,"medium"), competition=Co(58,42,None,482.0), data_conf="low"),
    P("Ilmu Komunikasi","Fakultas Ilmu Sosial dan Ilmu Politik",35,520,518,515,512, pathways=upn_pw, career=C(["PR Specialist","Journalist"],4800000,"medium"), competition=Co(55,45,None,495.0), data_conf="low"),
    P("Hubungan Internasional","Fakultas Ilmu Sosial dan Ilmu Politik",30,480,528,525,522, pathways=upn_pw, career=C(["Diplomat","International Relations Analyst"],5200000,"medium"), competition=Co(52,48,None,505.0), data_conf="low"),
    P("Administrasi Bisnis","Fakultas Ilmu Sosial dan Ilmu Politik",35,450,498,495,492, pathways=upn_pw, career=C(["Business Administrator","Management Trainee"],4800000,"medium"), competition=Co(55,45,None,478.0), data_conf="low"),
    P("Ekonomi Pembangunan","Fakultas Ekonomi dan Bisnis",32,380,488,485,482, pathways=upn_pw, career=C(["Economist","Policy Analyst"],4500000,"low"), competition=Co(58,42,None,470.0), data_conf="low"),
    P("Manajemen","Fakultas Ekonomi dan Bisnis",40,580,522,520,518, pathways=upn_pw, career=C(["Management Consultant","Business Analyst"],5500000,"medium"), competition=Co(50,50,None,500.0), data_conf="low"),
    P("Akuntansi","Fakultas Ekonomi dan Bisnis",38,520,515,512,510, pathways=upn_pw, career=C(["Accountant","Auditor"],5200000,"medium"), competition=Co(52,48,None,495.0), data_conf="low"),
    P("Agribisnis","Fakultas Pertanian",30,240,445,442,440, pathways=upn_pw, career=C(["Agribusiness Manager","Agricultural Economist"],4000000,"low"), competition=Co(65,35,None,428.0), data_conf="low"),
    P("Agroteknologi","Fakultas Pertanian",28,210,438,435,432, pathways=upn_pw, career=C(["Agronomist","Agricultural Consultant"],3800000,"low"), competition=Co(68,32,None,420.0), data_conf="low"),
    P("Teknik Geofisika","Fakultas Teknologi Mineral",22,180,488,485,482, pathways=upn_pw, career=C(["Geophysicist","Seismic Analyst"],5500000,"medium"), competition=Co(58,42,None,470.0), data_conf="low"),
    P("Teknik Sipil","Fakultas Teknik Industri",32,420,508,505,502, pathways=upn_pw, career=C(["Civil Engineer","Construction Manager"],5000000,"medium"), competition=Co(55,45,None,488.0), data_conf="low"),
], std_sources("upn_jogja", "UPN Veteran Yogyakarta", "https://smm.upnyk.ac.id"))

# ══════════════════════════════════════════════════════════════════
# UNDIP - Universitas Diponegoro
# ══════════════════════════════════════════════════════════════════
undip_pw = [snbp(), snbt(), mandiri_path("UM Undip", 300000, 500000, 13500000, ["UTBK score or UM Undip exam","Max age 25"], "May-Jul", "https://um.undip.ac.id")]
build_uni("undip", "Universitas Diponegoro", "S1", "UM Undip", "0-1000", "2024", [
    P("Teknik Sipil","Fakultas Teknik",40,1050,628,625,622, pathways=undip_pw, career=C(["Civil Engineer","Construction Manager"],5200000,"medium"), competition=Co(60,40,None,555.0)),
    P("Teknik Mesin","Fakultas Teknik",38,950,622,620,618, pathways=undip_pw, career=C(["Mechanical Engineer","Manufacturing Engineer"],5200000,"medium"), competition=Co(58,42,None,550.0)),
    P("Teknik Elektro","Fakultas Teknik",35,880,635,632,630, pathways=undip_pw, career=C(["Electrical Engineer","Power Systems Engineer"],5500000,"medium"), competition=Co(55,45,None,565.0)),
    P("Teknik Informatika","Fakultas Teknik",42,1800,652,650,648, pathways=undip_pw, career=C(["Software Engineer","Data Scientist","Web Developer"],7000000,"high"), competition=Co(45,55,None,585.0)),
    P("Teknik Kimia","Fakultas Teknik",35,780,612,610,608, pathways=undip_pw, career=C(["Chemical Engineer","Process Engineer"],5500000,"medium"), competition=Co(55,45,None,548.0)),
    P("Arsitektur","Fakultas Teknik",30,620,598,595,592, pathways=undip_pw, career=C(["Architect","Urban Designer"],5200000,"medium"), competition=Co(55,45,None,540.0)),
    P("Teknik Perkapalan","Fakultas Teknik",32,580,568,565,562, pathways=undip_pw, career=C(["Naval Architect","Marine Engineer"],5500000,"medium"), competition=Co(58,42,None,530.0)),
    P("Pendidikan Dokter","Fakultas Kedokteran",60,4800,738,740,742, pathways=undip_pw, career=C(["Medical Doctor","Specialist Physician"],7500000,"high"), competition=Co(50,50,None,680.0)),
    P("Kesehatan Masyarakat","Fakultas Kesehatan Masyarakat",45,780,545,542,540, pathways=undip_pw, career=C(["Public Health Officer","Epidemiologist","Health Policy Analyst"],4800000,"medium"), competition=Co(60,40,None,510.0)),
    P("Ilmu Kelautan","Fakultas Perikanan dan Ilmu Kelautan",30,320,478,475,472, pathways=undip_pw, career=C(["Marine Scientist","Ocean Researcher","Fisheries Manager"],4500000,"medium"), competition=Co(65,35,None,458.0)),
    P("Perikanan","Fakultas Perikanan dan Ilmu Kelautan",28,280,465,462,460, pathways=undip_pw, career=C(["Fisheries Manager","Aquaculture Specialist"],4000000,"low"), competition=Co(68,32,None,448.0)),
    P("Ilmu Hukum","Fakultas Hukum",75,2200,625,622,620, pathways=undip_pw, career=C(["Lawyer","Legal Counsel","Notary"],5500000,"high"), competition=Co(55,45,None,558.0)),
    P("Manajemen","Fakultas Ekonomika dan Bisnis",60,2600,642,640,638, pathways=undip_pw, career=C(["Management Consultant","Business Analyst"],6500000,"high"), competition=Co(48,52,None,575.0)),
    P("Akuntansi","Fakultas Ekonomika dan Bisnis",55,2400,638,635,632, pathways=undip_pw, career=C(["Accountant","Auditor","Tax Consultant"],6000000,"high"), competition=Co(50,50,None,570.0)),
    P("Ilmu Komunikasi","Fakultas Ilmu Sosial dan Ilmu Politik",40,1400,622,620,618, pathways=undip_pw, career=C(["PR Specialist","Journalist","Digital Marketer"],5000000,"medium"), competition=Co(52,48,None,555.0)),
    P("Administrasi Publik","Fakultas Ilmu Sosial dan Ilmu Politik",38,680,565,562,560, pathways=undip_pw, career=C(["Public Administrator","Government Official"],4800000,"medium"), competition=Co(58,42,None,525.0)),
    P("Psikologi","Fakultas Psikologi",40,1200,618,615,612, pathways=undip_pw, career=C(["Psychologist","HR Specialist","Counselor"],5000000,"high"), competition=Co(50,50,None,555.0)),
    P("Fisika","Fakultas Sains dan Matematika",30,280,462,460,458, pathways=undip_pw, career=C(["Physicist","Research Scientist"],4500000,"low"), competition=Co(62,38,None,445.0)),
    P("Kimia","Fakultas Sains dan Matematika",28,265,458,455,452, pathways=undip_pw, career=C(["Chemist","Lab Analyst"],4200000,"low"), competition=Co(65,35,None,440.0)),
    P("Biologi","Fakultas Sains dan Matematika",28,290,460,458,455, pathways=undip_pw, career=C(["Biologist","Environmental Consultant"],4000000,"low"), competition=Co(62,38,None,442.0)),
    P("Statistika","Fakultas Sains dan Matematika",32,420,498,495,492, pathways=undip_pw, career=C(["Statistician","Data Scientist"],5800000,"medium"), competition=Co(55,45,None,478.0)),
    P("Farmasi","Fakultas Kedokteran",38,850,605,602,600, pathways=undip_pw, career=C(["Pharmacist","Pharmaceutical Researcher"],5200000,"high"), competition=Co(52,48,None,545.0)),
], std_sources("undip", "Universitas Diponegoro", "https://um.undip.ac.id"))

print("[OK] Batch 1 done: UB, UPN Jogja, UNDIP")
