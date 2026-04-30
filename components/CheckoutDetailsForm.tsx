'use client';

import { useState, useEffect } from 'react';
import { useCartStore } from '@/stores/cartStore';
import DeliveryTypeSelector from './DeliveryTypeSelector';
import PhoneInput from './PhoneInput';
import AddressInput from './AddressInput';
import DateTimeSelector from './DateTimeSelector';
import { isValidScheduleTime } from '@/lib/operatingHours';

interface CheckoutDetailsFormProps {
  onValidationComplete: (isValid: boolean) => void;
}

interface FormState {
  deliveryType: 'delivery' | 'pickup';
  phoneNumber: string;
  address: string;
  deliveryDate: string;
  deliveryTime: string;
}

interface FormErrors {
  phoneNumber?: string;
  address?: string;
  deliveryDate?: string;
  deliveryTime?: string;
}

const PHONE_REGEX = /^[\+]?[(]?[0-9]{3}[)]?[-\s\.]?[0-9]{3}[-\s\.]?[0-9]{4,6}$/;

export default function CheckoutDetailsForm({ onValidationComplete }: CheckoutDetailsFormProps) {
  const { deliveryDetails, setDeliveryDetails } = useCartStore();

  const [formState, setFormState] = useState<FormState>({
    deliveryType: deliveryDetails?.deliveryType || 'pickup',
    phoneNumber: deliveryDetails?.phoneNumber || '',
    address: deliveryDetails?.address || '',
    deliveryDate: deliveryDetails?.deliveryDate || '',
    deliveryTime: deliveryDetails?.deliveryTime || '',
  });

  const [errors, setErrors] = useState<FormErrors>({});
  const [touched, setTouched] = useState<Record<string, boolean>>({});

  // Validate form and update parent
  useEffect(() => {
    const isValid = validateForm();
    onValidationComplete(isValid);
  }, [formState, onValidationComplete]);

  // Update cart store when form changes
  useEffect(() => {
    if (validateForm()) {
      setDeliveryDetails({
        deliveryType: formState.deliveryType,
        phoneNumber: formState.phoneNumber,
        address: formState.deliveryType === 'delivery' ? formState.address : undefined,
        deliveryDate: formState.deliveryDate,
        deliveryTime: formState.deliveryTime,
      });
    }
  }, [formState, setDeliveryDetails]);

  const validateForm = (): boolean => {
    const newErrors: FormErrors = {};

    // Phone validation
    if (!formState.phoneNumber) {
      newErrors.phoneNumber = 'Phone number is required';
    } else if (!PHONE_REGEX.test(formState.phoneNumber)) {
      newErrors.phoneNumber = 'Please enter a valid phone number (e.g., (555) 123-4567)';
    }

    // Address validation (only for delivery)
    if (formState.deliveryType === 'delivery') {
      if (!formState.address) {
        newErrors.address = 'Delivery address is required for delivery orders';
      } else if (formState.address.length < 10) {
        newErrors.address = 'Address must be at least 10 characters';
      }
    }

    // Date validation
    if (!formState.deliveryDate) {
      newErrors.deliveryDate = 'Please select a delivery date';
    } else {
      const today = new Date().toISOString().split('T')[0];
      if (formState.deliveryDate < today) {
        newErrors.deliveryDate = 'Please select a valid date (today or later)';
      }
    }

    // Time validation
    if (!formState.deliveryTime) {
      newErrors.deliveryTime = 'Please select a delivery time';
    } else if (formState.deliveryDate && !isValidScheduleTime(formState.deliveryDate, formState.deliveryTime)) {
      newErrors.deliveryTime = 'Please select a time between 11:00 AM and 9:00 PM';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleBlur = (field: keyof FormState) => {
    setTouched({ ...touched, [field]: true });
    validateForm();
  };

  const handleDeliveryTypeChange = (type: 'delivery' | 'pickup') => {
    setFormState({ ...formState, deliveryType: type });
  };

  const handlePhoneChange = (value: string) => {
    setFormState({ ...formState, phoneNumber: value });
  };

  const handleAddressChange = (value: string) => {
    setFormState({ ...formState, address: value });
  };

  const handleDateChange = (value: string) => {
    setFormState({ ...formState, deliveryDate: value });
  };

  const handleTimeChange = (value: string) => {
    setFormState({ ...formState, deliveryTime: value });
  };

  return (
    <div className="w-full max-w-2xl mx-auto bg-white rounded-xl p-6 shadow-lg space-y-6">
      <h2 className="text-2xl font-bold text-gray-900 mb-4">Delivery Details</h2>

      <DeliveryTypeSelector
        value={formState.deliveryType}
        onChange={handleDeliveryTypeChange}
      />

      <PhoneInput
        value={formState.phoneNumber}
        onChange={handlePhoneChange}
        onBlur={() => handleBlur('phoneNumber')}
        error={touched.phoneNumber ? errors.phoneNumber : undefined}
      />

      <AddressInput
        value={formState.address}
        onChange={handleAddressChange}
        onBlur={() => handleBlur('address')}
        error={touched.address ? errors.address : undefined}
        required={formState.deliveryType === 'delivery'}
      />

      <DateTimeSelector
        date={formState.deliveryDate}
        time={formState.deliveryTime}
        onDateChange={handleDateChange}
        onTimeChange={handleTimeChange}
        dateError={touched.deliveryDate ? errors.deliveryDate : undefined}
        timeError={touched.deliveryTime ? errors.deliveryTime : undefined}
      />
    </div>
  );
}
