# FitTrack Application Schema

This document outlines the data structures (TypeScript interfaces) used across the FitTrack application. These structures define the "tables" and "columns" for the mock data system and state management.

---

## 👤 User Module
*Location: `src/context/AuthContext.tsx`*

### Table: `User`
| Column | Type | Description |
| :--- | :--- | :--- |
| `id` | `string` | Unique identifier |
| `firstName` | `string` | User's first name |
| `lastName` | `string` | User's last name |
| `email` | `string` | User's email address |
| `goal` | `string?` | User's primary goal (e.g., 'lose_weight') |
| `fitnessLevel`| `string?` | Experience level (e.g., 'beginner') |
| `gamification` | `object` | Embedded gamification summary |
| `├ currentLevel` | `number` | User's level |
| `├ currentStreak`| `number` | Current day streak |
| `└ xp` | `number` | Total XP points |

---

## 🏋️ Fitness Module
*Location: `src/types/fitness.ts`*

### Table: `Exercise`
| Column | Type | Description |
| :--- | :--- | :--- |
| `id` | `string` | Unique identifier |
| `name` | `{ en, fr }` | Bilingual exercise name |
| `category` | `string` | Body part / Muscle group |
| `equipment` | `string[]` | List of required equipment |
| `difficulty` | `'Beginner' \| 'Intermediate' \| 'Advanced'` | Difficulty level |
| `muscles` | `Muscle[]` | List of target muscles |
| `instructions` | `{ en: string[], fr: string[] }` | Bilingual step-by-step guides |
| `mediaUrl` | `string?` | URL to demo video/image |
| `lastPerformed`| `string?` | ISO Date of last performance |

### Table: `SetLog`
| Column | Type | Description |
| :--- | :--- | :--- |
| `id` | `string` | Unique identifier |
| `weight` | `number` | Weight used in kg |
| `reps` | `number` | Repetitions performed |
| `isCompleted` | `boolean` | Completion status |
| `timestamp` | `string` | ISO Date/Time |
| `previousWeight`| `number?` | Weight from last session (for PR tracking) |
| `previousReps` | `number?` | Reps from last session |

### Table: `WorkoutSession`
| Column | Type | Description |
| :--- | :--- | :--- |
| `id` | `string` | Unique identifier |
| `templateId` | `string?` | ID of the source template |
| `name` | `string` | Session name |
| `startTime` | `string` | ISO Date/Time |
| `endTime` | `string?` | ISO Date/Time |
| `duration` | `number` | Duration in seconds |
| `exercises` | `ExerciseInSession[]` | List of exercises with their sets |
| `totalVolume` | `number` | Total kg moved (weight * reps) |
| `xpEarned` | `number` | XP awarded for the session |

---

## 🏆 Gamification Module
*Location: `src/types/gamification.ts`*

### Table: `UserStats`
| Column | Type | Description |
| :--- | :--- | :--- |
| `xp` | `number` | Current XP |
| `level` | `number` | Current Level |
| `xpToNextLevel`| `number` | Target XP for next level |
| `streakDays` | `number` | Total active streak |
| `streakStatus` | `'active' \| 'at-risk' \| 'broken'` | Visual status of the streak |
| `achievements` | `Achievement[]` | List of unlocked trophies |

---

## 🥗 Nutrition Module
*Location: `src/types/nutrition.ts`*

### Table: `FoodItem`
| Column | Type | Description |
| :--- | :--- | :--- |
| `id` | `string` | Unique identifier |
| `name` | `{ en, fr }` | Bilingual food name |
| `calories` | `number` | kcal per serving |
| `protein` | `number` | grams of protein |
| `carbs` | `number` | grams of carbohydrates |
| `fats` | `number` | grams of fats |
| `servingSize` | `number` | Standard serving amount |
| `unit` | `'g' \| 'ml' \| 'piece'` | Measurement unit |

### Table: `MealEntry`
| Column | Type | Description |
| :--- | :--- | :--- |
| `id` | `string` | Unique identifier |
| `foodId` | `string` | ID of the linked FoodItem |
| `quantity` | `number` | Amount consumed |
| `macros` | `object` | Total macros for this entry |
| `type` | `MealType` | `'Breakfast' \| 'Lunch' \| 'Dinner' \| 'Snack'` |
| `timestamp` | `string` | ISO Date/Time |
