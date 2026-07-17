import mongoose from 'mongoose';
import { connectDatabase, disconnectDatabase } from '../config/database';
import { User, Project, Task } from '../models';
import { hashPassword } from '../utils/helpers';

const SEED_USERS = [
  {
    email: 'admin@example.com',
    password: 'Password123',
    firstName: 'Admin',
    lastName: 'User',
    role: 'admin' as const,
  },
  {
    email: 'bob@example.com',
    password: 'Password123',
    firstName: 'Bob',
    lastName: 'Example',
    role: 'user' as const,
  },
  {
    email: 'alice@example.com',
    password: 'Password123',
    firstName: 'Alice',
    lastName: 'Smith',
    role: 'user' as const,
  },
];

const SEED_PROJECT = {
  name: 'Website Redesign',
  description: 'Collaborative project for redesigning the company website.',
  status: 'active' as const,
  tasks: [
    { title: 'Design homepage mockup', status: 'done' as const, priority: 'high' as const, assigneeEmail: 'alice@example.com' },
    { title: 'Set up Next.js project', status: 'in_progress' as const, priority: 'medium' as const, assigneeEmail: 'bob@example.com' },
    { title: 'Implement auth flow', status: 'todo' as const, priority: 'high' as const, assigneeEmail: 'bob@example.com' },
    { title: 'Write API documentation', status: 'todo' as const, priority: 'low' as const, assigneeEmail: 'admin@example.com' },
  ],
};

async function seed() {
  await connectDatabase();

  console.log('Seeding users...\n');
  const userMap = new Map<string, string>();

  for (const seedUser of SEED_USERS) {
    let user = await User.findOne({ email: seedUser.email });

    if (!user) {
      const hashedPassword = await hashPassword(seedUser.password);
      user = await User.create({
        email: seedUser.email,
        password: hashedPassword,
        firstName: seedUser.firstName,
        lastName: seedUser.lastName,
        role: seedUser.role,
      });
      console.log(`  added ${seedUser.email}`);
    } else {
      console.log(`  skip  ${seedUser.email} (already exists)`);
    }

    userMap.set(seedUser.email, user._id.toString());
  }

  console.log('\nSeeding demo project...\n');

  const adminId = userMap.get('admin@example.com')!;
  const bobId = userMap.get('bob@example.com')!;
  const aliceId = userMap.get('alice@example.com')!;

  let project = await Project.findOne({ name: SEED_PROJECT.name });

  if (!project) {
    project = await Project.create({
      name: SEED_PROJECT.name,
      description: SEED_PROJECT.description,
      status: SEED_PROJECT.status,
      owner: adminId,
      members: [bobId, aliceId],
    });
    console.log(`  added project "${SEED_PROJECT.name}"`);
  } else {
    console.log(`  skip  project "${SEED_PROJECT.name}" (already exists)`);
  }

  const existingTaskCount = await Task.countDocuments({ project: project._id });

  if (existingTaskCount === 0) {
    for (const seedTask of SEED_PROJECT.tasks) {
      const assigneeId = userMap.get(seedTask.assigneeEmail);
      await Task.create({
        title: seedTask.title,
        status: seedTask.status,
        priority: seedTask.priority,
        project: project._id,
        assignee: assigneeId,
        createdBy: adminId,
        lastUpdatedBy: adminId,
      });
      console.log(`  added task "${seedTask.title}"`);
    }
  } else {
    console.log(`  skip  tasks (${existingTaskCount} already exist)`);
  }

  console.log('\nSeed complete!\n');
  console.log('Login credentials (all use Password123):');
  for (const user of SEED_USERS) {
    console.log(`  ${user.email}`);
  }
  console.log('\nFlow: Login → Projects (sidebar) → Open Board → Kanban + real-time');
}

seed()
  .catch((error) => {
    console.error('Seed failed:', error);
    process.exitCode = 1;
  })
  .finally(async () => {
    await disconnectDatabase();
    await mongoose.connection.close();
  });
