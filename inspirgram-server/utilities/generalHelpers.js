exports.isset = (param) =>{
    return typeof param != "undefined" && param !== '' && param !== null;
};
