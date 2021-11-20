import { Arg, Field, InputType, Int, Mutation, Query, Resolver } from "type-graphql";
import { User } from "../entity/User";
import bcrypt from 'bcryptjs';
import { IsEmail, Length } from "class-validator";
import { IsEmailAlreadyExist } from "../decorators/isEmailAlreadyExist";

@InputType({description:"Signup information for new user"})
class UserInput implements Partial<User>{

    @Field({nullable:false})
    @Length(1,20,{message:"Name length must be 1 between 20"})
    name:string;

    @Field({nullable:false})
    @IsEmail()
    @IsEmailAlreadyExist({message:"Email already in use!!"})
    email:string;

    @Field({nullable:false})
    password:string;

    @Field(()=>Int,{nullable:true,defaultValue:0})
    leave_balance:number;
}

@Resolver()
export class UserResolver{

    @Query((_type)=>User,{nullable:true})
    async getUser(
        @Arg('email',{nullable:true}) email:string
    ):Promise<User|undefined>{

        if(email){
            return await User.findOne({where:{email:email}});
        }
        return undefined;
    }

    @Query( ()=>[User])
    async getAllUsers():Promise<User[]>{
        return await User.find();
    }

    @Mutation(()=>User, {name:"userSignUp"})
    async signup(
        @Arg('user') user:UserInput,
    ):Promise<User>{
        const hashedPassword = await bcrypt.hash(user.password, 12);

        user.password=hashedPassword;
        return await User.create(user).save();
    }
}