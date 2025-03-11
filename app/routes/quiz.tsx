import { json } from "@remix-run/node";
import { useLoaderData, Form, useActionData } from "@remix-run/react";
import { getRandomQuestions } from "~/db.server";
import { useState } from "react";

export const loader = async () => {
  const questions = await getRandomQuestions(40);
  return json({ questions });
};

export const action = async ({ request }) => {
  const formData = await request.formData();
  const answers = Object.fromEntries(formData.entries());
  
  const questions = await getRandomQuestions(40);
  let correctCount = 0;
  let incorrectCount = 0;
  let unansweredCount = 0;
  
  const results = questions.map(q => {
    const userAnswer = answers[q.id];
    const isCorrect = userAnswer ? parseInt(userAnswer) === q.correctAnswer : false;
    
    if (userAnswer === undefined) {
      unansweredCount++;
    } else if (isCorrect) {
      correctCount++;
    } else {
      incorrectCount++;
    }
    
    return {
      question: q.question,
      userAnswer: userAnswer !== undefined ? q.options[parseInt(userAnswer)] : "Not answered",
      correctAnswer: q.options[q.correctAnswer],
      isCorrect,
      isAnswered: userAnswer !== undefined
    };
  });

  return json({ 
    correctCount,
    incorrectCount,
    unansweredCount,
    total: questions.length,
    results,
    percentage: Math.round((correctCount / questions.length) * 100)
  });
};

export default function Quiz() {
  const { questions } = useLoaderData<typeof loader>();
  const actionData = useActionData<typeof action>();
  const [currentQuestion, setCurrentQuestion] = useState(0);

  if (actionData) {
    return (
      <div className="max-w-4xl mx-auto p-4">
        <h1 className="text-2xl font-bold mb-4">Quiz Results</h1>
        
        <div className="grid grid-cols-3 gap-4 mb-6">
          <div className="bg-green-100 p-4 rounded-lg">
            <p className="text-lg font-medium">Correct</p>
            <p className="text-2xl">{actionData.correctCount}</p>
          </div>
          <div className="bg-red-100 p-4 rounded-lg">
            <p className="text-lg font-medium">Incorrect</p>
            <p className="text-2xl">{actionData.incorrectCount}</p>
          </div>
          <div className="bg-gray-100 p-4 rounded-lg">
            <p className="text-lg font-medium">Unanswered</p>
            <p className="text-2xl">{actionData.unansweredCount}</p>
          </div>
        </div>

        <div className="bg-blue-50 p-4 rounded-lg mb-6">
          <p className="text-lg font-medium">
            Your Score: {actionData.correctCount}/{actionData.total} (
            {actionData.percentage}%)
          </p>
        </div>
        
        <div className="space-y-4">
          {actionData.results.map((result, index) => (
            <div key={index} className={`p-4 rounded-lg ${
              result.isCorrect ? "bg-green-50" : 
              result.isAnswered ? "bg-red-50" : "bg-gray-50"
            }`}>
              <p className="font-medium">{index + 1}. {result.question}</p>
              <div className="mt-2 space-y-1">
                <p>Your answer: {result.userAnswer}</p>
                {!result.isCorrect && (
                  <p>Correct answer: {result.correctAnswer}</p>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto p-4">
      <h1 className="text-2xl font-bold mb-4">Quiz</h1>
      
      <Form method="post">
        <div className="border p-4 rounded-lg mb-4">
          <div className="font-medium mb-2">
            {currentQuestion + 1}. {questions[currentQuestion].question}
          </div>
          <div className="grid grid-cols-2 gap-2">
            {questions[currentQuestion].options.map((option, i) => (
              <label key={i} className="flex items-center p-2 rounded bg-gray-100">
                <input
                  type="radio"
                  name={questions[currentQuestion].id}
                  value={i}
                  className="mr-2"
                />
                {option}
              </label>
            ))}
          </div>
        </div>

        <div className="flex justify-between">
          <button
            type="button"
            onClick={() => setCurrentQuestion(prev => Math.max(0, prev - 1))}
            className="px-4 py-2 bg-gray-500 text-white rounded hover:bg-gray-600"
            disabled={currentQuestion === 0}
          >
            Previous
          </button>
          <button
            type="button"
            onClick={() => setCurrentQuestion(prev => Math.min(questions.length - 1, prev + 1))}
            className="px-4 py-2 bg-gray-500 text-white rounded hover:bg-gray-600"
            disabled={currentQuestion === questions.length - 1}
          >
            Next
          </button>
        </div>

        <button
          type="submit"
          className="mt-4 w-full px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
        >
          Submit Quiz
        </button>
      </Form>
    </div>
  );
}
