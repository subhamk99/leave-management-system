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

  describe("Queries", () => {
    test("Invalid query getAllLeaves", () => {
      const invalidQuery = `
      query AllLeaves {
        allLeaves {
          id
          start_date
          end_date
          status
          invalid_field
          user {
            id
            name
            email
            leave_balance
          }
        }
      }
      `;
      // First arg: false because the query is not valid (There is no invalid field in getUser query)
      // Second arg: query to test
      tester.test(false, invalidQuery);
    });

    test("Should pass with a valid query", () => {
      const validQuery = `
      query AllLeaves {
        allLeaves {
          id
          start_date
          end_date
          status
          user {
            id
            name
            email
            leave_balance
          }
        }
      }
      `;
      // First arg: true because the query is valid
      // Second arg: query to test
      tester.test(true, validQuery);
    });
  });
});