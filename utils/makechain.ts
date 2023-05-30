import { OpenAI } from 'langchain/llms/openai';
import { PineconeStore } from 'langchain/vectorstores/pinecone';
import { ConversationalRetrievalQAChain } from 'langchain/chains';

const CONDENSE_PROMPT = `Given the following conversation and a follow up question, rephrase the follow up question to be a standalone question.

Chat History:
{chat_history}
Follow Up Input: {question}
Standalone question:`;

const QA_PROMPT = `Create 5 different multiple choice question with 4 options of difficulty medium about the rules of Australian Football suitable for children aged 10-11. Provide correct answer in numeric format and hint for each questions on AFL rules. 

Make sure the hints are designed to improve STEM (Science, Technology, Engineering and Mathematics) knowledge for the kids. 
    Do not include any explanations, only provide a  RFC8259 compliant array of JSON response  following this format without deviation.
    
    The JSON response:`;

export const makeChain = (vectorstore: PineconeStore) => {
  const model = new OpenAI({
    temperature: 0.5, // increase temepreature to get more creative answers
    modelName: 'gpt-3.5-turbo', //change this to gpt-4 if you have access
  });

  const chain = ConversationalRetrievalQAChain.fromLLM(
    model,
    vectorstore.asRetriever(),
    {
      qaTemplate: QA_PROMPT,
      questionGeneratorTemplate: CONDENSE_PROMPT,
      returnSourceDocuments: false, //The number of source documents returned is 4 by default
    },
  );
  return chain;
};
