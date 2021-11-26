import { Arg, Ctx, Field, InputType, Int, Mutation, ObjectType, Query, Resolver, UseMiddleware } from "type-graphql";
import { User } from "../entity/User";
import bcrypt, { compare } from 'bcryptjs';
import { IsEmail, Length } from "class-validator";
import { IsEmailAlreadyExist } from "../decorators/isEmailAlreadyExist";
import { isAuthenticated } from "../middleware/Authenticate";
import { MyContext } from "src/config/MyContext";
import { createAccessToken } from "../config/Authorize";

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

@InputType({description:"login input for authorization"})
class LoginInput{
    @Field()
    email:string;

    @Field()
    password:string;
}

@ObjectType({description:"login response after authorization"})
class LoginResponse{
    @Field()
    accessToken:string;

    @Field()
    user:User;
}


@Resolver()
export class UserResolver{

    //fetch current user details
    @Query((_type)=>User,{nullable:true})
    @UseMiddleware(isAuthenticated)
    async getUser(
        @Ctx() {payload}:MyContext
    ):Promise<User|undefined>{
        return await User.findOne({where:{id:payload?.userId}})
    }
    
    //fetch all user details
    @Query( ()=>[User])
    @UseMiddleware(isAuthenticated)
    async getAllUsers():Promise<User[]>{
        return await User.find();
    }

    // signup mutation
    @Mutation(()=>User, {name:"userSignUp"})
    async signup(
        @Arg('user') user:UserInput,
    ):Promise<User|string>{
        const hashedPassword = await bcrypt.hash(user.password, 12);

        user.password=hashedPassword;
        
        return await User.create(user).save();
    }

    //login mutation
    @Mutation( ()=>LoginResponse )
    async login(
        @Arg("login_data", ()=> LoginInput) login_data:LoginInput
    ):Promise<LoginResponse>{

        const user = await User.findOne({where:{email:login_data.email}})
            if(!user){
                throw new Error("User doesn't exist!!");
            }
            
            const valid = await compare(login_data.password, user.password);
            if(!valid){
                throw new Error("Bad credentials!!");
            }
            return {
                accessToken: createAccessToken(user),
                user,
            };
    }
}