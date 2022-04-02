import { CURRENT_ORG_SELECTED, ORG_ID, OTHER_USER_DATA, USER_DATA, USER_DETAIL } from '../Constants/types';

let userDetail = localStorage.getItem("userDetail");
if(userDetail){
    userDetail = JSON.parse(userDetail);
}

let org = localStorage.getItem("orgDetail");
if(org){
    org = JSON.parse(org);
} else {
    org = null;
}

const INITIAL_STATE ={
loader:false,
alertArray:[],
alertArrayLength:0,
userData:null,
userDetail: userDetail,
otherUserData:null,
orgId: org,
selectedOrg:null
}

export default function (state=INITIAL_STATE, action){
    switch (action.type){
        case USER_DATA:{
            return{
                ...state,
                userData:{...action.payload},
            };
        }
        case USER_DATA:{
            return{
                ...state,
                ownUserData:{...action.payload},
            };
        }
        case USER_DETAIL:{
            return{
                ...state,
                userDetail:{...action.payload},
            };
        }
        case OTHER_USER_DATA:{
            return{
                ...state,
                otherUserData:{...action.payload},
            };
        }
        case ORG_ID:{
            return{
                ...state,
                orgId:{...action.payload},
            };
        }
        case CURRENT_ORG_SELECTED:{
            return{
                ...state,
                selectedOrg:{...action.payload},
            };
        }
        default:
        return state
    }


}