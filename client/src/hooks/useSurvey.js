import { useState, useCallback } from 'react';
import { SURVEY_SCREENS } from '../data/surveyQuestions';

export function useSurvey() {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [answers, setAnswers] = useState({});

  const currentScreen = SURVEY_SCREENS[currentIndex];
  const isFirst = currentIndex === 0;
  const isLast  = currentIndex === SURVEY_SCREENS.length - 1;

  const canAdvance = useCallback(() => {
    const s = currentScreen;
    if (s.type === 'welcome') return true;
    if (s.type === 'result')  return false;
    if (!s.required)          return true;
    return answers[s.key] !== undefined;
  }, [currentScreen, answers]);

  const setAnswer = useCallback((key, value) => {
    setAnswers(prev => ({ ...prev, [key]: value }));
  }, []);

  const advance = useCallback(() => {
    if (currentIndex < SURVEY_SCREENS.length - 1) {
      setCurrentIndex(i => i + 1);
    }
  }, [currentIndex]);

  const goBack = useCallback(() => {
    if (currentIndex > 0) {
      setCurrentIndex(i => i - 1);
    }
  }, [currentIndex]);

  const skip = useCallback(() => {
    if (!currentScreen.required) advance();
  }, [currentScreen, advance]);

  const questionScreens = SURVEY_SCREENS.filter(s => s.type !== 'welcome' && s.type !== 'result');
  const questionIndex   = questionScreens.findIndex(s => s.id === currentScreen.id);
  const totalQuestions  = questionScreens.length;

  return {
    currentScreen,
    currentIndex,
    answers,
    canAdvance,
    setAnswer,
    advance,
    goBack,
    skip,
    isFirst,
    isLast,
    questionIndex,
    totalQuestions,
  };
}
