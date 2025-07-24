import { MigrationInterface, QueryRunner } from "typeorm";

export class AddGINIndexes1753267256648 implements MigrationInterface {

    public async up(queryRunner: QueryRunner): Promise<void> {
        
        await queryRunner.query(`
            DO $$
            BEGIN
                IF NOT EXISTS (
                    SELECT 1 FROM pg_class c
                    WHERE c.relname = 'IDX_delivery_history_receiverList_gin'
                ) THEN
                    CREATE INDEX "IDX_delivery_history_receiverList_gin" 
                    ON delivery_history USING GIN ("receiverList");
                END IF;
            END
            $$;
        `);

        await queryRunner.query(`
            DO $$
            BEGIN
                IF NOT EXISTS (
                    SELECT 1 FROM pg_class c
                    WHERE c.relname = 'IDX_latest_delivery_receiverList_gin'
                ) THEN
                    CREATE INDEX "IDX_latest_delivery_receiverList_gin" 
                    ON "latest_delivery" USING GIN ("receiverList");
                END IF;
            END
            $$;
        `);


    }

    public async down(queryRunner: QueryRunner): Promise<void> {
       
        await queryRunner.query(
            `DROP INDEX IF EXISTS "IDX_delivery_history_receiverList_gin";`
        );
        await queryRunner.query(
            `DROP INDEX IF EXISTS "IDX_latest_delivery_receiverList_gin";`
        );

        

    }

}
