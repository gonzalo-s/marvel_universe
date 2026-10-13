'use client';
import { createContext, useContext } from 'react';
import { sceneSettings } from '@/types/scene-settings';
export const SceneSettingsContext = createContext(sceneSettings);
export const useSceneSettings = () => useContext(SceneSettingsContext);
