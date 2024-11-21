import { Hono } from "@hono/hono";
import { logger } from "@hono/hono/logger";
import { Octokit } from "octokit";
import { GetResponseTypeFromEndpointMethod } from "@octokit/types";
import { components } from "@octokit/openapi-types";

enum Status {
  UP = "UP",
  DOWN = "DOWN",
}

type Pull = {
  title: string;
  url: string;
  repository_url: string;
};

const octokit = new Octokit({ auth: Deno.env.get("MY_GH_TOKEN") });

type PullsResponse = GetResponseTypeFromEndpointMethod<
  typeof octokit.rest.search.issuesAndPullRequests
>;

type PullResponseItem = components["schemas"]["issue-search-result-item"];

function formatPulls(responseItems: PullsResponse["data"]["items"]): Pull[] {
  return responseItems.map((
    item: PullResponseItem,
  ) => ({
    title: item.title,
    url: item.url,
    repository_url: item.repository_url,
  }));
}

const app = new Hono();

app.use(logger());

app.get("/health", (ctx) => {
  return ctx.json({ status: Status.UP });
});

app.get("/pulls", async (ctx) => {
  const response: PullsResponse = await octokit.rest.search
    .issuesAndPullRequests({
      q: "author:barberdt+is:pull-request",
    });

  const formattedPulls = formatPulls(response.data.items);
  formattedPulls.forEach((pull) => {
    console.log(pull.repository_url);
  });
  return ctx.json(formattedPulls);
});

Deno.serve(app.fetch);
