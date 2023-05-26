import { useRef, useState, useEffect } from 'react';
import Layout from '@/components/layout';
import styles from '@/styles/Home.module.css';
import { Message } from '@/types/chat';
import Image from 'next/image';
import { Document } from 'langchain/document';
import loader from '../public/assets/loader.gif';

export default function Home() {
  const [language, setLanguage] = useState('8-12');
  const [difficulty, setDifficulty] = useState('default');
  const [quizData, setQuizData] = useState<any>([]);
  const [counter, setCounter] = useState<number>(0);
  const [isAnswerCorrect, setIsAnswerCorrect] = useState<boolean>(false);
  const [questionOnView, setQuestionOnView] = useState<number>();
  const [clickedOption, setClickedOption] = useState<number>();

  const [query, setQuery] = useState<string>('');
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [messageState, setMessageState] = useState<{
    messages: Message[];
    pending?: string;
    history: [string, string][];
    pendingSourceDocs?: Document[];
  }>({
    messages: [
      {
        message: 'Hi, what would you like to learn about this document?',
        type: 'apiMessage',
      },
    ],
    history: [],
  });

  const { history } = messageState;

  const messageListRef = useRef<HTMLDivElement>(null);
  const textAreaRef = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    textAreaRef.current?.focus();
  }, []);

  //handle form submission
  async function handleSubmit(e: any) {
    e.preventDefault();

    setError(null);

    let query = `Create 5 different multiple choice question with 4 options of difficult ${difficulty} and of ${language} language on AFL rules. Provide correct answer in numeric format and hint for each questions on AFL rules. 

    Make sure the hints are designed to improve STEM (Science, Technology, Engineering and Mathematics) knowledge for the kids. 
        Do not include any explanations, only provide a  RFC8259 compliant array of JSON response  following this format without deviation.
        
        The JSON response:`;

    const question = query.trim();

    setMessageState((state) => ({
      ...state,
      messages: [
        ...state.messages,
        {
          type: 'userMessage',
          message: question,
        },
      ],
    }));

    setLoading(true);
    setQuery('');

    try {
      const response = await fetch('/api/chat', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          question,
          history,
        }),
      });
      const data = await response.json();
      console.log('data', data);

      const jsonData = JSON.parse(data.text.replace(/\\n' \+/g, ''));
      console.log('jsonData', jsonData);

      if (data.error) {
        setError(data.error);
      } else {
        setMessageState((state) => ({
          ...state,
          messages: [
            ...state.messages,
            {
              type: 'apiMessage',
              message: data.text,
              sourceDocs: data.sourceDocuments,
            },
          ],
          history: [...state.history, [question, data.text]],
        }));
      }
      console.log('messageState', messageState);
      setQuizData(jsonData);
      setLoading(false);

      //scroll to bottom
      messageListRef.current?.scrollTo(0, messageListRef.current.scrollHeight);
    } catch (error) {
      setLoading(false);
      setError('An error occurred while fetching the data. Please try again.');
      console.log('error', error);
    }
  }

  //prevent empty submissions
  const handleEnter = (e: any) => {
    if (e.key === 'Enter' && query) {
      handleSubmit(e);
    } else if (e.key == 'Enter') {
      e.preventDefault();
    }
  };

  const handleOptionClick = (optionIndex: any, questionIndex: any) => {
    setQuestionOnView(questionIndex);
    setClickedOption(optionIndex);
    if (quizData[questionIndex].answer === optionIndex + 1) {
      setIsAnswerCorrect(true);
      return;
    }
    setIsAnswerCorrect(false);
  };

  const handleNextBtnClick = () => {
    setCounter(counter + 1);
    setIsAnswerCorrect(false);
  };

  console.log('quizData', quizData);
  return (
    <>
      <Layout>
        <div className="flex flex-col gap-4">
          <h1 className="text-2xl font-bold leading-[1.1] tracking-tighter text-center">
            INTERACTIVE QUIZ BOT
          </h1>
          <form className="mt-8" onSubmit={handleSubmit}>
            <div className={styles.flex}>
              <select
                placeholder="Difficulty Level"
                value={difficulty}
                onChange={(e) => setDifficulty(e.target.value)}
                className={styles.select}
              >
                <option value="default">Difficulty Level</option>
                <option value="easy">Easy</option>
                <option value="medium">Medium</option>
                <option value="difficult">Difficult</option>
              </select>
              <select
                value={language}
                onChange={(e) => setLanguage(e.target.value)}
                placeholder="Languages"
                className={styles.select}
              >
                <option value="english">English</option>
                <option value="mandarin">Mandarin</option>
                <option value="arabic">Arabic</option>
              </select>
            </div>
            <div className={styles.flex}>
              <button
                type="submit"
                onClick={handleSubmit}
                disabled={loading}
                className="mt-8 text-center bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded"
              >
                Generate Quiz
              </button>
            </div>
            <div className="border-b border-b-slate-400 py-4 w-full"></div>
          </form>

          {loading && (
            <Image
              className="mx-auto"
              alt="loader"
              width={100}
              height={100}
              src={loader}
            />
          )}

          {quizData &&
            quizData.length > 0 &&
            quizData.map((datum: any, i: number) => {
              return (
                <>
                  {i === counter ? (
                    <div key={i} className="py-4 text-center">
                      <>
                        <p>{datum.question}</p>
                        <p className="py-4">
                          <strong>Hint: </strong>
                          {datum.hint}
                        </p>
                        <div className="gap-4 flex flex-row justify-center py-4">
                          {datum.options.map((item: any, index: number) => {
                            return (
                              <button
                                onClick={() => handleOptionClick(index, i)}
                                key={i}
                                className={`bg-gray-300 border border-gray-200 px-4 py-2  ${
                                  questionOnView === i &&
                                  isAnswerCorrect &&
                                  clickedOption === index
                                    ? 'bg-green-400 text-white'
                                    : 'hover:bg-slate-700 hover:text-white focus:bg-red-400 focus:text-white'
                                }}`}
                              >
                                {item}
                              </button>
                            );
                          })}
                        </div>
                      </>
                      <button
                        type="button"
                        onClick={handleNextBtnClick}
                        className="mt-8 text-center bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded disabled:bg-gray-500"
                        disabled={!isAnswerCorrect}
                      >
                        Next
                      </button>
                    </div>
                  ) : null}
                </>
              );
            })}
        </div>
      </Layout>
    </>
  );
}
