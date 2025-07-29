import { faker } from '@faker-js/faker';
import { v4 as uuidv4 } from 'uuid';
import  DataSource  from '../src/data-source';
import { Store } from '../src/store/store.entity';
import { Admin } from '../src/admin/admin.entity';


const unique_storenames = new Set<string>();
const unique_storeCodes = new Set<string>();

async function getUnique_storename(){
  let storename : string;
  do{
    storename = faker.company.name();
  }
  while(unique_storenames.has(storename));

  unique_storenames.add(storename);

  return storename;
}

async function getUnique_storeCode(){
  let storeCode : string;
  do{
    storeCode = faker.string.alphanumeric(4).toUpperCase();
  }
  while(unique_storeCodes.has(storeCode));

  unique_storeCodes.add(storeCode);

  return storeCode;
}


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

      // Create 15 groups per admin
      for (let i = 0; i < 15; i++) {
        const storename = await getUnique_storename(); // human-readable
        const storeName = faker.internet.domainWord().toLowerCase() + `-group-${i}`; // lowercase, no spaces

        const storeCode = await getUnique_storeCode();
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

    // Now create 35 shops per admin
    for (const admin of admins) {
      const availableGroups = groupsByAdmin[admin.id] || [];

      if (availableGroups.length === 0) {
        console.warn(`No groups available for admin ${admin.id}. Skipping shop creation.`);
        continue;
      }

      for (let i = 0; i < 35; i++) {
        const storename = await getUnique_storename(); // human-readable 
        const storeName = faker.internet.domainWord().toLowerCase() + `-shop-${i}`; // lowercase, no spaces

        const storeCode = await getUnique_storeCode();
        const group = faker.helpers.arrayElement(availableGroups);


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
