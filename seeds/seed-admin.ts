// seed-admins.ts
import { v4 as uuidv4 } from 'uuid';
import { Admin } from '../src/admin/admin.entity';
import DataSource from '../src/data-source';
import { faker } from '@faker-js/faker';

async function main() {
  await DataSource.initialize();
  const adminRepo = DataSource.getRepository(Admin);

  const admins: Admin[] = [];

  for (let i = 0; i < 10; i++) {
    const admin = adminRepo.create({
      adminId: uuidv4(),
      name: faker.company.name(),
      officeId: faker.string.alphanumeric(10),
    });
    admins.push(admin);
  }

  await adminRepo.save(admins);
  console.log(`Seeded ${admins.length} admins`);
  await DataSource.destroy();
}

main().catch((err) => {
  console.error('Error seeding admins:', err);
});
