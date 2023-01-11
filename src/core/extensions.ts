import { ApiExtensionFn } from "./types";

export class ValestoryApiExtensions {
  private static extensions = new Map<string, ApiExtensionFn<any>>();

  public static has(name: string): boolean {
    return this.extensions.has(name);
  }

  public static getExtension(
    name: string
    // eslint-disable-next-line @typescript-eslint/ban-types
  ): (apiToContinueWith: any) => Function {
    if (!this.extensions.has(name)) {
      throw new Error(
        `[valestory] No extension registered with name "${name}".`
      );
    }

    // hint: we checked that the extensions have the requested item above:
    // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
    return this.extensions.get(name)!;
  }

  public static register<C>(
    name: string,
    executor: ApiExtensionFn<C>,
    override = false
  ): void {
    if (!this.extensions.has(name) || override) {
      this.extensions.set(name, executor);
    } else {
      throw new Error(
        `[valestory] Refuse to override already set extension with name ${name}. If this is intentionally, use the third parameter with true to force overriding.`
      );
    }
  }
}
