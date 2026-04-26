#!/usr/bin/env python3
"""Extension generator batch 2: UPI, UNAIR, UNHAS"""
import sys, os
sys.path.insert(0, os.path.dirname(__file__))
from generate_data_v2 import P, C, Co, build_uni, std_sources, snbp, snbt, mandiri_path

# ══════════════════════════════════════════════════════════════════
# UPI - Universitas Pendidikan Indonesia
# ══════════════════════════════════════════════════════════════════
upi_pw = [snbp(), snbt(), mandiri_path("SM UPI", 275000, 500000, 11000000, ["UTBK score or SM UPI exam","Max age 25"], "May-Jul", "https://pmb.upi.edu")]
build_uni("upi", "Universitas Pendidikan Indonesia", "S1", "SM UPI", "0-1000", "2024", [
    P("Pendidikan Guru Sekolah Dasar","Fakultas Ilmu Pendidikan",60,1800,568,565,562, pathways=upi_pw, career=C(["Elementary Teacher","Education Researcher","School Principal"],4200000,"high"), competition=Co(65,35,None,520.0)),
    P("Bimbingan dan Konseling","Fakultas Ilmu Pendidikan",35,620,535,532,530, pathways=upi_pw, career=C(["School Counselor","Career Counselor","Psychologist"],4500000,"medium"), competition=Co(60,40,None,505.0)),
    P("Pendidikan Luar Biasa","Fakultas Ilmu Pendidikan",30,320,488,485,482, pathways=upi_pw, career=C(["Special Education Teacher","Therapist"],4000000,"medium"), competition=Co(65,35,None,468.0)),
    P("Pendidikan Matematika","Fakultas Pendidikan MIPA",40,680,548,545,542, pathways=upi_pw, career=C(["Math Teacher","Education Researcher","Curriculum Developer"],4200000,"medium"), competition=Co(58,42,None,515.0)),
    P("Pendidikan Fisika","Fakultas Pendidikan MIPA",30,320,495,492,490, pathways=upi_pw, career=C(["Physics Teacher","Lab Instructor"],4000000,"low"), competition=Co(62,38,None,475.0)),
    P("Pendidikan Kimia","Fakultas Pendidikan MIPA",28,290,490,488,485, pathways=upi_pw, career=C(["Chemistry Teacher","Lab Instructor"],4000000,"low"), competition=Co(65,35,None,472.0)),
    P("Pendidikan Biologi","Fakultas Pendidikan MIPA",30,340,498,495,492, pathways=upi_pw, career=C(["Biology Teacher","Environmental Educator"],4000000,"low"), competition=Co(60,40,None,478.0)),
    P("Matematika","Fakultas Pendidikan MIPA",32,380,505,502,500, pathways=upi_pw, career=C(["Actuary","Data Analyst","Quantitative Analyst"],5500000,"medium"), competition=Co(55,45,None,485.0)),
    P("Kimia","Fakultas Pendidikan MIPA",28,260,478,475,472, pathways=upi_pw, career=C(["Chemist","Lab Analyst"],4500000,"low"), competition=Co(62,38,None,460.0)),
    P("Pendidikan Bahasa Inggris","Fakultas Pendidikan Bahasa dan Sastra",40,920,558,555,552, pathways=upi_pw, career=C(["English Teacher","Translator","Content Writer"],4500000,"medium"), competition=Co(55,45,None,525.0)),
    P("Pendidikan Bahasa Indonesia","Fakultas Pendidikan Bahasa dan Sastra",35,520,518,515,512, pathways=upi_pw, career=C(["Indonesian Teacher","Editor","Content Writer"],4000000,"low"), competition=Co(60,40,None,495.0)),
    P("Manajemen","Fakultas Pendidikan Ekonomi dan Bisnis",45,1500,598,595,592, pathways=upi_pw, career=C(["Management Trainee","Business Analyst"],5500000,"medium"), competition=Co(48,52,None,545.0)),
    P("Akuntansi","Fakultas Pendidikan Ekonomi dan Bisnis",40,1200,588,585,582, pathways=upi_pw, career=C(["Accountant","Auditor"],5200000,"medium"), competition=Co(50,50,None,535.0)),
    P("Pendidikan Ekonomi","Fakultas Pendidikan Ekonomi dan Bisnis",35,480,512,510,508, pathways=upi_pw, career=C(["Economics Teacher","Education Researcher"],4200000,"low"), competition=Co(58,42,None,490.0)),
    P("Ilmu Komunikasi","Fakultas Pendidikan Ilmu Pengetahuan Sosial",38,780,542,540,538, pathways=upi_pw, career=C(["PR Specialist","Journalist","Digital Marketer"],5000000,"medium"), competition=Co(52,48,None,515.0)),
    P("Pendidikan Jasmani","Fakultas Pendidikan Olahraga dan Kesehatan",40,580,478,475,472, pathways=upi_pw, career=C(["PE Teacher","Sports Coach","Athletic Trainer"],3800000,"low"), competition=Co(65,35,None,458.0)),
    P("Ilmu Komputer","Fakultas Pendidikan MIPA",35,620,548,545,542, pathways=upi_pw, career=C(["Software Engineer","Data Scientist"],6500000,"high"), competition=Co(48,52,None,520.0)),
    P("Pendidikan Teknik Mesin","Fakultas Pendidikan Teknologi dan Kejuruan",28,280,475,472,470, pathways=upi_pw, career=C(["Vocational Teacher","Technical Trainer"],4000000,"low"), competition=Co(65,35,None,455.0)),
    P("Desain Komunikasi Visual","Fakultas Pendidikan Seni dan Desain",30,520,535,532,530, pathways=upi_pw, career=C(["Graphic Designer","UX Designer","Art Director"],5000000,"medium"), competition=Co(50,50,None,505.0)),
    P("Pendidikan Sejarah","Fakultas Pendidikan Ilmu Pengetahuan Sosial",28,280,468,465,462, pathways=upi_pw, career=C(["History Teacher","Archivist","Cultural Researcher"],3800000,"low"), competition=Co(65,35,None,450.0)),
], std_sources("upi", "Universitas Pendidikan Indonesia", "https://pmb.upi.edu"))

