import React, { useState, createContext, useContext } from 'react';
import { X } from 'lucide-react';

interface DialogContextType {
  isOpen: boolean;
  setIsOpen: (open: boolean) => void;
}

const DialogContext = createContext<DialogContextType>({
  isOpen: false,
  setIsOpen: () => {}
});

interface DialogProps {
  open?: boolean;
  onOpenChange?: (open: boolean) => void;
  children: React.ReactNode;
}

export const Dialog: React.FC<DialogProps> = ({ open, onOpenChange, children }) => {
  const [internalOpen, setInternalOpen] = useState(false);
  
  const isOpen = open !== undefined ? open : internalOpen;
  const setIsOpen = onOpenChange || setInternalOpen;

  // Filter children to separate triggers from content
  const childrenArray = React.Children.toArray(children);
  const triggers = childrenArray.filter(child => 
    React.isValidElement(child) && child.type === DialogTrigger
  );
  const content = childrenArray.filter(child => 
    React.isValidElement(child) && child.type === DialogContent
  );

  return (
    <DialogContext.Provider value={{ isOpen, setIsOpen }}>
      {/* Always render triggers */}
      {triggers}
      {/* Only render modal overlay and content when open */}
      {isOpen && (
        <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4">
          <div 
            className="fixed inset-0 bg-black/50 backdrop-blur-sm z-[9998]"
            onClick={() => setIsOpen(false)}
          />
          <div className="relative z-[10000] w-full max-w-2xl mx-auto flex justify-center">
            {content}
          </div>
        </div>
      )}
    </DialogContext.Provider>
  );
};

interface DialogTriggerProps {
  asChild?: boolean;
  children: React.ReactNode;
}

export const DialogTrigger: React.FC<DialogTriggerProps> = ({ children }) => {
  const { setIsOpen } = useContext(DialogContext);
  
  return (
    <div onClick={() => setIsOpen(true)}>
      {children}
    </div>
  );
};

interface DialogContentProps {
  className?: string;
  children: React.ReactNode;
}

export const DialogContent: React.FC<DialogContentProps> = ({ className = '', children }) => {
  const { isOpen, setIsOpen } = useContext(DialogContext);
  
  if (!isOpen) return null;
  
  return (
    <div className={`bg-white rounded-lg shadow-xl border border-gray-200 dark:bg-gray-800 dark:border-gray-700 p-6 ${className}`}>
      <div className="relative">
        <button
          onClick={() => setIsOpen(false)}
          className="absolute right-2 top-2 p-1 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 z-10"
        >
          <X className="h-4 w-4" />
        </button>
        {children}
      </div>
    </div>
  );
};

interface DialogHeaderProps {
  children: React.ReactNode;
}

export const DialogHeader: React.FC<DialogHeaderProps> = ({ children }) => {
  return (
    <div className="-mx-6 -mt-6 px-6 py-4 border-b border-gray-200 dark:border-gray-700 mb-6">
      {children}
    </div>
  );
};

interface DialogTitleProps {
  children: React.ReactNode;
}

export const DialogTitle: React.FC<DialogTitleProps> = ({ children }) => {
  return (
    <h2 className="text-lg font-semibold text-gray-900 dark:text-white pr-8">
      {children}
    </h2>
  );
};

interface DialogFooterProps {
  children: React.ReactNode;
}

export const DialogFooter: React.FC<DialogFooterProps> = ({ children }) => {
  return (
    <div className="-mx-6 -mb-6 px-6 py-4 border-t border-gray-200 dark:border-gray-700 mt-6 flex items-center justify-end gap-2">
      {children}
    </div>
  );
};
