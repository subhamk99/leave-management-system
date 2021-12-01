import "reflect-metadata";
import { createConnection } from "typeorm";
import express from "express";
import { ApolloServer, gql } from "apollo-server-express";
import cors from "cors";
import fs from "fs";
import path from "path";
import { isAuthenticated } from "./middleware/Authenticate";
// import { isAuthenticated } from "./middleware/Authenticate";

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

    const typeDefs = gql(fs.readFileSync(path.join(__dirname,'schema.graphql'),{encoding:"utf-8"}));
    const resolvers =require("./graphql/resolvers/Resolver");
    const apolloServer = new ApolloServer({
         typeDefs:typeDefs,
         resolvers:resolvers,
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
