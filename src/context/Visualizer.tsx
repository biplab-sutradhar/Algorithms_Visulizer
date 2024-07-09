'use client';

import { AnimationArrayType, SortingAlgorithmType } from '@/lib/types';
import {
  MAX_ANIMATION_SPEED,
  generateRandomNumberFromInterval,
} from '@/lib/utils';
import React, {
  ReactNode,
  createContext,
  useContext,
  useEffect,
  useState,
  useCallback,
} from 'react';

interface SortingAlgorithmContextType {
  arrayToSort: number[];
  selectedAlgorithm: SortingAlgorithmType;
  isSorting: boolean;
  setSelectedAlgorithm: (algorithm: SortingAlgorithmType) => void;
  setIsSorting: (isSorting: boolean) => void;
  animationSpeed: number;
  setAnimationSpeed: (speed: number) => void;
  barCount: number;
  setBarCount: (count: number) => void;
  resetArrayAndAnimation: () => void;
  runAnimation: (animations: AnimationArrayType) => void;
  isAnimationComplete: boolean;
  requiresReset: boolean;
}

const SortingAlgorithmContext = createContext<SortingAlgorithmContextType | undefined>(undefined);

export const SortingAlgorithmProvider = ({ children }: { children: ReactNode }) => {
  const [arrayToSort, setArrayToSort] = useState<number[]>([]);
  const [selectedAlgorithm, setSelectedAlgorithm] = useState<SortingAlgorithmType>('bubble');
  const [isSorting, setIsSorting] = useState<boolean>(false);
  const [isAnimationComplete, setIsAnimationComplete] = useState<boolean>(false);
  const [animationSpeed, setAnimationSpeed] = useState<number>(MAX_ANIMATION_SPEED);
  const [barCount, setBarCount] = useState<number>(50); // Default bar count
  const requiresReset = isAnimationComplete || isSorting;

  const resetArrayAndAnimation = useCallback(() => {
    const tempArray: number[] = [];
    const containerHeight = window.innerHeight;
    const maxLineHeight = Math.max(containerHeight - 320, 100);

    for (let i = 0; i < barCount; i++) {
      tempArray.push(generateRandomNumberFromInterval(35, maxLineHeight));
    }

    setArrayToSort(tempArray);
    setIsSorting(false);
    setIsAnimationComplete(false);

    // Clear all existing intervals and timeouts
    let highestId = window.setTimeout(() => {});
    while (highestId--) {
      window.clearTimeout(highestId);
    }

    setTimeout(() => {
      const arrLines = document.getElementsByClassName('array-line');
      for (let i = 0; i < arrLines.length; i++) {
        arrLines[i].classList.remove('change-line-color');
        arrLines[i].classList.add('default-line-color');
      }
    }, 0);
  }, [barCount]);

  const debounce = (func: Function, wait: number) => {
    let timeout: NodeJS.Timeout;
    return (...args: any[]) => {
      clearTimeout(timeout);
      timeout = setTimeout(() => func(...args), wait);
    };
  };

  useEffect(() => {
    resetArrayAndAnimation();
    const debouncedReset = debounce(resetArrayAndAnimation, 100);
    window.addEventListener('resize', debouncedReset);

    return () => {
      window.removeEventListener('resize', debouncedReset);
    };
  }, [resetArrayAndAnimation]);

  const updateClassList = useCallback((indexes: number[], addClassName: string, removeClassName: string) => {
    const arrLines = document.getElementsByClassName('array-line') as HTMLCollectionOf<HTMLElement>;
    indexes.forEach((index) => {
      arrLines[index].classList.add(addClassName);
      arrLines[index].classList.remove(removeClassName);
    });
  }, []);

  const updateHeightValue = useCallback((lineIndex: number, newHeight: number | undefined) => {
    const arrLines = document.getElementsByClassName('array-line') as HTMLCollectionOf<HTMLElement>;
    arrLines[lineIndex].style.height = `${newHeight}px`;
  }, []);

  const runAnimation = useCallback((animations: AnimationArrayType) => {
    setIsSorting(true);

    const inverseSpeed = (1 / animationSpeed) * 200;
    const arrLines = document.getElementsByClassName('array-line') as HTMLCollectionOf<HTMLElement>;

    animations.forEach((animation, index) => {
      setTimeout(() => {
        const [lineIndexes, isSwap] = animation;
        if (!isSwap) {
          updateClassList(lineIndexes, 'change-line-color', 'default-line-color');
          setTimeout(() => {
            updateClassList(lineIndexes, 'default-line-color', 'change-line-color');
          }, inverseSpeed);
        } else {
          const [lineIndex, newHeight] = lineIndexes;
          updateHeightValue(lineIndex, newHeight);
        }
      }, index * inverseSpeed);
    });

    setTimeout(() => {
      setIsSorting(false);
      setIsAnimationComplete(true);
    }, animations.length * inverseSpeed);
  }, [animationSpeed, updateClassList, updateHeightValue]);

  const value = {
    arrayToSort,
    selectedAlgorithm,
    setSelectedAlgorithm,
    isSorting,
    setIsSorting,
    animationSpeed,
    setAnimationSpeed,
    barCount,
    setBarCount,
    isAnimationComplete,
    resetArrayAndAnimation,
    runAnimation,
    requiresReset,
  };

  return (
    <SortingAlgorithmContext.Provider value={value}>
      {children}
    </SortingAlgorithmContext.Provider>
  );
};

export const useSortingAlgorithmContext = (): SortingAlgorithmContextType => {
  const context = useContext(SortingAlgorithmContext);
  if (context === undefined) {
    throw new Error('useSortingAlgorithmContext must be used within a SortingAlgorithmProvider');
  }
  return context;
};
