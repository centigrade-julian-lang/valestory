import { TestoryConfiguration } from "./types";

export class TestoryConfig {
  private static current = new Map();

  public static override(cfg: TestoryConfiguration) {
    this.current = new Map(Object.entries(cfg));
  }

  public static get(property: keyof TestoryConfiguration) {
    if (this.current.has(property))
      throw new Error(`No config value for "${property}"`);

    return this.current.get(property);
  }
}
