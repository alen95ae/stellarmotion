'use client';

import React, { useCallback, useState } from 'react';
import { Send, Paperclip } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

export interface ChatInputProps {
  onSend: (content: string) => void;
  placeholder?: string;
  disabled?: boolean;
  className?: string;
}

export function ChatInput({
  onSend,
  placeholder = 'Escribe un mensaje...',
  disabled = false,
  className,
}: ChatInputProps) {
  const [value, setValue] = useState('');

  const handleSubmit = useCallback(() => {
    const trimmed = value.trim();
    if (!trimmed || disabled) return;
    onSend(trimmed);
    setValue('');
  }, [value, disabled, onSend]);

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSubmit();
    }
  };

  return (
    <div
      className={cn(
        'shrink-0 flex items-end gap-2 p-3 border-t border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-950',
        className
      )}
    >
      <Button
        variant="ghost"
        size="icon"
        className="shrink-0 h-9 w-9 text-muted-foreground"
        title="Adjuntar (próximamente)"
        disabled
      >
        <Paperclip className="h-4 w-4" />
      </Button>
      <textarea
        value={value}
        onChange={(e) => setValue(e.target.value)}
        onKeyDown={handleKeyDown}
        placeholder={placeholder}
        disabled={disabled}
        rows={1}
        className={cn(
          'flex-1 min-h-[40px] max-h-32 resize-none rounded-md border border-gray-200 dark:border-gray-700',
          'bg-white dark:bg-gray-900 px-3 py-2 text-sm outline-none',
          'focus:ring-2 focus:ring-[#e94446]/20 focus:border-[#e94446]',
          'placeholder:text-muted-foreground disabled:opacity-50'
        )}
      />
      <Button
        type="button"
        variant="brand"
        size="icon"
        onClick={handleSubmit}
        disabled={disabled || !value.trim()}
        className="shrink-0 h-9 w-9 bg-[#e94446] hover:bg-[#d63a3a]"
        title="Enviar"
      >
        <Send className="h-4 w-4" />
      </Button>
    </div>
  );
}
