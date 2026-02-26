import {Subject} from "../types";

export const MOCK_SUBJECTS: Subject[] = [
    {
        id: 1,
        code: "CS101",
        name: "Introduction to Computer Science",
        department: "CS",
        description: "An overview of the field of computer science, including basic programming concepts and algorithmic thinking.",
        createdAt: "2024-02-01T08:00:00Z"
    },
    {
        id: 2,
        code: "MATH201",
        name: "Calculus I",
        department: "Math",
        description: "Fundamental concepts of differential and integral calculus, including limits, derivatives, and integrals.",
        createdAt: "2024-02-01T08:00:00Z"
    },
    {
        id: 3,
        code: "ENG101",
        name: "English Composition",
        department: "English",
        description: "Introduction to academic writing, focusing on essay structure, grammar, and critical thinking.",
        createdAt: "2024-02-01T08:00:00Z"
    }
];
