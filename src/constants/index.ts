import { GraduationCap, School } from "lucide-react";

export const USER_ROLES = {
    STUDENT: "student",
    TEACHER: "teacher",
    ADMIN: "admin",
};

export const ROLE_OPTIONS = [
    {
        value: USER_ROLES.STUDENT,
        label: "Student",
        icon: GraduationCap,
    },
    {
        value: USER_ROLES.TEACHER,
        label: "Teacher",
        icon: School,
    },
];

export const DEPARTMENTS = [
    "Science",
    "Arts"
] as const;

export const DEPARTMENT_OPTIONS = DEPARTMENTS.map((dept) => ({
    value: dept,
    label: dept,
}));

export const MAX_FILE_SIZE = 3 * 1024 * 1024; // 3MB in bytes
export const ALLOWED_TYPES = [
    "image/png",
    "image/jpeg",
    "image/jpg",
    "image/webp",
];

const getEnvVar = (key: string): string => {
    const value = import.meta.env[key];
    if (!value) {
        throw new Error(`Missing environment variable: ${key}`);
    }
    return value;
};

export const CLOUDINARY_UPLOAD_URL = getEnvVar("VITE_CLOUDINARY_UPLOAD_URL");
export const CLOUDINARY_CLOUD_NAME = getEnvVar("VITE_CLOUDINARY_CLOUD_NAME");
export const BACKEND_BASE_URL = getEnvVar("VITE_BACKEND_BASE_URL");

export const BASE_URL =  import.meta.env.VITE_API_URL;
export const ACCESS_TOKEN_KEY = import.meta.env.VITE_ACCESS_TOKEN_KEY;
export const REFRESH_TOKEN_KEY = import.meta.env.VITE_REFRESH_TOKEN_KEY;

export const REFRESH_TOKEN_URL = `${BASE_URL}/refresh-token`;

export const CLOUDINARY_UPLOAD_PRESET = getEnvVar("VITE_CLOUDINARY_UPLOAD_PRESET");

export const teachers = [
    {
        id: 1,
        name: "John Doe",
    },
    {
        id: 2,
        name: "Jane Smith",
    },
    {
        id: 3,
        name: "Dr. Alan Turing",
    },
];

export const subjects = [
    {
        id: 1,
        name: "Mathematics",
        code: "MATH",
    },
    {
        id: 2,
        name: "Computer Science",
        code: "CS",
    },
    {
        id: 3,
        name: "Physics",
        code: "PHY",
    },
    {
        id: 4,
        name: "Chemistry",
        code: "CHEM",
    },
];

const SEED_DATA = {
    admin: {
        name: "Admin",
        email: "admin@school.com",
        password: "AdminPass123"
    },
    teachers: [
        { name: "John Smith", email: "teacher1@school.com", password: "TeacherPass123" },
        { name: "Jane Doe", email: "teacher2@school.com", password: "TeacherPass123" },
        { name: "Mr. Johnson", email: "teacher3@school.com", password: "TeacherPass123" },
    ],
    students: [
        { name: "Alice Brown", email: "student1@school.com", password: "StudentPass123" },
        { name: "Bob Wilson", email: "student2@school.com", password: "StudentPass123" },
        { name: "Charlie Lee", email: "student3@school.com", password: "StudentPass123" },
        { name: "Diana Garcia", email: "student4@school.com", password: "StudentPass123" },
        { name: "Evan Martinez", email: "student5@school.com", password: "StudentPass123" },
    ],
    departments: [
        { code: "SCI", name: "Science", description: "Science department" },
        { code: "ARTS", name: "Arts", description: "Arts and Humanities department" },
    ],
    subjects: [
        { code: "MATH", name: "Mathematics", description: "Math course", deptCode: "SCI" },
        { code: "PHYS", name: "Physics", description: "Physics course", deptCode: "SCI" },
        { code: "CHEM", name: "Chemistry", description: "Chemistry course", deptCode: "SCI" },
        { code: "HIST", name: "History", description: "History course", deptCode: "ARTS" },
        { code: "ENG", name: "English", description: "English course", deptCode: "ARTS" },
        { code: "ART", name: "Art", description: "Art course", deptCode: "ARTS" },
    ],
};