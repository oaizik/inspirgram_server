const { Router } = require('express');
const SentencesRouter = new Router();
const { getAllSentences,
        getSentence,
        getSentenceByWriterId,
        addSentence,
        updateSentence,
        deleteSentence } = require('../controllers/SentencesController');
//path = /sentences
SentencesRouter.get('/', getAllSentences);
//path = /sentences/<sentenceId>
SentencesRouter.get('/:sentenceId', getSentence);
//path = /sentences/getByWriterId/<writerId>
SentencesRouter.get('/getByWriterId/:writerId', getSentenceByWriterId);
//path = /sentences
SentencesRouter.post('/',addSentence);
//path = /sentences/<sentenceId>
SentencesRouter.put('/', updateSentence);
//path = /sentences/<sentenceId>
SentencesRouter.delete('/', deleteSentence);


module.exports = SentencesRouter;
