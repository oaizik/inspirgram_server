const User = require('../models/User');
const responses = require('../config/responses').usersResponses;
const bcrypt = require('bcryptjs')  ;
const { isset } = require('../utilities/generalHelpers');
const { AllowedUserTypes } = require('../config/types');
const jwtSecret = process.env.JWT_SECRET;
const jwt = require('jsonwebtoken');
const randomString = require('randomstring');
const {SESSION_PERIOD} = require('../utilities/consts');
const hashPassword = async (pass) => {
    const salt = await bcrypt.genSalt(10);
    const toStore = await bcrypt.hash(pass,salt);
    return toStore;
};
/**
 * @param hashedPass
 * @param toCompare
 * @returns {Promise<void>}
 */
const comparePassword = async (hashedPass, toCompare) => {
    const result = await bcrypt.compare(toCompare, hashedPass);
    console.log(hashedPass);
    return result;
};
/**
 * get all users function
 */



/**
 * get user by id function
 */
exports.getUserById = (req , res) => {
    console.log('usersController - getUserById request received');
    let { userId = null } = req.AuthUser;
    if(!isset(userId) ) {
        console.log('usersController - get user by user id request - missing parameters');
        return res.status(responses.MISSING_PARAMS.code).json(responses.MISSING_PARAMS.json);
    }
    User.findOne({userId: userId, isActive: true}).select('userId name email userRegistrationType')
        .then( doc => {
            if( !isset(doc) ) {
                console.log(`usersController - get user by user id request - user id ${userId} is not found`);
                return res.status(responses.NOT_FOUND.code).json(responses.NOT_FOUND.json);
            } else {
                console.log(`usersController - get user by user id request - user id ${userId} returned to client`);
                const retData = responses.GET.SUCCESS;
                retData.json.data = doc;
                res.status(retData.code).json(retData.json);
            }
        })
        .catch(
            err => {
                console.log(`usersController - get user by id request db error ${err.name} message: ${err.message}`);
                return handleDbError(res, err);
            });
};


/**
 * if the user exist (log-in) function
 */
exports.authEmailUser = (req , res) => {

    console.log('usersController - authUser request received');
    const { password, email } = req.body;
    if(!isset(email) || !isset(password)){
        return res.status(responses.MISSING_PARAMS.code).json(responses.MISSING_PARAMS.json);
    }
    User.findOne({ email: email, isActive: true})
        .then(async user => {
            if( !isset(user) ) {
                console.log(`usersController - authUser request - user mail ${email} is not found`);
                return res.status(responses.NOT_FOUND.code).json(responses.NOT_FOUND.json);
            } else {
                result = await comparePassword(user.password,password);
                if (!result){
                    //if it is not match
                    return res.status(responses.UNAUTHORIZED_USER.code).json(responses.UNAUTHORIZED_USER.json);
                }
                else {
                    console.log(`usersController - authUser request - user mail ${email} authenticated`);
                    jwt.sign(
                        getTokenPayload(user),
                        jwtSecret,
                        {expiresIn: SESSION_PERIOD},
                        (err, token) =>{
                            if (err){
                                return res.status(responses.TOKEN_ERROR.code).json(responses.TOKEN_ERROR.json);
                            }
                            const userResObj = {...responses.USER_AUTH_SUCCESSFULLY.json, userParams:{...getUserParams(user), token}};
                            return res.status(responses.USER_AUTH_SUCCESSFULLY.code).json(userResObj);
                        }
                    );
                }
            }
        })
        .catch(
            err => {
                console.log(`usersController - get authUser request db error ${err.name} message: ${err.message}`);
                return handleDbError(res, err);
            });
};


/**
 * if the user is writer function
 */

const getTokenPayload = (userDoc) => {
    return{userId: userDoc.userId, userType: userDoc.userType };
};

const getUserParams = (result) => {
    return {id: result.userId, name: result.name, email: result.email, userType: result.userType};
};

