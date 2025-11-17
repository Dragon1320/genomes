import { error } from "console";
import type { RequestHandler } from "./$types";
import { readFile } from "fs/promises";
import path from "path";
import z from "zod";

const genomeSchema = z.array(
  z.object({
    category: z.enum([
      "vertebrate_other",
      "vertebrate_mammalian",
      "protozoa",
      "plant",
      "invertebrate",
      "fungi",
      "bacteria",
      "archaea",
    ]),
    genome: z.string(),
  }),
);

const genomesPath = "./scripts/genomes.json";
const ncbiBase = "https://www.ncbi.nlm.nih.gov/datasets/taxonomy/";

let cache: z.infer<typeof genomeSchema> = [];

const loadGenomes = async () => {
  if (cache.length !== 0) {
    console.log("cached");
    return cache;
  }

  const res = genomeSchema.safeParse(JSON.parse((await readFile(genomesPath)).toString()));

  if (res.error) {
    console.log(res.error);

    return null;
  }

  cache = res.data;

  return cache;
};

export const GET = (async ({ url }) => {
  const labels = url.searchParams.get("labels") == null ? [] : String(url.searchParams.get("labels")).split(",");

  const genomes = await loadGenomes();

  if (genomes == null) {
    return new Response("Error loading genomes", { status: 500 });
  }

  const filtered = labels.length === 0 ? cache : cache.filter((e) => labels.includes(e.category));

  const idx = Math.floor(Math.random() * filtered.length);
  const name = filtered[idx].genome;

  const redirect = path.join(ncbiBase, name);

  return Response.redirect(redirect);
}) satisfies RequestHandler;
