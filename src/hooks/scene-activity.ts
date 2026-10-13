import { createContext, useContext } from 'react';

/** Hover lives outside React state so pointer movement never re-renders the scene. */
export interface SceneActivityValue { hovered: () => string | null; hover: (id: string, on: boolean) => void }
export const SceneActivity = createContext<SceneActivityValue | null>(null);
export function useSceneActivity() {
  const value = useContext(SceneActivity);
  if (!value) throw new Error('SceneActivity missing');
  return value;
}
