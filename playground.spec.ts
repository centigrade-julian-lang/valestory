import { BehaviorSubject, tap } from "rxjs";
import {
  call,
  createExtension,
  equal,
  haveCalled,
  haveState,
  haveThrown,
  state,
  the,
  when,
} from "./src";
import { Valestory } from "./src/core/platform";
import { TestExtendingOrExpecter } from "./src/core/types";

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
  didThrow: async (testBodyFn, negate, error) => {
    if (negate) {
      if (error != null) {
        await expect(testBodyFn).rejects.not.toThrow(error);
      } else {
        await expect(testBodyFn()).resolves.not.toThrowError();
      }
    } else {
      await expect(testBodyFn).rejects.toThrow(error);
    }
  },
  hasBeenCalled: (spy: any, negate, times?: number, withArgs?: any[]) => {
    if (negate) {
      times != null
        ? expect(spy).not.toHaveBeenCalledTimes(times)
        : expect(spy).not.toHaveBeenCalled();

      if (withArgs != null) {
        expect(spy).not.toHaveBeenCalledWith(...withArgs);
      }
    } else {
      times != null
        ? expect(spy).toHaveBeenCalledTimes(times)
        : expect(spy).toHaveBeenCalled();

      if (withArgs != null) {
        expect(spy).toHaveBeenCalledWith(...withArgs);
      }
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

  const throwError = createExtension((_, { addTestStep }) => {
    addTestStep(() => {
      throw new Error("error!!");
    });
  });

  class once {
    static serviceHasState(stateDef: any) {
      return when(the(service)).does(state(stateDef));
    }
  }

  it("should produce new tests each time called when", () => {
    const a = when().expect().to();
    const b = when().expect().to();

    expect(a).not.toBe(b);
    expect(a).toEqual(b);
  });

  it("should produce new test-contents each time called when", () => {
    const x = when();
    const a = when(x);

    expect(a.steps).not.toBe(x.steps);
    expect(a.spyRequests).not.toBe(x.spyRequests);
    expect(a.steps).toEqual(x.steps);
    expect(a.spyRequests).toEqual(x.spyRequests);
  });

  it("should add steps from imported test-expression", () => {
    const a = when(somethingAsync());
    const b = when(a).and(somethingAsync());

    expect(a.steps.length).toBe(1);
    expect(b.steps.length).toBe(2);
  });

  it("should add steps from imported test-expression", () => {
    const a = when(somethingAsync());
    const b = when().and(somethingAsync()).and(a);

    expect(a.steps.length).toBe(1);
    expect(b.steps.length).toBe(2);
  });

  it("should call expressions in the right order", async () => {
    const order: string[] = [];
    const createExt = (label: string) =>
      createExtension((_, { addTestStep }) =>
        addTestStep(() => {
          order.push(label);
        })
      );

    const a = createExt("a");
    const b = createExt("b");
    const c = createExt("c");

    const x = when(a).and(b, c).expect().will(c);
    await when(x).and(a).expect().to(b, c);

    expect(order.join("")).toEqual("abccabc");
  });

  it("should throw if a spy could not be set", async () => {
    try {
      await when()
        .expect(() => null!)
        .not.to(haveCalled("x"));

      fail("should throw");
    } catch (err) {
      const error = err as Error;
      expect(error.message).toContain("[valestory] Could not set all spies.");
    }
  });

  it("should allow to pass extension fn to when", () => {
    const state = { changed: false };
    const update = createExtension((_, { addTestStep }) => {
      addTestStep(() => {
        state.changed = true;
      });
    });

    return when(update)
      .expect(the(state))
      .to(haveState({ changed: true }));
  });

  it("should allow to wrap the test body (e.g. to check if it threw)", () => {
    return when(throwError).expect().to(haveThrown());
  });

  it("should allow to wrap the test body (e.g. to check if it threw) (negated)", () => {
    return when().expect().not.to(haveThrown());
  });

  it("should execute api-extension functions", () => {
    return (when(() => null) as any)
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

  it("should spy on targets (any times)", () => {
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

  it("should spy on targets (with args)", () => {
    const host = {
      doSomething: (a: number, b: string) => {},
    };

    return when(() => host)
      .calls("doSomething", 42, "hello")
      .expect(() => host)
      .to(haveCalled("doSomething", { withArgs: [42, "hello"] }));
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
    return when(the(service))
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
    return when(with42Contacts())
      .expect(the(service))
      .to(haveState({ numberOfContacts: 42 }));
  });

  it("should allow for chaining (external classes, via when)", () => {
    return when(once.serviceHasState({ numberOfContacts: 42 }))
      .expect(the(service))
      .to(haveState({ numberOfContacts: 42 }));
  });

  it("should allow for override chained external classes (via when)", () => {
    return when(once.serviceHasState({ numberOfContacts: 42 }))
      .and(the(service))
      .has(state({ numberOfContacts: 24 }))
      .expect(the(service))
      .to(haveState({ numberOfContacts: 24 }));
  });

  it("should allow for chaining (external classes, via and)", () => {
    return when(the(service))
      .has(state({ numberOfContacts: 24 }))
      .and(once.serviceHasState({ numberOfContacts: 42 }))
      .expect(the(service))
      .to(haveState({ numberOfContacts: 42 }));
  });

  it("should allow for override chained external classes (via and)", () => {
    return when()
      .and(once.serviceHasState({ numberOfContacts: 42 }))
      .and(the(service))
      .has(state({ numberOfContacts: 24 }))
      .expect(the(service))
      .to(haveState({ numberOfContacts: 24 }));
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

    return when(the(service))
      .has(state({ numberOfContacts: 12 }))
      .and(check)
      .expect(() => was)
      .to(haveState({ executed: true }));
  });
});
