import { build, BuildOptions } from "esbuild";
import { outputFile } from "fs-extra";
import { resolve } from "path";
import { cwd } from "process";
import * as packageJson from "../package.json";
/*  
    shx cp package.json dist/package.json
    shx cp README.md dist/README.md
    node buildhelper/package-json-preparer.js package.json dist/package.json
*/
const cwdPath = (path: string) => {
  return resolve(cwd(), path);
};

class Program {
  static async main(production: boolean) {
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
      tsconfig: cwdPath("./tsconfig-mjs.json"),
    });
    await build({
      ...commonBuildOpts,
      format: "cjs",
      outfile: cwdPath("./dist/cjs/index.js"),
      tsconfig: cwdPath("./tsconfig-cjs.json"),
    });

    await this.preparePackageJson();
  }

  private static async preparePackageJson() {
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
}

const args = process.argv.slice(1);
const production = args.includes("--prod");

Program.main(production)
  .catch(console.error)
  .then(() => console.log("Built."));
