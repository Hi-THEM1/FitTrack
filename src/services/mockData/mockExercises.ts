import type { Exercise } from '../../types/fitness';

export const mockExercises: Exercise[] = [
  {
    id: '1',
    name: { en: 'Bench Press', fr: 'Développé couché' },
    category: 'Chest',
    difficulty: 'Intermediate',
    muscles: [
      { id: 'chest', name: { en: 'Chest', fr: 'Pectoraux' }, isPrimary: true },
      { id: 'triceps', name: { en: 'Triceps', fr: 'Triceps' }, isPrimary: false },
      { id: 'shoulders', name: { en: 'Shoulders', fr: 'Épaules' }, isPrimary: false }
    ],
    equipment: ['Barbell', 'Bench'],
    mediaUrl: 'https://images.unsplash.com/photo-1571019614242-c5c5dee9f50b?auto=format&fit=crop&q=80&w=800',
    instructions: {
      en: ['Keep feet flat', 'Retract shoulder blades', 'Lower to mid-chest', 'Drive through heels'],
      fr: ['Gardez les pieds plats', 'Rentrez les omoplates', 'Descendez au milieu des pectoraux', 'Poussez par les talons']
    }
  },
  {
    id: '2',
    name: { en: 'Barbell Squat', fr: 'Squat Barre' },
    category: 'Legs',
    difficulty: 'Intermediate',
    muscles: [
      { id: 'quads', name: { en: 'Quads', fr: 'Quadriceps' }, isPrimary: true },
      { id: 'glutes', name: { en: 'Glutes', fr: 'Fessiers' }, isPrimary: true },
      { id: 'hamstrings', name: { en: 'Hamstrings', fr: 'Ischios' }, isPrimary: false }
    ],
    equipment: ['Barbell', 'Rack'],
    mediaUrl: 'https://images.unsplash.com/photo-1534438327276-14e5300c3a48?auto=format&fit=crop&q=80&w=800',
    instructions: {
      en: ['Chest up', 'Drive through heels', 'Go below parallel if mobility allows'],
      fr: ['Poitrine sortie', 'Poussez sur les talons', 'Descendez sous la parallèle si possible']
    }
  },
  {
    id: '3',
    name: { en: 'Pull-up', fr: 'Traction' },
    category: 'Back',
    difficulty: 'Advanced',
    muscles: [
      { id: 'back', name: { en: 'Back', fr: 'Dos' }, isPrimary: true },
      { id: 'biceps', name: { en: 'Biceps', fr: 'Biceps' }, isPrimary: false }
    ],
    equipment: ['Pull-up Bar'],
    mediaUrl: 'https://images.unsplash.com/photo-1598971639058-aba3c72e9a72?auto=format&fit=crop&q=80&w=800',
    instructions: {
      en: ['Full extension at bottom', 'Pull chest to bar'],
      fr: ['Extension complète en bas', 'Tirez la poitrine vers la barre']
    }
  },
  {
    id: '4',
    name: { en: 'Overhead Press', fr: 'Développé Militaire' },
    category: 'Shoulders',
    difficulty: 'Intermediate',
    muscles: [
      { id: 'shoulders', name: { en: 'Shoulders', fr: 'Épaules' }, isPrimary: true },
      { id: 'triceps', name: { en: 'Triceps', fr: 'Triceps' }, isPrimary: false }
    ],
    equipment: ['Barbell'],
    mediaUrl: 'https://images.unsplash.com/photo-1541534741688-6078c64b5554?auto=format&fit=crop&q=80&w=800',
    instructions: {
      en: ['Core tight', 'Don\'t overextend lower back'],
      fr: ['Gainez', 'Ne cambrez pas trop le bas du dos']
    }
  },
  {
    id: '5',
    name: { en: 'Dumbbell Curl', fr: 'Curl Biceps Haltères' },
    category: 'Arms',
    difficulty: 'Beginner',
    muscles: [
      { id: 'biceps', name: { en: 'Biceps', fr: 'Biceps' }, isPrimary: true }
    ],
    equipment: ['Dumbbells'],
    mediaUrl: 'https://images.unsplash.com/photo-1581009146145-b5ef03a726ec?auto=format&fit=crop&q=80&w=800',
    instructions: {
      en: ['Keep elbows pinned', 'Squeeze at the top'],
      fr: ['Coudes collés au corps', 'Contractez en haut']
    }
  }
];
