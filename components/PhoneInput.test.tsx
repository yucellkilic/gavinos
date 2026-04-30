import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import '@testing-library/jest-dom';
import PhoneInput, { validatePhoneNumber } from './PhoneInput';

describe('PhoneInput Component', () => {
  const mockOnChange = jest.fn();
  const mockOnBlur = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('Rendering', () => {
    it('should render with label and input field', () => {
      render(
        <PhoneInput
          value=""
          onChange={mockOnChange}
          onBlur={mockOnBlur}
        />
      );

      expect(screen.getByLabelText('Phone Number')).toBeInTheDocument();
      expect(screen.getByPlaceholderText('(555) 123-4567')).toBeInTheDocument();
    });

    it('should display the provided value', () => {
      render(
        <PhoneInput
          value="(555) 123-4567"
          onChange={mockOnChange}
          onBlur={mockOnBlur}
        />
      );

      const input = screen.getByLabelText('Phone Number') as HTMLInputElement;
      expect(input.value).toBe('(555) 123-4567');
    });

    it('should not display error message when error prop is undefined', () => {
      render(
        <PhoneInput
          value=""
          onChange={mockOnChange}
          onBlur={mockOnBlur}
        />
      );

      expect(screen.queryByRole('alert')).not.toBeInTheDocument();
    });

    it('should display error message when error prop is provided', async () => {
      render(
        <PhoneInput
          value=""
          onChange={mockOnChange}
          onBlur={mockOnBlur}
          error="Please enter a valid phone number"
        />
      );

      await waitFor(() => {
        expect(screen.getByRole('alert')).toBeInTheDocument();
        expect(screen.getByText('Please enter a valid phone number')).toBeInTheDocument();
      });
    });
  });

  describe('Phone Number Formatting', () => {
    it('should format US phone number as (XXX) XXX-XXXX', () => {
      render(
        <PhoneInput
          value=""
          onChange={mockOnChange}
          onBlur={mockOnBlur}
        />
      );

      const input = screen.getByLabelText('Phone Number') as HTMLInputElement;
      
      fireEvent.change(input, { target: { value: '5551234567' } });
      
      expect(mockOnChange).toHaveBeenCalledWith('(555) 123-4567');
    });

    it('should format partial phone number correctly', () => {
      render(
        <PhoneInput
          value=""
          onChange={mockOnChange}
          onBlur={mockOnBlur}
        />
      );

      const input = screen.getByLabelText('Phone Number') as HTMLInputElement;
      
      // Type first 3 digits
      fireEvent.change(input, { target: { value: '555' } });
      expect(mockOnChange).toHaveBeenCalledWith('555');
      
      // Type 6 digits
      fireEvent.change(input, { target: { value: '555123' } });
      expect(mockOnChange).toHaveBeenCalledWith('(555) 123');
    });

    it('should format international phone number with country code', () => {
      render(
        <PhoneInput
          value=""
          onChange={mockOnChange}
          onBlur={mockOnBlur}
        />
      );

      const input = screen.getByLabelText('Phone Number') as HTMLInputElement;
      
      fireEvent.change(input, { target: { value: '+15551234567' } });
      
      expect(mockOnChange).toHaveBeenCalledWith('+1 555 123 4567');
    });

    it('should handle user typing with formatting characters', () => {
      render(
        <PhoneInput
          value=""
          onChange={mockOnChange}
          onBlur={mockOnBlur}
        />
      );

      const input = screen.getByLabelText('Phone Number') as HTMLInputElement;
      
      // User types with parentheses and dashes
      fireEvent.change(input, { target: { value: '(555) 123-4567' } });
      
      expect(mockOnChange).toHaveBeenCalledWith('(555) 123-4567');
    });
  });

  describe('User Interactions', () => {
    it('should call onChange when input value changes', () => {
      render(
        <PhoneInput
          value=""
          onChange={mockOnChange}
          onBlur={mockOnBlur}
        />
      );

      const input = screen.getByLabelText('Phone Number');
      fireEvent.change(input, { target: { value: '555' } });

      expect(mockOnChange).toHaveBeenCalled();
    });

    it('should call onBlur when input loses focus', () => {
      render(
        <PhoneInput
          value=""
          onChange={mockOnChange}
          onBlur={mockOnBlur}
        />
      );

      const input = screen.getByLabelText('Phone Number');
      fireEvent.blur(input);

      expect(mockOnBlur).toHaveBeenCalled();
    });
  });

  describe('Accessibility', () => {
    it('should have proper ARIA attributes when no error', () => {
      render(
        <PhoneInput
          value=""
          onChange={mockOnChange}
          onBlur={mockOnBlur}
        />
      );

      const input = screen.getByLabelText('Phone Number');
      expect(input).toHaveAttribute('aria-invalid', 'false');
      expect(input).not.toHaveAttribute('aria-describedby');
    });

    it('should have proper ARIA attributes when error is present', () => {
      render(
        <PhoneInput
          value=""
          onChange={mockOnChange}
          onBlur={mockOnBlur}
          error="Invalid phone number"
        />
      );

      const input = screen.getByLabelText('Phone Number');
      expect(input).toHaveAttribute('aria-invalid', 'true');
      expect(input).toHaveAttribute('aria-describedby', 'phone-error');
    });

    it('should have minimum touch target size (44px)', () => {
      render(
        <PhoneInput
          value=""
          onChange={mockOnChange}
          onBlur={mockOnBlur}
        />
      );

      const input = screen.getByLabelText('Phone Number');
      expect(input).toHaveClass('min-h-[44px]');
    });
  });

  describe('Styling', () => {
    it('should apply error styling when error is present', () => {
      render(
        <PhoneInput
          value=""
          onChange={mockOnChange}
          onBlur={mockOnBlur}
          error="Invalid phone number"
        />
      );

      const input = screen.getByLabelText('Phone Number');
      expect(input).toHaveClass('border-classicRed');
    });

    it('should apply normal styling when no error', () => {
      render(
        <PhoneInput
          value=""
          onChange={mockOnChange}
          onBlur={mockOnBlur}
        />
      );

      const input = screen.getByLabelText('Phone Number');
      expect(input).toHaveClass('border-gray-300');
    });
  });
});

