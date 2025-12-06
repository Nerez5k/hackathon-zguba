"use client";

import { forwardRef, InputHTMLAttributes } from "react";

interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  label: string;
  error?: string;
  helperText?: string;
}

const Input = forwardRef<HTMLInputElement, InputProps>(
  ({ label, error, helperText, id, className = "", ...props }, ref) => {
    const inputId = id || `input-${label.toLowerCase().replace(/\s+/g, "-")}`;
    const errorId = `${inputId}-error`;
    const helperId = `${inputId}-helper`;

    return (
      <div className="w-full">
        <label
          htmlFor={inputId}
          className="block text-sm font-semibold text-gov-text mb-1.5"
        >
          {label}
          {props.required && (
            <span className="text-gov-error ml-1" aria-hidden="true">
              *
            </span>
          )}
        </label>
        <input
          ref={ref}
          id={inputId}
          className={`
            w-full px-4 py-2.5 rounded-lg border-2 transition-all duration-200
            bg-gov-surface text-gov-text
            placeholder:text-gov-text-light
            focus:outline-none focus:border-gov-primary focus:ring-2 focus:ring-gov-primary/20
            disabled:bg-gray-100 disabled:cursor-not-allowed
            ${error ? "border-gov-error focus:border-gov-error focus:ring-gov-error/20" : "border-gov-border"}
            ${className}
          `}
          aria-invalid={error ? "true" : "false"}
          aria-describedby={
            error ? errorId : helperText ? helperId : undefined
          }
          {...props}
        />
        {error && (
          <p id={errorId} className="mt-1.5 text-sm text-gov-error" role="alert">
            {error}
          </p>
        )}
        {helperText && !error && (
          <p id={helperId} className="mt-1.5 text-sm text-gov-text-light">
            {helperText}
          </p>
        )}
      </div>
    );
  }
);

Input.displayName = "Input";

export default Input;

