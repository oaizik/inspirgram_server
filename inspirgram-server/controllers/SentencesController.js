const Sentence = require('../models/Sentence');
const responses = require('../config/responses').sentencesResponses;
const {isset} = require('../utilities/generalHelpers');

// generalGet = (req, res, searchTerm, then_func) => {
//     Sentence.find(searchTerm)
//         .then(then_func)
//         .catch(
//             err => {
//                 return handleDbError(res, err);
//             });

// };
generalGet = (req, res, searchTerm, then_func) => {
    Sentence.find(searchTerm).sort({"sentenceId":1})
        .then(then_func)
        .catch(
            err => {
                return handleDbError(res, err);
            });

};
/**
 * get all the sentences function
 */
exports.getAllSentences = (req, res) => {
    console.log(`sentenceController - get all sentences request received`);
    const then_func = sentences => {
        console.log(`sentenceController - get all sentences request sentences returned successfully`);
        const retData = responses.GET.SUCCESS;
        retData.json.data = sentences;
        res.status(retData.code).json(retData.json);
    };
    return generalGet(req, res,{isActive: true}, then_func);
};
/**
 * get specific sentence function
 */
exports.getSentence = (req , res) => {
    console.log(`sentenceController - get sentence request received`);
    const then_func = sentences =>{
        if(sentences.length !== 0){
            console.log(`sentenceController - get sentence request sentence returned successfully`);
            const retData = responses.GET.SUCCESS;
            retData.json.data = sentences;
            res.status(retData.code).json(retData.json);
        }
        else
            res.status(responses.NOT_FOUND.code).json(responses.NOT_FOUND.json);
    };
    return generalGet(req, res , {sentenceId: req.params.sentenceId, isActive: true},then_func);
};

/**
 * get sentence by writer id function
 */
exports.getSentenceByWriterId = (req , res) => {
    console.log(`sentenceController - get sentence by writer id request received`);
    const then_func = sentences =>{
        if(sentences.length !== 0){
            console.log(`sentenceController - get sentence by writer id request returned successfully`);
            const retData = responses.GET.SUCCESS;
            retData.json.data = sentences;
            res.status(retData.code).json(retData.json);
        }
        else
            res.status(responses.NOT_FOUND.code).json(responses.NOT_FOUND.json);
    };
    return generalGet(req, res , {writerId: req.params.writerId, isActive: true},then_func);
};


exports.addSentence = async (req,res) => {
    const { sentenceBody, writerId, style } = req.body;
    console.log(`sentenceController - add sentence request received`);
    if( !isset(sentenceBody) || !isset(writerId)  ){
        console.log(`sentenceController - add sentence request - missing parameters`);
        return res.status(responses.MISSING_PARAMS.code).json(responses.MISSING_PARAMS.json);
    }

    const sentenceData = { sentenceBody: sentenceBody, writerId: writerId};

    if (typeof style == "object")
        sentenceData.style = style;

    sentenceData.sentenceId = await getSentenceLastId()+1;
    const sentence = new Sentence(sentenceData);
    sentence.save()
        .then(result => {
            if(result){
                console.log(`sentenceController - add sentence request - sentence saved successfully`);
                return res.status(responses.ADD.SAVED_SUCCESSFULLY.code).json(responses.ADD.SAVED_SUCCESSFULLY.json);
            }
            else{
                console.log(`sentenceController - add sentence request - sentence not saved`);
                return res.status(responses.ADD.FAILURE.code).json(responses.ADD.FAILURE.json);
            }
        })
        .catch(
            err => {
                console.log(`sentenceController - add sentence request db error ${err.name} message: ${err.message}`);
                return handleDbError(res, err);
            });
};


exports.updateSentence = (req, res) => {
    let { sentenceBody = null , style = null, sentenceId = null} = req.body, {userId = null} = req.AuthUser ;
    if(sentenceId === null || userId === null)
        return res.status(responses.MISSING_PARAMS.code).json(responses.MISSING_PARAMS.json);
    sentenceId = parseInt(sentenceId);
    Sentence.findOne({sentenceId: sentenceId})
        .then( doc => {
            if( doc === null ){
                console.log(`sentenceController - update sentence request - missing parameters`);
                return res.status(responses.NOT_FOUND.code).json(responses.NOT_FOUND.json);
            }

            if(doc.writerId !== userId)//todo maybe add master user privileged to edit all the sentences
            {
                console.log(`sentenceController - update sentence request - missing parameters`);
                return res.status(responses.FORBIDDEN.code).json(responses.FORBIDDEN.json);
            }

            doc.sentenceBody = sentenceBody !== null ? sentenceBody : doc.sentenceBody ;
            doc.style = style !== null ? style : doc.style;
            doc.updatedAt = Date.now();
            doc.save()
                .then(result => {
                    if(result){
                        console.log(`sentenceController - update sentence request - sentence saved successfully`);
                        return res.status(responses.UPDATE.SUCCESS.code).json(responses.UPDATE.SUCCESS.json);
                    }
                    else
                    {
                        console.log(`sentenceController - update sentence request - sentence not saved`);
                        return res.status(responses.UPDATE.FAILURE.code).json(responses.UPDATE.FAILURE.json);
                    }
                })
                .catch(err => {
                    console.log(`sentenceController - update sentence request db error ${err.name} message: ${err.message}`);
                    return handleDbError(res, err);
                })
        })
        .catch(
            err => {
                console.log(`sentenceController - update sentence request db error ${err.name} message: ${err.message}`);
                return handleDbError(res, err);
            });
};


