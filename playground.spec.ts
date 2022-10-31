import { BehaviorSubject, tap } from "rxjs";
import { the, when } from "./src";
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
  isEqual: (a: any, b: any, negate: boolean) =>
    negate ? expect(a).not.toEqual(b) : expect(a).toEqual(b),
});

describe("ContactBook", () => {
  const somethingAsync = () =>
    createExtension((subject: any, meta: any) => {
      return new Promise((resolve) => {
        setTimeout(() => {
          console.log("WAITED!");
          resolve(state({ contacts$: 42 })(subject, meta));
        }, 1000);
      });
    });

  class once {
    static serviceHasState(stateDef: any) {
      return when(the(service)).does(state(stateDef));
    }
  }

  it("should negate (basic)", () => {
    when(the(service))
      .has(state({ numberOfContacts: 42 }))
      .expect(the(service))
      .not.to(haveState({ numberOfContacts: 24 }));
  });

  it("should invoke extensions (basic)", () =>
    when(the(service))
      .has(state({ numberOfContacts: 42 }))
      .and(somethingAsync())
      .expect(the(service))
      .to(haveState({ numberOfContacts: 42 })));

  it.each([
    () => when(the(service)).has(state({ numberOfContacts: 42 })),
    () => when(the(service)).is(state({ numberOfContacts: 42 })),
    () => when(the(service)).does(state({ numberOfContacts: 42 })),
  ])("should allow for chaining (action)", async (with42Contacts) => {
    await when(with42Contacts())
      .expect(the(service))
      .to(haveState({ numberOfContacts: 42 }));
  });

  it("should allow for chaining (external classes, via when)", () => {
    when(once.serviceHasState({ numberOfContacts: 42 }))
      .expect(the(service))
      .to(haveState({ numberOfContacts: 42 }));
  });

  it("should allow for chaining (external classes, via and)", () => {
    when(the(service))
      .does()
      .and(once.serviceHasState({ numberOfContacts: 42 }))
      .expect(the(service))
      .to(haveState({ numberOfContacts: 42 }));
  });

  it("should allow for intermediate checks (via will)", async () => {
    const was = { executed: false };
    const check = createExtension(() => {
      was.executed = true;
    });

    const with42Contacts = when(the(service))
      .has(state({ numberOfContacts: 42 }))
      .expect(the(service))
      .will(check);

    await when(with42Contacts)
      .and(the(service))
      .has(state({ numberOfContacts: 12 }))
      .expect(() => was)
      .to(haveState({ executed: true }));
  });

  it("should allow for intermediate checks (via and)", async () => {
    const was = { executed: false };
    const check = createExtension(() => {
      was.executed = true;
    });

    await when(the(service))
      .has(state({ numberOfContacts: 12 }))
      .and(check)
      .expect(() => was)
      .to(haveState({ executed: true }));
  });
});
