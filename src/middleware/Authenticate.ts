import { verify } from "jsonwebtoken";

export const isAuthenticated = (req:any) => {
    const auth = req.headers["authorization"];
    let user;
    if(!auth) {
        return {user};
    }

    try {
        const token = auth.split(" ")[1];
        const payload = verify(token, process.env.ACCESS_TOKEN_SECRET!);
        user = payload as any;

    } catch(err) {
        console.log(err);
        throw new Error("Not authenticated");
    }
    return {user};
}