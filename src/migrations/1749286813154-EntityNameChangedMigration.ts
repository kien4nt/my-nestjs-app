import { MigrationInterface, QueryRunner } from "typeorm";

export class EntityNameChangedMigration1749286813154 implements MigrationInterface {
    name = 'EntityNameChangedMigration1749286813154'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "delivery_history" DROP CONSTRAINT "FK_0d1a6e3f5b8f171f83216490c01"`);
        await queryRunner.query(`ALTER TABLE "delivery_history" DROP CONSTRAINT "FK_3dbf9d9f8486caed1c93e4b62c4"`);
        await queryRunner.query(`ALTER TABLE "latest_delivery" DROP CONSTRAINT "FK_781ea8538ffda653df565221957"`);
        await queryRunner.query(`ALTER TABLE "store" DROP CONSTRAINT "FK_940f844f1c662c41b0a94cd5a04"`);
        await queryRunner.query(`ALTER TABLE "store" DROP CONSTRAINT "FK_98afb6d3b4275160ba6286bc88d"`);
        await queryRunner.query(`DROP INDEX "public"."IDX_DeliveryHistory_receiverList_gin"`);
        await queryRunner.query(`DROP INDEX "public"."IDX_LatestDelivery_receiverList_gin"`);
        await queryRunner.query(`DROP INDEX "public"."IDX_9551b1381b1489d0c23b79dd07"`);
        await queryRunner.query(`CREATE SEQUENCE IF NOT EXISTS "admin_id_seq" OWNED BY "admin"."id"`);
        await queryRunner.query(`ALTER TABLE "admin" ALTER COLUMN "id" SET DEFAULT nextval('"admin_id_seq"')`);
        await queryRunner.query(`ALTER TABLE "admin" ALTER COLUMN "id" DROP DEFAULT`);
        await queryRunner.query(`CREATE SEQUENCE IF NOT EXISTS "delivery_history_id_seq" OWNED BY "delivery_history"."id"`);
        await queryRunner.query(`ALTER TABLE "delivery_history" ALTER COLUMN "id" SET DEFAULT nextval('"delivery_history_id_seq"')`);
        await queryRunner.query(`ALTER TABLE "delivery_history" ALTER COLUMN "id" DROP DEFAULT`);
        await queryRunner.query(`CREATE SEQUENCE IF NOT EXISTS "store_id_seq" OWNED BY "store"."id"`);
        await queryRunner.query(`ALTER TABLE "store" ALTER COLUMN "id" SET DEFAULT nextval('"store_id_seq"')`);
        await queryRunner.query(`ALTER TABLE "store" ALTER COLUMN "id" DROP DEFAULT`);
        await queryRunner.query(`CREATE UNIQUE INDEX "IDX_e398112470c7079de18bd125c6" ON "store" ("storeName", "storeCode") `);
        await queryRunner.query(`ALTER TABLE "delivery_history" ADD CONSTRAINT "FK_5fd62bf6ae9f2ce91a21e36b0a9" FOREIGN KEY ("receiverId") REFERENCES "store"("id") ON DELETE SET NULL ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "delivery_history" ADD CONSTRAINT "FK_e7382dd1a4ed1f24a7f26b69d0f" FOREIGN KEY ("senderId") REFERENCES "store"("id") ON DELETE SET NULL ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "latest_delivery" ADD CONSTRAINT "FK_fea49b0e6bc3388938a9279c338" FOREIGN KEY ("storeIdPK") REFERENCES "store"("id") ON DELETE CASCADE ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "store" ADD CONSTRAINT "FK_cc18c58bf33f72ca628a4297921" FOREIGN KEY ("adminIdPK") REFERENCES "admin"("id") ON DELETE SET NULL ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "store" ADD CONSTRAINT "FK_58a9795ca8f1606b3d582e23e99" FOREIGN KEY ("parentGroupId") REFERENCES "store"("id") ON DELETE SET NULL ON UPDATE NO ACTION`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "store" DROP CONSTRAINT "FK_58a9795ca8f1606b3d582e23e99"`);
        await queryRunner.query(`ALTER TABLE "store" DROP CONSTRAINT "FK_cc18c58bf33f72ca628a4297921"`);
        await queryRunner.query(`ALTER TABLE "latest_delivery" DROP CONSTRAINT "FK_fea49b0e6bc3388938a9279c338"`);
        await queryRunner.query(`ALTER TABLE "delivery_history" DROP CONSTRAINT "FK_e7382dd1a4ed1f24a7f26b69d0f"`);
        await queryRunner.query(`ALTER TABLE "delivery_history" DROP CONSTRAINT "FK_5fd62bf6ae9f2ce91a21e36b0a9"`);
        await queryRunner.query(`DROP INDEX "public"."IDX_e398112470c7079de18bd125c6"`);
        await queryRunner.query(`ALTER TABLE "store" ALTER COLUMN "id" SET DEFAULT nextval('"Store_id_seq"')`);
        await queryRunner.query(`ALTER TABLE "store" ALTER COLUMN "id" DROP DEFAULT`);
        await queryRunner.query(`DROP SEQUENCE "store_id_seq"`);
        await queryRunner.query(`ALTER TABLE "delivery_history" ALTER COLUMN "id" SET DEFAULT nextval('"DeliveryHistory_id_seq"')`);
        await queryRunner.query(`ALTER TABLE "delivery_history" ALTER COLUMN "id" DROP DEFAULT`);
        await queryRunner.query(`DROP SEQUENCE "delivery_history_id_seq"`);
        await queryRunner.query(`ALTER TABLE "admin" ALTER COLUMN "id" SET DEFAULT nextval('"Admin_id_seq"')`);
        await queryRunner.query(`ALTER TABLE "admin" ALTER COLUMN "id" DROP DEFAULT`);
        await queryRunner.query(`DROP SEQUENCE "admin_id_seq"`);
        await queryRunner.query(`CREATE UNIQUE INDEX "IDX_9551b1381b1489d0c23b79dd07" ON "store" ("storeCode", "storeName") `);
        await queryRunner.query(`CREATE INDEX "IDX_LatestDelivery_receiverList_gin" ON "latest_delivery" ("receiverList") `);
        await queryRunner.query(`CREATE INDEX "IDX_DeliveryHistory_receiverList_gin" ON "delivery_history" ("receiverList") `);
        await queryRunner.query(`ALTER TABLE "store" ADD CONSTRAINT "FK_98afb6d3b4275160ba6286bc88d" FOREIGN KEY ("parentGroupId") REFERENCES "store"("id") ON DELETE SET NULL ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "store" ADD CONSTRAINT "FK_940f844f1c662c41b0a94cd5a04" FOREIGN KEY ("adminIdPK") REFERENCES "admin"("id") ON DELETE SET NULL ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "latest_delivery" ADD CONSTRAINT "FK_781ea8538ffda653df565221957" FOREIGN KEY ("storeIdPK") REFERENCES "store"("id") ON DELETE CASCADE ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "delivery_history" ADD CONSTRAINT "FK_3dbf9d9f8486caed1c93e4b62c4" FOREIGN KEY ("senderId") REFERENCES "store"("id") ON DELETE SET NULL ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "delivery_history" ADD CONSTRAINT "FK_0d1a6e3f5b8f171f83216490c01" FOREIGN KEY ("receiverId") REFERENCES "store"("id") ON DELETE SET NULL ON UPDATE NO ACTION`);
    }

}