# ══════════════════════════════════════════════════════════════════
# UNAIR - Universitas Airlangga
# ══════════════════════════════════════════════════════════════════
unair_pw = [snbp(), snbt(), mandiri_path("Mandiri Unair", 350000, 500000, 14500000, ["UTBK score or Mandiri Unair exam","Max age 25"], "May-Jul", "https://ppmb.unair.ac.id")]
build_uni("unair", "Universitas Airlangga", "S1", "Mandiri Unair", "0-1000", "2024", [
    P("Pendidikan Dokter","Fakultas Kedokteran",70,5600,742,745,748, pathways=unair_pw, career=C(["Medical Doctor","Specialist Physician","Medical Researcher"],8000000,"high"), competition=Co(40,60,None,690.0)),
    P("Pendidikan Dokter Gigi","Fakultas Kedokteran Gigi",35,1400,698,695,692, pathways=unair_pw, career=C(["Dentist","Orthodontist","Oral Surgeon"],7500000,"high"), competition=Co(42,58,None,635.0)),
    P("Farmasi","Fakultas Farmasi",45,1100,618,615,612, pathways=unair_pw, career=C(["Pharmacist","Pharmaceutical Researcher","Drug Regulatory Specialist"],5500000,"high"), competition=Co(45,55,None,558.0)),
    P("Ilmu Keperawatan","Fakultas Keperawatan",40,520,512,510,508, pathways=unair_pw, career=C(["Nurse","Healthcare Manager"],4500000,"high"), competition=Co(55,45,None,488.0)),
    P("Kesehatan Masyarakat","Fakultas Kesehatan Masyarakat",42,720,538,535,532, pathways=unair_pw, career=C(["Public Health Officer","Epidemiologist"],4800000,"medium"), competition=Co(55,45,None,508.0)),
    P("Kedokteran Hewan","Fakultas Kedokteran Hewan",35,620,572,570,568, pathways=unair_pw, career=C(["Veterinarian","Animal Health Specialist"],5000000,"medium"), competition=Co(50,50,None,530.0)),
    P("Manajemen","Fakultas Ekonomi dan Bisnis",65,3000,645,642,640, pathways=unair_pw, career=C(["Management Consultant","Business Analyst","Financial Analyst"],6500000,"high"), competition=Co(40,60,None,578.0)),
    P("Akuntansi","Fakultas Ekonomi dan Bisnis",60,2700,640,638,635, pathways=unair_pw, career=C(["Accountant","Auditor","Tax Consultant"],6000000,"high"), competition=Co(42,58,None,572.0)),
    P("Ilmu Ekonomi","Fakultas Ekonomi dan Bisnis",50,1800,618,615,612, pathways=unair_pw, career=C(["Economist","Policy Analyst","Banking Professional"],5500000,"medium"), competition=Co(48,52,None,555.0)),
    P("Ilmu Hukum","Fakultas Hukum",70,2100,622,620,618, pathways=unair_pw, career=C(["Lawyer","Legal Counsel","Notary","Judge"],5500000,"high"), competition=Co(50,50,None,555.0)),
    P("Psikologi","Fakultas Psikologi",45,1500,632,630,628, pathways=unair_pw, career=C(["Psychologist","HR Specialist","Counselor"],5200000,"high"), competition=Co(45,55,None,568.0)),
    P("Ilmu Komunikasi","Fakultas Ilmu Sosial dan Ilmu Politik",40,1400,625,622,620, pathways=unair_pw, career=C(["PR Specialist","Journalist","Digital Marketer"],5000000,"medium"), competition=Co(48,52,None,558.0)),
    P("Hubungan Internasional","Fakultas Ilmu Sosial dan Ilmu Politik",35,820,608,605,602, pathways=unair_pw, career=C(["Diplomat","International Relations Analyst"],5200000,"medium"), competition=Co(48,52,None,548.0)),
    P("Administrasi Negara","Fakultas Ilmu Sosial dan Ilmu Politik",38,620,565,562,560, pathways=unair_pw, career=C(["Public Administrator","Government Official"],4800000,"medium"), competition=Co(55,45,None,525.0)),
    P("Sosiologi","Fakultas Ilmu Sosial dan Ilmu Politik",30,380,515,512,510, pathways=unair_pw, career=C(["Social Researcher","Policy Analyst"],4200000,"low"), competition=Co(58,42,None,492.0)),
    P("Fisika","Fakultas Sains dan Teknologi",28,270,462,460,458, pathways=unair_pw, career=C(["Physicist","Research Scientist"],4500000,"low"), competition=Co(62,38,None,445.0)),
    P("Kimia","Fakultas Sains dan Teknologi",26,250,458,455,452, pathways=unair_pw, career=C(["Chemist","Lab Analyst"],4200000,"low"), competition=Co(65,35,None,440.0)),
    P("Biologi","Fakultas Sains dan Teknologi",28,280,460,458,455, pathways=unair_pw, career=C(["Biologist","Research Scientist"],4000000,"low"), competition=Co(62,38,None,442.0)),
    P("Matematika","Fakultas Sains dan Teknologi",30,360,485,482,480, pathways=unair_pw, career=C(["Actuary","Data Analyst"],5200000,"medium"), competition=Co(58,42,None,468.0)),
    P("Teknik Informatika","Fakultas Sains dan Teknologi",42,1600,645,642,640, pathways=unair_pw, career=C(["Software Engineer","Data Scientist","Web Developer"],7000000,"high"), competition=Co(42,58,None,578.0)),
    P("Sastra Indonesia","Fakultas Ilmu Budaya",30,260,435,432,430, pathways=unair_pw, career=C(["Editor","Content Writer","Translator"],3800000,"low"), competition=Co(62,38,None,420.0)),
    P("Sastra Inggris","Fakultas Ilmu Budaya",32,380,478,475,472, pathways=unair_pw, career=C(["Translator","Content Writer","Language Instructor"],4200000,"low"), competition=Co(55,45,None,458.0)),
    P("Ilmu Sejarah","Fakultas Ilmu Budaya",25,190,420,418,415, pathways=unair_pw, career=C(["Historian","Archivist","Museum Curator"],3800000,"low"), competition=Co(65,35,None,405.0)),
    P("Teknologi Sains Data","Fakultas Sains dan Teknologi",30,520,548,545,542, pathways=unair_pw, career=C(["Data Scientist","ML Engineer","Data Analyst"],7500000,"high"), competition=Co(42,58,None,520.0)),
    P("Gizi","Fakultas Kesehatan Masyarakat",32,420,518,515,512, pathways=unair_pw, career=C(["Nutritionist","Dietitian","Food Safety Specialist"],4500000,"medium"), competition=Co(55,45,None,495.0)),
], std_sources("unair", "Universitas Airlangga", "https://ppmb.unair.ac.id"))

