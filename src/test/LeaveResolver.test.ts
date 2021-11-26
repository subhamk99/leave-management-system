import {  Connection } from "typeorm";
import { testConn } from "../test-utils/testConn";
import faker from "faker";
import { gCall } from "../test-utils/gCall";
import { User } from "../entity/User";

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

const applyLeave = `
mutation Mutation($leaveInput: LeaveInput!) {
    applyLeave(leave_input: $leaveInput) {
      id
      start_date
      end_date
      status
    }
  }
`;

describe("It checks the apply leave mutation",()=>{
    it('insufficient leaves', async()=>{
        const dbUser = await User.create({
            name:faker.name.firstName(),
            email:faker.internet.email(),
            password:faker.internet.password(),
            leave_balance:0,
        }).save();
        const response = await gCall({
            source:applyLeave,
            userId:dbUser.id,
            variableValues:{
                leaveInput:{
                    start_date:"2021-11-11",
                    end_date:"2021-11-13"
                }
            }
        });

        expect(response).toMatchObject({
            errors:[
                {
                    message:"Insufficient leaves!!!",
                    path:[
                        "applyLeave"
                    ]
                }
            ],
            data:null
        });
    });
    it('insufficient leaves', async()=>{
        const dbUser = await User.create({
            name:faker.name.firstName(),
            email:faker.internet.email(),
            password:faker.internet.password(),
            leave_balance:0,
        }).save();
        const response = await gCall({
            source:applyLeave,
            userId:dbUser.id,
            variableValues:{
                leaveInput:{
                    start_date:"2021-11-11",
                    end_date:"2021-11-11"
                }
            }
        });

        expect(response).toMatchObject({
            errors:[
                {
                    message:"Minimum leave duration should be 1 day!",
                    path:[
                        "applyLeave"
                    ]
                }
            ],
            data:null
        });
    });
    it('user doesn\'t exist', async()=>{
        const response = await gCall({
            source:applyLeave,
            variableValues:{
                leaveInput:{
                    start_date:"2021-11-11",
                    end_date:"2021-11-13"
                }
            }
        });

        expect(response).toMatchObject({
            errors:[
                {
                    message:"User doesn't exist!!!",
                    path:[
                        "applyLeave"
                    ]
                }
            ],
            data:null
        });
    });
    it('apply leave should be succesful', async()=>{
        const dbUser = await User.create({
            name:faker.name.firstName(),
            email:faker.internet.email(),
            password:faker.internet.password(),
            leave_balance:faker.datatype.number(),
        }).save();
        const response = await gCall({
            source:applyLeave,
            userId:dbUser.id,
            variableValues:{
                leaveInput:{
                    start_date:"2021-11-11",
                    end_date:"2021-11-13"
                }
            }
        });

        expect(response).toMatchObject({
            data:{
                applyLeave:{
                    start_date:"2021-11-11T00:00:00.000Z",
                    end_date: '2021-11-13T00:00:00.000Z',
                    status: 'pending'
                }
            }
        });
    });
});

const updateLeave =
`
mutation UpdateLeave($leaveInput: LeaveUpdateInput!, $leaveId: Int!) {
    updateLeave(leave_input: $leaveInput, leave_id: $leaveId)
  }`;
describe("It checks the updateLeave mutation",()=>{
    it("updated successfully",async ()=>{
        const dbUser = await User.create({
            name:faker.name.firstName(),
            email:faker.internet.email(),
            password:faker.internet.password(),
            leave_balance:faker.datatype.number(),
        }).save();
        const response = await gCall({
            source:applyLeave,
            userId:dbUser.id,
            variableValues:{
                leaveInput:{
                    start_date:"2021-11-11",
                    end_date:"2021-11-13"
                }
            }
        });
        const leave_id = response.data!.applyLeave.id;
        const updateLeaveResponse = await gCall({
            source:updateLeave,
            userId:dbUser.id,
            variableValues:{
                leaveInput:{
                    start_date:"2021-12-11",
                    end_date:"2021-12-13"
                },
                leaveId:leave_id
            }
        });
        expect(updateLeaveResponse).toEqual({
            data:{
                updateLeave:true
            }
        })
    });
});
const canLeaveMutation =
`
mutation CancelLeave($leaveId: Int!) {
    cancelLeave(leave_id: $leaveId)
  }
`;
describe("It checks the cancelLeave mutation",()=>{
    it("cancelled successfully",async ()=>{
        const dbUser = await User.create({
            name:faker.name.firstName(),
            email:faker.internet.email(),
            password:faker.internet.password(),
            leave_balance:faker.datatype.number(),
        }).save();
        const response = await gCall({
            source:applyLeave,
            userId:dbUser.id,
            variableValues:{
                leaveInput:{
                    start_date:"2021-11-11",
                    end_date:"2021-11-13"
                }
            }
        });
        const leave_id = response.data!.applyLeave.id;
        const cancelLeaveResponse = await gCall({
            source:canLeaveMutation,
            userId:dbUser.id,
            variableValues:{
                leaveInput:{
                    start_date:"2021-12-11",
                    end_date:"2021-12-13"
                },
                leaveId:leave_id
            }
        });
        expect(cancelLeaveResponse).toEqual({
            data:{
                cancelLeave:true
            }
        })
    });
});
const getAllLeavesQuery = `
query AllLeaves {
    allLeaves {
      id
      start_date
      end_date
      status
    }
  }
`;
describe("It checks the getAllLeaves query",()=>{
    it("user doesn't exist",async()=>{
        const response = await gCall({
            source:getAllLeavesQuery,
        });
        expect(response).toMatchObject({
            errors:[
                {
                    message:"User doesn't exist!!!",
                    path:[
                        "allLeaves"
                    ]
                }
            ],
            data:null
        });
    });
    it("fetch all leaves of logged in user",async()=>{
        const dbUser = await User.create({
            name:faker.name.firstName(),
            email:faker.internet.email(),
            password:faker.internet.password(),
            leave_balance:faker.datatype.number(),
        }).save();
        await gCall({
            source:applyLeave,
            userId:dbUser.id,
            variableValues:{
                leaveInput:{
                    start_date:"2021-11-11",
                    end_date:"2021-11-13"
                }
            }
        });

        const response = await gCall({
            source:getAllLeavesQuery,
            userId:dbUser.id
        });
        expect(response.data!.allLeaves[0].start_date).toEqual("2021-11-11T00:00:00.000Z");
        expect(response.data!.allLeaves[0].end_date).toEqual("2021-11-13T00:00:00.000Z");
        expect(response.data!.allLeaves[0].status).toEqual("pending");
    });
});