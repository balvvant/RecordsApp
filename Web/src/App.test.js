import { configure, shallow } from "enzyme";
import Adapter from "enzyme-adapter-react-16";
import React from "react";
import { Provider } from "react-redux";
import { BrowserRouter } from "react-router-dom";
import { PersistGate } from "redux-persist/lib/integration/react";
import App from "./App";
import "./mockMedia";
import { appstore, persistor } from "./store/index";

configure({ adapter: new Adapter() });

describe("App", () => {
  test("Component has rendered", () => {
    shallow(
      <Provider store={appstore}>
        <PersistGate loading={null} persistor={persistor}>
          <BrowserRouter>
            <App />
          </BrowserRouter>
        </PersistGate>
      </Provider>
    );
  });
});
