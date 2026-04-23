import { Company, Job, JobDetail } from "@/lib/types/company";

// ─── Mock Companies ────────────────────────────────────────────────────────────
export const companies: Company[] = [
  {
    slug: "techcorp-vietnam",
    name: "TechCorp Vietnam",
    logo: "https://ui-avatars.com/api/?name=TechCorp&background=0ea5e9&color=fff&size=128&bold=true&rounded=true",
    tagline: "Building the future of technology in Southeast Asia",
    rating: 4.2,
    reviews: 128,
    info: {
      companyType: "Product",
      industry: "Internet / E-commerce",
      companySize: "500–999",
      country: "Vietnam",
      workingDays: "Monday – Friday",
      overtimePolicy: "No OT",
    },
    overview: [
      "TechCorp Vietnam is a leading technology company headquartered in Ho Chi Minh City, Vietnam. Founded in 2015, we have grown to become one of Southeast Asia's most innovative software product companies.",
      "We specialize in building scalable cloud-native platforms that serve millions of users across the region. Our engineering culture is rooted in continuous learning, ownership, and delivering real impact.",
      "With a team of over 600 engineers, designers, and product managers, we are on a mission to digitize everyday experiences for consumers and businesses alike.",
    ],
    overviewBullets: [
      "Ranked Top 10 Best Places to Work in Vietnam 2024",
      "500+ enterprise clients across 12 countries",
      "Offices in HCMC, Hanoi, Singapore, and Bangkok",
      "Annual R&D budget exceeding $10M USD",
    ],
    skills: [
      "React", "TypeScript", "Node.js", "Next.js", "Go",
      "Kubernetes", "AWS", "PostgreSQL", "Redis", "GraphQL", "Docker", "Kafka",
    ],
    benefits: [
      { id: "bonus",      icon: "Trophy",      title: "Competitive Bonus",    description: "13th-month salary guaranteed + performance bonus up to 3 months based on KPI achievement." },
      { id: "healthcare", icon: "HeartPulse",  title: "Premium Healthcare",   description: "Full health insurance coverage for employee + 1 dependent. Annual health check-up included." },
      { id: "allowance",  icon: "Wallet",      title: "Generous Allowances",  description: "Meal, transportation, and phone allowances. Flexible WFH policy with equipment provided." },
      { id: "techstack",  icon: "Layers",      title: "Cutting-edge Tech",    description: "Work with modern cloud-native stack. $1,000/year learning budget for courses & conferences." },
      { id: "growth",     icon: "TrendingUp",  title: "Career Growth",        description: "Clear career ladder, mentorship program, and internal mobility across teams and offices." },
      { id: "culture",    icon: "Users",       title: "Great Culture",        description: "Flat hierarchy, diverse team, team building trips, and weekly knowledge-sharing sessions." },
    ],
    images: [
      "https://picsum.photos/seed/office1/600/400",
      "https://picsum.photos/seed/team2/600/400",
      "https://picsum.photos/seed/work3/600/400",
      "https://picsum.photos/seed/event4/600/400",
      "https://picsum.photos/seed/hack5/600/400",
      "https://picsum.photos/seed/fun6/600/400",
    ],
  },
  {
    slug: "itviec",
    name: "ITviec",
    logo: "https://ui-avatars.com/api/?name=ITviec&background=e11d48&color=fff&size=128&bold=true&rounded=true",
    tagline: "Vietnam's #1 Tech Job Platform",
    rating: 4.5,
    reviews: 245,
    info: {
      companyType: "Product",
      industry: "IT / Software",
      companySize: "100–499",
      country: "Vietnam",
      workingDays: "Monday – Friday",
      overtimePolicy: "Rare OT",
    },
    overview: [
      "ITviec is Vietnam's leading tech job platform connecting top IT professionals with the best technology companies.",
    ],
    overviewBullets: [
      "Over 2 million registered candidates",
      "10,000+ tech companies on the platform",
    ],
    skills: ["React", "Python", "Django", "PostgreSQL", "AWS"],
    benefits: [
      { id: "bonus",      icon: "Trophy",     title: "Performance Bonus", description: "Quarterly and annual performance bonuses." },
      { id: "healthcare", icon: "HeartPulse", title: "Healthcare",        description: "Premium health insurance for employees." },
    ],
    images: [
      "https://picsum.photos/seed/itv1/600/400",
      "https://picsum.photos/seed/itv2/600/400",
    ],
  },
];

