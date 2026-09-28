import 'dotenv/config';
import { PrismaClient, Role } from '@prisma/client';
import { PrismaPg } from '@prisma/adapter-pg';
import { Pool } from 'pg';
import * as bcrypt from 'bcrypt';

const mockOwnerEmail = 'mock-jobs@mastawekia.local';

const jobs = [
  { title: 'Frontend Developer', description: 'Build accessible, responsive interfaces with React and TypeScript.', company: 'Northstar Labs' },
  { title: 'Backend Developer', description: 'Design reliable APIs and services with Node.js, PostgreSQL, and NestJS.', company: 'Northstar Labs' },
  { title: 'Full Stack Engineer', description: 'Own product features from database design through polished web experiences.', company: 'Northstar Labs' },
  { title: 'Mobile App Developer', description: 'Create cross-platform mobile experiences with React Native.', company: 'Northstar Labs' },
  { title: 'QA Automation Engineer', description: 'Build automated test suites and improve confidence across every release.', company: 'Northstar Labs' },
  { title: 'Product Designer', description: 'Turn complex workflows into clear, useful, and elegant product experiences.', company: 'BrightPath Finance' },
  { title: 'Data Analyst', description: 'Translate business questions into actionable insights and dashboards.', company: 'BrightPath Finance' },
  { title: 'DevOps Engineer', description: 'Improve deployment pipelines, observability, and cloud infrastructure.', company: 'BrightPath Finance' },
  { title: 'Security Engineer', description: 'Protect customer data through practical application and cloud security.', company: 'BrightPath Finance' },
  { title: 'Technical Writer', description: 'Create documentation that helps developers adopt APIs and tools quickly.', company: 'BrightPath Finance' },
  { title: 'Machine Learning Engineer', description: 'Productionize predictive models and reliable machine learning workflows.', company: 'Greenline Mobility' },
  { title: 'Cloud Solutions Architect', description: 'Shape scalable cloud platforms for high-volume transportation products.', company: 'Greenline Mobility' },
  { title: 'UX Researcher', description: 'Use interviews and product research to uncover better customer solutions.', company: 'Greenline Mobility' },
  { title: 'Operations Manager', description: 'Coordinate teams and processes that keep daily operations moving smoothly.', company: 'Greenline Mobility' },
  { title: 'Customer Success Manager', description: 'Help customers get lasting value from the platform and its services.', company: 'Greenline Mobility' },
  { title: 'JavaScript Developer', description: 'Deliver maintainable browser features with modern JavaScript and testing.', company: 'Northstar Labs' },
  { title: 'Database Engineer', description: 'Optimize schemas, queries, and data access patterns for growing systems.', company: 'BrightPath Finance' },
  { title: 'Project Manager', description: 'Lead cross-functional delivery from discovery through launch.', company: 'Greenline Mobility' },
  { title: 'Business Analyst', description: 'Connect stakeholder goals with measurable product and process improvements.', company: 'BrightPath Finance' },
  { title: 'Support Engineer', description: 'Solve technical customer problems and turn recurring issues into improvements.', company: 'Northstar Labs' },
];

async function main() {
  const connectionString = process.env.DATABASE_URL;

  if (!connectionString) {
    throw new Error('DATABASE_URL must be set before running the seed script.');
  }

  const pool = new Pool({ connectionString });
  const adapter = new PrismaPg(pool);
  const prisma = new PrismaClient({ adapter });

  try {
    const password = await bcrypt.hash('mock-password', 10);
    const owner = await prisma.user.upsert({
      where: { email: mockOwnerEmail },
      update: { role: Role.CLIENT },
      create: { email: mockOwnerEmail, password, role: Role.CLIENT },
    });

    const companyIds = new Map<string, string>();
    for (const companyName of [...new Set(jobs.map((job) => job.company))]) {
      const existingCompany = await prisma.company.findFirst({
        where: { name: companyName, ownerId: owner.id },
      });

      const company = existingCompany
        ? await prisma.company.update({
            where: { id: existingCompany.id },
            data: { description: `Mock company for the ${companyName} job listings.` },
          })
        : await prisma.company.create({
            data: {
              name: companyName,
              description: `Mock company for the ${companyName} job listings.`,
              ownerId: owner.id,
            },
          });

      companyIds.set(companyName, company.id);
    }

    await prisma.application.deleteMany({});
    await prisma.jobPost.deleteMany({});

    await prisma.jobPost.createMany({
      data: jobs.map((job) => ({
        title: job.title,
        description: job.description,
        companyId: companyIds.get(job.company) as string,
        userId: owner.id,
      })),
    });

    console.log(`Seeded ${jobs.length} mock jobs for ${mockOwnerEmail}.`);
  } finally {
    await prisma.$disconnect();
    await pool.end();
  }
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});