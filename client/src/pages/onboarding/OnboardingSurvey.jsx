import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { auth } from '../../firebase-config';
import { useSurvey } from '../../hooks/useSurvey';
import { buildSurveyPayload } from '../../utils/firebasePayload';
import { writeBaselineLiteracy } from '../../firebase/literacyService';
import SurveyShell from '../../components/onboarding/SurveyShell';
import WelcomeScreen from '../../components/onboarding/WelcomeScreen';
import ChoiceQuestion from '../../components/onboarding/ChoiceQuestion';
import ConfidenceQuestion from '../../components/onboarding/ConfidenceQuestion';
import KnowledgeQuestion from '../../components/onboarding/KnowledgeQuestion';
import SurveyResult from './SurveyResult';

export default function OnboardingSurvey() {
  const navigate = useNavigate();
  const survey = useSurvey();
  const [submitting, setSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState(null);

  async function handleSubmit() {
    const user = auth.currentUser;
    if (!user) {
      navigate('/');
      return;
    }
    setSubmitting(true);
    setSubmitError(null);
    try {
      const payload = buildSurveyPayload(survey.answers);
      await writeBaselineLiteracy(user.uid, payload);
      navigate('/dashboard');
    } catch (err) {
      console.error('Survey submission failed:', err);
      setSubmitError('Something went wrong saving your profile. Please try again.');
      setSubmitting(false);
    }
  }

  const s = survey.currentScreen;

  return (
    <SurveyShell
      questionIndex={survey.questionIndex}
      totalQuestions={survey.totalQuestions}
    >
      {s.type === 'welcome' && (
        <WelcomeScreen onBegin={survey.advance} />
      )}

      {s.type === 'choice' && (
        <ChoiceQuestion
          screen={s}
          selectedValue={survey.answers[s.key]}
          onSelect={(val) => {
            survey.setAnswer(s.key, val);
            setTimeout(survey.advance, 300);
          }}
          onBack={survey.goBack}
          canAdvance={survey.canAdvance()}
          onAdvance={survey.advance}
        />
      )}

      {s.type === 'confidence' && (
        <ConfidenceQuestion
          screen={s}
          selectedValue={survey.answers[s.key]}
          onSelect={(val) => {
            survey.setAnswer(s.key, val);
            setTimeout(survey.advance, 300);
          }}
          onBack={survey.goBack}
        />
      )}

      {s.type === 'knowledge' && (
        <KnowledgeQuestion
          screen={s}
          selectedValue={survey.answers[s.key]}
          onSelect={(val) => survey.setAnswer(s.key, val)}
          onBack={survey.goBack}
          canAdvance={survey.canAdvance()}
          onAdvance={survey.advance}
          onSkip={survey.skip}
        />
      )}

      {s.type === 'result' && (
        <SurveyResult
          answers={survey.answers}
          onSubmit={handleSubmit}
          submitting={submitting}
          submitError={submitError}
        />
      )}
    </SurveyShell>
  );
}
