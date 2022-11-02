import { BehaviorSubject, tap } from "rxjs";
import { the, when } from "./src";
import { call, state } from "./src/actions";
import { equal, haveCalled, haveState } from "./src/expectations";
import { Valestory } from "./src/platform";
import { TestExtendingOrExpecter } from "./src/types";
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

Valestory.config.override({
  spyFactory: (value) => jest.fn().mockReturnValue(value),
  hasBeenCalled: (spy: any, negate, times?: number) => {
    if (negate) {
      times != null
        ? expect(spy).not.toHaveBeenCalledTimes(times)
        : expect(spy).not.toHaveBeenCalled();
    } else {
      times != null
        ? expect(spy).toHaveBeenCalledTimes(times)
        : expect(spy).toHaveBeenCalled();
    }
  },
  isEqual: (a: any, b: any, negate: boolean) =>
    negate ? expect(a).not.toEqual(b) : expect(a).toEqual(b),
});

let wasExtensionExecuted = false;
const markExtensionExecutedTrue = "markExtensionExecutedTrue" as const;
Valestory.extensions.register(
  markExtensionExecutedTrue,
  (context: TestExtendingOrExpecter<any>) => () => {
    wasExtensionExecuted = true;
    return context;
  }
);

describe("ContactBook", () => {
  const somethingAsync = (delay = 1000) =>
    createExtension((subject: any, meta) => {
      meta.addTestStep(
        () =>
          new Promise((resolve) => {
            setTimeout(() => {
              console.log("waited!");

              state({ contacts$: 42 })(subject, meta);
              resolve();
            }, delay);
          })
      );
    });

  class once {
    static serviceHasState(stateDef: any) {
      return when(the(service)).does(state(stateDef));
    }
  }

  it("should execute api-extension functions", () => {
    (when(null!) as any)
      .markExtensionExecutedTrue()
      .expect(() => wasExtensionExecuted)
      .to(equal(true));
  });

  it("should spy on targets (times 1)", () => {
    const host = {
      doSomething: () => {},
    };

    return when(() => host)
      .calls("doSomething")
      .expect(() => host)
      .to(haveCalled("doSomething"));
  });

  it("should spy on targets (times 2)", () => {
    const host = {
      doSomething: () => {},
    };

    return when(() => host)
      .calls("doSomething")
      .and(call("doSomething"))
      .expect(() => host)
      .to(haveCalled("doSomething", { times: 2 }));
  });

  it("should spy on targets (times 2)", () => {
    const host = {
      doSomething: () => {},
    };

    return when(() => host)
      .calls("doSomething")
      .and(call("doSomething"))
      .expect(() => host)
      .to(haveCalled("doSomething", { times: null }));
  });

  it("should spy on targets (returnValue)", () => {
    const service = { spyOnMe: () => false, called: false };
    const host = {
      doSomething: () => {
        service.called = service.spyOnMe();
      },
    };

    return when(() => host)
      .calls("doSomething")
      .expect(() => service)
      .to(
        haveCalled("spyOnMe", { returnValue: true }),
        haveState({ called: true })
      );
  });

  it("should spy on targets (bind to target)", () => {
    class Service {
      called = false;
      callMe() {
        this.called = true;
      }
    }
    const service = new Service();

    return when(the(service))
      .calls("callMe")
      .expect(the(service))
      .to(haveState({ called: true }));
  });

  it("should negate (basic)", () => {
    when(the(service))
      .has(state({ numberOfContacts: 42 }))
      .expect(the(service))
      .not.to(haveState({ numberOfContacts: 24 }));
  });

  it("should invoke extensions (basic & async)", () =>
    when(the(service))
      .has(state({ numberOfContacts: 42 }))
      .and(somethingAsync())
      .expect(the(service))
      .to(haveState({ numberOfContacts: 42 })));

  it.each([
    () => when(the(service)).has(state({ numberOfContacts: 42 })),
    () => when(the(service)).is(state({ numberOfContacts: 42 })),
    () => when(the(service)).does(state({ numberOfContacts: 42 })),
  ])("should allow for chaining (action)", (with42Contacts) => {
    when(with42Contacts())
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

  it("should allow for intermediate checks (via will)", () => {
    const was = { executed: false };
    const check = createExtension(() => {
      was.executed = true;
    });

    const with42Contacts = when(the(service))
      .has(state({ numberOfContacts: 42 }))
      .expect(the(service))
      .will(check);

    when(with42Contacts)
      .and(the(service))
      .has(state({ numberOfContacts: 12 }))
      .expect(() => was)
      .to(haveState({ executed: true }));
  });

  it("should allow for intermediate checks (via and)", () => {
    const was = { executed: false };
    const check = createExtension(() => {
      was.executed = true;
    });

    when(the(service))
      .has(state({ numberOfContacts: 12 }))
      .and(check)
      .expect(() => was)
      .to(haveState({ executed: true }));
  });
});
