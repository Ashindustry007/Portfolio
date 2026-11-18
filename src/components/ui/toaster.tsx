"use client"

import { useToast } from "@/hooks/use-toast"
import {
  Toast,
  ToastClose,
  ToastDescription,
  ToastProvider,
  ToastTitle,
  ToastViewport,
} from "@/components/ui/toast"

export function Toaster() {
  const { toasts } = useToast()

  return (
    <ToastProvider>
      {toasts.map(function ({ id, title, description, action, ...props }) {
        return (
          <Toast key={id} duration={3800} {...props} className="rounded-none border-primary/40 bg-background/95 p-4 pr-8 backdrop-blur">
            <div className="grid gap-1">
              {title && <ToastTitle className="font-mono text-[0.6875rem] font-medium uppercase tracking-[0.2em] text-primary">{title}</ToastTitle>}
              {description && (
                <ToastDescription>{description}</ToastDescription>
              )}
            </div>
            {action}
            <ToastClose />
          </Toast>
        )
      })}
      <ToastViewport className="bottom-0 top-auto flex-col p-3 sm:right-0 md:max-w-[22rem]" />
    </ToastProvider>
  )
}
