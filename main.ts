import { Hono } from "@hono/hono";
import { logger } from "@hono/hono/logger";
import { Octokit } from "octokit";

enum Status {
  UP = "UP",
  DOWN = "DOWN",
}

const octokit = new Octokit({ auth: Deno.env.get("GH_TOKEN") });

const app = new Hono();

app.use(logger());

app.get("/health", (ctx) => {
  return ctx.json({ status: Status.UP });
});

app.get("/pulls", async (ctx) => {
  const { data } = await octokit.rest.search.issuesAndPullRequests({
    q: "author:barberdt+is:pull-request",
  });
  return ctx.json(data.items[0]);
});

Deno.serve(app.fetch);
