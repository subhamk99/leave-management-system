import { createConnection } from "typeorm";

export const testConn = (drop:boolean = false) => {
    return createConnection({
        name:"default",
        type:"postgres",
        host:"localhost",
        port:5433,
        username:"subham",
        password:"test",
        database:"lms_test",
        synchronize:true,
        dropSchema:drop,
        entities:["src/entity/**/*.ts"],
    });
};