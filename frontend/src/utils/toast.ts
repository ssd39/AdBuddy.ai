import React from 'react';
import toast from 'react-hot-toast';

// Define our own ToastOptions interface
interface ToastOptions {
  duration?: number;
  position?: 'top-left' | 'top-center' | 'top-right' | 'bottom-left' | 'bottom-center' | 'bottom-right';
  style?: React.CSSProperties;
  className?: string;
  iconTheme?: {
    primary: string;
    secondary: string;
  };
  icon?: React.ReactNode;
}

// Default toast options
const defaultOptions: ToastOptions = {
  duration: 4000,
  position: 'bottom-right',
};

// Custom toast styles for different types
const successStyle: ToastOptions = {
  ...defaultOptions,
  style: {
    background: '#EDF7ED',
    color: '#1E4620',
    borderLeft: '4px solid #4CAF50',
  },
  className: 'dark:bg-gray-800 dark:text-green-200 dark:border-green-500',
  iconTheme: {
    primary: '#4CAF50',
    secondary: '#FFFFFF',
  },
};

const errorStyle: ToastOptions = {
  ...defaultOptions,
  duration: 5000,
  style: {
    background: '#FDEDED',
    color: '#5F2120',
    borderLeft: '4px solid #EF5350',
  },
  className: 'dark:bg-gray-800 dark:text-red-200 dark:border-red-500',
  iconTheme: {
    primary: '#EF5350',
    secondary: '#FFFFFF',
  },
};

const warningStyle: ToastOptions = {
  ...defaultOptions,
  style: {
    background: '#FFF4E5',
    color: '#663C00',
    borderLeft: '4px solid #FF9800',
  },
  className: 'dark:bg-gray-800 dark:text-amber-200 dark:border-amber-500',
  iconTheme: {
    primary: '#FF9800',
    secondary: '#FFFFFF',
  },
};

const infoStyle: ToastOptions = {
  ...defaultOptions,
  style: {
    background: '#E5F6FD',
    color: '#014361',
    borderLeft: '4px solid #03A9F4',
  },
  className: 'dark:bg-gray-800 dark:text-blue-200 dark:border-blue-500',
  iconTheme: {
    primary: '#03A9F4',
    secondary: '#FFFFFF',
  },
};

// Toast utilities
const toastUtils = {
  success: (message: string, options?: ToastOptions) => {
    return toast.success(message, { ...successStyle, ...options });
  },
  
  error: (message: string, options?: ToastOptions) => {
    return toast.error(message, { ...errorStyle, ...options });
  },
  
  warning: (message: string, options?: ToastOptions) => {
    return toast(message, { ...warningStyle, icon: '⚠️', ...options });
  },
  
  info: (message: string, options?: ToastOptions) => {
    return toast(message, { ...infoStyle, icon: 'ℹ️', ...options });
  },
  
  promise: <T>(
    promise: Promise<T>,
    {
      loading = 'Loading...',
      success = 'Success!',
      error = 'Something went wrong',
    },
    options?: ToastOptions
  ) => {
    return toast.promise(
      promise,
      { loading, success, error },
      options
    );
  },
  
  dismiss: (toastId?: string) => {
    if (toastId) {
      toast.dismiss(toastId);
    } else {
      toast.dismiss();
    }
  },
};

export default toastUtils;