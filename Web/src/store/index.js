import { combineReducers, createStore } from "redux";
import { persistReducer, persistStore } from 'redux-persist';
import storage from 'redux-persist/lib/storage';
import clinicianReducer from '../reducers/clinicianReducer';
import commonReducer from '../reducers/commonReducer';
import screenReducer from '../reducers/screenReducer';
import userReducer from '../reducers/userReducer';

const persistConfig = {
  key: 'root',
  storage,
  blacklist: ['common', 'clinician', 'user']
}

const authPersistConfig = {
  key: 'auth',
  storage: storage,
  whitelist: ['orgId']
};
let reducer = combineReducers({
  common: commonReducer,
  user: persistReducer(authPersistConfig, userReducer),
  clinician: clinicianReducer,
  screen: screenReducer
});
const persistedReducer = persistReducer(persistConfig, reducer)

export const appstore = createStore(persistedReducer);
export const persistor = persistStore(appstore);