function generateRegisterResponseToken(result, res) {
    jwt.sign(getTokenPayload(result), jwtSecret, {expiresIn: SESSION_PERIOD}, (err, token) => {
        const userResObj = {...responses.ADD.SAVED_SUCCESSFULLY.json, userParams: getUserParams(result)};
        userResObj.userParams.token = (!err) ? token : null;
        return res.status(responses.ADD.SAVED_SUCCESSFULLY.code).json(userResObj);
    })
}

/**
 * add user function
 */
exports.addUser = (req,res) => {
    console.log('usersController - addUser request received');
    let { name, password, email, userType, userAuthType } = req.body;
    if( !isset(name) || !isset(password) || !isset(email) ){
        console.log(`usersController - addUser request - missing parameters`);
        return res.status(responses.MISSING_PARAMS.code).json(responses.MISSING_PARAMS.json);
    }
    if(!AllowedUserTypes.includes(userType) ){
        console.log(`usersController - addUser user type ${userType}  not supported`);
        return res.status(responses.WRONG_PARAMS.code).json(responses.WRONG_PARAMS.json);
    }
    User.findOne({email: email})
        .then(async user => {
            if (user){
                if (user.isActive === false)
                {
                    user.isActive = true;
                    user.password = await hashPassword(password);
                    user.userRegistrationType = userAuthType;
                    user.save()
                        .then( result =>{
                            if (result){
                                console.log(`usersController - user is reactivated`);
                                return  generateRegisterResponseToken(result, res);
                            }
                            else{
                                return res.status(responses.ADD.FAILURE.code).json(responses.ADD.FAILURE.json);
                            }
                        }).catch(err => {
                            console.log(`usersController - get all users orders request db error ${err.name} message: ${err.message}`);
                            return handleDbError(res, err);
                        });
                }
                else
                    res.status(responses.USER_ALREADY_EXISTS.code).json(responses.USER_ALREADY_EXISTS.json);
            }
            else{
                const userData = { name: name, password:  await hashPassword(password), email: email, userType: userType, userRegistrationType: userAuthType};
                userData.userId = await getUserLastId()+1;
                const user = new User(userData);
                user.save()
                    .then(result => {
                        if(result){
                            console.log(`usersController - addUser user saved successfully`);
                            generateRegisterResponseToken(result, res)
                            // jwt.sign(getTokenPayload(result),jwtSecret,{expiresIn: SESSION_PERIOD}, (err,token) => {
                            //     const userResObj = {...responses.ADD.SAVED_SUCCESSFULLY.json, userParams:getUserParams(result)};
                            //     userResObj.userParams.token = (!err) ? token : null;
                            //     return res.status(responses.ADD.SAVED_SUCCESSFULLY.code).json(userResObj);
                            // });
                        }
                        else{
                            console.log(`usersController - addUser error to save user`);
                            return res.status(responses.ADD.FAILURE.code).json(responses.ADD.FAILURE.json);
                        }
                    })
                    .catch(
                        err => {
                            console.log(`usersController - get all users orders request db error ${err.name} message: ${err.message}`);
                            return handleDbError(res, err);
                        });
            }
        })
        .catch( err =>{
            return handleDbError(res, err);
        });
};

/**
 * add facebook user function
 */
exports.addFacebookUser = async (req,res) => {

    let { name, email} = req.body;

    if( !isset(name)|| !isset(email))
        return res.status(responses.MISSING_PARAMS.code).json(responses.MISSING_PARAMS.json);
    User.findOne({email: email, isActive: true})
        .then(async doc =>{
            if (doc){
                res.status(responses.USER_ALREADY_EXISTS.code).json(responses.USER_ALREADY_EXISTS.json);
            }
            else
            {
                const userData = { name: name, password: await hashPassword(randomString.generate(10)), email: email, userType: 'client',userRegistrationType: "facebook"};
                userData.userId = await getUserLastId()+1;
                const user = new User(userData);
                user.save()
                    .then(result => {
                        if(result){
                            jwt.sign(getTokenPayload(result), jwtSecret, {expiresIn: 3600},(err, token)=>{
                                const userResObj = {...responses.ADD.SAVED_SUCCESSFULLY.json, userParams:{...getUserParams(user), token}};
                                return res.status(responses.ADD.SAVED_SUCCESSFULLY.code).json(userResObj);
                            });
                        }
                        else
                            return res.status(responses.ADD.FAILURE.code).json(responses.ADD.FAILURE.json);
                    })
                    .catch(
                        err => {
                            return handleDbError(res, err);
                        });
            }
        })
        .catch(err =>{
            return handleDbError(res, err);
        });
};

