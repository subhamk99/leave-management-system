import { Min } from "class-validator";
import { Field, ObjectType,ID, Int } from "type-graphql";
import { BaseEntity, Column, Entity, OneToMany, PrimaryGeneratedColumn } from "typeorm";
import { Leave } from "./Leave";

@ObjectType()
@Entity()
export class User extends BaseEntity{

    @Field(()=> ID)
    @PrimaryGeneratedColumn()
    id!:number;

    @Field()
    @Column('text', {nullable:true})
    name:string;

    @Field()
    @Column('text', {nullable:true,unique:true})
    email:string;

    @Column('text', {nullable:true})
    password:string;

    @Field(()=> Int)
    @Column({default:0})
    @Min(0)
    leave_balance:number;

    @OneToMany(_type => Leave, leave => leave.user)
    leaves: Promise<Leave[]>
}