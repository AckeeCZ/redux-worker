I am going to explain:

-   how bridge between the store worker and container is initialized, and what needs to happen before it can be initialized
-   why mapStateToProps is placed in its own special file, how it's connected to the store worker and why I've chosen the following solution

The begenning idea was quite straithfoward, replace `react-redux` with `redux-worker` package, that is going to connect presential component to redux store (same as the `connect` HOC from `react-redux` does), BUT the store going to be placed at web worker.

The goal also was to preserve as much similar API as `connect` HOC has. But since I've moved whole redux store (reducers, sagas and **selectors** included), there has to be made some changes.

The biggest change in the API of `connect` is related to selectors, specifically the `mapStateToProps` selector. Selectors are, as I mentioned before, placed in the worker context, to prevent circular dependencies `mapStateToProps` selector is placed at its own special file (current convention is to name the file as so: ComponentName.mapStateToProps.js).

Now we have a little problem:

## How are we going to tell which mapStateToProps selector belongs to which container?

### My initial idea

1. A unique key is created which is going to be passed to `connectWorker` HOC and all messages going to be signed with that key.
2. Then a mapStateToProps selector is added to an object (let's called `selectors`), where the property name is that unique key and its value is that mapStateToProps selector.
3. Now we just pass the object with all selectors to store worker and everytime store subscribed handle changes, we can get the right mapStateToProps selector, select the state and passed it from the worker to the correct container and its component.

This solution is perfectly working, but there're two things that developer must additional do compare to using the `react-redux` package:

-   creating unique key for each container
-   and mainly, exporting the selector to global some object and then pass the global object to worker

Let's first tackle the second issue, how can we simplify passing the selector to the store worker and at the same time maintain connection with its container?
Well, what about we extend API of our `redux-worker` package by new method called `registerContainerSelector`,
that receives two parameters, unique key and mapStateToProps selector. This method would register the selector in store worker for us.
To mame it work we need to have in mind two things:

1. `registerContainerSelector` must be called before intializing the bridge between store worker and container (otherwise the selector wouldn't be ready and state selection would failed)
2. since `mapStateToProps` is placed in its special file, we need to connect it to the rest of execution tree and import it somewhere