/**
 * update user function
 */
exports.updateUser = (req, res) => {
    console.log('usersController - updateUser request received');
    let {userId = null} = req.AuthUser;
    userId = parseInt(userId);
    let { name = null , password = null , email = null, userType = null } = req.body;

    User.findOne({userId: userId, isActive:true })
        .then( doc => {
            if( !isset(doc)){
                console.log(`usersController - updateUser user with user id ${userId} not  found`);
                return res.status(responses.NOT_FOUND.code).json(responses.NOT_FOUND.json);
            }

            doc.name = name !== null ? name : doc.name;
            doc.password = password !== null ? password : doc.password ;
            doc.email = email !== null ? email : doc.email;
            if(userType !== null) {
                if(AllowedUserTypes.includes(userType))
                    doc.userType = userType;
            }

            doc.save()
                .then(result => {
                    if(result){
                        console.log(`usersController - updateUser user with user id ${userId} saved successfully`);
                        return res.status(responses.UPDATE.SUCCESS.code).json(responses.UPDATE.SUCCESS.json);
                    }
                    else{
                        console.log(`usersController - updateUser user with user id ${userId} error to save`);
                        return res.status(responses.UPDATE.FAILURE.code).json(responses.UPDATE.FAILURE.json);
                    }
                })
                .catch(err => {
                    console.log(`usersController - updateUser orders request db error ${err.name} message: ${err.message}`);
                    return handleDbError(res, err);
                })
        })
        .catch(
            err => {
                console.log(`usersController - updateUser orders request db error ${err.name} message: ${err.message}`);
                return handleDbError(res, err);
            });
};

/**
 * delete user function
 */
exports.deleteUser = (req, res) => {
    console.log('usersController - delete user request received');
    let {userId = null} = req.AuthUser;
    if(!isset(userId)){
        console.log(`usersController - delete user request - missing parameters`);
        return res.status(responses.MISSING_PARAMS.code).json(responses.MISSING_PARAMS.json);
    }
    User.findOne({userId: userId})
        .then(doc => {
            if(!isset(doc)){
                console.log(`usersController - delete user user with user id ${userId} not  found`);
                return res.status(responses.NOT_FOUND.code).json(responses.NOT_FOUND.json);
            }

            doc.isActive = false;
            doc.save()
                .then(result => {
                    if(result){
                        console.log(`usersController - delete user user with user id ${userId} saved successfully`);
                        return res.status(responses.DELETE.SUCCESS.code).json(responses.DELETE.SUCCESS.json);
                    }
                    else{
                        console.log(`usersController - delete user user with user id ${userId} error to save`);
                        return res.status(responses.ERROR_OCCURRED.code).json(responses.ERROR_OCCURRED.json);
                    }
                })
                .catch(err => {
                    console.log(`usersController - get all users orders request db error ${err.name} message: ${err.message}`);
                    return handleDbError(res, err);
                })
        })
        .catch(err =>{
            console.log(`usersController - get all users orders request db error ${err.name} message: ${err.message}`);
            return handleDbError(res, err);
        });
};

handleDbError = (res, err) =>{
    const retParams = responses.DB_ERROR;
    retParams.json.message += err.name + ` message: ${err.message}` ;
    res.status(retParams.code).json(retParams.json);
};


getUserLastId = async () => {
    const lastId = await User.findOne({}).sort('-userId');
    if(lastId)
        return lastId.userId;
    else
        return 0;
};


