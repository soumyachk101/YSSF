import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient({
  datasourceUrl: process.env.DATABASE_URL,
});

function hashPassword(password: string): string {
  return bcrypt.hashSync(password, 10);
}

const CAMPAIGNS = [
  { id: "1", slug: "green-canopy-project", title: "Green Canopy Project", category: "Environment", description: "Our target is planting 20,000 native saplings in Bankura to establish organic corridors.", fullDescription: "The Green Canopy Project is our flagship environmental initiative aimed at reforesting degraded lands across the Bankura district of West Bengal.", raised: 325000, goal: 500000, imageSrc: "/Assets/Basic_Workflow.png", accentClass: "text-primary-900", progressColor: "bg-primary-900", status: "active" },
  { id: "2", slug: "sakti-blood-directory", title: "Sakti Blood Directory", category: "Healthcare", description: "Developing a custom web dashboard to match emergency donors with local hospital units in real-time.", fullDescription: "The Sakti Blood Directory combines technology with grassroots healthcare.", raised: 185000, goal: 300000, imageSrc: "/Assets/Ecosystems.png", accentClass: "text-alert-500", progressColor: "bg-alert-500", status: "active" },
  { id: "3", slug: "sakti-scholar-centers", title: "Sakti Scholar Centers", category: "Education", description: "Setting up modern learning centers in disadvantaged communities.", fullDescription: "Sakti Scholar Centers establish safe, modern learning spaces in underserved communities.", raised: 150000, goal: 400000, imageSrc: "/Assets/Workflows.png", accentClass: "text-accent-600", progressColor: "bg-accent-500", status: "active" },
  { id: "4", slug: "community-sanitation-drive", title: "Community Sanitation Drive", category: "Environment", description: "Organizing neighborhood cleanups and hygiene awareness campaigns.", fullDescription: "Our Community Sanitation Drive tackles waste management and public hygiene.", raised: 95000, goal: 200000, imageSrc: "/Assets/st_michale_01.png", accentClass: "text-primary-700", progressColor: "bg-primary-700", status: "active" },
  { id: "5", slug: "youth-mentorship-program", title: "Youth Mentorship Program", category: "Education", description: "Connecting experienced professionals with young students for career guidance.", fullDescription: "The Youth Mentorship Program pairs college students with school students from underserved communities.", raised: 80000, goal: 250000, imageSrc: "/Assets/st_peters_01.png", accentClass: "text-warning-500", progressColor: "bg-warning-500", status: "active" },
  { id: "6", slug: "emergency-response-network", title: "Emergency Response Network", category: "Healthcare", description: "Building a trained volunteer network for disaster relief and medical emergencies.", fullDescription: "The Emergency Response Network trains volunteer teams in first aid and disaster preparedness.", raised: 210000, goal: 350000, imageSrc: "/Assets/narayana_01.png", accentClass: "text-alert-500", progressColor: "bg-alert-500", status: "active" },
];

