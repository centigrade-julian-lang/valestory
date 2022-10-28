import { TestoryConfiguration as ValestoryConfiguration } from "./types";

export class ValestoryConfig {
  private static current = new Map();

  public static override(cfg: ValestoryConfiguration) {
    this.current = new Map(Object.entries(cfg));
  }

  public static get(property: keyof ValestoryConfiguration) {
    if (!this.current.has(property))
      throw new Error(`No config value for "${property}"`);

    return this.current.get(property);
  }
}