exports.deleteSentence = (req, res) => {
    const {sentenceId = null} = req.body;
    const { userId = null } = req.AuthUser;
    if(sentenceId === null || userId === null ){
        console.log(`sentenceController - delete sentence request - missing parameters`);
        return res.status(responses.MISSING_PARAMS.code).json(responses.MISSING_PARAMS.json);
    }

    Sentence.findOne({sentenceId: sentenceId})
        .then(doc => {
            if( doc === null ){
                console.log(`sentenceController - delete sentence request - sentence with sentence id: ${sentenceId} is not found`);
                return res.status(responses.NOT_FOUND.code).json(responses.NOT_FOUND.json);
            }
            if(doc.writerId !== userId)//todo maybe add master user privileged to edit all the sentences
            {
                console.log(`sentenceController - delete sentence request - sentence not belongs to user id ${doc.writerId}`);
                return res.status(responses.FORBIDDEN.code).json(responses.FORBIDDEN.json);
            }
            doc.isActive = false;
            doc.save()
                .then(result => {
                    if(result){
                        console.log(`sentenceController - delete sentence request - sentence removed successfully`);
                        return res.status(responses.DELETE.SUCCESS.code).json(responses.DELETE.SUCCESS.json);
                    }
                    else{
                        console.log(`sentenceController - delete sentence request - error to remove sentence`);
                        return res.status(responses.ERROR_OCCURRED.code).json(responses.ERROR_OCCURRED.json);
                    }
                })
                .catch(err => {
                    console.log(`sentenceController - update sentence request db error ${err.name} message: ${err.message}`);
                    return handleDbError(res, err);
                })
        })
        .catch(err => {
            console.log(`sentenceController - update sentence request db error ${err.name} message: ${err.message}`);
            return handleDbError(res, err);
        });
};

handleDbError = (res, err) =>{
    const retParams = responses.DB_ERROR;
    retParams.json.message += err.name + ` message: ${err.message}` ;
    res.status(retParams.code).json(retParams.json);
};


getSentenceLastId = async () => {
    const lastId = await Sentence.findOne({}).sort('-sentenceId');
    if(lastId)
        return lastId.sentenceId;
    else
        return 0;
};

exports.addNumOfOrders = sentenceId => {
    Sentence.findOne({sentenceId: sentenceId})
        .then( doc => {
            if( doc === null )
                return false;
            doc.numOfOrders += 1;
            doc.save()
                .then(result => {
                    if(result) {
                        console.log(`successfuly updated num of orders for sentence id: ${sentenceId}!`);
                        return;
                    } else {
                        console.log(`unsuccessfuly updated num of orders for sentence id: ${sentenceId}`);
                        return;
                    }
                })
                .catch(err => {
                    console.log(`unsuccessfuly updated num of orders for sentence id: ${sentenceId}, DB error!`);
                    return;
                })
        })
        .catch(
            err => {
                console.log(`unsuccessfuly updated num of orders for sentence id: ${sentenceId}, sentence dosent found!!`);
                return;
            });
};

exports.minusNumOfOrders = sentenceId => {
    Sentence.findOne({sentenceId: sentenceId})
        .then( doc => {
            if( doc === null )
                return false;
            doc.numOfOrders -= 1;
            doc.save()
                .then(result => {
                    if(result) {
                        console.log(`successfuly updated num of orders for sentence id: ${sentenceId}!`);
                        return;
                    } else {
                        console.log(`unsuccessfuly updated num of orders for sentence id: ${sentenceId}`);
                        return;
                    }
                })
                .catch(err => {
                    console.log(`unsuccessfuly updated num of orders for sentence id: ${sentenceId}, DB error!`);
                    return;
                })
        })
        .catch(
            err => {
                console.log(`unsuccessfuly updated num of orders for sentence id: ${sentenceId}, sentence dosent found!`);
                return;
            });
}


