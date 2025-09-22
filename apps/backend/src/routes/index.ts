import { Hono } from "hono";
import usersRoute from "./users.js";
import { cors } from "hono/cors";

const app = new Hono().use("*", cors()).route("/users", usersRoute)

export type AppType = typeof app
export default app;
