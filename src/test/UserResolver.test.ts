import { gCall } from "../test-utils/gCall";
import { Connection } from "typeorm";
import { testConn } from "../test-utils/testConn";

let conn:Connection;
beforeAll( async ()=>{
   conn = await testConn();
});

afterAll( async ()=>{
    await conn.close();
});

const signUpMutation = `
mutation Mutation($user: UserInput!) {
    userSignUp(user: $user) {
      id
      name
      email
      leave_balance
    }
  }
`;
describe('UserResolver',()=>{
    it('create user', async()=>{
        console.log(await gCall({
            source:signUpMutation,
            variableValues:{
                user:{
                    name:"subham",
                    email:"subham@gmail.com",
                    password:"test",
                    leave_balance:10
                }
            }
        }));
        
    });
});