# ══════════════════════════════════════════════════════════════════
# UNHAS - Universitas Hasanuddin
# ══════════════════════════════════════════════════════════════════
unhas_pw = [snbp(), snbt(), mandiri_path("SM Unhas", 275000, 500000, 11500000, ["UTBK score or SM Unhas exam","Max age 25"], "May-Jul", "https://admission.unhas.ac.id")]
build_uni("unhas", "Universitas Hasanuddin", "S1", "SM Unhas", "0-1000", "2024", [
    P("Teknik Sipil","Fakultas Teknik",38,780,598,595,592, pathways=unhas_pw, career=C(["Civil Engineer","Construction Manager"],4800000,"medium"), competition=Co(70,30,None,530.0)),
    P("Teknik Mesin","Fakultas Teknik",35,680,592,590,588, pathways=unhas_pw, career=C(["Mechanical Engineer","Manufacturing Engineer"],4800000,"medium"), competition=Co(68,32,None,525.0)),
    P("Teknik Elektro","Fakultas Teknik",32,620,605,602,600, pathways=unhas_pw, career=C(["Electrical Engineer","Telecom Engineer"],5200000,"medium"), competition=Co(65,35,None,540.0)),
    P("Teknik Informatika","Fakultas Teknik",40,1400,635,632,630, pathways=unhas_pw, career=C(["Software Engineer","Data Scientist","Web Developer"],6500000,"high"), competition=Co(55,45,None,570.0)),
    P("Teknik Perkapalan","Fakultas Teknik",28,380,528,525,522, pathways=unhas_pw, career=C(["Naval Architect","Marine Engineer"],5200000,"medium"), competition=Co(68,32,None,502.0)),
    P("Arsitektur","Fakultas Teknik",28,480,568,565,562, pathways=unhas_pw, career=C(["Architect","Urban Designer"],5000000,"medium"), competition=Co(62,38,None,520.0)),
    P("Pendidikan Dokter","Fakultas Kedokteran",55,4200,728,730,732, pathways=unhas_pw, career=C(["Medical Doctor","Specialist Physician"],7500000,"high"), competition=Co(55,45,None,670.0)),
    P("Ilmu Keperawatan","Fakultas Keperawatan",35,420,498,495,492, pathways=unhas_pw, career=C(["Nurse","Healthcare Manager"],4200000,"high"), competition=Co(68,32,None,475.0)),
    P("Farmasi","Fakultas Farmasi",38,720,578,575,572, pathways=unhas_pw, career=C(["Pharmacist","Pharmaceutical Researcher"],5000000,"high"), competition=Co(60,40,None,530.0)),
    P("Ilmu Hukum","Fakultas Hukum",65,1800,608,605,602, pathways=unhas_pw, career=C(["Lawyer","Legal Counsel","Notary"],5200000,"high"), competition=Co(62,38,None,545.0)),
    P("Manajemen","Fakultas Ekonomi dan Bisnis",55,2200,628,625,622, pathways=unhas_pw, career=C(["Management Consultant","Business Analyst"],6000000,"high"), competition=Co(55,45,None,562.0)),
    P("Akuntansi","Fakultas Ekonomi dan Bisnis",50,1900,622,620,618, pathways=unhas_pw, career=C(["Accountant","Auditor","Tax Consultant"],5500000,"high"), competition=Co(58,42,None,555.0)),
    P("Ilmu Komunikasi","Fakultas Ilmu Sosial dan Ilmu Politik",35,980,595,592,590, pathways=unhas_pw, career=C(["PR Specialist","Journalist","Digital Marketer"],4800000,"medium"), competition=Co(58,42,None,535.0)),
    P("Administrasi Publik","Fakultas Ilmu Sosial dan Ilmu Politik",35,520,548,545,542, pathways=unhas_pw, career=C(["Public Administrator","Government Official"],4500000,"medium"), competition=Co(65,35,None,515.0)),
    P("Hubungan Internasional","Fakultas Ilmu Sosial dan Ilmu Politik",30,580,572,570,568, pathways=unhas_pw, career=C(["Diplomat","International Relations Analyst"],5000000,"medium"), competition=Co(60,40,None,530.0)),
    P("Ilmu Kelautan","Fakultas Ilmu Kelautan dan Perikanan",30,280,465,462,460, pathways=unhas_pw, career=C(["Marine Scientist","Ocean Researcher"],4500000,"medium"), competition=Co(72,28,None,445.0)),
    P("Perikanan","Fakultas Ilmu Kelautan dan Perikanan",28,250,455,452,450, pathways=unhas_pw, career=C(["Fisheries Manager","Aquaculture Specialist"],4000000,"low"), competition=Co(75,25,None,438.0)),
    P("Agribisnis","Fakultas Pertanian",35,340,445,442,440, pathways=unhas_pw, career=C(["Agribusiness Manager","Agricultural Economist"],4000000,"medium"), competition=Co(72,28,None,428.0)),
    P("Agroteknologi","Fakultas Pertanian",32,300,438,435,432, pathways=unhas_pw, career=C(["Agronomist","Agricultural Consultant"],3800000,"low"), competition=Co(75,25,None,420.0)),
    P("Kehutanan","Fakultas Kehutanan",30,260,432,430,428, pathways=unhas_pw, career=C(["Forest Engineer","Conservation Specialist"],4200000,"medium"), competition=Co(75,25,None,418.0)),
    P("Psikologi","Fakultas Kedokteran",35,780,588,585,582, pathways=unhas_pw, career=C(["Psychologist","HR Specialist","Counselor"],4800000,"medium"), competition=Co(58,42,None,530.0)),
    P("Fisika","Fakultas MIPA",28,240,452,450,448, pathways=unhas_pw, career=C(["Physicist","Research Scientist"],4200000,"low"), competition=Co(72,28,None,435.0)),
], std_sources("unhas", "Universitas Hasanuddin", "https://admission.unhas.ac.id"))

print("[OK] Batch 2 done: UPI, UNAIR, UNHAS")
