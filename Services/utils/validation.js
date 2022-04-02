/**
 * Email validation
 * 
 * @param {*} email 
 * @returns 
 */
 const emailValidation = async (email)=>{
    var mailformat = /^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/;
    if(!email.match(mailformat)){
        return false
    }
    else{
        return true
    }
}

/**
 * Mobile number validation
 * 
 * @param {*} text 
 * @returns 
 */
 const mobileValidation = async (text, min, max)=>{
    if(text) {
        if(text.length <  min || text.length > max){
            return false;
        }else{
            return numberValidaation(text);
        }
    } else {
        return false;
    }
} 

/**
 * Text length validation
 * 
 * @param {*} text 
 * @returns 
 */
const textValidation = async (text, min, max)=>{
    if(text) {
        if(text.length <  min || text.length > max){
            return false;
        }else{
            return true;
        }
    } else {
        return false;
    }
}

/**
 * alphanumeric validation
 * 
 * @param {*} text 
 * @returns 
 */
const alphanumericValidation = async (text)=>{
    var textformat = /^[a-z0-9]+$/i;
    if(!text.match(textformat)){
        return false
    }
    else{
        return true
    }
}

/**
 * date validation 
 * 
 * @param {*} date 
 * @param {*} minAge 
 * @returns 
 */
const dateValidation = async (date, minAge) => {
    var diff_ms = Date.now() - date.getTime();
    var age_dt = new Date(diff_ms); 
  
    var age =  Math.abs(age_dt.getUTCFullYear() - 1970);

    if(age >= minAge){
        return true
    }else{
        return false
    }
}

/**
 * Number Validation
 * 
 * @param {*} number 
 */
const numberValidaation = async (number) => {
    
    var textformat = /^\d+$/;
    if(!number.match(textformat)){
        return false
    }
    else{
        return true
    }
}

const passwordValidation = async (text) =>{
    var containsNumber = /\d+/;
    var specailChar = /[ `!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?~]/;
    var variableChar = /[A-z]/

 
    if(!text.match(containsNumber)){
        return false
    } else if(!text.match(specailChar)){
        return false
    } else if(!text.match(variableChar)){
        return false
    }
    else{
        return true
    }
}

const tagValidation = async (text)=>{
    var textformat = /^[A-Za-z]+$/i;
    if(!text.match(textformat)){
        return false
    }
    else{

        if(text.length > 30){
            return false
        } else {
            return true
        }
    }
}

module.exports = {
    emailValidation: emailValidation,
    textValidation: textValidation,
    alphanumericValidation: alphanumericValidation,
    dateValidation: dateValidation,
    numberValidaation: numberValidaation,
    mobileValidation : mobileValidation,
    passwordValidation:passwordValidation,
    tagValidation: tagValidation
};