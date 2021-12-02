'use strict';
import fs from "fs";
import path from "path";

const EasyGraphQLTester = require('easygraphql-tester')
const userSchema = fs.readFileSync(path.join(  __dirname,'..','..','..','src','graphql','typedefs','user','user.graphql'),{encoding:"utf-8"});
const leaveSchema = fs.readFileSync(path.join(  __dirname,'..','..','..','src','graphql','typedefs','leave','leave.graphql'),{encoding:"utf-8"});

describe("Test my schema, queries and mutations", () => {
  let tester:any;
  beforeAll(() => {
    tester = new EasyGraphQLTester([userSchema,leaveSchema]);
  });
  
  describe("Mutations", () => {
    test("Invalid input type for applyLeave mutation", () => {
      const applyLeave_mutation = `
      mutation ApplyLeave($leaveInput: LeaveInput) {
        applyLeave(leave_input: $leaveInput) {
          start_date
          end_date
          status
          id
        }
      }
      `;
      // First arg: false because the input value is not valid (start and end dates must be DateTime)
      // Second arg: mutation to test
      // Third arg: input value
      tester.test(false, applyLeave_mutation, {
        leaveInput:{
            start_date:1,
            end_date:undefined
        }
      });
    });
    test("Valid input type for applyLeave mutation", () => {
        const applyLeave_mutation = `
        mutation ApplyLeave($leaveInput: LeaveInput) {
          applyLeave(leave_input: $leaveInput) {
            start_date
            end_date
            status
            id
          }
        }
        `;
      // First arg: true because the input value is valid
      // Second arg: mutation to test
      // Third arg: input value
      tester.test(true, applyLeave_mutation, {
        leaveInput:{
            start_date:"2021-12-02",
            end_date:"2021-12-03"
        }
      });
    });
  });
  test("Invalid input type for updateLeave mutation", () => {
    const updateLeave_mutation = `
    mutation UpdateLeave($leaveId: Int, $leaveInput: LeaveInput) {
      updateLeave(leave_id: $leaveId, leave_input: $leaveInput) {
        id
        start_date
        end_date
        status
      }
    }
    `;
    // First arg: false because the input value is not valid (start and end dates must be DateTime, leaveId must be Integer)
    // Second arg: mutation to test
    // Third arg: input value
    tester.test(false, updateLeave_mutation, {
      leaveId:undefined,
      leaveInput:{
          start_date:1,
          end_date:undefined
      }
    });
  });
  test("Valid input type for updateLeave mutation", () => {
      const updateLeave_mutation = `
    mutation UpdateLeave($leaveId: Int, $leaveInput: LeaveInput) {
      updateLeave(leave_id: $leaveId, leave_input: $leaveInput) {
        id
        start_date
        end_date
        status
      }
    }
    `;
    // First arg: true because the input value is valid
    // Second arg: mutation to test
    // Third arg: input value
    tester.test(true, updateLeave_mutation, {
      leaveId:2,
      leaveInput:{
          start_date:"2021-12-02",
          end_date:"2021-12-03"
      }
    });
  });
  test("Invalid input type for cancelLeave mutation", () => {
    const cancelLeave_mutation = `
    mutation CancelLeave($leaveId: Int) {
        cancelLeave(leave_id: $leaveId) {
          id
          start_date
          end_date
          status
        }
      }
    `;
    // First arg: false because the input value is not valid (leaveId must be Integer)
    // Second arg: mutation to test
    // Third arg: input value
    tester.test(false, cancelLeave_mutation, {
      leaveId:"random",
    });
  });
  test("Valid input type for cancelLeave mutation", () => {
      const cancelLeave_mutation = `
      mutation CancelLeave($leaveId: Int) {
        cancelLeave(leave_id: $leaveId) {
          id
          start_date
          end_date
          status
        }
      }
    `;
    // First arg: true because the input value is valid
    // Second arg: mutation to test
    // Third arg: input value
    tester.test(true, cancelLeave_mutation, {
      leaveId:2,
    });
  });
});