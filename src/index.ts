import "reflect-metadata";
import { createConnection } from "typeorm";
import express from "express";
import { ApolloServer } from "apollo-server-express";
import { buildSchema } from "type-graphql";
import cors from "cors";
import { UserResolver } from "./resolvers/UserResolver";
import { LeaveResolver } from "./resolvers/LeaveResolver";

( async () => {
    const app = express();

    await createConnection();

    const apolloServer = new ApolloServer({
        schema: await buildSchema({
            resolvers: [UserResolver, LeaveResolver]
        }),
        context: ({req, res}) => ({req, res})
    });
    
    app.use(cors(
        {
            origin: "*",
            methods: "GET,HEAD,PUT,PATCH,POST,DELETE",
            preflightContinue: false,
            optionsSuccessStatus: 204,
        }
    ));

    await apolloServer.start();

    apolloServer.applyMiddleware({app, cors:false});

    app.listen(4000, () => {
        console.log("express server started");
        console.log(apolloServer.graphqlPath)
    });
})();