describe('validatePhoneNumber Function', () => {
  describe('Valid Phone Numbers', () => {
    it('should validate US format (XXX) XXX-XXXX', () => {
      const result = validatePhoneNumber('(555) 123-4567');
      expect(result.isValid).toBe(true);
      expect(result.error).toBeUndefined();
    });

    it('should validate US format XXX-XXX-XXXX', () => {
      const result = validatePhoneNumber('555-123-4567');
      expect(result.isValid).toBe(true);
      expect(result.error).toBeUndefined();
    });

    it('should validate international format +X XXX XXX XXXX', () => {
      const result = validatePhoneNumber('+1 555 123 4567');
      expect(result.isValid).toBe(true);
      expect(result.error).toBeUndefined();
    });

    it('should validate phone number with dots as separators', () => {
      const result = validatePhoneNumber('555.123.4567');
      expect(result.isValid).toBe(true);
      expect(result.error).toBeUndefined();
    });

    it('should validate 10-digit phone number without formatting', () => {
      const result = validatePhoneNumber('5551234567');
      expect(result.isValid).toBe(true);
      expect(result.error).toBeUndefined();
    });

    it('should validate 11-digit phone number with country code', () => {
      const result = validatePhoneNumber('+15551234567');
      expect(result.isValid).toBe(true);
      expect(result.error).toBeUndefined();
    });
  });

  describe('Invalid Phone Numbers', () => {
    it('should reject empty string', () => {
      const result = validatePhoneNumber('');
      expect(result.isValid).toBe(false);
      expect(result.error).toBe('Phone number is required');
    });

    it('should reject phone number with less than 10 digits', () => {
      const result = validatePhoneNumber('555-123');
      expect(result.isValid).toBe(false);
      expect(result.error).toBe('Phone number must contain at least 10 digits');
    });

    it('should reject phone number with only 9 digits', () => {
      const result = validatePhoneNumber('555123456');
      expect(result.isValid).toBe(false);
      expect(result.error).toBe('Phone number must contain at least 10 digits');
    });

    it('should reject phone number with invalid characters', () => {
      const result = validatePhoneNumber('555-ABC-4567');
      expect(result.isValid).toBe(false);
      // This will fail digit count check first (only 7 digits after removing non-digits)
      expect(result.error).toBe('Phone number must contain at least 10 digits');
    });

    it('should reject whitespace-only string', () => {
      const result = validatePhoneNumber('   ');
      expect(result.isValid).toBe(false);
      expect(result.error).toBe('Phone number is required');
    });
  });

  describe('Edge Cases', () => {
    it('should handle phone number with extra spaces', () => {
      const result = validatePhoneNumber('(555)  123  4567');
      expect(result.isValid).toBe(true);
      expect(result.error).toBeUndefined();
    });

    it('should validate exactly 10 digits', () => {
      const result = validatePhoneNumber('1234567890');
      expect(result.isValid).toBe(true);
      expect(result.error).toBeUndefined();
    });

    it('should validate phone number with mixed separators', () => {
      const result = validatePhoneNumber('(555) 123.4567');
      expect(result.isValid).toBe(true);
      expect(result.error).toBeUndefined();
    });
  });
});
