import { faker } from '@faker-js/faker';
import { v4 as uuidv4 } from 'uuid';
import  DataSource  from '../src/data-source';
import { Store } from '../src/store/store.entity';
import { Admin } from '../src/admin/admin.entity';



async function seedStores() {
  const dataSource = await DataSource.initialize();

  await dataSource.transaction(async (manager) => {
    const adminRepo = manager.getRepository(Admin);
    const storeRepo = manager.getRepository(Store);

    const admins = await adminRepo.find();
    const stores: Store[] = [];
    const groups: Store[] = [];
    const shops: Store[] = [];

    // Group stores per admin.id
    const groupsByAdmin: Record<number, Store[]> = {};


    for (const admin of admins) {
      groupsByAdmin[admin.id] = [];

      // Create 3 group stores per admin
      for (let i = 0; i < 3; i++) {
        const storename = faker.company.name(); // human-readable
        const storeName = faker.internet.domainWord().toLowerCase() + `-group-${i}`; // lowercase, no spaces

        const storeCode = faker.string.alphanumeric(4).toUpperCase();
        const groupStore = storeRepo.create({
          storeId: uuidv4(),
          storeName,
          storeCode,
          storeNameCode: storeName + storeCode,
          storename,
          password: 'password123',
          storeType: 'group',
          admin,
        });


        stores.push(groupStore);
        groups.push(groupStore);
      }
    }

    const savedGroups = await storeRepo.save(groups);

    for (const groupStore of savedGroups) {
        groupsByAdmin[groupStore.admin.id].push(groupStore);
    }

    // Now create 7 shops per admin
    for (const admin of admins) {
      const availableGroups = groupsByAdmin[admin.id] || [];

      for (let i = 0; i < 7; i++) {
        const storename = faker.company.name(); // human-readable 
        const storeName = faker.internet.domainWord().toLowerCase() + `-shop-${i}`; // lowercase, no spaces

        const storeCode = faker.string.alphanumeric(4).toUpperCase();
        const group = faker.helpers.maybe(() => faker.helpers.arrayElement(availableGroups), { probability: 0.7 });

        const shopStore = storeRepo.create({
          storeId: uuidv4(),
          storeName,
          storeCode,
          storeNameCode: storeName + storeCode,
          storename,
          password: 'password123',
          storeType: 'shop',
          admin,
          parentGroup: group ?? undefined,
        });

        stores.push(shopStore);
        shops.push(shopStore);
      }
    }

    await storeRepo.save(shops);
    console.log(' Stores seeded successfully!');
  });

  await dataSource.destroy();
}

seedStores().catch((error) => {
  console.error(' Error seeding stores:', error);
});
