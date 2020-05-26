const genericResponses = {
    GET_SUCCESS:{
        code:200,
        json:{
            status: 1,
            message:'success',
            data: undefined,
        }
    },
    GENERAL_SUCCESS:{
        code:200,
        json:{ status:1, message:`success` }
    },
    MISSING_PARAMS:{
        code: 400,
        json:{ status: 0, message:`all API parameters must be set`},
    },
    WRONG_PARAMS:{
        code: 400,
        json:{ status: 0, message:`incorrect API parameters sent`},
    },
    SAVED_SUCCESSFULLY:{
        code: 200,
        json: { status: 1, message: `saved successfully` },
    },
    DB_ERROR:{
        code: 502,
        json:{
            status: 0, message:`DB Error: `
        }
    },
    UPDATED: {
        code: 200,
        json: { status: 1, message: `updated successfully` },
    },
    FORBIDDEN: {
        code:403,
        json:{ status: 0, message: 'unauthorized user' }
    },
    ERROR_OCCURRED:{
        code: 502,
        json: {
            code: 0,
            message: `error occurred`
        },
    },
    UNAUTHORIZED_USER:{
        code: 401,
        json:{status: 0, message: 'unauthorized user' }
    },
};

exports.genericsReponses = genericResponses;


const sentencesResponses = {
    NOT_FOUND:{
        code: 404,
        json:{
            status: 0,
            message:'not found',
        }
    },
    ADD:{
        SAVED_SUCCESSFULLY:genericResponses.SAVED_SUCCESSFULLY,
        FAILURE: {
            code: 502,
            json:{
                status: 0,
                message:'there was error to save the sentence',
            },
        },
    },
    GET:{
        SUCCESS: genericResponses.GET_SUCCESS,
    },
    UPDATE: {
        SUCCESS: genericResponses.UPDATED,
        FAILURE: genericResponses.ERROR_OCCURRED,
    },
    DELETE:{
        SUCCESS: genericResponses.GENERAL_SUCCESS,
    },
    DB_ERROR: genericResponses.DB_ERROR,
    FORBIDDEN: genericResponses.FORBIDDEN,
    MISSING_PARAMS: genericResponses.MISSING_PARAMS,
    WRONG_PARAMS: genericResponses.WRONG_PARAMS,
    ERROR_OCCURRED: genericResponses.ERROR_OCCURRED,
};

exports.sentencesResponses = sentencesResponses;

const ordersResponses = {
    NOT_FOUND:{
        code: 404,
        json:{
            status: 0,
            message:'not found',
        }
    },
    ADD:{
        SAVED_SUCCESSFULLY:genericResponses.SAVED_SUCCESSFULLY,
        FAILURE: {
            code: 502,
            json:{
                status: 0,
                message:'there was error to establish your order',
            },
        },
    },
    GET:{
        SUCCESS: genericResponses.GET_SUCCESS,
    },
    UPDATE: {
        SUCCESS: genericResponses.UPDATED,
        FAILURE: genericResponses.ERROR_OCCURRED,
    },
    DELETE:{
        SUCCESS: genericResponses.GENERAL_SUCCESS,
    },
    DB_ERROR: genericResponses.DB_ERROR,
    FORBIDDEN: genericResponses.FORBIDDEN,
    MISSING_PARAMS: genericResponses.MISSING_PARAMS,
    WRONG_PARAMS: genericResponses.WRONG_PARAMS,
    ERROR_OCCURRED: genericResponses.ERROR_OCCURRED,
};

exports.ordersResponses = ordersResponses;

const usersResponses = {
    NOT_FOUND:{
        code: 404,
        json:{
            status: 0,
            message:'not found',
        }
    },
    ADD:{
        SAVED_SUCCESSFULLY:genericResponses.SAVED_SUCCESSFULLY,
        FAILURE: {
            code: 502,
            json:{
                status: 0,
                message:'there was error to save users credentials',
            },
        },
    },
    GET:{
        SUCCESS: genericResponses.GET_SUCCESS,
    },
    UPDATE: {
        SUCCESS: genericResponses.UPDATED,
        FAILURE: genericResponses.ERROR_OCCURRED,
    },
    DELETE:{
        SUCCESS: genericResponses.GENERAL_SUCCESS,
    },
    DB_ERROR: genericResponses.DB_ERROR,
    FORBIDDEN: genericResponses.FORBIDDEN,
    MISSING_PARAMS: genericResponses.MISSING_PARAMS,
    WRONG_PARAMS: genericResponses.WRONG_PARAMS,
    ERROR_OCCURRED: genericResponses.ERROR_OCCURRED,
    UNAUTHORIZED_USER: genericResponses.UNAUTHORIZED_USER,
    USER_ALREADY_EXISTS: {
        code: 409,
        json: {
            status: 0,
            message: 'user already exists',
        }
    },
    USER_AUTH_SUCCESSFULLY: {
        code: 200,
        json:{
            status: 1,
            message:" user authenticated successfully",
        }
    },
    TOKEN_ERROR:{
        code: 500,
        json: {
            status:0,
            message: 'error generate token',
        }
    },
};

exports.usersResponses = usersResponses;

const paymentResponses = {
    MISSING_PARAMS: genericResponses.MISSING_PARAMS,
    INCORRECT_VALUES:{
        code: 400,
        json:{
            status: 0,
            message:'incorrect item structure',
        },
    },
    DB_ERROR: genericResponses.DB_ERROR,
    SAVE_ERROR: {
        code: 502,
        json:{
            status: 0,
            message:'error while trying to save to DB',
        },
    },
    CREATE_PAYMENT_ERROR:{
        code: 502,
        json:{
            status: 0,
            message:'error to create payment: ',
        },
    },
    EXECUTE_PAYMENT_ERROR:{
        code: 502,
        json:{
            status: 0,
            message:'error to execute payment: ',
        },
    },
};
exports.paymentResponses = paymentResponses;
