import { Expose } from 'class-transformer';

export class AdminRO {

    @Expose()
    adminId: string;

    @Expose()
    name: string;

    @Expose()
    officeId: string;

    @Expose()
    isActive: boolean;

}