const EVENTS = [
  { id: "1", slug: "eco-restoration-plantation-drive", title: "Eco-Restoration Plantation Drive", date: "June 05, 2026", time: "09:00 AM - 01:00 PM", location: "Barjora, Bankura District", schoolPartner: "Barjora High School", description: "Planting 1,000+ native saplings.", fullDescription: "Join us for our flagship environmental restoration event.", imageSrc: "/Assets/Borjora_HS_01.png", badge: "Environment", badgeColor: "bg-primary-900 text-white border-primary-400", category: "Environment", status: "upcoming" },
  { id: "2", slug: "sakti-life-saving-blood-camp", title: "Sakti Life-Saving Blood Camp", date: "June 14, 2026", time: "10:00 AM - 04:00 PM", location: "Narayana Healthcare Center, Kolkata", schoolPartner: "Narayana Group", description: "Annual blood collection drive.", fullDescription: "Our annual blood donation camp brings together healthcare professionals.", imageSrc: "/Assets/narayana_01.png", badge: "Health Camp", badgeColor: "bg-alert-500 text-white border-alert-500", category: "Healthcare", status: "upcoming" },
  { id: "3", slug: "dps-green-workshop-seminars", title: "DPS Green Workshop & Seminars", date: "June 22, 2026", time: "11:00 AM - 02:00 PM", location: "DPS Auditorium, Salt Lake", schoolPartner: "Delhi Public School", description: "Empowering young students through hands-on seminars.", fullDescription: "An interactive workshop series for school students.", imageSrc: "/Assets/dps_01.png", badge: "Education", badgeColor: "bg-accent-500 text-primary-900 border-accent-500", category: "Education", status: "upcoming" },
  { id: "4", slug: "community-cleanliness-campaign", title: "Community Cleanliness Campaign", date: "July 01, 2026", time: "07:30 AM - 11:30 AM", location: "St Michael's Grounds and Suburbs", schoolPartner: "St Michael's School", description: "A community cleanup campaign.", fullDescription: "A grassroots community cleanliness drive.", imageSrc: "/Assets/st_michale_01.png", badge: "Sanitation", badgeColor: "bg-primary-400 text-primary-900 border-primary-400", category: "Sanitation", status: "upcoming" },
  { id: "5", slug: "youth-leadership-sakti-camp", title: "Youth Leadership Sakti Camp", date: "July 12, 2026", time: "09:00 AM - 05:00 PM", location: "St Peter's Campus, Kolkata", schoolPartner: "St Peter's Academy", description: "Developing youth leadership skills.", fullDescription: "A full-day leadership development camp.", imageSrc: "/Assets/st_peters_01.png", badge: "Youth Sakti", badgeColor: "bg-warning-500 text-white border-warning-500", category: "Youth", status: "upcoming" },
  { id: "6", slug: "beachwood-plantation-drive", title: "Beachwood Campus Green Drive", date: "May 15, 2026", time: "08:00 AM - 12:00 PM", location: "Beachwood Academy Grounds", schoolPartner: "Beachwood Academy", description: "Completed plantation of 500 saplings.", fullDescription: "A successful campus greening initiative.", imageSrc: "/Assets/beachwood_01.png", badge: "Environment", badgeColor: "bg-primary-900 text-white border-primary-400", category: "Environment", status: "completed" },
  { id: "7", slug: "emergency-blood-drive-narayana", title: "Emergency Blood Drive at Narayana", date: "May 20, 2026", time: "09:00 AM - 03:00 PM", location: "Narayana Medical College", schoolPartner: "Narayana Group", description: "Emergency blood collection drive.", fullDescription: "An emergency response blood donation camp.", imageSrc: "/Assets/narayana_02.png", badge: "Health Camp", badgeColor: "bg-alert-500 text-white border-alert-500", category: "Healthcare", status: "completed" },
  { id: "8", slug: "dps-science-fair-sustainability", title: "DPS Science Fair for Sustainability", date: "May 28, 2026", time: "10:00 AM - 04:00 PM", location: "DPS Science Block, Salt Lake", schoolPartner: "Delhi Public School", description: "Student science fair focused on sustainable technology.", fullDescription: "A student-led science fair showcasing innovative projects.", imageSrc: "/Assets/dps_02.png", badge: "Education", badgeColor: "bg-accent-500 text-primary-900 border-accent-500", category: "Education", status: "completed" },
];

const BLOG_POSTS = [
  { id: "blog-1", slug: "how-tree-plantation-changes-lives", title: "How Tree Plantation Changes Lives in Rural Bengal", category: "Environment", excerpt: "Our Green Canopy Project has planted over 15,000 saplings across Bankura district.", content: "Tree plantation is more than just putting saplings in the ground.", author: "Ananya Das", authorRole: "Environment Lead", imageSrc: "/Assets/Basic_Workflow.png", tags: "environment,tree-plantation,bankura,green-canopy", readTime: "4 min read" },
  { id: "blog-2", slug: "blood-donation-saves-lives", title: "Why Blood Donation Camps Matter More Than Ever", category: "Healthcare", excerpt: "Our blood donation camps have collected over 1,200 units of blood.", content: "Blood shortages remain one of the most critical healthcare challenges in India.", author: "Dr. Rakesh Sen", authorRole: "Healthcare Coordinator", imageSrc: "/Assets/narayana_01.png", tags: "healthcare,blood-donation,emergency,narayana", readTime: "5 min read" },
  { id: "blog-3", slug: "empowering-youth-through-education", title: "Empowering Youth Through Scholar Centers", category: "Education", excerpt: "Sakti Scholar Centers provide safe learning spaces.", content: "Education is the most powerful tool we can use to change the world.", author: "Priya Mukherjee", authorRole: "Education Director", imageSrc: "/Assets/Workflows.png", tags: "education,scholar-centers,youth,learning", readTime: "4 min read" },
  { id: "blog-4", slug: "community-cleanliness-starts-with-us", title: "Community Cleanliness Starts With Us", category: "Sanitation", excerpt: "Our Community Sanitation Drive has organized 25+ neighborhood cleanups.", content: "A clean community is a healthy community.", author: "Amit Ghosh", authorRole: "Sanitation Program Lead", imageSrc: "/Assets/st_michale_01.png", tags: "sanitation,community,cleanliness,hygiene", readTime: "3 min read" },
  { id: "blog-5", slug: "building-tomorrow-leaders-today", title: "Building Tomorrow's Leaders Today", category: "Youth", excerpt: "Our Youth Leadership Sakti Camp equips young people with essential skills.", content: "The future belongs to the youth.", author: "Sourav Roy", authorRole: "Youth Programs Coordinator", imageSrc: "/Assets/st_peters_01.png", tags: "youth,leadership,mentoring,camp", readTime: "5 min read" },
  { id: "blog-6", slug: "technology-meets-social-impact", title: "Where Technology Meets Social Impact", category: "Technology", excerpt: "Technology is at the heart of how YSSF scales its impact.", content: "At Youth Sakti Social Foundation, we believe technology is a force multiplier for social good.", author: "Soumya Chakraborty", authorRole: "Tech Lead", imageSrc: "/Assets/Ecosystems.png", tags: "technology,blood-directory,open-source,impact", readTime: "4 min read" },
];

