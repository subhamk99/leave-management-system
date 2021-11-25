import {  Connection } from "typeorm";
import { testConn } from "../test-utils/testConn";
import faker from "faker";
import { gCall } from "../test-utils/gCall";
import { User } from "../entity/User";
import { createAccessToken } from "../config/Authorize";


let conn:Connection;
jest.mock("../middleware/Authenticate",()=>{
    return{
        isAuthenticated:(_:any,next:any)=>next()
    }
});
beforeAll( async ()=>{
   conn = await testConn();
   process.env = Object.assign(process.env, { ACCESS_TOKEN_SECRET: 'test' });
});

afterAll( async ()=>{
    await conn.close();
});
const user:{name:string,email:string,password:string,leave_balance:number,id:number} = {
    name:faker.name.firstName(),
    email:faker.internet.email(),
    password:faker.internet.password(),
    leave_balance:faker.datatype.number(),
    id:faker.datatype.number()
}
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
describe("It checks signUp mutation",()=>{
    it('create user', async()=>{
        const response = await gCall({
            source:signUpMutation,
            variableValues:{
                user:{
                    name:user.name,
                    email:user.email,
                    password:user.password,
                    leave_balance:user.leave_balance
                }
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
        user.id = dbUser!.id;
        expect(dbUser).toBeDefined();
        expect(dbUser?.name).toBe(user.name);
    });
});
describe("It checks no duplicate records are created for the same email.",()=>{
    it('create duplicate user', async()=>{
        const response = await gCall({
            source:signUpMutation,
            variableValues:{
                user:{
                    name:user.name,
                    email:user.email,
                    password:user.password,
                    leave_balance:user.leave_balance
                }
            }
        });

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
describe('It checks if access token is created',()=>{
    it('checks access token if null', async ()=>{
        const response = await createAccessToken(user);

        expect(response).toBeTruthy();
    });
});
const getAllUsers=
`
query Query {
    getAllUsers {
      name
      email
      leave_balance
    }
  }
`;
describe('It checks the get all users query',()=>{
    it('getAllUSers',async()=>{
        const dbUser = await User.create({
            name:faker.name.firstName(),
            email:faker.internet.email(),
            password:faker.internet.password(),
            leave_balance:faker.datatype.number(),
        }).save();
        const response = await gCall({
            source:getAllUsers
        });
        expect(response.data!.getAllUsers).toContainEqual({
            name:dbUser.name,
            email:dbUser.email,
            leave_balance:dbUser.leave_balance
        })
    });
});

const loginMutation =
`
mutation Login($loginData: LoginInput!) {
    login(login_data: $loginData) {
      accessToken
    }
  }`;
describe("It checks login mutation",()=>{
    it("user doesn't exist",async()=>{
        const response = await gCall({
            source:loginMutation,
            variableValues:{
                loginData:{
                    email:faker.internet.email(),
                    password:faker.internet.password()
                }
            }
        });
        expect(response).toMatchObject({
            errors:[
                {
                    message:"User doesn't exist!!",
                    path:[
                        "login"
                    ]
                }
            ],
            data:null
        });
    });
    it("bad credentials",async()=>{
        const response = await gCall({
            source:loginMutation,
            variableValues:{
                loginData:{
                    email:user.email,
                    password:faker.internet.password()
                }
            }
        });
        expect(response).toMatchObject({
            errors:[
                {
                    message:"Bad credentials!!",
                    path:[
                        "login"
                    ]
                }
            ],
            data:null
        });
    });
    it("generates access token",async()=>{
        const response = await gCall({
            source:loginMutation,
            variableValues:{
                loginData:{
                    email:user.email,
                    password:user.password
                }
            }
        });
        const accessToken = createAccessToken(user);
        expect(response).toEqual({
            data:{
                login:{
                    accessToken:accessToken
                }
            }
        });
    });
});