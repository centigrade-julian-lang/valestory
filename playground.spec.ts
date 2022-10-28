import { BehaviorSubject } from "rxjs";
import { when } from "./src";
import { state } from "./src/actions";
import { TestoryConfig } from "./src/config";
import { haveState } from "./src/expectations";
import { createExtension } from "./src/utility";

interface Address {
  street: string;
  houseNo: number;
}
interface Person {
  name: string;
  address: Address[];
}

class ContactBook {
  private readonly contacts = new BehaviorSubject<Person[]>([]);
  public readonly contacts$ = this.contacts.asObservable();
}

const service = new ContactBook();

TestoryConfig.override({
  isEqual: (a: any, b: any) => expect(a).toEqual(b),
});

describe("ContactBook", () => {
  const somethingAsync = () =>
    createExtension((subject: any) => {
      return new Promise((resolve) => {
        setTimeout(() => {
          resolve(state({ contacts$: 42 })(subject));
        }, 1000);
      });
    });

  class the {
    static service = () => service;
  }

  it("should invoke extensions (basic)", async () =>
    when(the.service)
      .has(state({ contacts$: 42 as any }))
      .and(the.service)
      .does(somethingAsync())
      .expect(the.service)
      .to(haveState({ contacts$: 42 as any })));

  it("should invoke extensions (basic)", async () =>
    when(the.service)
      .has(state({ contacts$: 42 as any }))
      .and(somethingAsync())
      .expect(the.service)
      .to(haveState({ contacts$: 42 as any })));
});