const GALLERY_ITEMS = [
  { id: "gal-1", title: "Green Canopy Project Workflow", category: "Environment", imageSrc: "/Assets/Basic_Workflow.png", description: "Planning and execution workflow for our flagship tree plantation initiative.", date: "2026-04-10" },
  { id: "gal-2", title: "Barjora High School Plantation", category: "Environment", imageSrc: "/Assets/Borjora_HS_01.png", description: "Students from Barjora High School participating in the eco-restoration plantation drive.", date: "2026-05-01" },
  { id: "gal-3", title: "Ecosystem Restoration", category: "Environment", imageSrc: "/Assets/Ecosystems.png", description: "Visual representation of the ecosystem restoration efforts in Bankura district.", date: "2026-03-15" },
  { id: "gal-4", title: "Campaign Workflows", category: "Operations", imageSrc: "/Assets/Workflows.png", description: "Behind-the-scenes look at how YSSF plans and executes its campaigns.", date: "2026-02-20" },
  { id: "gal-5", title: "Beachwood Academy Green Drive", category: "Environment", imageSrc: "/Assets/beachwood_01.png", description: "Completed plantation of 500 saplings at Beachwood Academy campus.", date: "2026-05-15" },
  { id: "gal-6", title: "Beachwood Campus After Plantation", category: "Environment", imageSrc: "/Assets/beachwood_02.png", description: "Follow-up photo showing the saplings thriving at Beachwood Academy.", date: "2026-05-18" },
  { id: "gal-7", title: "DPS Green Workshop", category: "Education", imageSrc: "/Assets/dps_01.png", description: "Students at Delhi Public School during the environmental awareness workshop.", date: "2026-04-22" },
  { id: "gal-8", title: "DPS Science Fair", category: "Education", imageSrc: "/Assets/dps_02.png", description: "Student projects on display at the DPS Science Fair for Sustainability.", date: "2026-05-28" },
  { id: "gal-9", title: "Narayana Blood Camp Setup", category: "Healthcare", imageSrc: "/Assets/narayana_01.png", description: "Setup and coordination at the Narayana Healthcare blood donation camp.", date: "2026-04-14" },
  { id: "gal-10", title: "Emergency Blood Drive at Narayana", category: "Healthcare", imageSrc: "/Assets/narayana_02.png", description: "Volunteers and donors at the emergency blood collection drive.", date: "2026-05-20" },
  { id: "gal-11", title: "St Michael's Cleanup Day", category: "Sanitation", imageSrc: "/Assets/st_michale_01.png", description: "Community volunteers participating in the St Michael's cleanliness campaign.", date: "2026-04-01" },
  { id: "gal-12", title: "St Michael's Awareness Drive", category: "Sanitation", imageSrc: "/Assets/st_michale_02.png", description: "Door-to-door hygiene awareness campaign in the St Michael's neighborhood.", date: "2026-04-05" },
  { id: "gal-13", title: "Youth Leadership Camp", category: "Youth", imageSrc: "/Assets/st_peters_01.png", description: "Young leaders at the Sakti Camp held at St Peter's Campus, Kolkata.", date: "2026-03-22" },
  { id: "gal-14", title: "St Peter's Academy Partnership", category: "Youth", imageSrc: "/Assets/st_peters_02.png", description: "Ongoing collaboration with St Peter's Academy for youth development programs.", date: "2026-04-12" },
];

async function main() {
  console.log("Seeding database...");

  console.log("  Creating demo users...");
  await prisma.user.upsert({ where: { email: "admin@yssf.org" }, update: {}, create: { id: "user-admin-001", name: "YSSF Admin", email: "admin@yssf.org", phone: "9876543210", role: "ADMIN", location: "Kolkata, West Bengal", passwordHash: hashPassword("admin123") } });
  await prisma.user.upsert({ where: { email: "volunteer@yssf.org" }, update: {}, create: { id: "user-volunteer-001", name: "Priya Volunteer", email: "volunteer@yssf.org", phone: "9876543211", role: "VOLUNTEER", location: "Bankura, West Bengal", skills: "Teaching, First Aid, Event Management", availability: "Weekends", passwordHash: hashPassword("volunteer123") } });

  console.log("  Seeding campaigns...");
  for (const c of CAMPAIGNS) { await prisma.campaign.upsert({ where: { slug: c.slug }, update: c, create: c }); }

  console.log("  Seeding events...");
  for (const e of EVENTS) { await prisma.event.upsert({ where: { slug: e.slug }, update: e, create: e }); }

  console.log("  Seeding blog posts...");
  for (const b of BLOG_POSTS) { await prisma.blogPost.upsert({ where: { slug: b.slug }, update: b, create: b }); }

  console.log("  Seeding gallery items...");
  for (const g of GALLERY_ITEMS) { await prisma.galleryItem.upsert({ where: { id: g.id }, update: g, create: g }); }

  console.log("Seed complete.");
}

main().catch((e) => { console.error("Seed failed:", e); process.exit(1); }).finally(async () => { await prisma.$disconnect(); });
