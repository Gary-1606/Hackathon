import { useRef, useState, useEffect } from 'react';
import Layout from '@/components/layout';
import styles from '@/styles/Home.module.css';
import { Message } from '@/types/chat';
import Image from 'next/image';
import ReactMarkdown from 'react-markdown';
import LoadingDots from '@/components/ui/LoadingDots';
import { Document } from 'langchain/document';
import { Select } from '@chakra-ui/react';

export default function Home() {
  const [age, setAge] = useState('8-12');
  const [difficulty, setDifficulty] = useState('easy');
  const [quizData, setQuizData] = useState<any>([]);
  const [counter, setCounter] = useState<number>(0);

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

    let query = `Create 10 different multiple choice question with 4 options of difficult ${difficulty} and for children of age group ${age} years on AFL rules. Provide correct answer and hint for each questions on AFL rules. 

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
      setCounter(counter + 1);
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

  console.log('quizData', quizData);
  return (
    <>
      <Layout>
        <div className="mx-auto flex flex-col gap-4">
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
                <option value="easy">Easy</option>
                <option value="medium">Medium</option>
                <option value="difficult">Difficult</option>
              </select>
              <select
                value={age}
                onChange={(e) => setAge(e.target.value)}
                placeholder="Age Group"
                className={styles.select}
              >
                <option value="8-12">8-12 years</option>
                <option value="12-16">12-16 years</option>
                <option value="16-20">16-20 years</option>
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
          </form>

          {loading && <div>loading....</div>}

          {quizData &&
            quizData.length > 0 &&
            quizData.map((datum: any, i: any) => {
              return (
                <>
                  {i === counter + 1 ? (
                    <div key={i}>
                      <div>{datum.question}</div>
                      <button
                        type="button"
                        onClick={() => setCounter(counter + 1)}
                        className="mt-8 text-center bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded"
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
