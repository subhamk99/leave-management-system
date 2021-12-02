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
    test("Invalid input type for signup mutation", () => {
      const signup_mutation = `
      mutation Mutation($user: UserInput) {
        signup(user: $user) {
          id
          name
          email
          leave_balance
        }
      }
      `;
      // First arg: false because the input value is not valid (invalid email, leave_balance must be integer)
      // Second arg: mutation to test
      // Third arg: input value
      tester.test(false, signup_mutation, {
        user: {
          name: "test",
          email: "invalid_email",
          password: "test",
          leave_balance: "invalid_input"
        }
      });
    });
    test("Valid input type for signup mutation", () => {
      const signup_mutation = `
      mutation Mutation($user: UserInput) {
        signup(user: $user) {
          id
          name
          email
          leave_balance
        }
      }
      `;
      // First arg: true because the input value is valid
      // Second arg: mutation to test
      // Third arg: input value
      tester.test(true, signup_mutation, {
        user: {
          name: "test",
          email: "random@email.com",
          password: "test",
          leave_balance: 10
        }
      });
    });
    test("Invalid input type for login mutation", () => {
      const login_mutation = `
      mutation Login($loginData: LoginInput) {
        login(loginData: $loginData) {
          accessToken
          user {
            email
            name
            id
          }
        }
      }
      `;
      // First arg: false because the input value is not valid (invalid email, password must be string)
      // Second arg: mutation to test
      // Third arg: input value
      tester.test(false, login_mutation, {
        loginData: {
          email: "invalid_email",
          password: 10,
        }
      });
    });
    test("Valid input type for signup mutation", () => {
      const login_mutation = `
      mutation Login($loginData: LoginInput) {
        login(loginData: $loginData) {
          accessToken
          user {
            email
            name
            id
          }
        }
      }
      `;
      // First arg: true because the input value is valid
      // Second arg: mutation to test
      // Third arg: input value
      tester.test(true, login_mutation, {
        loginData: {
            email: "test@gmail.com",
            password: "test",
          }
      });
    });

  });
});