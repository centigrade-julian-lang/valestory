import { ValestoryConfiguration } from "./types";

export class ValestoryConfig {
  private static current = new Map();

  public static override(cfg: ValestoryConfiguration) {
    this.current = new Map(Object.entries(cfg));
  }

  public static get<T extends keyof ValestoryConfiguration>(
    property: T
  ): ValestoryConfiguration[T] {
    if (!this.current.has(property))
      throw new Error(`[valestory] No config value for "${property}"`);

    return this.current.get(property);
  }
}
