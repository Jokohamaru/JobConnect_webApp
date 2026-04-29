import { PrismaClient } from '../generated/prisma/client';
import * as bcrypt from 'bcrypt';

const prisma = new PrismaClient();

async function main() {
  console.log('Starting database seed...');

  // Clear existing data
  await prisma.applications.deleteMany();
  await prisma.job_tags.deleteMany();
  await prisma.job_skills.deleteMany();
  await prisma.candidate_skills.deleteMany();
  await prisma.cvs.deleteMany();
  await prisma.jobs.deleteMany();
  await prisma.companies.deleteMany();
  await prisma.recruiters.deleteMany();
  await prisma.candidates.deleteMany();
  await prisma.admins.deleteMany();
  await prisma.users.deleteMany();
  await prisma.tags.deleteMany();
  await prisma.skills.deleteMany();
  await prisma.cities.deleteMany();

  // Create cities
  const cities = await Promise.all([
    prisma.cities.create({
      data: { id: 'city-1', name: 'San Francisco', country: 'USA' },
    }),
    prisma.cities.create({
      data: { id: 'city-2', name: 'New York', country: 'USA' },
    }),
    prisma.cities.create({
      data: { id: 'city-3', name: 'London', country: 'UK' },
    }),
    prisma.cities.create({
      data: { id: 'city-4', name: 'Berlin', country: 'Germany' },
    }),
    prisma.cities.create({
      data: { id: 'city-5', name: 'Toronto', country: 'Canada' },
    }),
  ]);

  console.log(`Created ${cities.length} cities`);

  // Create skills
  const skills = await Promise.all([
    prisma.skills.create({ data: { id: 'skill-1', name: 'TypeScript' } }),
    prisma.skills.create({ data: { id: 'skill-2', name: 'React' } }),
    prisma.skills.create({ data: { id: 'skill-3', name: 'Node.js' } }),
    prisma.skills.create({ data: { id: 'skill-4', name: 'PostgreSQL' } }),
    prisma.skills.create({ data: { id: 'skill-5', name: 'Docker' } }),
    prisma.skills.create({ data: { id: 'skill-6', name: 'AWS' } }),
    prisma.skills.create({ data: { id: 'skill-7', name: 'Python' } }),
    prisma.skills.create({ data: { id: 'skill-8', name: 'Java' } }),
    prisma.skills.create({ data: { id: 'skill-9', name: 'GraphQL' } }),
    prisma.skills.create({ data: { id: 'skill-10', name: 'Kubernetes' } }),
  ]);

  console.log(`Created ${skills.length} skills`);

  // Create tags
  const tags = await Promise.all([
    prisma.tags.create({ data: { id: 'tag-1', name: 'Remote' } }),
    prisma.tags.create({ data: { id: 'tag-2', name: 'Full-time' } }),
    prisma.tags.create({ data: { id: 'tag-3', name: 'Part-time' } }),
    prisma.tags.create({ data: { id: 'tag-4', name: 'Startup' } }),
    prisma.tags.create({ data: { id: 'tag-5', name: 'Enterprise' } }),
    prisma.tags.create({ data: { id: 'tag-6', name: 'Contract' } }),
  ]);

  console.log(`Created ${tags.length} tags`);

  // Create admin user
  const adminUser = await prisma.users.create({
    data: {
      id: 'user-admin-1',
      email: 'admin@jobconnect.com',
      full_name: 'Admin User',
      password_hash: await bcrypt.hash('AdminPassword123', 10),
      role: 'ADMIN',
      is_active: true,
      updated_at: new Date(),
    },
  });

  await prisma.admins.create({
    data: {
      id: 'admin-1',
      user_id: adminUser.id,
      updated_at: new Date(),
    },
  });

  console.log('Created admin user');

  // Create recruiter users and companies
  const recruiterUsers = await Promise.all([
    prisma.users.create({
      data: {
        id: 'user-recruiter-1',
        email: 'recruiter1@techcorp.com',
        full_name: 'Sarah Johnson',
        password_hash: await bcrypt.hash('RecruiterPass123', 10),
        role: 'RECRUITER',
        is_active: true,
      updated_at: new Date(),
      },
    }),
    prisma.users.create({
      data: {
        id: 'user-recruiter-2',
        email: 'recruiter2@innovate.com',
        full_name: 'Michael Chen',
        password_hash: await bcrypt.hash('RecruiterPass123', 10),
        role: 'RECRUITER',
        is_active: true,
      updated_at: new Date(),
      },
    }),
    prisma.users.create({
      data: {
        id: 'user-recruiter-3',
        email: 'recruiter3@startup.io',
        full_name: 'Emma Davis',
        password_hash: await bcrypt.hash('RecruiterPass123', 10),
        role: 'RECRUITER',
        is_active: true,
      updated_at: new Date(),
      },
    }),
  ]);

  console.log(`Created ${recruiterUsers.length} recruiter users`);

  // Create recruiters
  const recruiters = await Promise.all([
    prisma.recruiters.create({
      data: {
        id: 'recruiter-1',
        user_id: recruiterUsers[0].id,
      updated_at: new Date(),
      },
    }),
    prisma.recruiters.create({
      data: {
        id: 'recruiter-2',
        user_id: recruiterUsers[1].id,
      updated_at: new Date(),
      },
    }),
    prisma.recruiters.create({
      data: {
        id: 'recruiter-3',
        user_id: recruiterUsers[2].id,
      updated_at: new Date(),
      },
    }),
  ]);

  console.log(`Created ${recruiters.length} recruiters`);

  // Create companies
  const companies = await Promise.all([
    prisma.companies.create({
      data: {
        id: 'company-1',
        name: 'TechCorp Solutions',
        description: 'Leading software development company',
        website: 'https://techcorp.com',
        industry: 'Technology',
        company_type: 'LARGE_ENTERPRISE',
        location: 'San Francisco',
        recruiter_id: recruiters[0].id,
      updated_at: new Date(),
      },
    }),
    prisma.companies.create({
      data: {
        id: 'company-2',
        name: 'Innovate Labs',
        description: 'AI and machine learning startup',
        website: 'https://innovatelabs.io',
        industry: 'Artificial Intelligence',
        company_type: 'STARTUP',
        location: 'New York',
        recruiter_id: recruiters[1].id,
      updated_at: new Date(),
      },
    }),
    prisma.companies.create({
      data: {
        id: 'company-3',
        name: 'StartupHub',
        description: 'Fast-growing tech startup',
        website: 'https://startuphub.io',
        industry: 'Technology',
        company_type: 'SMALL_BUSINESS',
        location: 'London',
        recruiter_id: recruiters[2].id,
      updated_at: new Date(),
      },
    }),
  ]);

  console.log(`Created ${companies.length} companies`);

  // Create jobs
  const jobs = await Promise.all([
    prisma.jobs.create({
      data: {
        id: 'job-1',
        company_id: companies[0].id,
        title: 'Senior Full Stack Developer',
        description:
          'We are looking for an experienced full stack developer with expertise in TypeScript, React, and Node.js. You will work on building scalable web applications.',
        location: 'San Francisco',
        salary_min: 120000,
        salary_max: 160000,
        job_type: 'Full-time',
        status: 'ACTIVE',
      },
    }),
    prisma.jobs.create({
      data: {
        id: 'job-2',
        company_id: companies[0].id,
        title: 'DevOps Engineer',
        description:
          'Join our DevOps team to manage cloud infrastructure, containerization, and deployment pipelines using Docker and Kubernetes.',
        location: 'San Francisco',
        salary_min: 110000,
        salary_max: 150000,
        job_type: 'Full-time',
        status: 'ACTIVE',
      },
    }),
    prisma.jobs.create({
      data: {
        id: 'job-3',
        company_id: companies[1].id,
        title: 'Machine Learning Engineer',
        description:
          'Build and deploy machine learning models. Experience with Python, TensorFlow, and cloud platforms required.',
        location: 'New York',
        salary_min: 130000,
        salary_max: 180000,
        job_type: 'Full-time',
        status: 'ACTIVE',
      },
    }),
    prisma.jobs.create({
      data: {
        id: 'job-4',
        company_id: companies[1].id,
        title: 'Frontend Developer',
        description:
          'Create beautiful and responsive user interfaces using React and modern web technologies. Remote position available.',
        location: 'New York',
        salary_min: 100000,
        salary_max: 140000,
        job_type: 'Full-time',
        status: 'ACTIVE',
      },
    }),
    prisma.jobs.create({
      data: {
        id: 'job-5',
        company_id: companies[2].id,
        title: 'Backend Developer',
        description:
          'Develop robust backend services using Node.js and PostgreSQL. Work with a small, agile team in a startup environment.',
        location: 'London',
        salary_min: 80000,
        salary_max: 120000,
        job_type: 'Full-time',
        status: 'ACTIVE',
      },
    }),
    prisma.jobs.create({
      data: {
        id: 'job-6',
        company_id: companies[2].id,
        title: 'Junior Developer',
        description:
          'Great opportunity for junior developers to learn and grow. We provide mentorship and training.',
        location: 'London',
        salary_min: 40000,
        salary_max: 60000,
        job_type: 'Full-time',
        status: 'ACTIVE',
      },
    }),
  ]);

  console.log(`Created ${jobs.length} jobs`);

  // Associate skills with jobs
  await Promise.all([
    // Job 1: Senior Full Stack Developer
    prisma.job_skills.create({
      data: { id: 'job-skill-1', job_id: jobs[0].id, skill_id: skills[0].id },
    }),
    prisma.job_skills.create({
      data: { id: 'job-skill-2', job_id: jobs[0].id, skill_id: skills[1].id },
    }),
    prisma.job_skills.create({
      data: { id: 'job-skill-3', job_id: jobs[0].id, skill_id: skills[2].id },
    }),
    prisma.job_skills.create({
      data: { id: 'job-skill-4', job_id: jobs[0].id, skill_id: skills[3].id },
    }),
    // Job 2: DevOps Engineer
    prisma.job_skills.create({
      data: { id: 'job-skill-5', job_id: jobs[1].id, skill_id: skills[4].id },
    }),
    prisma.job_skills.create({
      data: { id: 'job-skill-6', job_id: jobs[1].id, skill_id: skills[5].id },
    }),
    prisma.job_skills.create({
      data: { id: 'job-skill-7', job_id: jobs[1].id, skill_id: skills[9].id },
    }),
    // Job 3: Machine Learning Engineer
    prisma.job_skills.create({
      data: { id: 'job-skill-8', job_id: jobs[2].id, skill_id: skills[6].id },
    }),
    prisma.job_skills.create({
      data: { id: 'job-skill-9', job_id: jobs[2].id, skill_id: skills[5].id },
    }),
    // Job 4: Frontend Developer
    prisma.job_skills.create({
      data: { id: 'job-skill-10', job_id: jobs[3].id, skill_id: skills[1].id },
    }),
    prisma.job_skills.create({
      data: { id: 'job-skill-11', job_id: jobs[3].id, skill_id: skills[0].id },
    }),
    // Job 5: Backend Developer
    prisma.job_skills.create({
      data: { id: 'job-skill-12', job_id: jobs[4].id, skill_id: skills[2].id },
    }),
    prisma.job_skills.create({
      data: { id: 'job-skill-13', job_id: jobs[4].id, skill_id: skills[3].id },
    }),
    // Job 6: Junior Developer
    prisma.job_skills.create({
      data: { id: 'job-skill-14', job_id: jobs[5].id, skill_id: skills[0].id },
    }),
    prisma.job_skills.create({
      data: { id: 'job-skill-15', job_id: jobs[5].id, skill_id: skills[1].id },
    }),
  ]);

  console.log('Associated skills with jobs');

  // Associate tags with jobs
  await Promise.all([
    // Job 1: Remote, Full-time, Enterprise
    prisma.job_tags.create({
      data: { id: 'job-tag-1', job_id: jobs[0].id, tag_id: tags[0].id },
    }),
    prisma.job_tags.create({
      data: { id: 'job-tag-2', job_id: jobs[0].id, tag_id: tags[1].id },
    }),
    prisma.job_tags.create({
      data: { id: 'job-tag-3', job_id: jobs[0].id, tag_id: tags[4].id },
    }),
    // Job 2: Full-time, Enterprise
    prisma.job_tags.create({
      data: { id: 'job-tag-4', job_id: jobs[1].id, tag_id: tags[1].id },
    }),
    prisma.job_tags.create({
      data: { id: 'job-tag-5', job_id: jobs[1].id, tag_id: tags[4].id },
    }),
    // Job 3: Full-time, Startup
    prisma.job_tags.create({
      data: { id: 'job-tag-6', job_id: jobs[2].id, tag_id: tags[1].id },
    }),
    prisma.job_tags.create({
      data: { id: 'job-tag-7', job_id: jobs[2].id, tag_id: tags[3].id },
    }),
    // Job 4: Remote, Full-time, Startup
    prisma.job_tags.create({
      data: { id: 'job-tag-8', job_id: jobs[3].id, tag_id: tags[0].id },
    }),
    prisma.job_tags.create({
      data: { id: 'job-tag-9', job_id: jobs[3].id, tag_id: tags[1].id },
    }),
    prisma.job_tags.create({
      data: { id: 'job-tag-10', job_id: jobs[3].id, tag_id: tags[3].id },
    }),
    // Job 5: Full-time
    prisma.job_tags.create({
      data: { id: 'job-tag-11', job_id: jobs[4].id, tag_id: tags[1].id },
    }),
    // Job 6: Full-time, Startup
    prisma.job_tags.create({
      data: { id: 'job-tag-12', job_id: jobs[5].id, tag_id: tags[1].id },
    }),
    prisma.job_tags.create({
      data: { id: 'job-tag-13', job_id: jobs[5].id, tag_id: tags[3].id },
    }),
  ]);

  console.log('Associated tags with jobs');

  // Create candidate users
  const candidateUsers = await Promise.all([
    prisma.users.create({
      data: {
        id: 'user-candidate-1',
        email: 'alice@example.com',
        full_name: 'Alice Smith',
        password_hash: await bcrypt.hash('CandidatePass123', 10),
        role: 'CANDIDATE',
        is_active: true,
      },
    }),
    prisma.users.create({
      data: {
        id: 'user-candidate-2',
        email: 'bob@example.com',
        full_name: 'Bob Wilson',
        password_hash: await bcrypt.hash('CandidatePass123', 10),
        role: 'CANDIDATE',
        is_active: true,
      },
    }),
    prisma.users.create({
      data: {
        id: 'user-candidate-3',
        email: 'carol@example.com',
        full_name: 'Carol Martinez',
        password_hash: await bcrypt.hash('CandidatePass123', 10),
        role: 'CANDIDATE',
        is_active: true,
      },
    }),
    prisma.users.create({
      data: {
        id: 'user-candidate-4',
        email: 'david@example.com',
        full_name: 'David Lee',
        password_hash: await bcrypt.hash('CandidatePass123', 10),
        role: 'CANDIDATE',
        is_active: true,
      },
    }),
    prisma.users.create({
      data: {
        id: 'user-candidate-5',
        email: 'emma@example.com',
        full_name: 'Emma Brown',
        password_hash: await bcrypt.hash('CandidatePass123', 10),
        role: 'CANDIDATE',
        is_active: true,
      },
    }),
  ]);

  console.log(`Created ${candidateUsers.length} candidate users`);

  // Create candidates
  const candidates = await Promise.all([
    prisma.candidates.create({
      data: {
        id: 'candidate-1',
        user_id: candidateUsers[0].id,
        phone_number: '+1-555-0101',
        bio: 'Experienced full stack developer with 5 years of experience',
        location: 'San Francisco',
      },
    }),
    prisma.candidates.create({
      data: {
        id: 'candidate-2',
        user_id: candidateUsers[1].id,
        phone_number: '+1-555-0102',
        bio: 'DevOps engineer passionate about cloud infrastructure',
        location: 'San Francisco',
      },
    }),
    prisma.candidates.create({
      data: {
        id: 'candidate-3',
        user_id: candidateUsers[2].id,
        phone_number: '+1-555-0103',
        bio: 'Machine learning specialist with AI expertise',
        location: 'New York',
      },
    }),
    prisma.candidates.create({
      data: {
        id: 'candidate-4',
        user_id: candidateUsers[3].id,
        phone_number: '+1-555-0104',
        bio: 'Frontend developer focused on React and modern web tech',
        location: 'New York',
      },
    }),
    prisma.candidates.create({
      data: {
        id: 'candidate-5',
        user_id: candidateUsers[4].id,
        phone_number: '+1-555-0105',
        bio: 'Junior developer eager to learn and grow',
        location: 'London',
      },
    }),
  ]);

  console.log(`Created ${candidates.length} candidates`);

  // Associate skills with candidates
  await Promise.all([
    // Candidate 1: TypeScript, React, Node.js, PostgreSQL
    prisma.candidate_skills.create({
      data: {
        id: 'cand-skill-1',
        candidate_id: candidates[0].id,
        skill_id: skills[0].id,
      },
    }),
    prisma.candidate_skills.create({
      data: {
        id: 'cand-skill-2',
        candidate_id: candidates[0].id,
        skill_id: skills[1].id,
      },
    }),
    prisma.candidate_skills.create({
      data: {
        id: 'cand-skill-3',
        candidate_id: candidates[0].id,
        skill_id: skills[2].id,
      },
    }),
    prisma.candidate_skills.create({
      data: {
        id: 'cand-skill-4',
        candidate_id: candidates[0].id,
        skill_id: skills[3].id,
      },
    }),
    // Candidate 2: Docker, AWS, Kubernetes
    prisma.candidate_skills.create({
      data: {
        id: 'cand-skill-5',
        candidate_id: candidates[1].id,
        skill_id: skills[4].id,
      },
    }),
    prisma.candidate_skills.create({
      data: {
        id: 'cand-skill-6',
        candidate_id: candidates[1].id,
        skill_id: skills[5].id,
      },
    }),
    prisma.candidate_skills.create({
      data: {
        id: 'cand-skill-7',
        candidate_id: candidates[1].id,
        skill_id: skills[9].id,
      },
    }),
    // Candidate 3: Python, AWS
    prisma.candidate_skills.create({
      data: {
        id: 'cand-skill-8',
        candidate_id: candidates[2].id,
        skill_id: skills[6].id,
      },
    }),
    prisma.candidate_skills.create({
      data: {
        id: 'cand-skill-9',
        candidate_id: candidates[2].id,
        skill_id: skills[5].id,
      },
    }),
    // Candidate 4: React, TypeScript
    prisma.candidate_skills.create({
      data: {
        id: 'cand-skill-10',
        candidate_id: candidates[3].id,
        skill_id: skills[1].id,
      },
    }),
    prisma.candidate_skills.create({
      data: {
        id: 'cand-skill-11',
        candidate_id: candidates[3].id,
        skill_id: skills[0].id,
      },
    }),
    // Candidate 5: TypeScript, React
    prisma.candidate_skills.create({
      data: {
        id: 'cand-skill-12',
        candidate_id: candidates[4].id,
        skill_id: skills[0].id,
      },
    }),
    prisma.candidate_skills.create({
      data: {
        id: 'cand-skill-13',
        candidate_id: candidates[4].id,
        skill_id: skills[1].id,
      },
    }),
  ]);

  console.log('Associated skills with candidates');

  // Create CVs for candidates
  const cvs = await Promise.all([
    prisma.cvs.create({
      data: {
        id: 'cv-1',
        candidate_id: candidates[0].id,
        file_name: 'alice_cv.pdf',
        file_path: '/uploads/cvs/alice_cv.pdf',
        is_default: true,
      },
    }),
    prisma.cvs.create({
      data: {
        id: 'cv-2',
        candidate_id: candidates[0].id,
        file_name: 'alice_cv_updated.pdf',
        file_path: '/uploads/cvs/alice_cv_updated.pdf',
        is_default: false,
      },
    }),
    prisma.cvs.create({
      data: {
        id: 'cv-3',
        candidate_id: candidates[1].id,
        file_name: 'bob_cv.pdf',
        file_path: '/uploads/cvs/bob_cv.pdf',
        is_default: true,
      },
    }),
    prisma.cvs.create({
      data: {
        id: 'cv-4',
        candidate_id: candidates[2].id,
        file_name: 'carol_cv.pdf',
        file_path: '/uploads/cvs/carol_cv.pdf',
        is_default: true,
      },
    }),
    prisma.cvs.create({
      data: {
        id: 'cv-5',
        candidate_id: candidates[3].id,
        file_name: 'david_cv.pdf',
        file_path: '/uploads/cvs/david_cv.pdf',
        is_default: true,
      },
    }),
    prisma.cvs.create({
      data: {
        id: 'cv-6',
        candidate_id: candidates[4].id,
        file_name: 'emma_cv.pdf',
        file_path: '/uploads/cvs/emma_cv.pdf',
        is_default: true,
      },
    }),
  ]);

  console.log(`Created ${cvs.length} CVs`);

  // Create applications
  const applications = await Promise.all([
    // Alice applies to Senior Full Stack Developer
    prisma.applications.create({
      data: {
        id: 'app-1',
        candidate_id: candidates[0].id,
        job_id: jobs[0].id,
        cv_id: cvs[0].id,
        status: 'APPLIED',
      },
    }),
    // Alice applies to Frontend Developer
    prisma.applications.create({
      data: {
        id: 'app-2',
        candidate_id: candidates[0].id,
        job_id: jobs[3].id,
        cv_id: cvs[0].id,
        status: 'REVIEWING',
      },
    }),
    // Bob applies to DevOps Engineer
    prisma.applications.create({
      data: {
        id: 'app-3',
        candidate_id: candidates[1].id,
        job_id: jobs[1].id,
        cv_id: cvs[2].id,
        status: 'APPLIED',
      },
    }),
    // Carol applies to Machine Learning Engineer
    prisma.applications.create({
      data: {
        id: 'app-4',
        candidate_id: candidates[2].id,
        job_id: jobs[2].id,
        cv_id: cvs[3].id,
        status: 'ACCEPTED',
      },
    }),
    // David applies to Frontend Developer
    prisma.applications.create({
      data: {
        id: 'app-5',
        candidate_id: candidates[3].id,
        job_id: jobs[3].id,
        cv_id: cvs[4].id,
        status: 'APPLIED',
      },
    }),
    // Emma applies to Junior Developer
    prisma.applications.create({
      data: {
        id: 'app-6',
        candidate_id: candidates[4].id,
        job_id: jobs[5].id,
        cv_id: cvs[5].id,
        status: 'APPLIED',
      },
    }),
    // Emma applies to Backend Developer
    prisma.applications.create({
      data: {
        id: 'app-7',
        candidate_id: candidates[4].id,
        job_id: jobs[4].id,
        cv_id: cvs[5].id,
        status: 'REJECTED',
      },
    }),
  ]);

  console.log(`Created ${applications.length} applications`);

  console.log('Database seed completed successfully!');
  console.log('\nSeed Summary:');
  console.log(`- Cities: ${cities.length}`);
  console.log(`- Skills: ${skills.length}`);
  console.log(`- Tags: ${tags.length}`);
  console.log(`- Admin Users: 1`);
  console.log(`- Recruiter Users: ${recruiterUsers.length}`);
  console.log(`- Companies: ${companies.length}`);
  console.log(`- Jobs: ${jobs.length}`);
  console.log(`- Candidate Users: ${candidateUsers.length}`);
  console.log(`- Candidates: ${candidates.length}`);
  console.log(`- CVs: ${cvs.length}`);
  console.log(`- Applications: ${applications.length}`);
}

main()
  .catch((e) => {
    console.error('Seed error:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });


