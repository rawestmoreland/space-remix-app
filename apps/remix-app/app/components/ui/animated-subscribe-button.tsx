'use client';

import React, { useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';

interface AnimatedSubscribeButtonProps {
  type?: 'button' | 'submit' | 'reset';
  buttonColor: string;
  buttonTextColor?: string;
  subscribeStatus: boolean;
  initialText: React.ReactElement | string;
  changeText: React.ReactElement | string;
}

export const AnimatedSubscribeButton: React.FC<
  AnimatedSubscribeButtonProps
> = ({
  type = 'button',
  buttonColor,
  subscribeStatus,
  buttonTextColor,
  changeText,
  initialText,
}) => {
  const [isSubscribed, setIsSubscribed] = useState<boolean>(subscribeStatus);

  return (
    <AnimatePresence mode='wait'>
      {isSubscribed ? (
        <motion.button
          className='relative h-9 flex w-full md:w-auto items-center justify-center overflow-hidden rounded-md bg-white p-[10px] outline outline-1 outline-black'
          onClick={() => setIsSubscribed(false)}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          type={type}
        >
          <motion.span
            key='action'
            className='relative block h-full w-full font-semibold'
            initial={{ y: -50 }}
            animate={{ y: 0 }}
            style={{ color: buttonColor }}
          >
            {changeText}
          </motion.span>
        </motion.button>
      ) : (
        <motion.button
          className='relative h-9 flex w-full md:w-auto cursor-pointer items-center justify-center rounded-md border-none p-[10px]'
          style={{ backgroundColor: buttonColor, color: buttonTextColor }}
          onClick={() => setIsSubscribed(true)}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
        >
          <motion.span
            key='reaction'
            className='relative block font-semibold'
            initial={{ x: 0 }}
            exit={{ x: 50, transition: { duration: 0.1 } }}
          >
            {initialText}
          </motion.span>
        </motion.button>
      )}
    </AnimatePresence>
  );
};
