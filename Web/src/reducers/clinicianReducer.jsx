import {
    AOP_LIST, GLOBAL_ALERT, GLOBAL_ALERT_REMOVE, GLOBAL_LOADER, HCP_AOPS_LIST, HCP_LIST, ISGUIDANCEINFO, ORGANIZATIONS_LIST, SECURITY_LIST
} from '../Constants/types';

const INITIAL_STATE ={
    isGuidanceInfo: false,
}

export default function (state=INITIAL_STATE, action){
    switch (action.type){

        
        case ISGUIDANCEINFO:{
            return{
                ...state,
                isGuidanceInfo:action.payload,
            };
        }
        case GLOBAL_LOADER:{
            return{
                ...state,
                loader:action.payload,
            };
        }
        case GLOBAL_ALERT:{
            let obj={
                alertType:action.payload,
                alertMessage:action.msg,
            }
        
            return{
                ...state,
                alertArray:[obj],            
            };
        }

        case SECURITY_LIST:{
            return{
                ...state,
                securityArray:[...action.payload],             
            };
        }
        case HCP_AOPS_LIST:{
            return{
                ...state,
                hcpArray:[...action.payload],             
            };
        }
        case HCP_LIST:{
            return{
                ...state,
                hcpList:[...action.payload],             
            };
        }
        case AOP_LIST:{
            return{
                ...state,
                aopList:[...action.payload],             
            };
        }
        case ORGANIZATIONS_LIST:{
            return{
                ...state,
                organizationsArray:[...action.payload],             
            };
        }

        case  GLOBAL_ALERT_REMOVE:{
            let arr= state.alertArray;
            if(arr.length )state.alertArray.shift()

            return{
                ...state,
                alertArray: [...arr]
                }
        }
        default:
        return state
    }


}