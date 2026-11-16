import { useFocusEffect } from 'expo-router';
import { useCallback, useState } from 'react';
import { loadProgress, type Progress } from '@/storage/progress';

/** Loads saved progress whenever the screen gains focus. */
export function useProgress() {
  const [progress, setProgress] = useState<Progress>({});

  useFocusEffect(
    useCallback(() => {
      let active = true;
      loadProgress().then((value) => {
        if (active) setProgress(value);
      });
      return () => {
        active = false;
      };
    }, []),
  );

  return progress;
}
