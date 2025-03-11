import { createClient } from "@libsql/client";

const client = createClient({
  url: "file:./data/questions.db"
});

export async function initializeDatabase() {
  await client.execute(`
    CREATE TABLE IF NOT EXISTS questions (
      id TEXT PRIMARY KEY,
      question TEXT NOT NULL,
      image TEXT,
      options TEXT NOT NULL,
      correctAnswer INTEGER NOT NULL,
      category TEXT NOT NULL
    )
  `);
}

export async function getQuestions() {
  const result = await client.execute("SELECT * FROM questions");
  return result.rows.map(row => ({
    ...row,
    options: JSON.parse(row.options as string)
  }));
}

export async function getRandomQuestions(limit: number) {
  const result = await client.execute(`
    SELECT * FROM questions
    ORDER BY RANDOM()
    LIMIT ?
  `, [limit]);
  return result.rows.map(row => ({
    ...row,
    options: JSON.parse(row.options as string)
  }));
}

export async function createQuestion(question: {
  question: string;
  options: string[];
  correctAnswer: number;
  category: string;
  image?: string;
}) {
  const id = crypto.randomUUID();
  await client.execute({
    sql: `
      INSERT INTO questions (id, question, image, options, correctAnswer, category)
      VALUES (:id, :question, :image, :options, :correctAnswer, :category)
    `,
    args: {
      id,
      question: question.question,
      image: question.image || null,
      options: JSON.stringify(question.options),
      correctAnswer: question.correctAnswer,
      category: question.category
    }
  });
  return id;
}

export async function updateQuestion(id: string, question: {
  question: string;
  options: string[];
  correctAnswer: number;
  category: string;
  image?: string;
}) {
  await client.execute({
    sql: `
      UPDATE questions
      SET
        question = :question,
        image = :image,
        options = :options,
        correctAnswer = :correctAnswer,
        category = :category
      WHERE id = :id
    `,
    args: {
      id,
      question: question.question,
      image: question.image || null,
      options: JSON.stringify(question.options),
      correctAnswer: question.correctAnswer,
      category: question.category
    }
  });
}

export async function deleteQuestion(id: string) {
  await client.execute({
    sql: "DELETE FROM questions WHERE id = :id",
    args: { id }
  });
}
