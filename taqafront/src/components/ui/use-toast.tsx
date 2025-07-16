import { toast as sonnerToast } from 'sonner';

interface ToastOptions {
  title?: string;
  description?: string;
  variant?: 'default' | 'destructive';
  duration?: number;
}

export const toast = ({ 
  title, 
  description, 
  variant = 'default',
  duration = 3000 
}: ToastOptions) => {
  const style = variant === 'destructive' ? { style: { background: '#fee2e2', border: '1px solid #ef4444' } } : {};
  
  sonnerToast(title, {
    description,
    duration,
    ...style
  });
}; 