// ─── Mock Jobs (list view) ─────────────────────────────────────────────────────
export const jobsBySlug: Record<string, Job[]> = {
  "techcorp-vietnam": [
    { id: "j1", slug: "senior-frontend-engineer",  title: "Senior Frontend Engineer",  company: "TechCorp Vietnam", companySlug: "techcorp-vietnam", location: "Ho Chi Minh City", salary: "$2,500 – $4,000", tags: ["React", "TypeScript", "Next.js"],             benefits: ["13th month", "Health insurance", "WFH 2 days"], isHot: true },
    { id: "j2", slug: "backend-engineer-go",        title: "Backend Engineer (Go)",      company: "TechCorp Vietnam", companySlug: "techcorp-vietnam", location: "Ho Chi Minh City", salary: "$2,000 – $3,500", tags: ["Go", "Kubernetes", "PostgreSQL"],             benefits: ["Flexible hours", "Learning budget"],             isHot: true },
    { id: "j3", slug: "devops-engineer",            title: "DevOps Engineer",            company: "TechCorp Vietnam", companySlug: "techcorp-vietnam", location: "Hanoi",            salary: "$1,800 – $3,000", tags: ["AWS", "Docker", "Terraform"],                benefits: ["Remote friendly", "Stock options"] },
    { id: "j4", slug: "product-designer-ux-ui",    title: "Product Designer (UX/UI)",   company: "TechCorp Vietnam", companySlug: "techcorp-vietnam", location: "Ho Chi Minh City", salary: "$1,500 – $2,500", tags: ["Figma", "Design Systems", "User Research"],  benefits: ["Creative freedom", "Team trips"] },
    { id: "j5", slug: "data-engineer",             title: "Data Engineer",              company: "TechCorp Vietnam", companySlug: "techcorp-vietnam", location: "Ho Chi Minh City", salary: "$2,000 – $3,200", tags: ["Python", "Spark", "Kafka", "AWS"],           benefits: ["Big data exposure", "Mentorship"] },
    { id: "j6", slug: "qa-automation-engineer",    title: "QA Automation Engineer",     company: "TechCorp Vietnam", companySlug: "techcorp-vietnam", location: "Ho Chi Minh City", salary: "$1,200 – $2,000", tags: ["Playwright", "Cypress", "TypeScript"],       benefits: ["Training budget", "Friendly team"] },
  ],
  itviec: [
    { id: "i1", slug: "full-stack-developer", title: "Full Stack Developer", company: "ITviec", companySlug: "itviec", location: "Ho Chi Minh City", salary: "$1,500 – $2,500", tags: ["React", "Django", "PostgreSQL"], benefits: ["Remote work", "Health insurance"], isHot: true },
  ],
};

