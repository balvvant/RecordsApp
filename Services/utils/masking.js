async function MaskCharacter(str, n = 1) {
  
    // Slice the string and replace with
    // mask then add remaining string
    return ('' + str).slice(0, -n)
        .replace(/./g, '*')
        + ('' + str).slice(-n);
}

const PhoneNoMasking = async (phoneNo)=>{
    return await MaskCharacter(phoneNo, 4);
}

const BinMasking = async (bin)=>{
    return await MaskCharacter(bin, 4);
}

const ExpiryMasking = async (expiry)=>{
    return await MaskCharacter(expiry, 2);
}

const OwnerNameMasking = async (ownerName)=>{
    return await MaskCharacter(ownerName, 3);
}

const FullNameMasking = async (fullName)=>{
    return await MaskCharacter(fullName, 4);
}

const BaseMasking = async (base)=>{
    return await MaskCharacter(base, 4);
}

module.exports = {
    BaseMasking,
    OwnerNameMasking,
    ExpiryMasking,
    BinMasking,
    PhoneNoMasking,
    FullNameMasking
};