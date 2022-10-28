import { BehaviorSubject, tap } from "rxjs";
import { when } from "./src";
import { state } from "./src/actions";
import { ValestoryConfig } from "./src/config";
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
  public readonly contacts$ = this.contacts.pipe(
    tap((c) => (this.numberOfContacts = c.length))
  );
  public numberOfContacts = this.contacts.value.length;
}

const service = new ContactBook();

ValestoryConfig.override({
  isEqual: (a: any, b: any) => expect(a).toEqual(b),
});

describe("ContactBook", () => {
  const somethingAsync = () =>
    createExtension((subject: any) => {
      return new Promise((resolve) => {
        setTimeout(() => {
          console.log("WAITED!");
          resolve(state({ contacts$: 42 })(subject));
        }, 1000);
      });
    });

  class the {
    static service = () => service;
  }

  it("should invoke extensions (basic)", () =>
    when(the.service)
      .has(state({ numberOfContacts: 42 }))
      .and(somethingAsync())
      .expect(the.service)
      .to(haveState({ numberOfContacts: 42 })));

  it("should allow for chaining (action)", async () => {
    const with42Contacts = when(the.service).has(
      state({ numberOfContacts: 42 })
    );

    await when(with42Contacts)
      .expect(the.service)
      .to(haveState({ numberOfContacts: 42 }));
  });

  it("should allow for intermediate checks (via will)", async () => {
    const was = { executed: false };
    const check = createExtension(() => {
      was.executed = true;
    });

    const with42Contacts = when(the.service)
      .has(state({ numberOfContacts: 42 }))
      .expect(the.service)
      .will(check);

    await when(with42Contacts)
      .and(the.service)
      .has(state({ numberOfContacts: 12 }))
      .expect(() => was)
      .to(haveState({ executed: true }));
  });

  it("should allow for intermediate checks (via and)", async () => {
    const was = { executed: false };
    const check = createExtension(() => {
      was.executed = true;
    });

    await when(the.service)
      .has(state({ numberOfContacts: 12 }))
      .and(check)
      .expect(() => was)
      .to(haveState({ executed: true }));
  });
});