// ─── Mock Job Details (detail page) ───────────────────────────────────────────
export const jobDetails: Record<string, JobDetail> = {
  "senior-frontend-engineer": {
    id: "j1",
    slug: "senior-frontend-engineer",
    title: "Senior Frontend Engineer",
    company: "TechCorp Vietnam",
    companySlug: "techcorp-vietnam",
    location: "Ho Chi Minh City",
    salary: "$2,500 – $4,000",
    tags: ["React", "TypeScript", "Next.js", "GraphQL", "TailwindCSS"],
    benefits: ["13th month", "Health insurance", "WFH 2 days"],
    isHot: true,
    experience: "3+ years",
    domain: "Internet / E-commerce",
    postedAt: "2 days ago",
    deadline: "30/05/2026",
    reasons: [
      "Work on products used by millions of users across Southeast Asia",
      "Collaborate with a world-class engineering team of 600+ people",
      "Competitive salary reviewed twice a year based on performance",
      "Flexible work-from-home policy up to 2 days/week",
      "Annual $1,000 learning budget for courses & conferences",
    ],
    description: [
      "We are looking for a passionate Senior Frontend Engineer to join our growing product team. You will be responsible for building and maintaining high-performance web applications that serve millions of users.",
      "As a senior engineer, you will take ownership of complex features from design to deployment, mentor junior engineers, and actively contribute to our engineering culture.",
    ],
    descriptionBullets: [
      "Design and implement new user-facing features using React, Next.js, and TypeScript",
      "Optimize applications for maximum speed and scalability",
      "Collaborate with designers, product managers, and backend engineers",
      "Conduct code reviews and provide constructive feedback",
      "Champion best practices for performance, accessibility, and testing",
      "Participate in architecture discussions and technical roadmap planning",
    ],
    requirements: [
      "3+ years of professional experience with React and TypeScript",
      "Strong understanding of JavaScript fundamentals and modern ES6+ features",
      "Experience with Next.js App Router and server-side rendering",
      "Proficiency with state management solutions (Zustand, Redux, or similar)",
      "Familiarity with GraphQL and REST API integration",
      "Experience writing unit and integration tests (Jest, Testing Library)",
      "Good understanding of CSS and experience with TailwindCSS or CSS-in-JS",
      "Strong communication skills and ability to work in an agile team",
    ],
    detailBenefits: {
      salary:    "Competitive salary $2,500–$4,000/month, reviewed bi-annually. 13th-month salary guaranteed + performance bonus up to 3 months.",
      insurance: "Premium health insurance for employee and 1 dependent. Annual medical check-up at top hospitals. Accident insurance 24/7.",
      environment: "Modern office in District 1, HCMC. WFH up to 2 days/week. MacBook Pro provided. Snacks, coffee, and team lunches.",
      growth:    "Clear engineering career ladder (Junior → Senior → Staff → Principal). $1,000/year learning budget. Internal mobility across 4 offices.",
    },
  },

  "backend-engineer-go": {
    id: "j2",
    slug: "backend-engineer-go",
    title: "Backend Engineer (Go)",
    company: "TechCorp Vietnam",
    companySlug: "techcorp-vietnam",
    location: "Ho Chi Minh City",
    salary: "$2,000 – $3,500",
    tags: ["Go", "Kubernetes", "PostgreSQL", "Redis", "Kafka"],
    benefits: ["Flexible hours", "Learning budget"],
    isHot: true,
    experience: "2+ years",
    domain: "Internet / E-commerce",
    postedAt: "5 days ago",
    deadline: "15/06/2026",
    reasons: [
      "Build high-throughput distributed systems processing millions of events daily",
      "Work with modern cloud-native stack: Kubernetes, Kafka, AWS",
      "Flexible working hours with results-oriented culture",
      "Direct impact on product architecture and engineering decisions",
      "Annual $1,000 learning budget for courses & conferences",
    ],
    description: [
      "We are seeking a talented Backend Engineer with strong Go experience to help us scale our core platform. You will design and build microservices that power our e-commerce and payment infrastructure.",
      "You will work closely with cross-functional teams to deliver high-quality, production-ready software in a fast-paced environment.",
    ],
    descriptionBullets: [
      "Design, develop, and maintain scalable microservices in Go",
      "Optimize system performance and ensure high availability (99.99% SLA)",
      "Implement event-driven architecture using Kafka",
      "Design and manage PostgreSQL database schemas",
      "Deploy and manage services on Kubernetes / AWS EKS",
      "Collaborate on API design with frontend and mobile teams",
    ],
    requirements: [
      "2+ years of backend development experience with Go (Golang)",
      "Solid understanding of microservices architecture and distributed systems",
      "Experience with PostgreSQL and Redis",
      "Familiarity with Kubernetes and Docker containerization",
      "Knowledge of message brokers (Kafka or RabbitMQ preferred)",
      "Understanding of RESTful API design principles and gRPC",
      "Experience with CI/CD pipelines (GitHub Actions, ArgoCD)",
    ],
    detailBenefits: {
      salary:      "Salary $2,000–$3,500/month with bi-annual review. Flexible working hours focused on outcomes.",
      insurance:   "Full health insurance coverage. Annual medical check-up included.",
      environment: "Results-oriented culture, no micro-management. Remote-friendly with flexible hours.",
      growth:      "$1,000/year learning budget. Access to internal tech talks and knowledge-sharing sessions.",
    },
  },

  "full-stack-developer": {
    id: "i1",
    slug: "full-stack-developer",
    title: "Full Stack Developer",
    company: "ITviec",
    companySlug: "itviec",
    location: "Ho Chi Minh City",
    salary: "$1,500 – $2,500",
    tags: ["React", "Django", "PostgreSQL", "AWS", "Python"],
    benefits: ["Remote work", "Health insurance"],
    isHot: true,
    experience: "2+ years",
    domain: "IT / Software",
    postedAt: "1 day ago",
    deadline: "20/06/2026",
    reasons: [
      "Work on Vietnam's #1 tech job platform with 2M+ registered users",
      "100% remote-friendly with flexible working schedule",
      "Opportunity to build features that impact the entire IT job market",
      "Collaborative and flat organizational culture",
      "Regular performance reviews with clear promotion paths",
    ],
    description: [
      "ITviec is looking for a Full Stack Developer to join our product team and help build the next generation of our platform. You will work on both the frontend (React) and backend (Django) to deliver seamless user experiences.",
    ],
    descriptionBullets: [
      "Build and maintain full-stack features across our web platform",
      "Develop REST APIs with Django and integrate with React frontend",
      "Write clean, well-tested code with high code coverage",
      "Participate in design reviews and sprint planning",
      "Deploy and monitor services on AWS infrastructure",
    ],
    requirements: [
      "2+ years of full-stack development experience",
      "Proficiency in React and modern JavaScript/TypeScript",
      "Experience with Django or similar Python web framework",
      "Familiarity with PostgreSQL and database design",
      "Basic understanding of AWS services (EC2, S3, RDS)",
      "Comfortable working in an agile/scrum environment",
    ],
    detailBenefits: {
      salary:      "Competitive salary $1,500–$2,500/month. Quarterly performance-based bonuses.",
      insurance:   "Premium health insurance for employee. Annual health check-up.",
      environment: "100% remote work option. Flexible hours. Monthly team meetups.",
      growth:      "Clear career progression path. Access to online learning platforms. Regular 1-on-1 mentoring.",
    },
  },
};

// ─── Data access helpers ───────────────────────────────────────────────────────
export function getCompanyBySlug(slug: string): Company | undefined {
  return companies.find((c) => c.slug === slug);
}

export function getJobsBySlug(slug: string): Job[] {
  return jobsBySlug[slug] ?? [];
}

export function getJobDetailBySlug(slug: string): JobDetail | undefined {
  return jobDetails[slug];
}
