import { Connection } from "typeorm";
import { testConn } from "../test-utils/testConn";
import faker from "faker";
import { gCall } from "../test-utils/gCall";
import { User } from "../entity/User";

let conn:Connection;
beforeAll( async ()=>{
   conn = await testConn();
});

afterAll( async ()=>{
    await conn.close();
});

const signUpMutation = `
mutation Signup($user: UserInput!) {
    userSignUp(user: $user) {
      id
      name
      email
      leave_balance
    }
  }
`;
const user:{name:string,email:string,password:string,leave_balance:number} = {
    name:faker.name.firstName(),
    email:faker.internet.email(),
    password:faker.internet.password(),
    leave_balance:faker.datatype.number()
}
describe("It checks if a user is created on signup.",()=>{
    it('create user', async()=>{
        
        const response = await gCall({
            source:signUpMutation,
            variableValues:{
                user:user
            }
        });

        expect(response).toMatchObject({
            data:{
                userSignUp:{
                    name:user.name,
                    email:user.email,
                    leave_balance:user.leave_balance
                }
            }
        });

        const dbUser = await User.findOne({where:{email:user.email}});
        expect(dbUser).toBeDefined();
        expect(dbUser?.name).toBe(user.name);
    });
   
});
describe("It checks no duplicate records are created for the same email.",()=>{
    it('create duplicate user', async()=>{
        const response = await gCall({
            source:signUpMutation,
            variableValues:{
                user:user
            }
        });

        console.log(response);
        
        expect(response).toMatchObject({
            errors:[
                {
                    message:"Argument Validation Error",
                    path:[
                        "userSignUp"
                    ]
                }
            ],
            data:null
        });
    });
});
const getUserMutation =`
query Query {
    getUser {
      id
      name
      email
      leave_balance
    }
  }
`;

describe('It checks current user query not available when not logged in.',()=>{
    it('fetches the current user', async ()=>{
        const response = await gCall({
            source:getUserMutation,
        });

        expect(response).toMatchObject({
            data:{
                getUser:null
            }
        });
    });
});