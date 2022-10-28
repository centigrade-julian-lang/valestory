import { build, BuildOptions } from "esbuild";
import { copyFile, outputFile } from "fs-extra";
import { resolve } from "path";
import { cwd } from "process";
import * as packageJson from "../package.json";

const cwdPath = (path: string) => {
  return resolve(cwd(), path);
};

class Program {
  static async main(production: boolean) {
    await this.buildLibrary(production);
    await this.createPackageJson();
    await this.copyDocs();
  }

  private static async buildLibrary(production: boolean) {
    const commonBuildOpts: BuildOptions = {
      entryPoints: [cwdPath("./src/index.ts")],
      platform: "node",
      target: "es2020",
      bundle: true,
      minify: production,
    };

    await build({
      ...commonBuildOpts,
      format: "esm",
      outfile: cwdPath("./dist/mjs/index.js"),
    });
    await build({
      ...commonBuildOpts,
      format: "cjs",
      outfile: cwdPath("./dist/cjs/index.js"),
    });
  }

  private static async createPackageJson() {
    const {
      name,
      version,
      author,
      description,
      keywords,
      license,
      homepage,
      repository,
    } = packageJson;

    const marketing = {
      homepage,
      repository,
    };
    const logistics = {
      files: ["**/*"],
      main: "./cjs/index.js",
      module: "./mjs/index.js",
      exports: {
        ".": {
          import: "./mjs/index.js",
          require: "./cjs/index.js",
        },
      },
    };
    const output = {
      name,
      version,
      author,
      description,
      keywords,
      license,
      ...marketing,
      ...logistics,
    };

    await outputFile(
      cwdPath("./dist/package.json"),
      JSON.stringify(output, null, production ? undefined : 2)
    );
  }

  private static async copyDocs() {
    return copyFile(cwdPath("./README.md"), cwdPath("./dist/README.md"));
  }
}

const args = process.argv.slice(1);
const production = args.includes("--prod");

Program.main(production)
  .catch(console.error)
  .then(() => console.log("Built."));
