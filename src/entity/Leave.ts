import { ObjectType, Field, ID } from "type-graphql";
import { BaseEntity, Column, Entity, ManyToOne, PrimaryGeneratedColumn } from "typeorm";
import { User } from "./User";

@ObjectType()
@Entity()
export class Leave extends BaseEntity{

    @Field(()=>ID)
    @PrimaryGeneratedColumn()
    id!:number;

    @Field()
    @Column()
    start_date:Date;

    @Field()
    @Column()
    end_date:Date;

    @Field()
    @Column({nullable:false,default:'pending'})
    status!:'pending'|'approved';

    @ManyToOne(_type => User, user => user.leaves)
    user:Promise<User>;
}