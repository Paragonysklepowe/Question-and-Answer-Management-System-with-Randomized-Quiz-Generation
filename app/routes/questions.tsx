import { json } from "@remix-run/node";
import { useLoaderData, Form, useFetcher } from "@remix-run/react";
import { getQuestions, createQuestion, updateQuestion, deleteQuestion } from "~/db.server";
import { useState } from "react";

export const loader = async () => {
  const questions = await getQuestions();
  return json({ questions });
};

export const action = async ({ request }) => {
  const formData = await request.formData();
  const actionType = formData.get("_action");

  if (actionType === "create") {
    const question = {
      question: formData.get("question"),
      options: [
        formData.get("option1"),
        formData.get("option2"),
        formData.get("option3"),
        formData.get("option4")
      ],
      correctAnswer: parseInt(formData.get("correctAnswer")),
      category: formData.get("category")
    };
    await createQuestion(question);
    return null;
  }

  if (actionType === "update") {
    const id = formData.get("id");
    const question = {
      question: formData.get("question"),
      options: [
        formData.get("option1"),
        formData.get("option2"),
        formData.get("option3"),
        formData.get("option4")
      ],
      correctAnswer: parseInt(formData.get("correctAnswer")),
      category: formData.get("category")
    };
    await updateQuestion(id, question);
    return null;
  }

  if (actionType === "delete") {
    const id = formData.get("id");
    await deleteQuestion(id);
    return null;
  }

  return null;
};

function QuestionForm({ question, onCancel }) {
  return (
    <Form method="post" className="mb-4 p-4 border rounded-lg">
      <div className="space-y-4">
        {question?.id && <input type="hidden" name="id" value={question.id} />}
        <input type="hidden" name="_action" value={question?.id ? "update" : "create"} />
        
        <div>
          <label className="block mb-1">Question</label>
          <textarea
            name="question"
            className="w-full p-2 border rounded"
            defaultValue={question?.question}
            required
          />
        </div>
        
        <div className="grid grid-cols-2 gap-4">
          {[1, 2, 3, 4].map((num) => (
            <div key={num}>
              <label className="block mb-1">Option {num}</label>
              <input
                type="text"
                name={`option${num}`}
                className="w-full p-2 border rounded"
                defaultValue={question?.options?.[num - 1]}
                required
              />
            </div>
          ))}
        </div>
        
        <div>
          <label className="block mb-1">Correct Answer</label>
          <select
            name="correctAnswer"
            className="w-full p-2 border rounded"
            defaultValue={question?.correctAnswer}
            required
          >
            <option value="0">Option 1</option>
            <option value="1">Option 2</option>
            <option value="2">Option 3</option>
            <option value="3">Option 4</option>
          </select>
        </div>
        
        <div>
          <label className="block mb-1">Category</label>
          <input
            type="text"
            name="category"
            className="w-full p-2 border rounded"
            defaultValue={question?.category}
            required
          />
        </div>
        
        <div className="flex gap-2">
          <button
            type="submit"
            className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
          >
            {question?.id ? "Update" : "Add"} Question
          </button>
          {onCancel && (
            <button
              type="button"
              onClick={onCancel}
              className="px-4 py-2 bg-gray-500 text-white rounded hover:bg-gray-600"
            >
              Cancel
            </button>
          )}
        </div>
      </div>
    </Form>
  );
}

function DeleteConfirmation({ question, onConfirm, onCancel }) {
  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4">
      <div className="bg-white p-6 rounded-lg max-w-md w-full">
        <h2 className="text-lg font-bold mb-4">Delete Question</h2>
        <p className="mb-4">Are you sure you want to delete this question?</p>
        <div className="flex justify-end gap-2">
          <button
            onClick={onCancel}
            className="px-4 py-2 bg-gray-500 text-white rounded hover:bg-gray-600"
          >
            Cancel
          </button>
          <button
            onClick={onConfirm}
            className="px-4 py-2 bg-red-500 text-white rounded hover:bg-red-600"
          >
            Delete
          </button>
        </div>
      </div>
    </div>
  );
}

export default function Questions() {
  const { questions } = useLoaderData<typeof loader>();
  const [editingQuestion, setEditingQuestion] = useState(null);
  const [deletingQuestion, setDeletingQuestion] = useState(null);
  const deleteFetcher = useFetcher();

  return (
    <div className="max-w-4xl mx-auto p-4">
      <h1 className="text-2xl font-bold mb-4">Manage Questions</h1>
      
      {deletingQuestion && (
        <DeleteConfirmation
          question={deletingQuestion}
          onConfirm={() => {
            deleteFetcher.submit(
              { _action: "delete", id: deletingQuestion.id },
              { method: "post" }
            );
            setDeletingQuestion(null);
          }}
          onCancel={() => setDeletingQuestion(null)}
        />
      )}

      <QuestionForm 
        question={editingQuestion} 
        onCancel={editingQuestion ? () => setEditingQuestion(null) : null}
      />

      <div className="grid gap-4">
        {questions.map((q) => (
          <div key={q.id} className="border p-4 rounded-lg">
            <div className="flex justify-between items-start">
              <div className="font-medium mb-2">{q.question}</div>
              <div className="flex gap-2">
                <button
                  onClick={() => setEditingQuestion(q)}
                  className="px-2 py-1 text-sm bg-yellow-500 text-white rounded hover:bg-yellow-600"
                >
                  Edit
                </button>
                <button
                  onClick={() => setDeletingQuestion(q)}
                  className="px-2 py-1 text-sm bg-red-500 text-white rounded hover:bg-red-600"
                >
                  {deleteFetcher.state === "submitting" && 
                   deleteFetcher.formData?.get("id") === q.id ? (
                    "Deleting..."
                  ) : (
                    "Delete"
                  )}
                </button>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-2">
              {q.options.map((option, index) => (
                <div key={index} className={`p-2 rounded ${
                  index === q.correctAnswer ? "bg-green-100" : "bg-gray-100"
                }`}>
                  {option}
                </div>
              ))}
            </div>
            <div className="mt-2 text-sm text-gray-600">
              Category: {q.category}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
