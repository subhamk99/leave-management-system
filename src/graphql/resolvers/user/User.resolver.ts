import { User } from "../../../entity/User";
import bcrypt, { compare } from 'bcryptjs';
import { createAccessToken } from "../../../config/Authorize";

module.exports = {
    Query:{

        async getUser(_parent: any,_args: any, context: any, _info: any):Promise<User|undefined>{
            if(!context.user){
                throw new Error("You must log in!!!")
            }
            return await User.findOne({where:{id:context.user.userId}});
        },
        async getAllUsers(){
            return await User.find();
        },
    },
    Mutation:{
        async signup(_parent: any,args: any, _context: any, _info: any){
            const user =args.user
            const hashedPassword = await bcrypt.hash(user.password, 12);
            user.password=hashedPassword;
            
            const temp =  await User.create(user);
            console.log(temp);
            return temp;
            
        },
        async login(_parent: any,{loginData}: any, _context: any, _info: any){
            const user = await User.findOne({where:{email:loginData.email}})
            if(!user){
                throw new Error("User doesn't exist!!");
            }
            
            const valid = await compare(loginData.password, user.password);
            if(!valid){
                throw new Error("Bad credentials!!");
            }
            return {
                accessToken: createAccessToken(user),
                user,
            };
        }
    }
}