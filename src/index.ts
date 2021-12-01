import "reflect-metadata";
import { createConnection } from "typeorm";
import express from "express";
import { ApolloServer, gql } from "apollo-server-express";
import cors from "cors";
import fs from "fs";
import path from "path";
import { isAuthenticated } from "./middleware/Authenticate";
( async () => {
    const app = express();

    app.use(cors(
        {
            origin: "*",
            methods: "GET,HEAD,PUT,PATCH,POST,DELETE",
            preflightContinue: false,
            optionsSuccessStatus: 204,
        }
    ));
    await createConnection();

    const user_typedef = gql(fs.readFileSync(
        path.join(
            __dirname,'..','src','graphql','typedefs','user','user.graphql')
            ,{encoding:"utf-8"}));
    const leave_typeDef = gql(fs.readFileSync(
        path.join(
            __dirname,'..','src','graphql','typedefs','leave','leave.graphql')
            ,{encoding:"utf-8"}));

    const user_resolver =require("./graphql/resolvers/user/user.resolver.ts");
    const leave_resolver =require("./graphql/resolvers/leave/leave.resolver.ts");

    const apolloServer = new ApolloServer({
         typeDefs:[
             user_typedef,
             leave_typeDef
         ],
         resolvers:[
             user_resolver,
             leave_resolver
         ],
         context: async({req}) => {
            return isAuthenticated(req)
         }
    });
    

    await apolloServer.start();

    apolloServer.applyMiddleware({app, cors:false});

    app.listen(4000, () => {
        console.log("express server started");
        console.log(apolloServer.graphqlPath)
    });
})();
