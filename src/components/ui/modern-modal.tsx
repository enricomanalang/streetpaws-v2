'use client';

import React, { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { AlertCircle, CheckCircle, Info, XCircle, AlertTriangle } from 'lucide-react';

interface ModalState {
  isOpen: boolean;
  type: 'alert' | 'confirm' | 'prompt' | 'success' | 'error' | 'warning' | 'info';
  title: string;
  message: string;
  defaultValue?: string;
  placeholder?: string;
  confirmText?: string;
  cancelText?: string;
  onConfirm?: (value?: string) => void;
  onCancel?: () => void;
}

const useModernModal = () => {
  const [modalState, setModalState] = useState<ModalState>({
    isOpen: false,
    type: 'alert',
    title: '',
    message: '',
    confirmText: 'OK',
    cancelText: 'Cancel'
  });

  const [inputValue, setInputValue] = useState('');

  const showModal = (config: Omit<ModalState, 'isOpen'>) => {
    setModalState({
      ...config,
      isOpen: true
    });
    setInputValue(config.defaultValue || '');
  };

  const hideModal = () => {
    setModalState(prev => ({ ...prev, isOpen: false }));
    setInputValue('');
  };

  const handleConfirm = () => {
    if (modalState.onConfirm) {
      modalState.onConfirm(modalState.type === 'prompt' ? inputValue : undefined);
    }
    hideModal();
  };

  const handleCancel = () => {
    if (modalState.onCancel) {
      modalState.onCancel();
    }
    hideModal();
  };

  // Modern replacements for browser dialogs
  const alert = (message: string, title: string = 'Alert') => {
    return new Promise<void>((resolve) => {
      showModal({
        type: 'alert',
        title,
        message,
        onConfirm: () => resolve(),
        confirmText: 'OK'
      });
    });
  };

  const confirm = (message: string, title: string = 'Confirm') => {
    return new Promise<boolean>((resolve) => {
      showModal({
        type: 'confirm',
        title,
        message,
        onConfirm: () => resolve(true),
        onCancel: () => resolve(false),
        confirmText: 'Yes',
        cancelText: 'No'
      });
    });
  };

  const prompt = (message: string, defaultValue: string = '', title: string = 'Input Required') => {
    return new Promise<string | null>((resolve) => {
      showModal({
        type: 'prompt',
        title,
        message,
        defaultValue,
        placeholder: 'Enter your response...',
        onConfirm: (value) => resolve(value || null),
        onCancel: () => resolve(null),
        confirmText: 'Submit',
        cancelText: 'Cancel'
      });
    });
  };

  const success = (message: string, title: string = 'Success') => {
    return new Promise<void>((resolve) => {
      showModal({
        type: 'success',
        title,
        message,
        onConfirm: () => resolve(),
        confirmText: 'OK'
      });
      
      // Auto-resolve after 3 seconds to prevent hanging
      setTimeout(() => {
        resolve();
      }, 3000);
    });
  };

  const error = (message: string, title: string = 'Error') => {
    return new Promise<void>((resolve) => {
      showModal({
        type: 'error',
        title,
        message,
        onConfirm: () => resolve(),
        confirmText: 'OK'
      });
      
      // Auto-resolve after 5 seconds to prevent hanging
      setTimeout(() => {
        resolve();
      }, 5000);
    });
  };

  const warning = (message: string, title: string = 'Warning') => {
    return new Promise<void>((resolve) => {
      showModal({
        type: 'warning',
        title,
        message,
        onConfirm: () => resolve(),
        confirmText: 'OK'
      });
    });
  };

  const info = (message: string, title: string = 'Information') => {
    return new Promise<void>((resolve) => {
      showModal({
        type: 'info',
        title,
        message,
        onConfirm: () => resolve(),
        confirmText: 'OK'
      });
    });
  };

  const getIcon = () => {
    switch (modalState.type) {
      case 'success':
        return <CheckCircle className="w-6 h-6 text-green-600" />;
      case 'error':
        return <XCircle className="w-6 h-6 text-red-600" />;
      case 'warning':
        return <AlertTriangle className="w-6 h-6 text-orange-600" />;
      case 'info':
        return <Info className="w-6 h-6 text-blue-600" />;
      case 'confirm':
        return <AlertCircle className="w-6 h-6 text-yellow-600" />;
      default:
        return <Info className="w-6 h-6 text-gray-600" />;
    }
  };

  const getButtonColors = () => {
    switch (modalState.type) {
      case 'success':
        return 'bg-green-600 hover:bg-green-700 text-white';
      case 'error':
        return 'bg-red-600 hover:bg-red-700 text-white';
      case 'warning':
        return 'bg-orange-600 hover:bg-orange-700 text-white';
      case 'confirm':
        return 'bg-blue-600 hover:bg-blue-700 text-white';
      default:
        return 'bg-gray-600 hover:bg-gray-700 text-white';
    }
  };

  const ModalComponent = () => (
    <Dialog open={modalState.isOpen} onOpenChange={hideModal}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-3">
            {getIcon()}
            {modalState.title}
          </DialogTitle>
        </DialogHeader>
        
        <div className="py-4">
          <p className="text-gray-700 leading-relaxed">{modalState.message}</p>
          
          {modalState.type === 'prompt' && (
            <div className="mt-4">
              <Textarea
                value={inputValue}
                onChange={(e) => setInputValue(e.target.value)}
                placeholder={modalState.placeholder}
                className="w-full"
                rows={3}
              />
            </div>
          )}
        </div>

        <DialogFooter className="flex gap-2">
          {modalState.type === 'confirm' || modalState.type === 'prompt' ? (
            <>
              <Button
                variant="outline"
                onClick={handleCancel}
                className="flex-1"
              >
                {modalState.cancelText}
              </Button>
              <Button
                onClick={handleConfirm}
                className={`flex-1 ${getButtonColors()}`}
              >
                {modalState.confirmText}
              </Button>
            </>
          ) : (
            <Button
              onClick={handleConfirm}
              className={`w-full ${getButtonColors()}`}
            >
              {modalState.confirmText}
            </Button>
          )}
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );

  return {
    ModalComponent,
    alert,
    confirm,
    prompt,
    success,
    error,
    warning,
    info
  };
};

export default useModernModal;
