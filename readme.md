# node-fs-testing [![tests](https://github.com/bendrucker/node-fs-testing/workflows/tests/badge.svg?branch=master)](https://github.com/bendrucker/node-fs-testing/actions?query=workflow%3Atests)

> An overview of common testing techniques in Node.js, applied to [`fs`](https://nodejs.org/api/fs.html)

## Usage

```sh
npm test
```

## Strategies

### Mutating Methods

The most direct way to modify the behavior of the [system under test](http://xunitpatterns.com/SUT.html) is to mutate its dependencies and replace some of their methods with "stubs"—functions that returned pre-configured responses.

#### Examples

* [`test-mutation.js`](test-mutation.js)
* [`test-sinon.js`](test-sinon.js)

A library like [Sinon](https://sinonjs.org) can help reduce the boilerplate involved in setting up and tearing down test stubs, but both of the above examples ultimately have the same behavior and assertions.

#### Caveats

##### Dependence on Object Semantics

Mutation is only possible with object types in JavaScript which are [passed by reference rather than by value](https://codeburst.io/explaining-value-vs-reference-in-javascript-647a975e12a0). If a dependent module exports a function directly, it is impossible to mutate the behavior of that function:

```js
module.exports = function () {}
```

Additionally, if your source code access the method at require time rather than runtime, you can no longer mutate its behavior:

```js
const rfs = require('fs').readFileSync
// replacing readFileSync with a stub will not affect the rfs value already assigned
```

##### Coupling to Implementation Details

Mutating methods during testing tends to couple tests to internal implementation details of the subject under test, rather than verifying its high level behavior (inputs, outputs). For example, if we wanted to replace `fs.readFileSync` with `fsPromises.readFile` so that our function is fully asynchronous, we'd have to modify the tests, even though the function signature and behavior of the source function is unchanged.

##### Leaking State

When each test is complete, it must restore the original methods to any shared object mutated during the test. This process can fail in unexpected ways. For example, many test runners/frameworks capture exceptions thrown during each test function. An exception thrown before mutations can be undone (e.g. calling `stub.restore()` with Sinon) will cause state to leak into the following test, potentially causing additional unexpected failures. 

```js
sinon.stub(myObj, 'method').returns('foo')
throw new Error('oh no!')
myObj.method.restore() // never runs
```

Test runners provide lifecycle callbacks like `beforeEach` and `afterEach` to help ensure that setup and teardown are independent of test functions. However, lifecycle callbacks cannot resolve a more fundamental limitation—**tests that mutate dependencies must be run serially and cannot be easily parallelized.** When mutating a shared _object_ (e.g. the `fs` module), parallelizing tests requires that each test run in an independent process (a la [ava](https://github.com/avajs/ava)). 

### Global Fakes

Global fakes apply the [mutating methods](#mutating-methods) strategy. Rather than replacing individual methods, a global fake replaces _all_ methods on a well-known object and backs them with a fake version. Fakes often rely on in-memory implementations to mock IO behavior (filesystem or network access). The [mock-fs](https://github.com/tschaub/mock-fs) package provides a complete implementation that transparently replaces the `fs` module, for example.

#### Examples

* [`test-mock-fs.js`](test-mock-fs.js)

#### Caveats

Global fakes have similar limitations to simpler method mutation. They are dependent on object semantics and often require complex [monkey-patching logic](https://en.wikipedia.org/wiki/Monkey_patch#Definitions), as seen in [mock-fs's main module](https://github.com/tschaub/mock-fs/blob/master/lib/index.js). This patching process is brittle and tends to break with each new major version of the dependency (major Node.js releases in the case of `fs`).

Global fakes do eliminate [coupling of tests to implementation details](#coupling-to-implementation-details), a significant improvement over simple mutations.

### Overriding `require`

Node.js is heavily oriented around modules. Each JavaScript file is a module and all declared variables are module-scoped. By overriding `require`, you can replace entire modules during testing. These replacements only apply to the module under test by default and will not leak to other modules that share the same dependency.

Dependent modules can be replaced even if they export scalar values (e.g. a string) that cannot be mutated.

When testing `fs`, we can easily replace the `fs` module with an in-memory fake (like [memfs](https://github.com/streamich/memfs)). By making a new copy of the module under test with a dedicated fake instance, we can entirely avoid leaking state.

#### Examples

* [`test-proxyquire.js`](test-proxyquire.js)

#### Caveats

Replacing modules at `require` time works best when you replace the _direct_ dependencies of your module under test. While proxyquire supports [globally overriding require](https://github.com/thlorenz/proxyquire#globally-override-require), this couples tests to behavior of _transitive_ dependencies, making tests significantly harder to reason about. For example, if your module under test depends on a `config` module that in turn reads configuration using `fs`, you'd be better served mocking the `config` module itself rather than globally overriding `fs`.

### Dependency Injection

Dependency injection inverts the `require` model—it prescribes passing objects to dependent functions/classes as arguments rather than expecting those functions to load dependencies from other modules. 

#### Examples

* [`test-dependency-injection.js`](test-dependency-injection.js)

#### Caveats

Dependency injection, unlike the other strategies described above, requires rewriting your source code. Injection is more common in statically typed languages where mutating the methods of an object is not possible (e.g. Go, Java). Many Node.js projects make heavy use of `require` and switching entirely to dependency injection would be impractical. However, it is certainly possible to introduce dependency injection to certain modules to aid in testing while generally relying on `require`.

## License

MIT © [Ben Drucker](http://bendrucker.me)
