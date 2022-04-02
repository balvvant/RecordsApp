import { ACTIVATE_PARAM, CHANGED_SCREEN, OLD_RESOURCE_KEY, RESET_PARAM, RESOURCE_KEY, HEADER_CONTENT } from '../Constants/types';

const INITIAL_STATE = {
    openedScreen: "",
    resetUserData: {},
    createUserData: {},
    resourceKey: null,
    oldResourceKey: null,
    headerContent: []
}

export default function (state = INITIAL_STATE, action) {
    switch (action.type) {
        case CHANGED_SCREEN: {
            return {
                ...state,
                openedScreen: action.payload,
            };
        }
        case RESET_PARAM: {
            return {
                ...state,
                resetUserData: action.payload,
            };
        }
        case ACTIVATE_PARAM: {
            return {
                ...state,
                createUserData: action.payload,
            };
        }
        case RESOURCE_KEY: {
            return {
                ...state,
                resourceKey: action.payload,
            };
        }
        case HEADER_CONTENT: {
            return {
                ...state,
                headerContent: action.payload,
            };
        }
        case OLD_RESOURCE_KEY: {
            return {
                ...state,
                oldResourceKey: action.payload,
            };
        }
        default:
            return state
    }


}